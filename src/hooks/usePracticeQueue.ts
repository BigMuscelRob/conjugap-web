'use client';

import { useState, useEffect, useRef } from 'react';
import type { SessionConfig } from '@/components/practice/SetupScreen';

// ── API shapes ────────────────────────────────────────────────────────────────

type ApiVerb = {
  id:         number;
  infinitive: string;
  cls:        string;
  irregular:  boolean;
  meaningDe:  string;
  meaningEn:  string;
};

type ApiConjugation = {
  id:      number;
  verbId:  number;
  tense:   string;
  pronoun: string;
  form:    string;
};

type ApiVerbFull = ApiVerb & { conjugations: ApiConjugation[] };

// ── Public types ──────────────────────────────────────────────────────────────

export type QueueItem = {
  key:        string;   // `${infinitive}|${tense}|${pronoun}`
  infinitive: string;
  cls:        string;
  meaningDe:  string;
  tense:      string;
  pronoun:    string;
  form:       string;
};

export type PracticeQueueResult = {
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

// ── Utilities ─────────────────────────────────────────────────────────────────

const PRONOUN_ORDER = ['yo', 'tú', 'él/ella', 'nosotros', 'vosotros', 'ellos/ellas'];

function createRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fisherYates<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function usePracticeQueue(config: SessionConfig): PracticeQueueResult {
  const structured = config.mode === 'structured';

  // ── Queue + loading state ──────────────────────────────────────────────────
  const [queue,      setQueue]      = useState<QueueItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  // ── Session tracking ───────────────────────────────────────────────────────
  const [mastered,        setMastered]        = useState<Set<string>>(new Set());
  const [attempted,       setAttempted]       = useState<Set<string>>(new Set());
  const [firstTryCorrect, setFirstTryCorrect] = useState<Set<string>>(new Set());

  // ── Structured-mode block state ────────────────────────────────────────────
  const [pendingBlocks,          setPendingBlocks]          = useState<QueueItem[][]>([]);
  const [blockTransition,        setBlockTransition]        = useState<QueueItem[] | null>(null);
  const [totalBlocks,            setTotalBlocks]            = useState(0);
  const [blocksCompleted,        setBlocksCompleted]        = useState(0);
  const [currentBlockSize,       setCurrentBlockSize]       = useState(0);
  const [masteredInCurrentBlock, setMasteredInCurrentBlock] = useState(0);

  const startedAtRef = useRef(Date.now());

  // ── Build queue on config change ───────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function buildQueue() {
      setLoading(true);
      setError(null);
      startedAtRef.current = Date.now();
      console.log('[Queue] verbs:', config.verbs, '| tenses:', config.tenses, '| mode:', config.mode, '| length:', config.length);

      try {
        const allVerbs: ApiVerb[] = await fetch('/api/verbs').then(r => r.json());
        const selected = allVerbs.filter(v => config.verbs.includes(v.infinitive));
        console.log('[Queue] matched verbs:', selected.map(v => v.infinitive));

        const verbsFull: ApiVerbFull[] = await Promise.all(
          selected.map(v => fetch(`/api/verbs/${v.id}/conjugations`).then(r => r.json()))
        );

        if (cancelled) return;

        // ── Structured: verb × tense blocks ──────────────────────────────────
        if (structured) {
          const blocks: QueueItem[][] = [];
          for (const verb of verbsFull) {
            for (const tenseKey of config.tenses) {
              const block: QueueItem[] = [];
              for (const pronoun of PRONOUN_ORDER) {
                const conj = verb.conjugations.find(
                  c => c.tense === tenseKey && c.pronoun === pronoun
                );
                if (conj && conj.form !== '—') {
                  block.push({
                    key:        `${verb.infinitive}|${tenseKey}|${pronoun}`,
                    infinitive: verb.infinitive,
                    cls:        verb.cls,
                    meaningDe:  verb.meaningDe,
                    tense:      tenseKey,
                    pronoun,
                    form:       conj.form,
                  });
                }
              }
              if (block.length > 0) blocks.push(block);
            }
          }
          setTotalItems(blocks.reduce((s, b) => s + b.length, 0));
          setTotalBlocks(blocks.length);
          setBlocksCompleted(0);
          setCurrentBlockSize(blocks[0]?.length ?? 0);
          setMasteredInCurrentBlock(0);
          setBlockTransition(null);
          setPendingBlocks(blocks.slice(1));
          setQueue(blocks[0] ?? []);

        // ── Random: flat 3× Fisher-Yates + anti-collision ─────────────────
        } else {
          console.log('[Queue/random] building — tenses:', config.tenses);
          const items: QueueItem[] = [];
          for (const verb of verbsFull) {
            for (const tenseKey of config.tenses) {
              let hits = 0;
              for (const pronoun of PRONOUN_ORDER) {
                const conj = verb.conjugations.find(
                  c => c.tense === tenseKey && c.pronoun === pronoun
                );
                if (conj && conj.form !== '—') {
                  hits++;
                  items.push({
                    key:        `${verb.infinitive}|${tenseKey}|${pronoun}`,
                    infinitive: verb.infinitive,
                    cls:        verb.cls,
                    meaningDe:  verb.meaningDe,
                    tense:      tenseKey,
                    pronoun,
                    form:       conj.form,
                  });
                }
              }
              console.log(`[Queue/random]   ${verb.infinitive}/${tenseKey}: ${hits} forms`);
            }
          }

          const rng   = createRng(Date.now());
          let   final = fisherYates(fisherYates(fisherYates(items, rng), rng), rng);

          // No two consecutive items with the same verb+tense
          for (let i = 0; i < final.length - 1; i++) {
            if (
              final[i].infinitive === final[i + 1].infinitive &&
              final[i].tense      === final[i + 1].tense
            ) {
              const swapIdx = i + 2 + Math.floor(rng() * Math.max(1, final.length - i - 2));
              if (swapIdx < final.length) {
                [final[i + 1], final[swapIdx]] = [final[swapIdx], final[i + 1]];
              }
            }
          }

          console.log(
            '[Queue/random] total:', final.length,
            '| first 15:',
            final.slice(0, 15).map(i => `${i.tense}/${i.pronoun}`).join(', ')
          );

          setPendingBlocks([]);
          setBlockTransition(null);
          setTotalBlocks(0);
          setBlocksCompleted(0);
          setCurrentBlockSize(0);
          setMasteredInCurrentBlock(0);
          setTotalItems(final.length);
          setQueue(final);
        }

        setMastered(new Set());
        setAttempted(new Set());
        setFirstTryCorrect(new Set());
      } catch {
        setError('Fehler beim Laden der Verbdaten.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    buildQueue();
    return () => { cancelled = true; };
  }, [config]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived ───────────────────────────────────────────────────────────────
  const current     = queue[0] ?? null;
  const masteredN   = mastered.size;
  const done        = !loading && totalItems > 0 && masteredN === totalItems;
  const progressPct = totalItems > 0 ? (masteredN / totalItems) * 100 : 0;
  const retryCount  = structured
    ? queue.length - (currentBlockSize - masteredInCurrentBlock)
    : attempted.size - masteredN;

  // ── Actions ───────────────────────────────────────────────────────────────

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
      setAttempted(prev => new Set([...prev, queue[0].key]));
      const delay = 3 + Math.floor(Math.random() * 3);
      setQueue(prev => {
        const [first, ...rest] = prev;
        const at = Math.min(delay, rest.length);
        return [...rest.slice(0, at), first, ...rest.slice(at)];
      });
    }
  }

  function loadNextBlock() {
    if (!blockTransition) return;
    setQueue(blockTransition);
    setCurrentBlockSize(blockTransition.length);
    setBlockTransition(null);
  }

  return {
    current,
    loading,
    error,
    done,
    totalItems,
    masteredN,
    firstTryCorrectN: firstTryCorrect.size,
    progressPct,
    retryCount,
    blocksCompleted,
    totalBlocks,
    blockTransition,
    startedAtRef,
    advance,
    loadNextBlock,
  };
}
