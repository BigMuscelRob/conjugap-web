'use client';

import { useState } from 'react';

function useBoolSetting(key: string, defaultValue: boolean) {
  return useState<boolean>(() => {
    if (typeof window === 'undefined') return defaultValue;
    const s = localStorage.getItem(key);
    return s === null ? defaultValue : s === 'true';
  });
}

export function usePracticeSettings() {
  const [soundOn,  setSoundOnRaw]  = useBoolSetting('cg_sound',    true);
  const [hardMode, setHardModeRaw] = useBoolSetting('cg_hard',     false);
  const [autoNext, setAutoNextRaw] = useBoolSetting('cg_autonext', true);

  function toggle(key: string, setter: (v: boolean) => void, current: boolean) {
    const next = !current;
    localStorage.setItem(key, String(next));
    setter(next);
  }

  return {
    soundOn,  toggleSound:    () => toggle('cg_sound',    setSoundOnRaw,  soundOn),
    hardMode, toggleHardMode: () => toggle('cg_hard',     setHardModeRaw, hardMode),
    autoNext, toggleAutoNext: () => toggle('cg_autonext', setAutoNextRaw, autoNext),
  };
}
