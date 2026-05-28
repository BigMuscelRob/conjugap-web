import { TENSE_LABELS } from '@/lib/labels';
import type { ProfileData } from '@/types/profile';

export function tenseLabel(t: string): string {
  return TENSE_LABELS[t] ?? t;
}

export function heatIntensity(mins: number): number {
  if (mins === 0) return 0;
  if (mins < 5)  return 1;
  if (mins < 15) return 2;
  if (mins < 30) return 3;
  return 4;
}

export function buildHeatGrid(raw: ProfileData['heatmap']): number[] {
  const map = new Map(raw.map(r => [r.date, r.totalMinutes]));
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 89);
  const dow = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - dow);

  const cells: number[] = [];
  const cur = new Date(start);
  const end = new Date(today);
  end.setDate(today.getDate() + (6 - (today.getDay() + 6) % 7));

  while (cur <= end) {
    const key = cur.toISOString().slice(0, 10);
    cells.push(heatIntensity(map.get(key) ?? 0));
    cur.setDate(cur.getDate() + 1);
  }
  return cells;
}

export function tenseColor(pct: number): string {
  if (pct >= 80) return '#7AB89B';
  if (pct >= 60) return '#F5B948';
  return '#C2456E';
}

export function weakColors(acc: number): { bg: string; color: string } {
  if (acc < 50)  return { bg: '#FBE6EC', color: '#8C2A4D' };
  if (acc < 65)  return { bg: '#FEF7E3', color: '#A8761A' };
  return { bg: '#E8F5EE', color: '#1F6B45' };
}
