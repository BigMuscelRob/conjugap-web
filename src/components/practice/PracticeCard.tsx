'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import type { SessionConfig } from './SetupScreen';

// ── API shapes ────────────────────────────────────────────────────────────────

type ApiVerb = {
  id:        number;
  infinitive: string;
  cls:       string;
  irregular: boolean;
  meaningDe: string;
  meaningEn: string;
};

type ApiConjugation = {
  id:      number;
  verbId:  number;
  tense:   string;
  pronoun: string;
  form:    string;
};

type ApiVerbFull = ApiVerb & { conjugations: ApiConjugation[] };

// ── Queue ─────────────────────────────────────────────────────────────────────

type QueueItem = {
  key:        string;   // `${infinitive}|${tense}|${pronoun}`
  infinitive: string;
  cls:        string;
  meaningDe:  string;
  tense:      string;
  pronoun:    string;
  form:       string;
};

type Status = 'typing' | 'correct' | 'wrong';

// ── Constants ─────────────────────────────────────────────────────────────────

const TENSE_LABELS: Record<string, string> = {
  pres:  'Presente',
  pi:    'Pretérito Indefinido',
  imp:   'Imperfecto',
  pp:    'Pretérito Perfecto',
  fut:   'Futuro Simple',
  cond:  'Condicional',
  sub:   'Subjuntivo Presente',
  imper: 'Imperativo',
};

const PRONOUN_LABELS: Record<string, string> = {
  'yo':          'YO',
  'tú':          'TÚ',
  'él/ella':     'ÉL / ELLA',
  'nosotros':    'NOSOTROS',
  'vosotros':    'VOSOTROS',
  'ellos/ellas': 'ELLOS / ELLAS',
};

const PRONOUN_ORDER = ['yo', 'tú', 'él/ella', 'nosotros', 'vosotros', 'ellos/ellas'];

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  config:  SessionConfig;
  onReset: () => void;
}

export default function PracticeCard({ config, onReset }: Props) {
  const t          = useTranslations('practice.card');
  const structured = config.mode === 'structured';

  // ── Shared state ────────────────────────────────────────────────────────
  const [queue,      setQueue]      = useState<QueueItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [value,      setValue]      = useState('');
  const [status,     setStatus]     = useState<Status>('typing');

  // ── Progress tracking (shared) ───────────────────────────────────────────
  const [mastered,        setMastered]        = useState<Set<string>>(new Set());
  const [attempted,       setAttempted]       = useState<Set<string>>(new Set());
  const [firstTryCorrect, setFirstTryCorrect] = useState<Set<string>>(new Set());

  // ── Structured-mode block state ──────────────────────────────────────────
  // In structured mode, `queue` holds ONLY the current tense block.
  // Remaining blocks wait in `pendingBlocks`.
  const [pendingBlocks,          setPendingBlocks]          = useState<QueueItem[][]>([]);
  const [blockTransition,        setBlockTransition]        = useState<QueueItem[] | null>(null);
  const [totalBlocks,            setTotalBlocks]            = useState(0);
  const [blocksCompleted,        setBlocksCompleted]        = useState(0);
  const [currentBlockSize,       setCurrentBlockSize]       = useState(0);
  const [masteredInCurrentBlock, setMasteredInCurrentBlock] = useState(0);

  const [confirmExit, setConfirmExit] = useState(false);

  const startTimeRef = useRef(Date.now());
  const inputRef     = useRef<HTMLInputElement>(null);

  // ── Back-button guard ────────────────────────────────────────────────────
  useEffect(() => {
    window.history.pushState({ practiceSession: true }, '');
    function onPopState() {
      // Re-push so a second back press also gets caught
      window.history.pushState({ practiceSession: true }, '');
      setConfirmExit(true);
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // ── Load + build queue ───────────────────────────────────────────────────
  useEffect(() => {
    async function buildQueue() {
      setLoading(true);
      setError(null);
      startTimeRef.current = Date.now();
      console.log('[Queue] verbs:', config.verbs, '| tenses:', config.tenses, '| mode:', config.mode, '| length:', config.length);
      try {
        const verbsRes = await fetch('/api/verbs');
        const allVerbs: ApiVerb[] = await verbsRes.json();
        const selected = allVerbs.filter(v => config.verbs.includes(v.infinitive));
        console.log('[Queue] matched verbs:', selected.map(v => v.infinitive));

        // Fetch all conjugations
        const verbsFull: ApiVerbFull[] = await Promise.all(
          selected.map(v =>
            fetch(`/api/verbs/${v.id}/conjugations`).then(r => r.json())
          )
        );

        // ── Structured mode: build blocks (verb × tense) ─────────────────
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

          // Structured mode always covers all selected verb/tense combos.
          setTotalItems(blocks.reduce((s, b) => s + b.length, 0));
          setTotalBlocks(blocks.length);
          setBlocksCompleted(0);
          setCurrentBlockSize(blocks[0]?.length ?? 0);
          setMasteredInCurrentBlock(0);
          setBlockTransition(null);
          setPendingBlocks(blocks.slice(1));
          setQueue(blocks[0] ?? []);

        // ── Random mode: flat shuffled queue ─────────────────────────────
        } else {
          const items: QueueItem[] = [];
          for (const verb of verbsFull) {
            for (const tenseKey of config.tenses) {
              for (const pronoun of PRONOUN_ORDER) {
                const conj = verb.conjugations.find(
                  c => c.tense === tenseKey && c.pronoun === pronoun
                );
                if (conj && conj.form !== '—') {
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
            }
          }
          const final = [...items].sort(() => Math.random() - 0.5);
          setTotalItems(final.length);
          setQueue(final);
        }

        setMastered(new Set());
        setAttempted(new Set());
        setFirstTryCorrect(new Set());
      } catch {
        setError('Fehler beim Laden der Verbdaten.');
      } finally {
        setLoading(false);
      }
    }
    buildQueue();
  }, [config]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!loading) inputRef.current?.focus();
  }, [queue, loading]);

  // ── Derived ──────────────────────────────────────────────────────────────
  const current   = queue[0] ?? null;
  const masteredN = mastered.size;
  const done      = !loading && totalItems > 0 && masteredN === totalItems;

  const progressPct = totalItems > 0 ? (masteredN / totalItems) * 100 : 0;

  const retryCount = structured
    ? queue.length - (currentBlockSize - masteredInCurrentBlock)
    : queue.length - (totalItems - masteredN);

  // ── check / advance ───────────────────────────────────────────────────────
  function check() {
    if (!current || status !== 'typing') { advance(); return; }

    const normalize      = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const ok             = normalize(value.trim()) === normalize(current.form);
    const isFirstAttempt = !attempted.has(current.key);

    setAttempted(prev => new Set([...prev, current.key]));
    if (ok && isFirstAttempt) setFirstTryCorrect(prev => new Set([...prev, current.key]));
    setStatus(ok ? 'correct' : 'wrong');
  }

  function advance() {
    if (status === 'correct') {
      setMastered(prev => new Set([...prev, queue[0].key]));

      if (structured) {
        const newMasteredInBlock = masteredInCurrentBlock + 1;
        const newQueue = queue.slice(1);

        if (newQueue.length === 0) {
          // Tense block fully mastered → show transition or finish
          setBlocksCompleted(prev => prev + 1);
          setMasteredInCurrentBlock(0);
          if (pendingBlocks.length > 0) {
            const [nextBlock, ...rest] = pendingBlocks;
            setPendingBlocks(rest);
            setBlockTransition(nextBlock);
            setQueue([]);
          } else {
            setQueue([]);
          }
        } else {
          setMasteredInCurrentBlock(newMasteredInBlock);
          setQueue(newQueue);
        }
      } else {
        setQueue(prev => prev.slice(1));
      }

    } else if (status === 'wrong') {
      // Re-insert 3–5 positions later.
      // In structured mode this naturally stays within the current block
      // because `queue` only contains the current block's items.
      const delay = 3 + Math.floor(Math.random() * 3);
      setQueue(prev => {
        const [first, ...rest] = prev;
        const at = Math.min(delay, rest.length);
        return [...rest.slice(0, at), first, ...rest.slice(at)];
      });
    }

    setStatus('typing');
    setValue('');
  }

  function loadNextBlock() {
    if (!blockTransition) return;
    setQueue(blockTransition);
    setCurrentBlockSize(blockTransition.length);
    setBlockTransition(null);
    inputRef.current?.focus();
  }

  const mascotState =
    status === 'correct' ? 'celebrate' :
    status === 'wrong'   ? 'wrong'     :
    value.length > 0     ? 'think'     : 'idle';

  const mascotAnim: Record<string, string> = {
    idle:      'animate-breathe',
    think:     'animate-think',
    celebrate: 'animate-celebrate',
    wrong:     'animate-shake',
  };

  // ── Exit confirmation overlay (rendered on top of any screen state) ──────
  const exitOverlay = confirmExit ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 backdrop-blur-sm px-4">
      <div className="bg-paper border-2 border-ink-900 rounded-[24px] p-8 shadow-[0_6px_0_#2A1F1A] max-w-[400px] w-full flex flex-col gap-5 text-center">
        <i className="ph-fill ph-warning text-[44px] text-saffron-500 mx-auto" aria-hidden="true" />
        <div>
          <p className="font-bricolage font-bold text-[22px] text-brand-dark leading-tight mb-2">
            Session beenden?
          </p>
          <p className="text-[14px] font-semibold text-brand-muted leading-relaxed">
            Möchtest du die Session wirklich beenden?<br />Dein Fortschritt geht verloren.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="md" onClick={() => setConfirmExit(false)} className="flex-1">
            Weitermachen
          </Button>
          <Button variant="primary" size="md" onClick={onReset} className="flex-1">
            Beenden
          </Button>
        </div>
      </div>
    </div>
  ) : null;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        {exitOverlay}
        <CardShell>
          <div className="flex flex-col items-center gap-4 py-10">
            <div className="w-10 h-10 border-4 border-terracotta-200 border-t-terracotta-500 rounded-full animate-spin" />
            <p className="text-sm font-semibold text-brand-muted">Lade Verben…</p>
          </div>
        </CardShell>
      </>
    );
  }

  if (error || totalItems === 0) {
    return (
      <>
        {exitOverlay}
        <CardShell>
          <p className="text-base font-semibold text-berry-700 text-center py-10">
            {error ?? 'Keine Fragen für diese Auswahl.'}
          </p>
        </CardShell>
      </>
    );
  }

  // ── Block transition ─────────────────────────────────────────────────────
  if (blockTransition) {
    const nextTense = TENSE_LABELS[blockTransition[0].tense] ?? blockTransition[0].tense;
    const nextVerb  = blockTransition[0].infinitive;
    return (
      <>
        {exitOverlay}
        <CardShell>
          <div className="flex flex-col items-center gap-6 py-8 text-center">
            <div className="w-14 h-14 rounded-full bg-saffron-50 border-2 border-saffron-200 flex items-center justify-center">
              <i className="ph-fill ph-arrow-right text-[26px] text-saffron-500" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[12px] font-bold text-brand-muted uppercase tracking-[0.08em] mb-2">
                Nächste Zeitform
              </p>
              <p className="font-bricolage font-bold text-[30px] text-brand-dark leading-tight">
                {nextTense}
              </p>
              <p className="text-[14px] font-semibold text-ink-500 mt-1 italic">{nextVerb}</p>
            </div>
            <p className="text-[12px] font-bold text-ink-400 uppercase tracking-[0.05em]">
              Block {blocksCompleted + 1} / {totalBlocks}
            </p>
            <Button variant="primary" size="md" onClick={loadNextBlock} iconAfter="arrow-right">
              Weiter
            </Button>
          </div>
        </CardShell>
      </>
    );
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  if (done) {
    const elapsed     = Date.now() - startTimeRef.current;
    const neededRetry = masteredN - firstTryCorrect.size;
    return (
      <>
        {exitOverlay}
        <CardShell>
          <div className="flex flex-col items-center gap-6 py-6">
            <i className="ph-fill ph-check-circle text-[56px] text-sage-500" aria-hidden="true" />
            <div className="text-center">
              <p className="font-bricolage font-bold text-[28px] text-brand-dark leading-tight">
                Session abgeschlossen!
              </p>
              <p className="text-sm font-semibold text-brand-muted mt-1">
                {totalItems} Fragen beantwortet
              </p>
            </div>
            <div className="w-full grid grid-cols-3 gap-3">
              <StatBox icon="check-circle"    iconColor="text-sage-500"       label="Beim 1. Versuch"  value={String(firstTryCorrect.size)} />
              <StatBox icon="arrow-clockwise" iconColor="text-saffron-500"    label="Mit Wdh. gelernt" value={String(neededRetry)} />
              <StatBox icon="timer"           iconColor="text-terracotta-500" label="Gesamtzeit"        value={formatTime(elapsed)} />
            </div>
          </div>
        </CardShell>
      </>
    );
  }

  // ── Main card ─────────────────────────────────────────────────────────────
  return (
    <>
    {exitOverlay}
    <CardShell>

      {/* Top: chips + progress */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <span className="px-3 py-1.5 rounded-pill text-[12px] font-bold bg-saffron-50 text-saffron-700 border-2 border-saffron-200">
            {current!.cls}
          </span>
          <span className="px-3 py-1.5 rounded-pill text-[12px] font-bold bg-ink-900 text-saffron-300 border-2 border-ink-900">
            {TENSE_LABELS[current!.tense] ?? current!.tense}
          </span>
        </div>

        <div className="flex items-center gap-2 text-ink-500 text-[12px] font-bold uppercase tracking-[0.05em]">
          <span>{masteredN} / {totalItems}</span>
          {structured && (
            <span className="text-ink-300 text-[10px] normal-case font-semibold">
              Block {blocksCompleted + 1}/{totalBlocks}
            </span>
          )}
          {retryCount > 0 && (
            <span className="text-saffron-600 font-bold text-[11px]">↻{retryCount}</span>
          )}
          <div className="w-16 h-2 bg-ink-100 rounded-pill overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-terracotta-500 to-saffron-300 rounded-pill transition-all duration-base"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Prompt */}
      <div className="text-center flex flex-col gap-1">
        <div className="text-[14px] font-bold text-ink-500 tracking-wide-08 uppercase">
          {PRONOUN_LABELS[current!.pronoun] ?? current!.pronoun}
        </div>
        <div className="font-display text-[56px] font-bold tracking-tightest text-ink-900 leading-none">
          {current!.infinitive}
        </div>
        <div className="text-ink-500 italic text-[14px] mt-1">
          {current!.meaningDe}
        </div>
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        value={status === 'wrong' ? current!.form : value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') check(); }}
        readOnly={status !== 'typing'}
        placeholder={t('placeholder')}
        className={[
          'w-full font-mono text-[32px] font-bold text-center',
          'px-5 py-[18px] rounded-[18px] border-2 outline-none',
          'transition-[border-color,background-color] duration-micro shadow-inset',
          status === 'correct' ? 'border-sage-700 bg-sage-50 text-sage-700'
            : status === 'wrong' ? 'border-berry-500 bg-warn-soft text-berry-700'
            : 'border-ink-200 bg-white-warm text-ink-900 focus:border-terracotta-400',
        ].join(' ')}
      />

      {/* Feedback */}
      {status === 'correct' && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-md text-[14px] font-bold bg-sage-50 text-sage-700 border border-sage-300/40">
          <i className="ph-fill ph-check-circle text-[20px]" aria-hidden="true" />
          {t('hint_correct', { xp: 12 })}
        </div>
      )}
      {status === 'wrong' && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-md text-[14px] font-bold bg-warn-soft text-berry-700 border border-berry-500/25">
          <i className="ph-fill ph-arrow-right text-[18px]" aria-hidden="true" />
          <span>
            {t.rich('hint_wrong', {
              typed:   value || '—',
              correct: current!.form,
              mono:    (chunks) => <span className="font-mono">{chunks}</span>,
            })}
          </span>
        </div>
      )}

      {/* Footer: mascot + buttons */}
      <div className="flex justify-between items-center gap-3 mt-1">
        <div className="flex items-center gap-2.5">
          <img
            key={status}
            src="/assets/mascot-mini.svg"
            alt=""
            width={56}
            height={56}
            className={`block select-none ${mascotAnim[mascotState]}`}
            draggable={false}
          />
          <span className="text-[13px] text-ink-500 font-semibold italic max-w-[200px]">
            {status === 'typing'  && (value ? t('mascot_typing') : t('mascot_idle'))}
            {status === 'correct' && t('mascot_correct')}
            {status === 'wrong'   && t('mascot_wrong')}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="md" icon="lightbulb">{t('btn_hint')}</Button>
          {status === 'typing'
            ? <Button variant="success" size="md" onClick={check}   iconAfter="arrow-right">{t('btn_check')}</Button>
            : <Button variant="primary" size="md" onClick={advance} iconAfter="arrow-right">{t('btn_next')}</Button>
          }
        </div>
      </div>
    </CardShell>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-paper border-2 border-ink-900 rounded-[28px] p-9 shadow-[0_6px_0_#2A1F1A] max-w-[560px] mx-auto flex flex-col gap-5">
      {children}
    </div>
  );
}

function StatBox({ icon, iconColor, label, value }: {
  icon:      string;
  iconColor: string;
  label:     string;
  value:     string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 p-4 rounded-[16px] bg-cream-deep border border-ink-900/[0.08]">
      <i className={`ph-fill ph-${icon} text-[24px] ${iconColor}`} aria-hidden="true" />
      <p className="font-bricolage font-bold text-[22px] text-brand-dark leading-none">{value}</p>
      <p className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.06em] text-center leading-tight">{label}</p>
    </div>
  );
}
