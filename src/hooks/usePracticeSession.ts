'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import type { SessionConfig } from '@/components/practice/SetupScreen';
import { usePracticeRetry } from './usePracticeRetry';
import type { QueueItem } from './usePracticeRetry';

export type { QueueItem };

// ── Public types ──────────────────────────────────────────────────────────────

export type AnswerState   = 'idle' | 'correct' | 'wrong';
export type SessionStatus = 'loading' | 'running' | 'transition' | 'finished' | 'error';

export type SessionResult = {
  sessionId:             string;
  correctCount:          number;
  incorrectCount:        number;
  accuracy:              number;
  durationSeconds:       number;
  currentStreak:         number;
  totalCorrectAllTime:   number;
  totalIncorrectAllTime: number;
};

export type PracticeSessionResult = {
  // Lifecycle
  sessionStatus:    SessionStatus;
  error:            string | null;

  // Current question + answer state
  current:          QueueItem | null;
  answerState:      AnswerState;

  // Actions
  checkAnswer:      (input: string) => AnswerState;
  nextQuestion:     () => void;
  loadNextBlock:    () => void;

  // Progress
  totalItems:       number;
  masteredN:        number;
  progressPct:      number;
  retryCount:       number;

  // Statistics
  firstTryCorrectN: number;
  startedAtRef:     React.RefObject<number>;

  // Structured-mode extras
  blocksCompleted:  number;
  totalBlocks:      number;
  blockTransition:  QueueItem[] | null;

  // Completion result (null until session finished + API responded)
  sessionResult:    SessionResult | null;
};

// ── Utilities ─────────────────────────────────────────────────────────────────

const normalize = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

type ResultEntry = { conjugationId: number; verbId: number; correct: boolean };

// ── Hook ──────────────────────────────────────────────────────────────────────

export function usePracticeSession(config: SessionConfig): PracticeSessionResult {
  const retry      = usePracticeRetry(config);
  const structured = config.mode === 'structured';
  const { data: authSession } = useSession();

  const [answerState,   setAnswerState]   = useState<AnswerState>('idle');
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);

  const resultsRef    = useRef<ResultEntry[]>([]);
  const submittedRef  = useRef(false); // guard against double-fire in strict mode

  // Reset on new build (config change / re-session)
  useEffect(() => {
    if (retry.loading) {
      setAnswerState('idle');
      setSessionResult(null);
      resultsRef.current   = [];
      submittedRef.current = false;
    }
  }, [retry.loading]);

  // POST to /api/practice/complete when the session finishes
  useEffect(() => {
    if (!retry.done)           return;
    if (submittedRef.current)  return;
    if (!authSession?.user?.id) return; // not logged in — skip silently

    submittedRef.current = true;

    const startedAt   = new Date(retry.startedAtRef.current).toISOString();
    const completedAt = new Date().toISOString();
    const verbIds     = [...new Set(resultsRef.current.map(r => r.verbId))];

    fetch('/api/practice/complete', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode:        config.mode,
        tenses:      config.tenses,
        verbIds,
        results:     resultsRef.current.map(({ conjugationId, correct }) => ({ conjugationId, correct })),
        startedAt,
        completedAt,
      }),
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setSessionResult(data as SessionResult); })
      .catch(() => {}); // stats are non-critical — swallow errors
  }, [retry.done]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived session status ────────────────────────────────────────────────
  const sessionStatus: SessionStatus =
    retry.loading                                  ? 'loading'    :
    (retry.error || retry.totalItems === 0)        ? 'error'      :
    retry.done                                     ? 'finished'   :
    (structured && retry.blockTransition !== null) ? 'transition' :
    retry.current === null                         ? 'loading'    : // queue effect not yet flushed
                                                     'running';

  // ── Actions ───────────────────────────────────────────────────────────────

  function checkAnswer(input: string): AnswerState {
    if (!retry.current) return 'idle';
    const outcome: AnswerState =
      normalize(input.trim()) === normalize(retry.current.form) ? 'correct' : 'wrong';
    setAnswerState(outcome);
    resultsRef.current.push({
      conjugationId: retry.current.conjugationId,
      verbId:        retry.current.verbId,
      correct:       outcome === 'correct',
    });
    return outcome;
  }

  function nextQuestion() {
    if (answerState === 'idle') return;
    retry.advance(answerState); // narrowed: 'correct' | 'wrong'
    setAnswerState('idle');
  }

  function loadNextBlock() {
    retry.loadNextBlock();
    setAnswerState('idle');
  }

  return {
    sessionStatus,
    error:            retry.error,
    current:          retry.current,
    answerState,
    checkAnswer,
    nextQuestion,
    loadNextBlock,
    totalItems:       retry.totalItems,
    masteredN:        retry.masteredN,
    progressPct:      retry.progressPct,
    retryCount:       retry.retryCount,
    firstTryCorrectN: retry.firstTryCorrectN,
    startedAtRef:     retry.startedAtRef,
    blocksCompleted:  retry.blocksCompleted,
    totalBlocks:      retry.totalBlocks,
    blockTransition:  retry.blockTransition,
    sessionResult,
  };
}
