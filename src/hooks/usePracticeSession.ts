'use client';

import { useState, useEffect } from 'react';
import type { SessionConfig } from '@/components/practice/SetupScreen';
import { usePracticeRetry } from './usePracticeRetry';
import type { QueueItem } from './usePracticeRetry';

export type { QueueItem };

// ── Public types ──────────────────────────────────────────────────────────────

export type AnswerState   = 'idle' | 'correct' | 'wrong';
export type SessionStatus = 'loading' | 'running' | 'transition' | 'finished' | 'error';

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
};

// ── Utilities ─────────────────────────────────────────────────────────────────

const normalize = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// ── Hook ──────────────────────────────────────────────────────────────────────

export function usePracticeSession(config: SessionConfig): PracticeSessionResult {
  const retry      = usePracticeRetry(config);
  const structured = config.mode === 'structured';

  const [answerState, setAnswerState] = useState<AnswerState>('idle');

  // Reset answer state whenever a new build starts (config change / re-session)
  useEffect(() => {
    if (retry.loading) setAnswerState('idle');
  }, [retry.loading]);

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
  };
}
