'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

// ── Static data (mirrors SetupScreen.jsx) ────────────────────────────────────

const SETUP_CLASSES = [
  { key: '-ar',         label: '-ar regulares', dotClass: 'bg-terracotta-500' },
  { key: '-er',         label: '-er regulares', dotClass: 'bg-saffron-500'    },
  { key: '-ir',         label: '-ir regulares', dotClass: 'bg-sage-300'       },
  { key: 'irregulares', label: 'irregulares',   dotClass: 'bg-berry-500'      },
] as const;

const SETUP_VERBS = [
  { word: 'hablar',   cls: '-ar'         },
  { word: 'comer',    cls: '-er'         },
  { word: 'vivir',    cls: '-ir'         },
  { word: 'tener',    cls: 'irregulares' },
  { word: 'ir',       cls: 'irregulares' },
  { word: 'ser',      cls: 'irregulares' },
  { word: 'estar',    cls: 'irregulares' },
  { word: 'querer',   cls: 'irregulares' },
  { word: 'estudiar', cls: '-ar'         },
  { word: 'trabajar', cls: '-ar'         },
  { word: 'beber',    cls: '-er'         },
  { word: 'leer',     cls: '-er'         },
  { word: 'escribir', cls: '-ir'         },
  { word: 'salir',    cls: 'irregulares' },
  { word: 'venir',    cls: 'irregulares' },
  { word: 'hacer',    cls: 'irregulares' },
];

const SETUP_TENSES = [
  { key: 'pres',  label: 'Presente',             level: 'A1' },
  { key: 'pi',    label: 'Pretérito Indefinido', level: 'A2' },
  { key: 'imp',   label: 'Imperfecto',           level: 'A2' },
  { key: 'pp',    label: 'Pretérito Perfecto',   level: 'B1' },
  { key: 'fut',   label: 'Futuro Simple',        level: 'B1' },
  { key: 'cond',  label: 'Condicional',          level: 'B1' },
  { key: 'sub',   label: 'Subjuntivo Presente',  level: 'B2' },
  { key: 'imper', label: 'Imperativo',           level: 'B1' },
];

const MODES = [
  { key: 'structured' as const, icon: 'stack'   },
  { key: 'random'     as const, icon: 'shuffle' },
];

// ── Types ────────────────────────────────────────────────────────────────────

type Mode = 'structured' | 'random';

export type SessionConfig = {
  verbs:   string[];
  tenses:  string[];
  mode:    Mode;
  length:  number;
};

interface SetupScreenProps {
  onStart?: (config: SessionConfig) => void;
  onBack?:  () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SetupScreen({ onStart, onBack }: SetupScreenProps) {
  const t = useTranslations('practice.setup');

  const [selectedClasses, setSelectedClasses] = useState<string[]>(['-ar', '-er']);
  const [selectedVerbs,   setSelectedVerbs]   = useState<string[]>(['hablar', 'comer', 'vivir', 'tener']);
  const [selectedTenses,  setSelectedTenses]  = useState<string[]>(['pres']);
  const [mode,            setMode]            = useState<Mode>('structured');
  const [length,          setLength]          = useState(10);

  function toggle<T>(setter: React.Dispatch<React.SetStateAction<T[]>>, current: T[], key: T) {
    setter(current.includes(key) ? current.filter(x => x !== key) : [...current, key]);
  }

  const classVerbs     = SETUP_VERBS.filter(v => selectedClasses.includes(v.cls)).map(v => v.word);
  const effectiveVerbs = Array.from(new Set([...classVerbs, ...selectedVerbs]));
  const totalQuestions = Math.min(effectiveVerbs.length * selectedTenses.length, length);
  const estMinutes     = Math.max(2, Math.round(totalQuestions * 0.4));
  const canStart       = effectiveVerbs.length > 0 && selectedTenses.length > 0;

  return (
    <div className="relative min-h-[90vh] px-6 pt-10 pb-[120px] bg-brand-bg overflow-hidden">

      {/* Radial glow — can't be expressed as a Tailwind class */}
      <div
        className="absolute inset-x-0 top-0 h-[360px] pointer-events-none"
        style={{ background: 'radial-gradient(900px 360px at 30% 0%, #FFE6BD 0%, transparent 60%)' }}
      />

      <div className="relative max-w-content mx-auto grid grid-cols-[1.4fr_1fr] gap-8 items-start">

        {/* ── Page header ── */}
        <div className="col-span-full flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-paper border border-ink-900/[0.08]
                inline-flex items-center justify-center text-ink-900 shrink-0
                transition-colors duration-micro ease-smooth hover:bg-ink-50"
            >
              <i className="ph-bold ph-arrow-left text-base" aria-hidden="true" />
            </button>
            <div>
              <h1 className="font-bricolage font-bold text-[44px] leading-[1.05]
                tracking-[-0.025em] text-brand-dark m-0">
                {t('title')}
              </h1>
              <p className="text-base font-semibold text-brand-muted mt-1.5">
                {t('subtitle')}
              </p>
            </div>
          </div>

          {/* Streak badge */}
          <div className="inline-flex items-center gap-2.5 bg-brand-dark text-brand-yellow
            pl-2.5 pr-3.5 py-2 rounded-full font-bold text-sm whitespace-nowrap shrink-0">
            <i className="ph-fill ph-flame text-brand-orange text-base" aria-hidden="true" />
            {t('streak_label', { days: 12 })}
          </div>
        </div>

        {/* ── Left column ── */}
        <div className="flex flex-col gap-[18px]">

          {/* Card 1 · Verbos */}
          <div className="bg-paper border-2 border-brand-dark rounded-[24px] p-6 shadow-stamp-big flex flex-col gap-4">

            <div className="flex items-center gap-3">
              <SectNum>1</SectNum>
              <span className="font-bricolage font-bold text-22 tracking-tight-1 text-ink-900 whitespace-nowrap">
                {t('section_verbs')}
              </span>
              <span className="ml-auto text-[13px] font-semibold text-brand-muted shrink-0">
                {t('verbs_count', { count: effectiveVerbs.length })}
              </span>
            </div>

            {/* Group chips */}
            <div>
              <RowLabel>{t('by_group')}</RowLabel>
              <div className="flex flex-wrap gap-2 mt-2.5">
                {SETUP_CLASSES.map(c => {
                  const active = selectedClasses.includes(c.key);
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => toggle(setSelectedClasses, selectedClasses, c.key)}
                      className={`inline-flex items-center gap-2 pl-2.5 pr-3.5 py-2 rounded-full
                        border-2 font-bold text-[13px] transition-colors duration-micro ease-smooth
                        ${active
                          ? 'bg-brand-dark border-brand-dark text-white-warm'
                          : 'bg-white-warm border-ink-900/[0.12] text-ink-900 hover:border-ink-900/30'
                        }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dotClass}`} />
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Individual verb tiles */}
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <RowLabel>{t('specific_verbs')}</RowLabel>
                <span className="text-[11px] font-semibold text-ink-300">{t('most_common')}</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {SETUP_VERBS.map(v => {
                  const active  = selectedVerbs.includes(v.word);
                  const dotCls  = SETUP_CLASSES.find(c => c.key === v.cls)?.dotClass;
                  return (
                    <button
                      key={v.word}
                      type="button"
                      onClick={() => toggle(setSelectedVerbs, selectedVerbs, v.word)}
                      className={`px-3 py-2.5 rounded-[12px] border-2
                        flex items-center justify-between gap-1
                        transition-colors duration-micro ease-smooth
                        ${active
                          ? 'bg-brand-dark border-brand-dark'
                          : 'bg-white-warm border-ink-900/[0.08] hover:border-ink-900/20'
                        }`}
                    >
                      <span className={`font-mono text-sm font-bold truncate
                        ${active ? 'text-white-warm' : 'text-ink-900'}`}>
                        {v.word}
                      </span>
                      {dotCls && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotCls}`} />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card 2 · Tiempos */}
          <div className="bg-paper border-2 border-brand-dark rounded-[24px] p-6 shadow-stamp-big flex flex-col gap-4">

            <div className="flex items-center gap-3">
              <SectNum>2</SectNum>
              <span className="font-bricolage font-bold text-22 tracking-tight-1 text-ink-900 whitespace-nowrap">
                {t('section_tenses')}
              </span>
              <span className="ml-auto text-[13px] font-semibold text-brand-muted shrink-0">
                {t('tenses_count', { count: selectedTenses.length })}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {SETUP_TENSES.map(tense => {
                const active = selectedTenses.includes(tense.key);
                return (
                  <button
                    key={tense.key}
                    type="button"
                    onClick={() => toggle(setSelectedTenses, selectedTenses, tense.key)}
                    className={`inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-full
                      border-2 font-bold text-[13px] transition-colors duration-micro ease-smooth
                      ${active
                        ? 'bg-brand-dark border-brand-dark text-white-warm'
                        : 'bg-white-warm border-ink-900/[0.12] text-ink-900 hover:border-ink-900/30'
                      }`}
                  >
                    {tense.label}
                    <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-[6px]
                      ${active
                        ? 'bg-brand-yellow/[0.16] text-brand-yellow'
                        : 'bg-ink-900/[0.06] text-brand-muted'
                      }`}>
                      {tense.level}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 3 · Modo & longitud */}
          <div className="bg-paper border-2 border-brand-dark rounded-[24px] p-6 shadow-stamp-big flex flex-col gap-4">

            <div className="flex items-center gap-3">
              <SectNum>3</SectNum>
              <span className="font-bricolage font-bold text-22 tracking-tight-1 text-ink-900 whitespace-nowrap">
                {t('section_mode')}
              </span>
            </div>

            {/* Mode cards */}
            <div className="grid grid-cols-2 gap-3">
              {MODES.map(m => {
                const active = mode === m.key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMode(m.key)}
                    className={`p-[18px] rounded-[16px] border-2 text-left flex flex-col gap-1.5
                      transition-all duration-micro ease-smooth
                      ${active
                        ? 'border-brand-orange bg-terracotta-50 shadow-[inset_0_0_0_1px_#E8623D]'
                        : 'border-ink-900/[0.12] bg-white-warm hover:border-ink-900/25'
                      }`}
                  >
                    <span className="font-bricolage font-bold text-[17px] tracking-tight-1
                      text-ink-900 flex items-center gap-2 whitespace-nowrap">
                      <i className={`ph-bold ph-${m.icon} text-[20px] text-brand-orange`} aria-hidden="true" />
                      {m.key === 'structured' ? t('mode_structured_label') : t('mode_random_label')}
                    </span>
                    <span className="text-xs text-brand-muted font-semibold leading-snug">
                      {m.key === 'structured' ? t('mode_structured_body') : t('mode_random_body')}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Session length */}
            <div>
              <RowLabel className="mb-2.5">{t('session_length')}</RowLabel>
              <div className="flex gap-2">
                {([5, 10, 20, 50] as const).map(n => {
                  const active = length === n;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setLength(n)}
                      className={`flex-1 px-2 py-3 rounded-[12px] border-2 text-center
                        font-bricolage font-bold text-lg leading-none
                        transition-colors duration-micro ease-smooth
                        ${active
                          ? 'border-brand-dark bg-brand-dark text-brand-yellow'
                          : 'border-ink-900/[0.12] bg-white-warm text-ink-900 hover:border-ink-900/30'
                        }`}
                    >
                      {n}
                      <span className={`block text-[10px] font-bold uppercase tracking-wide-08 mt-1
                        ${active ? 'text-brand-yellow/60' : 'text-brand-muted'}`}>
                        {t('verbs_unit')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right column — Summary panel ── */}
        <div className="sticky top-24 bg-paper border-2 border-brand-dark rounded-[24px] p-6
          shadow-stamp-big flex flex-col gap-[18px]">

          {/* Panel header */}
          <div className="flex items-center gap-3">
            <Image
              src="/assets/mascot-mini.svg"
              width={48}
              height={48}
              alt=""
              className="animate-breathe shrink-0"
            />
            <div>
              <p className="font-bricolage font-bold text-[20px] tracking-tight-1 text-ink-900 leading-none">
                {t('summary_title')}
              </p>
              <p className="text-xs font-semibold text-brand-muted mt-1">
                {t('summary_live')}
              </p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-[12px] bg-cream-deep">
              <p className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.06em]">
                {t('stat_questions')}
              </p>
              <p className="font-bricolage font-bold text-[30px] tracking-tight-2 text-ink-900 leading-none mt-1">
                {totalQuestions}
              </p>
            </div>
            <div className="p-3 rounded-[12px] bg-cream-deep">
              <p className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.06em]">
                {t('stat_duration')}
              </p>
              <p className="font-bricolage font-bold text-[30px] tracking-tight-2 text-ink-900 leading-none mt-1">
                ~{estMinutes} min
              </p>
            </div>
          </div>

          {/* Summary rows */}
          <div>
            {[
              { label: t('row_verbs'),  value: effectiveVerbs.length,                                                        last: false },
              { label: t('row_tenses'), value: selectedTenses.length,                                                        last: false },
              { label: t('row_mode'),   value: mode === 'structured' ? t('mode_value_structured') : t('mode_value_random'), last: true  },
            ].map(row => (
              <div
                key={row.label}
                className={`flex justify-between items-baseline py-1.5
                  ${row.last ? '' : 'border-b border-dashed border-ink-900/[0.08]'}`}
              >
                <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-brand-muted">
                  {row.label}
                </span>
                <span className="font-bold font-mono text-sm text-brand-dark">
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Start CTA */}
          <button
            type="button"
            disabled={!canStart}
            onClick={() => canStart && onStart?.({ verbs: effectiveVerbs, tenses: selectedTenses, mode, length })}
            className="w-full inline-flex items-center justify-center gap-2
              font-body font-bold text-[17px] text-white-warm
              px-7 py-4 bg-terracotta-500 border-2 border-ink-900 rounded-md
              shadow-stamp-primary transition-all duration-micro ease-smooth
              hover:-translate-y-px hover:shadow-stamp-primary-hover
              active:translate-y-0.5 active:shadow-none active:bg-terracotta-600
              disabled:opacity-50 disabled:cursor-not-allowed
              disabled:translate-y-0 disabled:shadow-stamp-primary"
          >
            {canStart ? t('start') : t('start_disabled')}
            <i className="ph-bold ph-arrow-right" aria-hidden="true" />
          </button>

          {/* Pro tip */}
          <p className="text-[11px] font-semibold text-brand-muted text-center leading-snug">
            {t.rich('pro_tip', { em: (chunks) => <em>{chunks}</em> })}
          </p>
        </div>

      </div>
    </div>
  );
}

// ── Small shared sub-components ───────────────────────────────────────────────

function SectNum({ children }: { children: React.ReactNode }) {
  return (
    <span className="w-[30px] h-[30px] rounded-full bg-brand-dark text-brand-yellow
      inline-flex items-center justify-center font-mono text-[13px] font-bold shrink-0">
      {children}
    </span>
  );
}

function RowLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-[11px] font-bold text-brand-muted uppercase tracking-wide-08 ${className}`}>
      {children}
    </p>
  );
}
