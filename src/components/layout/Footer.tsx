import Link from 'next/link';
import Image from 'next/image';

const FOOTER_LINKS = {
  Produkt: [
    { href: '/practice', label: 'Practicar' },
    { href: '/tenses', label: 'Tiempos' },
    { href: '/pricing', label: 'Precios' },
  ],
  Ressourcen: [
    { href: '/blog', label: 'Blog' },
    { href: '/faq', label: 'FAQ' },
    { href: '/changelog', label: 'Changelog' },
  ],
  Rechtliches: [
    { href: '/imprint', label: 'Impressum' },
    { href: '/privacy', label: 'Datenschutz' },
    { href: '/terms', label: 'AGB' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-cream-deep border-t border-ink-900/[0.08]">

      {/* Main content */}
      <div className="max-w-content mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-[1.5fr_2fr] gap-14">

        {/* Brand */}
        <div className="flex flex-col gap-5">
          <Link href="/" className="inline-flex items-center gap-2 no-underline text-ink-900 w-fit">
            <Image src="/assets/mascot-mini.svg" width={28} height={28} alt="" />
            <span className="font-display font-bold text-[20px] tracking-tightest">
              Verb<span className="text-terracotta-500">ito</span>
            </span>
          </Link>
          <p className="text-small text-ink-500 max-w-[220px] leading-5">
            Spanische Verben, endlich auf deiner Seite.
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
            © {new Date().getFullYear()} Verbito. Alle Rechte vorbehalten.
          </span>
          <span className="text-micro font-semibold text-ink-500 flex items-center gap-1">
            Hecho con{' '}
            <i className="ph-fill ph-heart text-terracotta-500" aria-hidden="true" />{' '}
            in Munich
          </span>
        </div>
      </div>

    </footer>
  );
}
