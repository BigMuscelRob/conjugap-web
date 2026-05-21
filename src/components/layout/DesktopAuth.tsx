'use client';

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

  if (loggedIn) {
    return (
      <div className="hidden md:flex items-center gap-3 shrink-0 ml-6">
        {userImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={userImage}
            alt={userName ?? ''}
            className="w-8 h-8 rounded-full border-2 border-ink-900/20"
          />
        )}
        <span className="font-bold text-small text-ink-700">
          {userName?.split(' ')[0]}
        </span>
        <form action={signOutAction}>
          <button
            type="submit"
            className="font-bold text-small text-ink-500 hover:text-ink-900
              transition-colors duration-micro ease-smooth"
          >
            Abmelden
          </button>
        </form>
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
        href="/practice"
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
