import type { Metadata } from 'next';
import SetupScreen from '@/components/practice/SetupScreen';

export const metadata: Metadata = {
  title: 'Üben — ConjuGap',
  description: 'Trainiere spanische Verbkonjugation — gezielt, schnell, effektiv.',
};

export default function UebenPage() {
  return <SetupScreen />;
}
