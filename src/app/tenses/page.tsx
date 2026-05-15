import type { Metadata } from 'next';
import TensesContent from './TensesContent';

export const metadata: Metadata = {
  title: 'Tiempos — ConjuGab',
  description: 'Alle Spanischen Tempi im Überblick.',
};

export default function TensesPage() {
  return <TensesContent />;
}
