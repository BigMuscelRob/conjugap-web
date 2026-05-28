'use client';

import { useState, useRef, useEffect } from 'react';

const HARD_TIMER_SECS = 6;

export function useHardModeTimer({
  enabled,
  active,
  onExpire,
}: {
  enabled:  boolean;
  active:   boolean;
  onExpire: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(HARD_TIMER_SECS);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  function clearTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  useEffect(() => {
    if (!enabled || !active) { clearTimer(); setTimeLeft(HARD_TIMER_SECS); return; }
    setTimeLeft(HARD_TIMER_SECS);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearTimer(); onExpireRef.current(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearTimer();
  }, [enabled, active]);

  return { timeLeft, totalSecs: HARD_TIMER_SECS, clearTimer };
}
