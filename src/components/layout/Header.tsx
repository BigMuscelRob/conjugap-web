'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/practice', label: 'Practicar' },
  { href: '/tenses', label: 'Tiempos' },
  { href: '/pricing', label: 'Precios' },
];

export default function Header() {
  const pathname = usePathname();

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
        <nav className="hidden md:flex gap-6 ml-auto" aria-label="Hauptnavigation">
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
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/login"
            className="hidden md:inline-flex font-bold text-small text-ink-700 no-underline
              px-3.5 py-2 rounded-sm transition-colors duration-micro ease-smooth
              hover:bg-ink-50 hover:text-ink-900"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/practice"
            className="inline-flex items-center font-body font-bold text-small text-white-warm no-underline
              px-4 py-2 bg-terracotta-500 border-2 border-ink-900 rounded-md
              shadow-stamp-primary
              transition-all duration-micro ease-smooth
              hover:-translate-y-px hover:shadow-stamp-primary-hover
              active:translate-y-0.5 active:shadow-none active:bg-terracotta-600"
          >
            Empezar gratis
          </Link>
        </div>

      </div>
    </header>
  );
}
