import { getLevelInfo } from '../xpSystem';

describe('getLevelInfo', () => {
  it('returns level 1 for 0 XP', () => {
    const r = getLevelInfo(0);
    expect(r.level).toBe(1);
    expect(r.key).toBe('novato');
    expect(r.isMax).toBe(false);
    expect(r.progress).toBeCloseTo(0);
  });

  it('returns level 1 for 99 XP', () => {
    const r = getLevelInfo(99);
    expect(r.level).toBe(1);
    expect(r.xpInLevel).toBe(99);
    expect(r.xpForLevel).toBe(100);
    expect(r.progress).toBeCloseTo(0.99);
  });

  it('returns level 2 at the exact threshold (100 XP)', () => {
    const r = getLevelInfo(100);
    expect(r.level).toBe(2);
    expect(r.key).toBe('aprendiz');
    expect(r.xpInLevel).toBe(0);
  });

  it('returns level 6 (max) at 2400+', () => {
    const r = getLevelInfo(2400);
    expect(r.level).toBe(6);
    expect(r.key).toBe('maestro');
    expect(r.isMax).toBe(true);
    expect(r.progress).toBe(1);
    expect(r.xpForLevel).toBe(0);
  });

  it('does not crash for negative input (defensive)', () => {
    expect(() => getLevelInfo(-1)).not.toThrow();
    const r = getLevelInfo(-1);
    expect(r.level).toBe(1); // clamped to level 1
  });

  it('progress is between 0 and 1 for mid-level values', () => {
    const r = getLevelInfo(450); // level 3: 300–599
    expect(r.level).toBe(3);
    expect(r.progress).toBeGreaterThan(0);
    expect(r.progress).toBeLessThan(1);
  });
});
