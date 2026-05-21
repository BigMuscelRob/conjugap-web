'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

interface MobileNavProps {
  loggedIn: boolean;
  userName?: string | null;
  signOutAction: () => Promise<void>;
}

export default function MobileNav({ loggedIn, userName, signOutAction }: MobileNavProps) {
  const pathname  = usePathname();
  const t         = useTranslations('header');
  const ref       = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const NAV_LINKS = [
    { href: '/practice', label: t('nav.practice') },
    { href: '/tenses',   label: t('nav.tenses')   },
    { href: '/pricing',  label: t('nav.pricing')  },
  ];

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  return (
    <div ref={ref} className="md:hidden">
      {/* Hamburger button */}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="ml-auto flex items-center justify-center w-10 h-10 rounded-full
          text-ink-900 hover:bg-ink-100 transition-colors duration-micro ease-smooth"
        aria-label={open ? 'Menü schließen' : 'Menü öffnen'}
        aria-expanded={open}
      >
        <i className={`ph-bold ${open ? 'ph-x' : 'ph-list'} text-[28px]`} aria-hidden="true" />
      </button>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-x-0 top-[57px] bg-cream border-b border-ink-900/[0.08] animate-slide-up z-40">
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
            {loggedIn ? (
              <>
                <span className="font-bold text-[17px] text-ink-700 py-1">
                  {userName?.split(' ')[0]}
                </span>
                <form action={signOutAction}>
                  <button type="submit" className="font-bold text-[17px] text-ink-500 py-1 text-left">
                    Abmelden
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className="font-bold text-[17px] text-ink-700 no-underline py-1
                  transition-colors duration-micro ease-smooth"
              >
                {t('login')}
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
