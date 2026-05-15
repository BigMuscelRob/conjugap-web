'use client';

import { useTranslations } from 'next-intl';

export default function PracticeContent() {
  const t = useTranslations('practice');

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-14">
      <div className="max-w-practice w-full text-center flex flex-col items-center gap-5">

        <span className="text-overline tracking-wide-10 uppercase font-bold text-ink-500">
          {t('overline')}
        </span>

        <h1 className="font-display font-bold text-h1 leading-[60px] tracking-tight-2 text-ink-900">
          {t('title')}
        </h1>

        <p className="text-bodyL text-ink-500 max-w-[480px]">
          {t('subtitle')}
        </p>

        <div className="mt-8 flex flex-col items-center gap-5 w-full max-w-[400px]
          bg-paper border-2 border-ink-900/[0.16] rounded-xl p-14 shadow-inset">
          <i className="ph-duotone ph-lightning text-terracotta-500 text-[64px]" aria-hidden="true" />
          <p className="text-small text-ink-500">{t('coming_soon')}</p>
        </div>

      </div>
    </div>
  );
}
