'use client';

import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import type { SessionConfig } from './SetupScreen';
import { usePracticeSession } from '@/hooks/usePracticeSession';
import { playCorrect } from '@/lib/sounds';

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

export const SPECIAL_CHARS = ['á', 'é', 'í', 'ó', 'ú', 'ü', 'ñ'] as const;

// ── Component ─────────────────────────────────────────────────────────────────

export type PracticeCardHandle = {
  insertChar: (ch: string) => void;
};

interface Props {
  config:  SessionConfig;
  onReset: () => void;
}

const PracticeCard = forwardRef<PracticeCardHandle, Props>(function PracticeCard({ config, onReset }, ref) {
  const t          = useTranslations('practice.card');
  const structured = config.mode === 'structured';
  const session    = usePracticeSession(config);
  const { status: authStatus } = useSession();

  // Pure UI state
  const [value,       setValue]       = useState('');
  const [confirmExit, setConfirmExit] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    insertChar(ch: string) {
      const el = inputRef.current;
      if (!el) return;
      const start = el.selectionStart ?? value.length;
      const end   = el.selectionEnd   ?? value.length;
      setValue(v => v.slice(0, start) + ch + v.slice(end));
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(start + 1, start + 1);
      });
    },
  }));

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

  // ── Auto-focus when a new question appears ────────────────────────────────
  useEffect(() => {
    if (session.sessionStatus === 'running') inputRef.current?.focus();
  }, [session.current, session.sessionStatus]);

  // ── Input handlers ────────────────────────────────────────────────────────
  function handleCheck() {
    const outcome = session.checkAnswer(value);
    if (outcome === 'correct') playCorrect();
  }

  function handleNext() {
    session.nextQuestion();
    setValue('');
  }

  function handleEnterKey() {
    if (session.answerState === 'idle') handleCheck();
    else handleNext();
  }

  // ── Mascot ────────────────────────────────────────────────────────────────
  const mascotState =
    session.answerState === 'correct' ? 'celebrate' :
    session.answerState === 'wrong'   ? 'wrong'     :
    value.length > 0                  ? 'think'     : 'idle';

  const mascotAnim: Record<string, string> = {
    idle:      'animate-breathe',
    think:     'animate-think',
    celebrate: 'animate-celebrate',
    wrong:     'animate-shake',
  };

  // ── Exit confirmation overlay (shown on all screens) ─────────────────────
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
  if (session.sessionStatus === 'loading') {
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

  // ── Error / empty ─────────────────────────────────────────────────────────
  if (session.sessionStatus === 'error') {
    return (
      <>
        {exitOverlay}
        <CardShell>
          <p className="text-base font-semibold text-berry-700 text-center py-10">
            {session.error ?? 'Keine Fragen für diese Auswahl.'}
          </p>
        </CardShell>
      </>
    );
  }

  // ── Block transition (structured mode) ───────────────────────────────────
  if (session.sessionStatus === 'transition') {
    const nextTense = TENSE_LABELS[session.blockTransition![0].tense] ?? session.blockTransition![0].tense;
    const nextVerb  = session.blockTransition![0].infinitive;
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
                {t('transition_heading')}
              </p>
              <p className="font-bricolage font-bold text-[30px] text-brand-dark leading-tight">
                {nextTense}
              </p>
              <p className="text-[14px] font-semibold text-ink-500 mt-1 italic">{nextVerb}</p>
            </div>
            <p className="text-[12px] font-bold text-ink-400 uppercase tracking-[0.05em]">
              Block {session.blocksCompleted + 1} / {session.totalBlocks}
            </p>
            <Button variant="primary" size="md" iconAfter="arrow-right" onClick={session.loadNextBlock}>
              Weiter
            </Button>
          </div>
        </CardShell>
      </>
    );
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  if (session.sessionStatus === 'finished') {
    const elapsed     = Date.now() - session.startedAtRef.current;
    const neededRetry = session.masteredN - session.firstTryCorrectN;
    const sr          = session.sessionResult;

    const total          = sr ? sr.correctCount + sr.incorrectCount : 0;
    const avgSeconds     = total > 0 ? Math.round(sr!.durationSeconds / total) : 0;
    const totalAnswered  = sr ? sr.totalCorrectAllTime + sr.totalIncorrectAllTime : 0;
    const allTimeAcc     = totalAnswered > 0
      ? Math.round(sr!.totalCorrectAllTime / totalAnswered * 100)
      : 0;
    const accuracyColor  = !sr            ? '' :
      sr.accuracy >= 70 ? 'text-sage-600'     :
      sr.accuracy >= 50 ? 'text-saffron-600'  :
                          'text-berry-600';

    return (
      <>
        {exitOverlay}
        <CardShell>
          <div className="flex flex-col items-center gap-6 py-6">

            {/* Header */}
            <i className="ph-fill ph-check-circle text-[56px] text-sage-500" aria-hidden="true" />
            <div className="text-center">
              <p className="font-bricolage font-bold text-[28px] text-brand-dark leading-tight">
                Session abgeschlossen!
              </p>
              <p className="text-sm font-semibold text-brand-muted mt-1">
                {session.totalItems} Fragen beantwortet
              </p>
            </div>

            {/* API stats — logged in + result loaded */}
            {sr && (
              <div className="w-full flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <ResultTile
                    value={`${sr.accuracy}%`}
                    label="Trefferquote"
                    valueClass={accuracyColor}
                  />
                  <ResultTile
                    value={`${sr.correctCount} / ${total}`}
                    label="Richtig beantwortet"
                  />
                  <ResultTile
                    value={`${avgSeconds}s`}
                    label="Ø pro Frage"
                    className={sr.currentStreak === 0 ? 'col-span-2' : ''}
                  />
                  {sr.currentStreak > 0 && (
                    <ResultTile value={String(sr.currentStreak)} label="Tage in Folge 🔥" />
                  )}
                </div>
                {totalAnswered > 0 && (
                  <p className="text-center text-[12px] font-semibold text-ink-400">
                    Gesamt: {allTimeAcc}% Trefferquote über {totalAnswered} Antworten
                  </p>
                )}
              </div>
            )}

            {/* Loading state — authenticated but API call still pending */}
            {!sr && authStatus === 'authenticated' && (
              <div className="flex items-center justify-center py-2">
                <div className="w-5 h-5 border-2 border-terracotta-200 border-t-terracotta-500 rounded-full animate-spin" />
              </div>
            )}

            {/* Login hint — not logged in */}
            {authStatus === 'unauthenticated' && (
              <Link
                href="/login"
                className="text-[13px] font-semibold text-ink-400 hover:text-terracotta-500
                  transition-colors duration-micro text-center"
              >
                Melde dich an um deinen Fortschritt zu speichern →
              </Link>
            )}

            {/* Session breakdown */}
            <div className="w-full grid grid-cols-3 gap-3">
              <StatBox icon="check-circle"    iconColor="text-sage-500"       label="Beim 1. Versuch"   value={String(session.firstTryCorrectN)} />
              <StatBox icon="arrow-clockwise" iconColor="text-saffron-500"    label="Mit Wdh. gelernt"  value={String(neededRetry)} />
              <StatBox icon="timer"           iconColor="text-terracotta-500" label="Gesamtzeit"         value={formatTime(elapsed)} />
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-3 w-full pt-1">
              <button
                type="button"
                onClick={onReset}
                className="flex-1 inline-flex items-center justify-center gap-2
                  font-body font-bold text-small text-ink-900
                  px-4 py-3 bg-paper border-2 border-ink-900 rounded-xl
                  shadow-stamp transition-all duration-micro ease-smooth
                  hover:-translate-y-px hover:shadow-stamp-hover
                  active:translate-y-0.5 active:shadow-none cursor-pointer"
              >
                <i className="ph-bold ph-arrow-clockwise text-[16px]" aria-hidden="true" />
                Weiter üben
              </button>
              <Link
                href="/dashboard"
                className="flex-1 inline-flex items-center justify-center gap-2
                  font-body font-bold text-small text-white-warm no-underline
                  px-4 py-3 bg-terracotta-500 border-2 border-ink-900 rounded-xl
                  shadow-stamp-primary transition-all duration-micro ease-smooth
                  hover:-translate-y-px hover:shadow-stamp-primary-hover
                  active:translate-y-0.5 active:shadow-none active:bg-terracotta-600"
              >
                <i className="ph-bold ph-chart-bar text-[16px]" aria-hidden="true" />
                Zum Dashboard
              </Link>
            </div>

          </div>
        </CardShell>
      </>
    );
  }

  // ── Main card (running) ───────────────────────────────────────────────────
  if (!session.current) {
    return (
      <>
        {exitOverlay}
        <CardShell>
          <div className="flex flex-col items-center gap-4 py-10">
            <div className="w-10 h-10 border-4 border-terracotta-200 border-t-terracotta-500 rounded-full animate-spin" />
            <p className="text-sm font-semibold text-brand-muted">Laden…</p>
          </div>
        </CardShell>
      </>
    );
  }
  const current = session.current;

  return (
    <>
    {exitOverlay}
    <CardShell>

      {/* Top: chips + progress */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <span className="px-3 py-1.5 rounded-pill text-[12px] font-bold bg-saffron-50 text-saffron-700 border-2 border-saffron-200">
            {current.cls}
          </span>
          <span className="px-3 py-1.5 rounded-pill text-[12px] font-bold bg-ink-900 text-saffron-300 border-2 border-ink-900">
            {TENSE_LABELS[current.tense] ?? current.tense}
          </span>
        </div>

        <div className="flex items-center gap-2 text-ink-500 text-[12px] font-bold uppercase tracking-[0.05em]">
          <span>{session.masteredN} / {session.totalItems}</span>
          {structured && (
            <span className="text-ink-300 text-[10px] normal-case font-semibold">
              Block {session.blocksCompleted + 1}/{session.totalBlocks}
            </span>
          )}
          {session.retryCount > 0 && (
            <span className="text-saffron-600 font-bold text-[11px]">↻{session.retryCount}</span>
          )}
          <div className="w-16 h-2 bg-ink-100 rounded-pill overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-terracotta-500 to-saffron-300 rounded-pill transition-all duration-base"
              style={{ width: `${session.progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Prompt */}
      <div className="text-center flex flex-col gap-1">
        <div className="text-[14px] font-bold text-ink-500 tracking-wide-08 uppercase">
          {PRONOUN_LABELS[current.pronoun] ?? current.pronoun}
        </div>
        <div className="font-display text-[36px] sm:text-[56px] font-bold tracking-tightest text-ink-900 leading-none">
          {current.infinitive}
        </div>
        <div className="text-ink-500 italic text-[14px] mt-1">
          {current.meaningDe}
        </div>
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        value={session.answerState === 'wrong' ? current.form : value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleEnterKey(); }}
        readOnly={session.answerState !== 'idle'}
        placeholder={t('placeholder')}
        className={[
          'w-full font-mono text-[24px] sm:text-[32px] font-bold text-center',
          'px-5 py-3 sm:py-[18px] rounded-[18px] border-2 outline-none',
          'transition-[border-color,background-color] duration-micro shadow-inset',
          session.answerState === 'correct' ? 'border-sage-700 bg-sage-50 text-sage-700'
            : session.answerState === 'wrong' ? 'border-berry-500 bg-warn-soft text-berry-700'
            : 'border-ink-200 bg-white-warm text-ink-900 focus:border-terracotta-400',
        ].join(' ')}
      />

      {/* Feedback */}
      {session.answerState === 'correct' && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-md text-[14px] font-bold bg-sage-50 text-sage-700 border border-sage-300/40">
          <i className="ph-fill ph-check-circle text-[20px]" aria-hidden="true" />
          {t('hint_correct', { xp: 12 })}
        </div>
      )}
      {session.answerState === 'wrong' && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-md text-[14px] font-bold bg-warn-soft text-berry-700 border border-berry-500/25">
          <i className="ph-fill ph-arrow-right text-[18px]" aria-hidden="true" />
          <span>
            {t.rich('hint_wrong', {
              typed:   value || '—',
              correct: current.form,
              mono:    (chunks) => <span className="font-mono">{chunks}</span>,
            })}
          </span>
        </div>
      )}

      {/* Footer: mascot + buttons */}
      <div className="flex justify-between items-center flex-wrap gap-3 gap-y-2 mt-1">
        <div className="flex items-center gap-2.5">
          <img
            key={session.answerState}
            src="/assets/mascot-mini.svg"
            alt=""
            width={56}
            height={56}
            className={`block select-none ${mascotAnim[mascotState]}`}
            draggable={false}
          />
          <span className="text-[13px] text-ink-500 font-semibold italic max-w-[200px]">
            {session.answerState === 'idle'    && (value ? t('mascot_typing') : t('mascot_idle'))}
            {session.answerState === 'correct' && t('mascot_correct')}
            {session.answerState === 'wrong'   && t('mascot_wrong')}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="md" icon="lightbulb">{t('btn_hint')}</Button>
          {session.answerState === 'idle'
            ? <Button variant="success" size="md" onClick={handleCheck} iconAfter="arrow-right">{t('btn_check')}</Button>
            : <Button variant="primary" size="md" onClick={handleNext}  iconAfter="arrow-right">{t('btn_next')}</Button>
          }
        </div>
      </div>
    </CardShell>
    </>
  );
});

export default PracticeCard;

// ── Sub-components ────────────────────────────────────────────────────────────

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-paper border-2 border-ink-900 rounded-[28px] p-5 sm:p-9 shadow-[0_6px_0_#2A1F1A] max-w-[560px] mx-auto flex flex-col gap-5">
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

function ResultTile({ value, label, valueClass = '', className = '' }: {
  value:       string;
  label:       string;
  valueClass?: string;
  className?:  string;
}) {
  return (
    <div className={`flex flex-col items-center gap-1.5 p-4 rounded-[16px] bg-cream border border-ink-900/[0.08] text-center ${className}`}>
      <p className={`font-bricolage font-bold text-[28px] leading-none ${valueClass || 'text-brand-dark'}`}>{value}</p>
      <p className="text-[11px] font-bold text-brand-muted uppercase tracking-[0.06em] leading-tight">{label}</p>
    </div>
  );
}
