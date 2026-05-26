import { NextResponse } from 'next/server';
import { auth } from '@/../auth';
import { prisma } from '@/lib/prisma';
import { Prisma as PrismaTypes } from '@/generated/prisma/client';

// bigint / Decimal / string → number (handles all pg adapter return types)
const n = (v: unknown): number => Number(v ?? 0);

// ── GET /api/profile ──────────────────────────────────────────────────────────

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
  const [
    user,
    progressAgg,
    tenseRows,
    weakSpotRows,
    heatmapRows,
    weeklyRows,
    sessionAgg,
  ] = await Promise.all([

    // a) User base data
    prisma.user.findUniqueOrThrow({
      where:  { id: userId },
      select: {
        name:             true,
        email:            true,
        image:            true,
        currentStreak:    true,
        longestStreak:    true,
        lastPracticeDate: true,
        createdAt:        true,
      },
    }),

    // b) Overall totals
    prisma.userProgress.aggregate({
      where: { userId },
      _sum:  { correct: true, incorrect: true },
    }),

    // c) Tense breakdown (UserProgress JOIN Conjugation, grouped by tense)
    prisma.$queryRaw<Array<{ tense: string; correct: unknown; incorrect: unknown }>>(
      PrismaTypes.sql`
        SELECT c.tense,
               SUM(up.correct)   AS correct,
               SUM(up.incorrect) AS incorrect
        FROM   "UserProgress" up
        JOIN   "Conjugation"  c ON c.id = up."conjugationId"
        WHERE  up."userId" = ${userId}
        GROUP  BY c.tense
        ORDER  BY c.tense
      `
    ),

    // d) Weak spots — 5 worst conjugations with ≥ 3 attempts
    prisma.$queryRaw<Array<{
      verbInfinitive: string;
      pronoun:        string;
      tense:          string;
      correct:        unknown;
      incorrect:      unknown;
      accuracy:       unknown;
    }>>(
      PrismaTypes.sql`
        SELECT v.infinitive                                                         AS "verbInfinitive",
               c.pronoun,
               c.tense,
               up.correct,
               up.incorrect,
               ROUND(up.correct::numeric / (up.correct + up.incorrect) * 100)      AS accuracy
        FROM   "UserProgress" up
        JOIN   "Conjugation"  c ON c.id = up."conjugationId"
        JOIN   "Verb"         v ON v.id = c."verbId"
        WHERE  up."userId"                    = ${userId}
          AND  (up.correct + up.incorrect)   >= 3
        ORDER  BY up.correct::float / (up.correct + up.incorrect) ASC
        LIMIT  5
      `
    ),

    // e) Heatmap — session counts + minutes per day for last 90 days
    prisma.$queryRaw<Array<{ date: string; sessionCount: unknown; totalMinutes: unknown }>>(
      PrismaTypes.sql`
        SELECT TO_CHAR("startedAt", 'YYYY-MM-DD')        AS date,
               COUNT(*)                                   AS "sessionCount",
               COALESCE(SUM("durationSeconds"), 0) / 60  AS "totalMinutes"
        FROM   "PracticeSession"
        WHERE  "userId"     = ${userId}
          AND  "startedAt" >= NOW() - INTERVAL '90 days'
        GROUP  BY date
        ORDER  BY date
      `
    ),

    // f) Weekly minutes — last 7 days grouped by weekday (0=Mon … 6=Sun)
    prisma.$queryRaw<Array<{ dayIndex: unknown; minutes: unknown }>>(
      PrismaTypes.sql`
        SELECT ((EXTRACT(DOW FROM "startedAt")::int + 6) % 7)  AS "dayIndex",
               COALESCE(SUM("durationSeconds"), 0) / 60        AS minutes
        FROM   "PracticeSession"
        WHERE  "userId"     = ${userId}
          AND  "startedAt" >= NOW() - INTERVAL '7 days'
        GROUP  BY "dayIndex"
        ORDER  BY "dayIndex"
      `
    ),

    // g) Avg seconds per question (all-time)
    prisma.practiceSession.aggregate({
      where: { userId },
      _sum:  { durationSeconds: true, totalQuestions: true },
    }),

  ]);

  // ── Derived stats ─────────────────────────────────────────────────────────

  const totalCorrect   = progressAgg._sum.correct   ?? 0;
  const totalIncorrect = progressAgg._sum.incorrect ?? 0;
  const totalAnswered  = totalCorrect + totalIncorrect;
  const overallAccuracy = totalAnswered > 0
    ? Math.round(totalCorrect / totalAnswered * 100)
    : 0;

  const totalQuestions = sessionAgg._sum.totalQuestions  ?? 0;
  const totalDuration  = sessionAgg._sum.durationSeconds ?? 0;
  const avgSecondsPerQuestion = totalQuestions > 0
    ? Math.round(totalDuration / totalQuestions)
    : 0;

  // ── Serialize (bigint-safe) ───────────────────────────────────────────────

  const tenseBreakdown = tenseRows.map(r => {
    const correct   = n(r.correct);
    const incorrect = n(r.incorrect);
    const total     = correct + incorrect;
    return {
      tense:    r.tense,
      correct,
      incorrect,
      accuracy: total > 0 ? Math.round(correct / total * 100) : 0,
    };
  });

  const weakSpots = weakSpotRows.map(r => ({
    verbInfinitive: r.verbInfinitive,
    pronoun:        r.pronoun,
    tense:          r.tense,
    correct:        n(r.correct),
    incorrect:      n(r.incorrect),
    accuracy:       n(r.accuracy),
  }));

  const heatmap = heatmapRows.map(r => ({
    date:         r.date,
    sessionCount: n(r.sessionCount),
    totalMinutes: Math.round(n(r.totalMinutes)),
  }));

  const weeklyMinutes = weeklyRows.map(r => ({
    dayIndex: n(r.dayIndex),
    minutes:  Math.round(n(r.minutes)),
  }));

  return NextResponse.json({
    user,
    stats: {
      totalCorrect,
      totalIncorrect,
      totalAnswered,
      overallAccuracy,
      avgSecondsPerQuestion,
    },
    tenseBreakdown,
    weakSpots,
    heatmap,
    weeklyMinutes,
  });

  } catch (err) {
    // User record deleted but session still valid
    if (
      err instanceof PrismaTypes.PrismaClientKnownRequestError &&
      err.code === 'P2025'
    ) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Any other DB/runtime error — log server-side, return generic message
    console.error('[GET /api/profile] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
