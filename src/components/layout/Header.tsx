'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

export default function Header() {
  const pathname = usePathname();
  const t = useTranslations('header');

  const NAV_LINKS = [
    { href: '/practice', label: t('nav.practice') },
    { href: '/tenses',   label: t('nav.tenses')   },
    { href: '/pricing',  label: t('nav.pricing')  },
  ];

  return (
    <header className="sticky top-0 z-50 bg-cream/85 backdrop-blur-md border-b border-ink-900/[0.08]">
      <div className="max-w-content mx-auto px-6 py-3.5 flex items-center gap-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 no-underline text-ink-900 shrink-0">
          <Image src="/assets/mascot-mini.svg" width={32} height={32} alt="Verbito Maskottchen" />
          <span className="font-display font-bold text-[22px] tracking-tightest">
            Verb<span className="text-terracotta-500">ito</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6 ml-auto" aria-label="Hauptnavigation">
          <LanguageSwitcher />
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`font-bold text-small no-underline transition-colors duration-micro ease-smooth
                ${pathname === href ? 'text-terracotta-500' : 'text-ink-700 hover:text-ink-900'}`}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/login"
            className="font-bold text-small text-ink-700 no-underline
              transition-colors duration-micro ease-smooth
              hover:text-ink-900"
          >
            {t('login')}
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/practice"
            className="inline-flex items-center font-body font-bold text-small text-white-warm no-underline
              px-4 py-2 bg-terracotta-500 border-2 border-ink-900 rounded-md
              shadow-stamp-primary
              transition-all duration-micro ease-smooth
              hover:-translate-y-px hover:shadow-stamp-primary-hover
              active:translate-y-0.5 active:shadow-none active:bg-terracotta-600"
          >
            {t('cta')}
          </Link>
        </div>

      </div>
    </header>
  );
}
