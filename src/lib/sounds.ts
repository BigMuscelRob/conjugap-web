/**
 * Plays a short ascending chime (C5 → E5) using the Web Audio API.
 * Silent no-op if:
 *  – the browser doesn't support AudioContext
 *  – localStorage key "cg_sound" is "false"
 */
export function playCorrect(): void {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem('cg_sound') === 'false') return;

  try {
    const ctx = new AudioContext();

    function tone(freq: number, startAt: number, duration: number, gain: number) {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();

      osc.connect(env);
      env.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startAt);

      env.gain.setValueAtTime(0, ctx.currentTime + startAt);
      env.gain.linearRampToValueAtTime(gain, ctx.currentTime + startAt + 0.01);
      env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startAt + duration);

      osc.start(ctx.currentTime + startAt);
      osc.stop(ctx.currentTime + startAt + duration);
    }

    // Two ascending tones: C5 (523 Hz) then E5 (659 Hz)
    tone(523, 0,    0.18, 0.25);
    tone(659, 0.12, 0.25, 0.20);

    // Clean up AudioContext after sounds finish
    setTimeout(() => ctx.close(), 700);
  } catch {
    // AudioContext not available or blocked — silent fail
  }
}
