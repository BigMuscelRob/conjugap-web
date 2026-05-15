import type { Metadata } from 'next';
import TensesContent from './TensesContent';

export const metadata: Metadata = {
  title: 'Tiempos — ConjuGap',
  description: 'Alle Spanischen Tempi im Überblick.',
};

export default function TensesPage() {
  return <TensesContent />;
}
