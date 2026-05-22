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
  key:           string;   // `${infinitive}|${tense}|${pronoun}`
  conjugationId: number;
  verbId:        number;
  infinitive:    string;
  cls:           string;
  meaningDe:     string;
  tense:         string;
  pronoun:       string;
  form:          string;
};

export type QueueBuild = {
  loading:       boolean;
  error:         string | null;
  firstBlock:    QueueItem[];    // first block (structured) or full shuffled list (random)
  pendingBlocks: QueueItem[][];  // remaining blocks (structured) or [] (random)
  totalItems:    number;
  totalBlocks:   number;
  startedAtRef:  React.RefObject<number>;
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

export function usePracticeQueue(config: SessionConfig): QueueBuild {
  const structured = config.mode === 'structured';

  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [firstBlock,    setFirstBlock]    = useState<QueueItem[]>([]);
  const [pendingBlocks, setPendingBlocks] = useState<QueueItem[][]>([]);
  const [totalItems,    setTotalItems]    = useState(0);
  const [totalBlocks,   setTotalBlocks]   = useState(0);

  const startedAtRef = useRef(Date.now());

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
                    key:           `${verb.infinitive}|${tenseKey}|${pronoun}`,
                    conjugationId: conj.id,
                    verbId:        verb.id,
                    infinitive:    verb.infinitive,
                    cls:           verb.cls,
                    meaningDe:     verb.meaningDe,
                    tense:         tenseKey,
                    pronoun,
                    form:          conj.form,
                  });
                }
              }
              if (block.length > 0) blocks.push(block);
            }
          }
          setTotalItems(blocks.reduce((s, b) => s + b.length, 0));
          setTotalBlocks(blocks.length);
          setFirstBlock(blocks[0] ?? []);
          setPendingBlocks(blocks.slice(1));

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
                    key:           `${verb.infinitive}|${tenseKey}|${pronoun}`,
                    conjugationId: conj.id,
                    verbId:        verb.id,
                    infinitive:    verb.infinitive,
                    cls:           verb.cls,
                    meaningDe:     verb.meaningDe,
                    tense:         tenseKey,
                    pronoun,
                    form:          conj.form,
                  });
                }
              }
              console.log(`[Queue/random]   ${verb.infinitive}/${tenseKey}: ${hits} forms`);
            }
          }

          const rng   = createRng(Date.now());
          let   final = fisherYates(fisherYates(fisherYates(items, rng), rng), rng);

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

          setTotalItems(final.length);
          setTotalBlocks(0);
          setFirstBlock(final);
          setPendingBlocks([]);
        }
      } catch {
        if (!cancelled) setError('Fehler beim Laden der Verbdaten.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    buildQueue();
    return () => { cancelled = true; };
  }, [config]); // eslint-disable-line react-hooks/exhaustive-deps

  return { loading, error, firstBlock, pendingBlocks, totalItems, totalBlocks, startedAtRef };
}
