import { Suspense } from 'react';
import type { Metadata } from 'next';
import UebenClient from './UebenClient';

export const metadata: Metadata = {
  title: 'Üben — ConjuGap',
  description: 'Trainiere spanische Verbkonjugation — gezielt, schnell, effektiv.',
};

export default function PracticePage() {
  return (
    <Suspense>
      <UebenClient />
    </Suspense>
  );
}
