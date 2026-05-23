import type { Metadata } from 'next';
import ProfilClient from '@/components/profile/ProfilClient';

export const metadata: Metadata = {
  title: 'Konto — ConjuGap',
  description: 'Deine Kontoeinstellungen.',
};

export default function ProfilPage() {
  return <ProfilClient />;
}
