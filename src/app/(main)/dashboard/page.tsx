import type { Metadata } from 'next';
import DashboardClient from '@/components/profile/DashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard — ConjuGap',
  description: 'Dein Lernfortschritt und Statistiken auf einen Blick.',
};

export default function DashboardPage() {
  return <DashboardClient />;
}
