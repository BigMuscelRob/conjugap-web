import type { Metadata } from 'next';
import PracticeContent from './PracticeContent';

export const metadata: Metadata = {
  title: 'Practicar — ConjuGap',
  description: 'Übe Spanische Verbkonjugation mit gezieltem Feedback.',
};

export default function PracticePage() {
  return <PracticeContent />;
}
