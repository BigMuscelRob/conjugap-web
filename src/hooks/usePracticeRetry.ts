'use client';

import { useState, useEffect } from 'react';
import type { SessionConfig } from '@/components/practice/SetupScreen';
import { usePracticeQueue } from './usePracticeQueue';
import type { QueueItem } from './usePracticeQueue';

export type { QueueItem };

// ── Public type ───────────────────────────────────────────────────────────────

export type PracticeRetryResult = {
  current:          QueueItem | null;
  loading:          boolean;
  error:            string | null;
  done:             boolean;
  totalItems:       number;
  masteredN:        number;
  firstTryCorrectN: number;
  progressPct:      number;
  retryCount:       number;
  // Structured-mode extras
  blocksCompleted:  number;
  totalBlocks:      number;
  blockTransition:  QueueItem[] | null;
  // Session timing (ref — stable, no re-render on set)
  startedAtRef:     React.RefObject<number>;
  // Actions
  advance:          (outcome: 'correct' | 'wrong') => void;
  loadNextBlock:    () => void;
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export function usePracticeRetry(config: SessionConfig): PracticeRetryResult {
  const build      = usePracticeQueue(config);
  const structured = config.mode === 'structured';

  // ── Runtime queue state ───────────────────────────────────────────────────
  const [queue,                  setQueue]                  = useState<QueueItem[]>([]);
  const [pendingBlocks,          setPendingBlocks]          = useState<QueueItem[][]>([]);
  const [blockTransition,        setBlockTransition]        = useState<QueueItem[] | null>(null);
  const [blocksCompleted,        setBlocksCompleted]        = useState(0);
  const [masteredInCurrentBlock, setMasteredInCurrentBlock] = useState(0);

  // ── Mastery tracking ──────────────────────────────────────────────────────
  const [mastered,        setMastered]        = useState<Set<string>>(new Set());
  const [attempted,       setAttempted]       = useState<Set<string>>(new Set());
  const [firstTryCorrect, setFirstTryCorrect] = useState<Set<string>>(new Set());

  // ── Sync with queue build ─────────────────────────────────────────────────
  // Runs when a build starts (reset) or completes (init from build result).
  // Reading build.firstBlock/pendingBlocks here is intentional: they change in
  // the same React batch as build.loading, so they're always in sync.
  useEffect(() => {
    if (build.loading) {
      setQueue([]);
      setPendingBlocks([]);
      setBlockTransition(null);
      setBlocksCompleted(0);
      setMasteredInCurrentBlock(0);
      setMastered(new Set());
      setAttempted(new Set());
      setFirstTryCorrect(new Set());
    } else if (!build.error) {
      setQueue(build.firstBlock);
      setPendingBlocks(build.pendingBlocks);
      setBlockTransition(null);
      setBlocksCompleted(0);
      setMasteredInCurrentBlock(0);
      setMastered(new Set());
      setAttempted(new Set());
      setFirstTryCorrect(new Set());
    }
  }, [build.loading, build.error]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived ───────────────────────────────────────────────────────────────
  const current     = queue[0] ?? null;
  const masteredN   = mastered.size;
  const done        = !build.loading && build.totalItems > 0 && masteredN === build.totalItems;
  const progressPct = build.totalItems > 0 ? (masteredN / build.totalItems) * 100 : 0;
  const retryCount  = structured
    ? queue.filter(item => attempted.has(item.key) && !mastered.has(item.key)).length
    : attempted.size - masteredN;

  // ── advance ───────────────────────────────────────────────────────────────

  function advance(outcome: 'correct' | 'wrong') {
    if (outcome === 'correct') {
      const key            = queue[0].key;
      const isFirstAttempt = !attempted.has(key);

      setAttempted(prev => new Set([...prev, key]));
      if (isFirstAttempt) setFirstTryCorrect(prev => new Set([...prev, key]));
      setMastered(prev => new Set([...prev, key]));

      if (structured) {
        const newMastered = masteredInCurrentBlock + 1;
        const newQueue    = queue.slice(1);

        if (newQueue.length === 0) {
          // Block fully mastered → show transition or finish
          setBlocksCompleted(prev => prev + 1);
          setMasteredInCurrentBlock(0);
          if (pendingBlocks.length > 0) {
            const [next, ...rest] = pendingBlocks;
            setPendingBlocks(rest);
            setBlockTransition(next);
            setQueue([]);
          } else {
            setQueue([]);
          }
        } else {
          setMasteredInCurrentBlock(newMastered);
          setQueue(newQueue);
        }
      } else {
        setQueue(prev => prev.slice(1));
      }

    } else {
      // Re-insert 3–5 positions later so the learner sees other cards first
      setAttempted(prev => new Set([...prev, queue[0].key]));
      const delay = 3 + Math.floor(Math.random() * 3);
      setQueue(prev => {
        const [first, ...rest] = prev;
        const at = Math.min(delay, rest.length);
        return [...rest.slice(0, at), first, ...rest.slice(at)];
      });
    }
  }

  // ── loadNextBlock ─────────────────────────────────────────────────────────

  function loadNextBlock() {
    if (!blockTransition) return;
    setQueue(blockTransition);
    setBlockTransition(null);
  }

  return {
    current,
    loading:          build.loading,
    error:            build.error,
    done,
    totalItems:       build.totalItems,
    masteredN,
    firstTryCorrectN: firstTryCorrect.size,
    progressPct,
    retryCount,
    blocksCompleted,
    totalBlocks:      build.totalBlocks,
    blockTransition,
    startedAtRef:     build.startedAtRef,
    advance,
    loadNextBlock,
  };
}
