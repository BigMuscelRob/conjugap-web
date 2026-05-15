import type { Metadata } from 'next';
import PricingContent from './PricingContent';

export const metadata: Metadata = {
  title: 'Precios — ConjuGab',
  description: 'ConjuGab kostenlos starten. Kein Abo nötig.',
};

export default function PricingPage() {
  return <PricingContent />;
}
