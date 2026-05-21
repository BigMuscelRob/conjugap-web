'use client';

import { useState } from 'react';
import SetupScreen, { type SessionConfig } from '@/components/practice/SetupScreen';
import PracticeCard from '@/components/practice/PracticeCard';

export default function UebenClient() {
  const [config, setConfig] = useState<SessionConfig | null>(null);

  if (!config) {
    return <SetupScreen onStart={setConfig} />;
  }

  return (
    <main className="min-h-screen bg-cream py-16 px-4">
      <PracticeCard config={config} onReset={() => setConfig(null)} />
    </main>
  );
}
