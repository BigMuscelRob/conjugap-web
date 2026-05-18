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

// ── Queue item ────────────────────────────────────────────────────────────────

type QueueItem = {
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

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  config: SessionConfig;
}

export default function PracticeCard({ config }: Props) {
  const t = useTranslations('practice.card');

  const [queue,   setQueue]   = useState<QueueItem[]>([]);
  const [qIdx,    setQIdx]    = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [value,   setValue]   = useState('');
  const [status,  setStatus]  = useState<Status>('typing');
  const inputRef              = useRef<HTMLInputElement>(null);

  // ── Load verb + conjugation data, build queue ────────────────────────────
  useEffect(() => {
    async function buildQueue() {
      setLoading(true);
      setError(null);
      try {
        const verbsRes  = await fetch('/api/verbs');
        const allVerbs: ApiVerb[] = await verbsRes.json();
        const selected  = allVerbs.filter(v => config.verbs.includes(v.infinitive));

        const items: QueueItem[] = [];

        for (const verb of selected) {
          const conjRes  = await fetch(`/api/verbs/${verb.id}/conjugations`);
          const full: ApiVerbFull = await conjRes.json();

          for (const tenseKey of config.tenses) {
            const forms = full.conjugations.filter(c => c.tense === tenseKey);
            for (const pronoun of PRONOUN_ORDER) {
              const conj = forms.find(c => c.pronoun === pronoun);
              if (conj && conj.form !== '—') {
                items.push({
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

        let final = config.mode === 'random'
          ? [...items].sort(() => Math.random() - 0.5)
          : items;

        if (config.length < final.length) {
          final = final.slice(0, config.length);
        }

        setQueue(final);
        setQIdx(0);
      } catch {
        setError('Fehler beim Laden der Verbdaten.');
      } finally {
        setLoading(false);
      }
    }
    buildQueue();
  }, [config]);

  useEffect(() => {
    if (!loading) inputRef.current?.focus();
  }, [qIdx, loading]);

  // ── Derived ──────────────────────────────────────────────────────────────
  const current  = queue[qIdx];
  const progress = queue.length > 0 ? ((qIdx + 1) / queue.length) * 100 : 0;
  const done     = !loading && qIdx >= queue.length && queue.length > 0;

  function check() {
    if (!current || status !== 'typing') { next(); return; }
    const ok = value.trim().toLowerCase() === current.form.toLowerCase();
    setStatus(ok ? 'correct' : 'wrong');
  }

  function next() {
    setStatus('typing');
    setValue('');
    setQIdx(i => i + 1);
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

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <CardShell>
        <div className="flex flex-col items-center gap-4 py-10">
          <div className="w-10 h-10 border-4 border-terracotta-200 border-t-terracotta-500 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-brand-muted">Lade Verben…</p>
        </div>
      </CardShell>
    );
  }

  // ── Error / empty ─────────────────────────────────────────────────────────
  if (error || queue.length === 0) {
    return (
      <CardShell>
        <p className="text-base font-semibold text-berry-700 text-center py-10">
          {error ?? 'Keine Fragen für diese Auswahl.'}
        </p>
      </CardShell>
    );
  }

  // ── Done ──────────────────────────────────────────────────────────────────
  if (done) {
    return (
      <CardShell>
        <div className="flex flex-col items-center gap-3 py-10">
          <i className="ph-fill ph-check-circle text-[56px] text-sage-500" aria-hidden="true" />
          <p className="font-bricolage font-bold text-[28px] text-brand-dark">Session abgeschlossen!</p>
          <p className="text-sm font-semibold text-brand-muted">{queue.length} Fragen beantwortet.</p>
        </div>
      </CardShell>
    );
  }

  // ── Main card ─────────────────────────────────────────────────────────────
  return (
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
          <span>{qIdx + 1} / {queue.length}</span>
          <div className="w-16 h-2 bg-ink-100 rounded-pill overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-terracotta-500 to-saffron-300 rounded-pill transition-all duration-base"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Prompt */}
      <div className="text-center flex flex-col gap-1">
        <div className="text-[14px] font-bold text-ink-500 tracking-wide-08 uppercase">
          {PRONOUN_LABELS[current.pronoun] ?? current.pronoun}
        </div>
        <div className="font-display text-[56px] font-bold tracking-tightest text-ink-900 leading-none">
          {current.infinitive}
        </div>
        <div className="text-ink-500 italic text-[14px] mt-1">
          {current.meaningDe}
        </div>
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        value={status === 'wrong' ? current.form : value}
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
              correct: current.form,
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
            ? <Button variant="success" size="md" onClick={check} iconAfter="arrow-right">{t('btn_check')}</Button>
            : <Button variant="primary" size="md" onClick={next}  iconAfter="arrow-right">{t('btn_next')}</Button>
          }
        </div>
      </div>
    </CardShell>
  );
}

// ── Shared card shell ─────────────────────────────────────────────────────────

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-paper border-2 border-ink-900 rounded-[28px] p-9 shadow-[0_6px_0_#2A1F1A] max-w-[560px] mx-auto flex flex-col gap-5">
      {children}
    </div>
  );
}
