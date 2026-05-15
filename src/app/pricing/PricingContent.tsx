'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

const PLAN_PRICES  = ['0 €', '4,99 €'];
const PLAN_HIGHLIGHT = [false, true];
const PLAN_CARD_CLASS = ['bg-paper', 'bg-terracotta-500 text-white-warm'];
const PLAN_CTA_CLASS = [
  'bg-terracotta-500 text-white-warm border-ink-900 shadow-stamp-primary ' +
  'hover:-translate-y-px hover:shadow-stamp-primary-hover active:translate-y-0.5 active:shadow-none',
  'bg-ink-900 text-white-warm border-ink-900 shadow-stamp ' +
  'hover:-translate-y-px hover:shadow-stamp-hover active:translate-y-0.5 active:shadow-none',
];

export default function PricingContent() {
  const t = useTranslations('pricing');

  return (
    <div className="max-w-content mx-auto px-6 py-20">

      {/* Header */}
      <div className="text-center flex flex-col items-center gap-5 mb-14">
        <p className="text-overline tracking-wide-10 uppercase font-bold text-ink-500">{t('overline')}</p>
        <h1 className="font-display font-bold text-h1 leading-[60px] tracking-tight-2 text-ink-900">
          {t('title')}
        </h1>
        <p className="text-bodyL text-ink-500 max-w-[420px]">
          {t('subtitle')}
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-[760px] mx-auto">
        {[0, 1].map((i) => {
          const featureCount = i === 0 ? 4 : 5;
          return (
            <div
              key={i}
              className={`${PLAN_CARD_CLASS[i]} border-2 border-ink-900 rounded-xl p-8 shadow-stamp-big flex flex-col gap-5 relative`}
            >
              {PLAN_HIGHLIGHT[i] && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2
                  bg-saffron-500 text-ink-900 border-2 border-ink-900
                  rounded-pill px-3.5 py-1 text-micro font-bold whitespace-nowrap shadow-stamp-sm">
                  {t('popular')}
                </span>
              )}

              <div className="font-display font-bold text-h3 leading-[30px]">{t(`plans.${i}.name`)}</div>

              <div className="font-display font-bold text-48 leading-none tracking-tightest">
                {PLAN_PRICES[i]}
                <span className="text-small font-semibold opacity-70"> / {t(`plans.${i}.period`)}</span>
              </div>

              <p className="text-small opacity-85">{t(`plans.${i}.description`)}</p>

              <ul className="list-none flex flex-col gap-3 flex-1">
                {Array.from({ length: featureCount }, (_, fi) => (
                  <li key={fi} className="flex items-center gap-2 text-small font-semibold">
                    <i className="ph-bold ph-check text-sage-500" aria-hidden="true" />
                    {t(`plans.${i}.features.${fi}`)}
                  </li>
                ))}
              </ul>

              <Link
                href="/practice"
                className={`flex justify-center items-center font-body font-bold text-[15px] no-underline
                  px-6 py-3.5 border-2 rounded-md
                  transition-all duration-micro ease-smooth
                  ${PLAN_CTA_CLASS[i]}`}
              >
                {t(`plans.${i}.cta`)}
              </Link>
            </div>
          );
        })}
      </div>

    </div>
  );
}
