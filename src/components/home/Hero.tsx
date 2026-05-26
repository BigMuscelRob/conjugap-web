'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: 'radial-gradient(900px 500px at 30% 0%, #FFE6BD 0%, transparent 60%), #FBF4E6' }}
    >
      <div className="max-w-content mx-auto px-4 sm:px-6 py-12 sm:py-20 sm:pb-24 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">

        {/* Copy */}
        <div className="flex flex-col">

          {/* Eyebrow */}
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-paper border border-ink-900/[0.08] text-overline tracking-wide-10 uppercase font-bold text-ink-700 w-fit mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-300" />
            {t('eyebrow')}
          </span>

          {/* Title */}
          <h1 className="font-display font-bold text-64 leading-[64px] tracking-tightest text-ink-900 text-wrap mb-5 max-[480px]:text-[38px] max-[480px]:leading-[42px] max-[900px]:text-[48px] max-[900px]:leading-[50px]">
            Spanish verbs,<br />
            finally <span className="text-terracotta-500">on your side</span>.
          </h1>

          {/* Subtitle */}
          <p className="text-bodyL text-ink-700 max-w-[480px] w-full mb-8">
            {t('subtitle')}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 items-center max-[480px]:flex-col max-[480px]:items-stretch">
            <Link
              href="/practice"
              className="inline-flex items-center justify-center gap-2 font-body font-bold text-[17px] text-white-warm no-underline
                px-7 py-4 bg-terracotta-500 border-2 border-ink-900 rounded-md shadow-stamp-primary
                transition-all duration-micro ease-smooth
                hover:-translate-y-px hover:shadow-stamp-primary-hover
                active:translate-y-0.5 active:shadow-none active:bg-terracotta-600"
            >
              <i className="ph-bold ph-lightning" aria-hidden="true" />
              {t('cta_primary')}
            </Link>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 font-body font-bold text-[17px] text-ink-900
                px-7 py-4 bg-transparent border-2 border-transparent rounded-md
                transition-colors duration-micro ease-smooth
                hover:bg-ink-50
                active:bg-ink-100"
            >
              <i className="ph-bold ph-play-circle" aria-hidden="true" />
              {t('cta_secondary')}
            </button>
          </div>


        </div>

        {/* Art — hidden on small screens */}
        <div className="relative hidden lg:flex items-center justify-center min-h-[360px]" aria-hidden="true">
          <div className="absolute w-[360px] h-[360px] rounded-full bg-saffron-100" />
          <Image
            src="/assets/mascot-verbito.svg"
            width={300}
            height={300}
            alt="ConjuGap Maskottchen"
            priority
            className="relative z-10 animate-breathe"
          />
          {/* Speech bubbles */}
          <div className="absolute top-[30px] right-0 z-20 bg-paper border-2 border-ink-900 rounded-lg px-3.5 py-2.5 shadow-stamp-big font-bold text-sm text-ink-900 whitespace-nowrap">
            ¡Vamos!
          </div>
          <div className="absolute bottom-[60px] -left-2.5 z-20 bg-sage-300 border-2 border-ink-900 rounded-lg px-3.5 py-2.5 shadow-stamp-big font-bold text-sm text-ink-900 whitespace-nowrap">
            +12 XP
          </div>
          <div className="absolute bottom-0 right-[30px] z-20 bg-saffron-500 border-2 border-ink-900 rounded-lg px-3.5 py-2.5 shadow-stamp-big font-bold text-sm text-ink-900 whitespace-nowrap flex items-center gap-1.5">
            <i className="ph-fill ph-flame text-terracotta-500 text-lg" />
            12 días
          </div>
        </div>

      </div>
    </section>
  );
}
