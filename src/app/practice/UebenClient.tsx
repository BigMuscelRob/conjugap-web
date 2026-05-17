'use client';

import { useState } from 'react';
import SetupScreen from '@/components/practice/SetupScreen';
import PracticeCard from '@/components/practice/PracticeCard';

export default function UebenClient() {
  const [started, setStarted] = useState(false);

  if (!started) {
    return <SetupScreen onStart={() => setStarted(true)} />;
  }

  return (
    <main className="min-h-screen bg-cream py-16 px-4">
      <PracticeCard />
    </main>
  );
}
