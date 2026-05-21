'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function NavLinks() {
  const pathname = usePathname();
  const t        = useTranslations('header');

  const links = [
    { href: '/practice', label: t('nav.practice') },
    { href: '/tenses',   label: t('nav.tenses')   },
    { href: '/pricing',  label: t('nav.pricing')  },
  ];

  return (
    <>
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`font-bold text-small no-underline transition-colors duration-micro ease-smooth
            ${pathname === href ? 'text-terracotta-500' : 'text-ink-700 hover:text-ink-900'}`}
        >
          {label}
        </Link>
      ))}
    </>
  );
}
