import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/../auth';
import { prisma } from '@/lib/prisma';

// ── Request body ──────────────────────────────────────────────────────────────

const ResultEntrySchema = z.object({
  conjugationId: z.number().int().positive(),
  correct:       z.boolean(),
});

const CompleteBodySchema = z.object({
  mode:        z.enum(['structured', 'random']),
  tenses:      z.array(z.enum(['pres', 'pi', 'imp', 'pp', 'fut', 'cond', 'sub', 'imper']))
                 .min(1).max(8),
  verbIds:     z.array(z.number().int().positive()).min(1).max(100),
  results:     z.array(ResultEntrySchema).min(1).max(500),
  startedAt:   z.string().datetime(),
  completedAt: z.string().datetime(),
});

// ── Streak helpers ────────────────────────────────────────────────────────────

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  );
}

function isYesterday(date: Date, today: Date): boolean {
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  return isSameDay(date, yesterday);
}

// ── POST /api/practice/complete ───────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = CompleteBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
  const { mode, tenses, verbIds, results, startedAt, completedAt } = parsed.data;

  const startedAtDate   = new Date(startedAt);
  const completedAtDate = new Date(completedAt);
  const durationSeconds = Math.round((completedAtDate.getTime() - startedAtDate.getTime()) / 1000);

  if (durationSeconds < 0 || durationSeconds > 86400) {
    return NextResponse.json({ error: 'Invalid duration' }, { status: 400 });
  }

  // Validate that all conjugationIds actually exist in the DB
  // (prevents clients from writing progress for arbitrary IDs)
  const validConjugations = await prisma.conjugation.findMany({
    where: { id: { in: results.map(r => r.conjugationId) } },
    select: { id: true, verbId: true },
  });
  const validIds = new Set(validConjugations.map(c => c.id));
  const allValid = results.every(r => validIds.has(r.conjugationId));

  if (!allValid) {
    return NextResponse.json({ error: 'Invalid conjugationId in results' }, { status: 400 });
  }

  const validVerbIds = new Set(validConjugations.map(c => c.verbId));
  const verbIdsValid = verbIds.every(id => validVerbIds.has(id));

  if (!verbIdsValid) {
    return NextResponse.json(
      { error: 'verbIds do not match conjugation data' },
      { status: 400 }
    );
  }

  const firstResultMap = new Map<number, typeof results[number]>();
  for (const r of results) {
    if (!firstResultMap.has(r.conjugationId)) {
      firstResultMap.set(r.conjugationId, r);
    }
  }
  const deduplicatedResults = [...firstResultMap.values()];

  const correctCount   = deduplicatedResults.filter(r => r.correct).length;
  const incorrectCount = deduplicatedResults.length - correctCount;

  let sessionRecord: Awaited<ReturnType<typeof prisma.practiceSession.create>>;
  let totals: { agg: { _sum: { correct: number | null; incorrect: number | null } }; currentStreak: number };

  try {
    [sessionRecord, totals] = await prisma.$transaction(async (tx) => {
    const serverNow = new Date(); // authoritative timestamp — never trust client for streak
    // a) Bulk-upsert UserProgress — max. 4 DB-Ops statt bis zu N sequenzieller upserts
    const existing = await tx.userProgress.findMany({
      where:  { userId, conjugationId: { in: deduplicatedResults.map(r => r.conjugationId) } },
      select: { conjugationId: true },
    });
    const existingIds = new Set(existing.map(e => e.conjugationId));

    const toCreate = deduplicatedResults.filter(r => !existingIds.has(r.conjugationId));
    const toUpdate = deduplicatedResults.filter(r =>  existingIds.has(r.conjugationId));

    if (toCreate.length > 0) {
      await tx.userProgress.createMany({
        data: toCreate.map(r => ({
          userId,
          conjugationId: r.conjugationId,
          correct:       r.correct ? 1 : 0,
          incorrect:     r.correct ? 0 : 1,
          lastPracticed: completedAtDate,
        })),
      });
    }

    const correctIds   = toUpdate.filter(r =>  r.correct).map(r => r.conjugationId);
    const incorrectIds = toUpdate.filter(r => !r.correct).map(r => r.conjugationId);

    if (correctIds.length > 0) {
      await tx.userProgress.updateMany({
        where: { userId, conjugationId: { in: correctIds } },
        data:  { correct: { increment: 1 }, lastPracticed: completedAtDate },
      });
    }
    if (incorrectIds.length > 0) {
      await tx.userProgress.updateMany({
        where: { userId, conjugationId: { in: incorrectIds } },
        data:  { incorrect: { increment: 1 }, lastPracticed: completedAtDate },
      });
    }

    // b) Create PracticeSession
    const newSession = await tx.practiceSession.create({
      data: {
        userId,
        mode,
        tenses,
        verbIds,
        startedAt:       startedAtDate,
        completedAt:     completedAtDate,
        totalQuestions:  deduplicatedResults.length,
        correctCount,
        incorrectCount,
        durationSeconds,
      },
    });

    // c) Update streak on User
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    const today = serverNow; // use server time — client timestamp is untrusted for streak

    let newStreak: number;
    if (user.lastPracticeDate && isSameDay(user.lastPracticeDate, today)) {
      newStreak = user.currentStreak; // already practiced today
    } else if (user.lastPracticeDate && isYesterday(user.lastPracticeDate, today)) {
      newStreak = user.currentStreak + 1;
    } else {
      newStreak = 1; // streak broken or first session
    }

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        lastPracticeDate: serverNow,
        currentStreak:    newStreak,
        longestStreak:    Math.max(user.longestStreak, newStreak),
      },
    });

    // d) Aggregate all-time totals for this user
    const agg = await tx.userProgress.aggregate({
      where:  { userId },
      _sum:   { correct: true, incorrect: true },
    });

    return [newSession, { agg, currentStreak: updatedUser.currentStreak }] as const;
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to save session' },
      { status: 500 }
    );
  }

  const accuracy = deduplicatedResults.length > 0
    ? Math.round((correctCount / deduplicatedResults.length) * 100)
    : 0;

  return NextResponse.json({
    sessionId:             sessionRecord.id,
    correctCount,
    incorrectCount,
    accuracy,
    durationSeconds:       sessionRecord.durationSeconds ?? durationSeconds,
    currentStreak:         totals.currentStreak,
    totalCorrectAllTime:   totals.agg._sum.correct   ?? 0,
    totalIncorrectAllTime: totals.agg._sum.incorrect ?? 0,
  });
}
