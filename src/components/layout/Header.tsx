'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

export default function Header() {
  const pathname    = usePathname();
  const t           = useTranslations('header');
  const headerRef   = useRef<HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    if (!drawerOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setDrawerOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  // Close on outside click
  useEffect(() => {
    if (!drawerOpen) return;
    function onMouseDown(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setDrawerOpen(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [drawerOpen]);

  const NAV_LINKS = [
    { href: '/practice', label: t('nav.practice') },
    { href: '/tenses',   label: t('nav.tenses')   },
    { href: '/pricing',  label: t('nav.pricing')  },
  ];

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 bg-cream/85 backdrop-blur-md border-b border-ink-900/[0.08]"
    >
      <div className="max-w-content mx-auto px-4 sm:px-6 py-3.5 flex items-center">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 no-underline text-ink-900 shrink-0">
          <Image src="/assets/mascot-mini.svg" width={32} height={32} alt="ConjuGap Logo" />
          <span className="font-display font-bold text-[22px] tracking-tightest">
            Conju<span className="text-terracotta-500">Gap</span>
          </span>
        </Link>

        {/* Desktop Nav */}
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
              transition-colors duration-micro ease-smooth hover:text-ink-900"
          >
            {t('login')}
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto md:ml-0 shrink-0">
          {/* Desktop CTA */}
          <Link
            href="/practice"
            className="hidden md:inline-flex items-center font-body font-bold text-small text-white-warm no-underline
              px-4 py-2 bg-terracotta-500 border-2 border-ink-900 rounded-md
              shadow-stamp-primary
              transition-all duration-micro ease-smooth
              hover:-translate-y-px hover:shadow-stamp-primary-hover
              active:translate-y-0.5 active:shadow-none active:bg-terracotta-600"
          >
            {t('cta')}
          </Link>

          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={() => setDrawerOpen(prev => !prev)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full
              text-ink-900 hover:bg-ink-100 transition-colors duration-micro ease-smooth"
            aria-label={drawerOpen ? 'Menü schließen' : 'Menü öffnen'}
            aria-expanded={drawerOpen}
          >
            <i
              className={`ph-bold ${drawerOpen ? 'ph-x' : 'ph-list'} text-[28px]`}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="md:hidden bg-cream border-b border-ink-900/[0.08] animate-slide-up">
          <div className="max-w-content mx-auto px-6 py-6 flex flex-col gap-5">
            <LanguageSwitcher />
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`font-bold text-[17px] no-underline py-1
                  transition-colors duration-micro ease-smooth
                  ${pathname === href ? 'text-terracotta-500' : 'text-ink-700'}`}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/login"
              className="font-bold text-[17px] text-ink-700 no-underline py-1
                transition-colors duration-micro ease-smooth"
            >
              {t('login')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
