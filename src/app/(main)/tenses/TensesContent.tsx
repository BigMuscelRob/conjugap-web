'use client';

import { useTranslations } from 'next-intl';

const TENSES_META = [
  { key: 'pres',  name: 'Presente',            level: 'A1', dotClass: 'bg-terracotta-500', btnClass: 'text-terracotta-500' },
  { key: 'pi',    name: 'Pretérito Indefinido', level: 'A2', dotClass: 'bg-saffron-500',    btnClass: 'text-saffron-600'   },
  { key: 'imp',   name: 'Imperfecto',           level: 'A2', dotClass: 'bg-sage-300',       btnClass: 'text-sage-500'      },
  { key: 'pp',    name: 'Pretérito Perfecto',   level: 'B1', dotClass: 'bg-saffron-300',    btnClass: 'text-saffron-700'   },
  { key: 'fut',   name: 'Futuro Simple',        level: 'B1', dotClass: 'bg-ink-300',        btnClass: 'text-ink-700'       },
  { key: 'cond',  name: 'Condicional',          level: 'B1', dotClass: 'bg-berry-500',      btnClass: 'text-berry-500'     },
  { key: 'sub',   name: 'Subjuntivo Presente',  level: 'B2', dotClass: 'bg-terracotta-700', btnClass: 'text-terracotta-700'},
  { key: 'imper', name: 'Imperativo',           level: 'B1', dotClass: 'bg-berry-300',      btnClass: 'text-berry-500'     },
];

export default function TensesContent() {
  const t = useTranslations('tenses');

  return (
    <div className="max-w-content mx-auto px-6 py-20">

      {/* Header */}
      <div className="text-center flex flex-col items-center gap-5 mb-14">
        <p className="text-overline tracking-wide-10 uppercase font-bold text-ink-500">
          {t('overline')}
        </p>
        <h1 className="font-display font-bold text-h1 leading-[60px] tracking-tight-2 text-ink-900">
          {t('title')}
        </h1>
        <p className="text-bodyL text-ink-500 max-w-[480px]">
          {t('subtitle')}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {TENSES_META.map(tense => (
          <div
            key={tense.key}
            className="bg-paper border-2 border-ink-900 rounded-lg p-8 shadow-stamp-big flex flex-col gap-4
              transition-all duration-base ease-smooth
              hover:-translate-y-0.5 hover:shadow-stamp-big-hover"
          >
            <span className={`w-2.5 h-2.5 rounded-full ${tense.dotClass}`} />
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-h3 leading-[30px] tracking-tight-1 text-ink-900">
                {tense.name}
              </h2>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-[6px] bg-ink-900/[0.06] text-brand-muted">
                {tense.level}
              </span>
            </div>
            <p className="text-small text-ink-700 flex-1">{t(`items.${tense.key}.desc`)}</p>
            <button
              type="button"
              className={`inline-flex items-center gap-1 font-body font-bold text-small
                bg-transparent border-none cursor-pointer mt-auto p-0
                transition-gap duration-micro ease-smooth ${tense.btnClass}`}
            >
              {t('practice_btn')} <i className="ph-bold ph-arrow-right" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
