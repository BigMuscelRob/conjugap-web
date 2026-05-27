'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

const FOOTER_HREFS = {
  product:   ['/practice', '/tenses', '/pricing'],
  resources: ['/faq'],
  legal:     ['/imprint', '/privacy', '/terms'],
};

const RESOURCE_LABELS = ['FAQ'];
const LEGAL_LABELS_DE = ['Impressum', 'Datenschutz', 'AGB'];

export default function Footer() {
  const t = useTranslations('footer');
  const th = useTranslations('header.nav');

  const FOOTER_LINKS = {
    [t('groups.product')]: [
      { href: '/practice', label: th('practice') },
      { href: '/tenses',   label: th('tenses')   },
      { href: '/pricing',  label: th('pricing')  },
    ],
    [t('groups.resources')]: FOOTER_HREFS.resources.map((href, i) => ({
      href,
      label: RESOURCE_LABELS[i],
    })),
    [t('groups.legal')]: FOOTER_HREFS.legal.map((href, i) => ({
      href,
      label: LEGAL_LABELS_DE[i],
    })),
  };

  return (
    <footer className="bg-cream-deep border-t border-ink-900/[0.08]">

      {/* Main content */}
      <div className="max-w-content mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-[1.5fr_2fr] gap-14">

        {/* Brand */}
        <div className="flex flex-col gap-5">
          <Link href="/" className="inline-flex items-center gap-2 no-underline text-ink-900 w-fit">
            <Image src="/assets/mascot-mini.svg" width={28} height={28} alt="" />
            <span className="font-display font-bold text-[20px] tracking-tightest">
              Conju<span className="text-terracotta-500">Gap</span>
            </span>
          </Link>
          <p className="text-small text-ink-500 max-w-[220px] leading-5">
            {t('tagline')}
          </p>
        </div>

        {/* Link groups */}
        <nav
          className="grid grid-cols-2 sm:grid-cols-3 gap-8"
          aria-label="Footer-Navigation"
        >
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group} className="flex flex-col gap-3">
              <span className="text-overline tracking-wide-10 uppercase font-bold text-ink-500">
                {group}
              </span>
              <ul className="list-none flex flex-col gap-2">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-small font-semibold text-ink-700 no-underline
                        transition-colors duration-micro ease-smooth
                        hover:text-terracotta-500"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-ink-900/[0.08]">
        <div className="max-w-content mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-micro font-semibold text-ink-500">
            © {new Date().getFullYear()} ConjuGap. {t('copyright')}
          </span>
          <span className="text-micro font-semibold text-ink-500 flex items-center gap-1">
            {t('made_with')}{' '}
            <i className="ph-fill ph-heart text-terracotta-500" aria-hidden="true" />{' '}
            in Munich
          </span>
        </div>
      </div>

    </footer>
  );
}
