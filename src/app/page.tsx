'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

export default function ComingSoonPage() {
  const t = useTranslations('coming_soon');

  return (
    <div className="relative min-h-screen bg-brand-bg flex flex-col overflow-hidden">

      {/* Radial glow */}
      <div
        className="absolute inset-x-0 top-0 h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(800px 400px at 50% -10%, #FFE6BD 0%, transparent 65%)' }}
      />

      {/* Top bar — logo + language switcher */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <Image
          src="/assets/logo-wordmark.svg"
          width={140}
          height={32}
          alt="ConjuGap"
          priority
        />
        <LanguageSwitcher />
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">

        {/* Mascot */}
        <Image
          src="/assets/mascot-verbito.svg"
          width={120}
          height={120}
          alt=""
          className="animate-breathe mb-8"
        />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-brand-dark text-brand-yellow
          px-4 py-2 rounded-full font-mono text-xs font-bold uppercase tracking-[0.08em] mb-6">
          <i className="ph-fill ph-clock text-brand-orange text-sm" aria-hidden="true" />
          {t('badge')}
        </div>

        {/* Headline */}
        <h1 className="font-bricolage font-bold text-[42px] sm:text-[56px] leading-[1.05]
          tracking-[-0.025em] text-brand-dark max-w-[640px] whitespace-pre-line mb-5">
          {t('title')}
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg font-semibold text-brand-muted max-w-[480px] leading-relaxed mb-10">
          {t('subtitle')}
        </p>

        {/* ETA pill */}
        <div className="inline-flex items-center gap-2.5 bg-paper border-2 border-brand-dark
          px-5 py-3 rounded-full shadow-stamp-big">
          <i className="ph-bold ph-calendar-blank text-brand-orange text-base" aria-hidden="true" />
          <span className="font-bricolage font-bold text-[15px] text-brand-dark">
            {t('eta')}
          </span>
        </div>

      </main>

      {/* Subtle bottom decoration */}
      <div className="relative z-10 pb-8 text-center">
        <p className="font-mono text-[11px] font-bold text-ink-300 uppercase tracking-[0.08em]">
          conjugap.com
        </p>
      </div>

    </div>
  );
}
