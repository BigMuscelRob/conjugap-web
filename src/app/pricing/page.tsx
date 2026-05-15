import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Precios — Verbito',
  description: 'Verbito kostenlos starten. Kein Abo nötig.',
};

const PLANS = [
  {
    name: 'Gratis',
    price: '0 €',
    period: 'für immer',
    description: 'Perfekt zum Ausprobieren.',
    features: [
      '10 Verben täglich',
      'Presente & Pretérito Indefinido',
      'Streak-Tracking',
      'Basis-Feedback',
    ],
    cta: { label: 'Kostenlos starten', href: '/practice' },
    highlight: false,
    cardClass: 'bg-paper',
    ctaClass:
      'bg-terracotta-500 text-white-warm border-ink-900 shadow-stamp-primary ' +
      'hover:-translate-y-px hover:shadow-stamp-primary-hover active:translate-y-0.5 active:shadow-none',
  },
  {
    name: 'Pro',
    price: '4,99 €',
    period: 'pro Monat',
    description: 'Für ernsthafte Lernende.',
    features: [
      'Unbegrenzte Verben',
      'Alle 14 Tempi',
      'Fortgeschrittenes Feedback',
      'Lernstatistiken',
      'Offline-Modus',
    ],
    cta: { label: 'Pro ausprobieren', href: '/practice' },
    highlight: true,
    cardClass: 'bg-terracotta-500 text-white-warm',
    ctaClass:
      'bg-ink-900 text-white-warm border-ink-900 shadow-stamp ' +
      'hover:-translate-y-px hover:shadow-stamp-hover active:translate-y-0.5 active:shadow-none',
  },
];

export default function PricingPage() {
  return (
    <div className="max-w-content mx-auto px-6 py-20">

      {/* Header */}
      <div className="text-center flex flex-col items-center gap-5 mb-14">
        <p className="text-overline tracking-wide-10 uppercase font-bold text-ink-500">Precios</p>
        <h1 className="font-display font-bold text-h1 leading-[60px] tracking-tight-2 text-ink-900">
          Einfach. Transparent.
        </h1>
        <p className="text-bodyL text-ink-500 max-w-[420px]">
          Fang gratis an. Upgrade, wenn du mehr willst.
          Kein Abo-Trick, kein kleines Gedrucktes.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-[760px] mx-auto">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`${plan.cardClass} border-2 border-ink-900 rounded-xl p-8 shadow-stamp-big flex flex-col gap-5 relative`}
          >
            {/* Popular badge */}
            {plan.highlight && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2
                bg-saffron-500 text-ink-900 border-2 border-ink-900
                rounded-pill px-3.5 py-1 text-micro font-bold whitespace-nowrap shadow-stamp-sm">
                Beliebteste Wahl
              </span>
            )}

            <div className="font-display font-bold text-h3 leading-[30px]">{plan.name}</div>

            <div className="font-display font-bold text-48 leading-none tracking-tightest">
              {plan.price}
              <span className="text-small font-semibold opacity-70"> / {plan.period}</span>
            </div>

            <p className="text-small opacity-85">{plan.description}</p>

            <ul className="list-none flex flex-col gap-3 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-small font-semibold">
                  <i className="ph-bold ph-check text-sage-500" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href={plan.cta.href}
              className={`flex justify-center items-center font-body font-bold text-[15px] no-underline
                px-6 py-3.5 border-2 rounded-md
                transition-all duration-micro ease-smooth
                ${plan.ctaClass}`}
            >
              {plan.cta.label}
            </Link>
          </div>
        ))}
      </div>

    </div>
  );
}
