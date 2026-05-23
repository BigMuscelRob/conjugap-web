export const LEVELS = [
  { level: 1, minXP: 0,    maxXP: 99   },
  { level: 2, minXP: 100,  maxXP: 299  },
  { level: 3, minXP: 300,  maxXP: 599  },
  { level: 4, minXP: 600,  maxXP: 1199 },
  { level: 5, minXP: 1200, maxXP: 2399 },
  { level: 6, minXP: 2400, maxXP: Infinity },
] as const;

export type LevelKey = 'novato' | 'aprendiz' | 'practicante' | 'avanzado' | 'experto' | 'maestro';

export const LEVEL_KEYS: LevelKey[] = [
  'novato', 'aprendiz', 'practicante', 'avanzado', 'experto', 'maestro',
];

/** Returns level (1-6), key, XP within current level, XP needed for next level, and overall progress 0–1 */
export function getLevelInfo(totalCorrect: number) {
  const idx = Math.max(0, LEVELS.findLastIndex(l => totalCorrect >= l.minXP));
  const entry = LEVELS[idx];
  const key   = LEVEL_KEYS[idx];
  const isMax = entry.maxXP === Infinity;
  const xpInLevel   = totalCorrect - entry.minXP;
  const xpForLevel  = isMax ? 0 : entry.maxXP - entry.minXP + 1;
  const progress    = isMax ? 1 : xpInLevel / xpForLevel;
  return { level: entry.level, key, xpInLevel, xpForLevel, progress, isMax };
}
