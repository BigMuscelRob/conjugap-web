'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import type { SessionConfig } from './SetupScreen';
import { usePracticeRetry } from '@/hooks/usePracticeRetry';

// ── Types ─────────────────────────────────────────────────────────────────────

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

  const {
    current,
    loading,
    error,
    done,
    totalItems,
    masteredN,
    firstTryCorrectN,
    progressPct,
    retryCount,
    blocksCompleted,
    totalBlocks,
    blockTransition,
    startedAtRef,
    advance,
    loadNextBlock,
  } = usePracticeRetry(config);

  const [value,       setValue]      = useState('');
  const [status,      setStatus]     = useState<Status>('typing');
  const [confirmExit, setConfirmExit] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // ── Back-button guard ────────────────────────────────────────────────────
  useEffect(() => {
    window.history.pushState({ practiceSession: true }, '');
    function onPopState() {
      window.history.pushState({ practiceSession: true }, '');
      setConfirmExit(true);
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // ── Scroll lock when exit dialog is open ─────────────────────────────────
  useEffect(() => {
    if (!confirmExit) return;
    const scrollY = window.scrollY;
    const body    = document.body;
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top      = `-${scrollY}px`;
    body.style.width    = '100%';
    return () => {
      body.style.overflow = '';
      body.style.position = '';
      body.style.top      = '';
      body.style.width    = '';
      window.scrollTo(0, scrollY);
    };
  }, [confirmExit]);

  // ── Auto-focus on card change ─────────────────────────────────────────────
  useEffect(() => {
    if (!loading) inputRef.current?.focus();
  }, [current, loading]);

  // ── check / advance ───────────────────────────────────────────────────────
  function handleAdvance() {
    if (status === 'typing') return;
    advance(status);
    setStatus('typing');
    setValue('');
  }

  function check() {
    if (!current || status !== 'typing') { handleAdvance(); return; }

    const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const ok = normalize(value.trim()) === normalize(current.form);
    setStatus(ok ? 'correct' : 'wrong');
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

  // ── Block transition (structured mode only) ──────────────────────────────
  if (structured && blockTransition) {
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
            <Button
              variant="primary"
              size="md"
              iconAfter="arrow-right"
              onClick={() => { loadNextBlock(); inputRef.current?.focus(); }}
            >
              Weiter
            </Button>
          </div>
        </CardShell>
      </>
    );
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  if (done) {
    const elapsed     = Date.now() - startedAtRef.current;
    const neededRetry = masteredN - firstTryCorrectN;
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
              <StatBox icon="check-circle"    iconColor="text-sage-500"       label="Beim 1. Versuch"  value={String(firstTryCorrectN)} />
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
            ? <Button variant="success" size="md" onClick={check}         iconAfter="arrow-right">{t('btn_check')}</Button>
            : <Button variant="primary" size="md" onClick={handleAdvance} iconAfter="arrow-right">{t('btn_next')}</Button>
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
