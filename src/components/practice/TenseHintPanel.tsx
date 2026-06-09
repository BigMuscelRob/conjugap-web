'use client';
import { useTranslations } from 'next-intl';
import { TENSE_HINTS } from '@/lib/tenseHints';
import { TENSE_LABELS } from '@/lib/labels';

interface Props { tense: string; show: boolean; }

const PRONOUNS = ['yo', 'tú', 'él/ella', 'nosotros', 'vosotros', 'ellos/ellas'];

export default function TenseHintPanel({ tense, show }: Props) {
  const t    = useTranslations('tenseHints');
  const hint = TENSE_HINTS[tense];
  if (!hint || !show) return null;

  return (
    <div className="w-[min(560px,calc(100vw-2rem))] mx-auto bg-paper border-2 border-ink-900 rounded-[18px]
      shadow-[0_4px_0_#2A1F1A] p-5 flex flex-col gap-4
      animate-in slide-in-from-top-2 duration-200">

      <div>
        <p className="text-[11px] font-bold text-ink-400 uppercase tracking-[0.08em] mb-1">
          {t('label')}
        </p>
        <h3 className="font-bricolage font-bold text-[20px] text-ink-900">
          {TENSE_LABELS[tense]}
        </h3>
        <p className="text-[13px] font-semibold text-ink-600 mt-1">
          {t(`${tense}.usage`)}
        </p>
      </div>

      <div>
        <p className="text-[11px] font-bold text-ink-400 uppercase tracking-[0.08em] mb-2">
          {t('signalWords')}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {t(`${tense}.signals`).split(', ').map((w: string) => (
            <span key={w} className="px-2.5 py-0.5 rounded-full bg-saffron-50
              border border-saffron-200 text-saffron-700 text-[12px] font-bold">
              {w}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-bold text-ink-400 uppercase tracking-[0.08em] mb-2">
          {t('example')} — <span className="text-terracotta-500">{hint.example.verb}</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5" translate="no">
          {PRONOUNS.map(p => (
            <div key={p} className="flex items-center justify-between
              bg-cream rounded-lg px-3 py-1.5">
              <span className="text-[11px] font-bold text-ink-400 uppercase">{p}</span>
              <span className="text-[14px] font-bold text-ink-900 font-mono">
                {hint.example.conjugation[p]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
