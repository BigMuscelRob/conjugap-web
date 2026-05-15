'use client';

import { useTranslations } from 'next-intl';

const STAT_VALUES = ['12.430', '2.840', '9.2 Tage'];

const STAT_STYLES = [
  { className: 'bg-terracotta-500 text-white-warm', labelClass: 'text-terracotta-100', descClass: 'text-terracotta-200' },
  { className: 'bg-paper text-ink-900',             labelClass: 'text-ink-500',         descClass: 'text-ink-700'        },
  { className: 'bg-sage-300 text-ink-900',          labelClass: 'text-sage-700',         descClass: 'text-ink-700'        },
];

export default function Stats() {
  const t = useTranslations('stats');

  return (
    <section className="bg-cream-deep py-20 px-6">
      <div className="max-w-content mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
        {STAT_STYLES.map((s, i) => (
          <div
            key={i}
            className={`${s.className} border-2 border-ink-900 rounded-lg p-8 shadow-stamp-big flex flex-col gap-3`}
          >
            <span className={`text-[13px] font-bold uppercase tracking-wide-08 ${s.labelClass}`}>
              {t(`items.${i}.label`)}
            </span>
            <span className="font-display font-bold text-64 leading-none tracking-tightest">
              {STAT_VALUES[i]}
            </span>
            <span className={`text-sm leading-5 mt-3 ${s.descClass}`}>
              {t(`items.${i}.description`)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
