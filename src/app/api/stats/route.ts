import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 3600; // cache for 1 hour

export async function GET() {
  const [userCount, conjugationCount, streakAgg] = await Promise.all([
    prisma.user.count(),
    prisma.conjugation.count(),
    prisma.user.aggregate({
      where: { currentStreak: { gt: 0 } },
      _avg:  { currentStreak: true },
    }),
  ]);

  const avgStreak = streakAgg._avg.currentStreak ?? 0;

  return NextResponse.json({
    userCount,
    conjugationCount,
    avgStreakDays: Math.round(avgStreak * 10) / 10, // one decimal
  });
}
