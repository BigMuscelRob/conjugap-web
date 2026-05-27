'use client';

import { useState, useRef } from 'react';
import SetupScreen, { type SessionConfig } from '@/components/practice/SetupScreen';
import PracticeCard, { type PracticeCardHandle, SPECIAL_CHARS } from '@/components/practice/PracticeCard';

export default function UebenClient() {
  const [config, setConfig] = useState<SessionConfig | null>(null);
  const cardRef = useRef<PracticeCardHandle>(null);

  if (!config) {
    return <SetupScreen onStart={setConfig} />;
  }

  return (
    <main className="min-h-screen bg-cream py-16 px-4">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-center gap-4">

        <PracticeCard ref={cardRef} config={config} onReset={() => setConfig(null)} />

        {/* Special chars sidebar */}
        <div className="flex lg:flex-col flex-wrap gap-2 bg-paper border-2 border-ink-900
          rounded-[18px] p-3 shadow-[0_4px_0_#2A1F1A]
          lg:self-start lg:mt-0 mx-auto lg:mx-0">
          {SPECIAL_CHARS.map(ch => (
            <button
              key={ch}
              type="button"
              onMouseDown={e => { e.preventDefault(); cardRef.current?.insertChar(ch); }}
              className="w-10 h-10 flex items-center justify-center rounded-lg
                font-mono text-[17px] font-bold text-ink-700
                bg-cream border border-ink-200
                hover:border-terracotta-400 hover:text-terracotta-500
                active:scale-95 transition-all duration-75 select-none"
            >
              {ch}
            </button>
          ))}
        </div>

      </div>
    </main>
  );
}
