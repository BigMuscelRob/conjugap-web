'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface DesktopAuthProps {
  loggedIn:      boolean;
  userName?:     string | null;
  userImage?:    string | null;
  signOutAction: () => Promise<void>;
}

export default function DesktopAuth({ loggedIn, userName, userImage, signOutAction }: DesktopAuthProps) {
  const t = useTranslations('header');

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  if (loggedIn) {
    return (
      <div ref={ref} className="hidden md:flex items-center gap-3 shrink-0 ml-6 relative">
        {/* Avatar button */}
        <button
          type="button"
          onClick={() => setOpen(prev => !prev)}
          aria-expanded={open}
          aria-label="Profilmenü öffnen"
          className="cursor-pointer focus:outline-none"
        >
          <div className="relative w-8 h-8 rounded-full border-2 border-ink-900/20 overflow-hidden bg-saffron-100 flex items-center justify-center shrink-0">
            <span className="font-bold text-[13px] text-saffron-700 select-none">
              {userName?.[0]?.toUpperCase() ?? '?'}
            </span>
            {userImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userImage}
                alt={userName ?? ''}
                width={32}
                height={32}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
          </div>
        </button>

        <span className="font-bold text-small text-ink-700">
          {userName?.split(' ')[0]}
        </span>

        {/* Dropdown */}
        {open && (
          <div className="absolute top-full right-0 mt-2 min-w-[160px] bg-cream border-2 border-ink-900 rounded-2xl shadow-stamp z-50 overflow-hidden">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="block w-full px-4 py-3 font-bold text-small text-ink-900 text-left no-underline
                hover:bg-ink-100 transition-colors duration-micro ease-smooth"
            >
              {t('nav.dashboard')}
            </Link>
            <div className="border-t border-ink-900/10 mx-3" />
            <Link
              href="/profil"
              onClick={() => setOpen(false)}
              className="block w-full px-4 py-3 font-bold text-small text-ink-900 text-left no-underline
                hover:bg-ink-100 transition-colors duration-micro ease-smooth"
            >
              {t('nav.profil')}
            </Link>
            <div className="border-t border-ink-900/10 mx-3" />
            <form action={signOutAction}>
              <button
                type="submit"
                className="block w-full text-left px-4 py-3 font-bold text-small text-terracotta-500
                  hover:bg-terracotta-50 transition-colors duration-micro ease-smooth"
              >
                {t('signout')}
              </button>
            </form>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-3 shrink-0 ml-6">
      <Link
        href="/login"
        className="font-bold text-small text-ink-700 no-underline
          transition-colors duration-micro ease-smooth hover:text-ink-900"
      >
        {t('login')}
      </Link>
      <Link
        href="/login"
        className="inline-flex items-center font-body font-bold text-small text-white-warm no-underline
          px-4 py-2 bg-terracotta-500 border-2 border-ink-900 rounded-md
          shadow-stamp-primary transition-all duration-micro ease-smooth
          hover:-translate-y-px hover:shadow-stamp-primary-hover
          active:translate-y-0.5 active:shadow-none active:bg-terracotta-600"
      >
        {t('cta')}
      </Link>
    </div>
  );
}
