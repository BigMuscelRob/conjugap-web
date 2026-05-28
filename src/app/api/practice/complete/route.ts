import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/../auth';
import { prisma } from '@/lib/prisma';

// ── Request body ──────────────────────────────────────────────────────────────

interface ResultEntry {
  conjugationId: number;
  correct:       boolean;
}

interface CompleteBody {
  mode:        string;
  tenses:      string[];
  verbIds:     number[];
  results:     ResultEntry[];
  startedAt:   string;
  completedAt: string;
}

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

  let body: CompleteBody;
  try {
    body = await req.json() as CompleteBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { mode, tenses, verbIds, results, startedAt, completedAt } = body;

  if (!Array.isArray(results) || results.length === 0) {
    return NextResponse.json({ error: 'results must be a non-empty array' }, { status: 400 });
  }

  const ALLOWED_MODES  = ['structured', 'random'] as const;
  const ALLOWED_TENSES = ['pres', 'pi', 'imp', 'pp', 'fut', 'cond', 'sub', 'imper'] as const;

  if (!ALLOWED_MODES.includes(mode as typeof ALLOWED_MODES[number])) {
    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
  }

  if (
    !Array.isArray(tenses) ||
    tenses.length === 0 ||
    tenses.length > 8 ||
    !tenses.every(t => ALLOWED_TENSES.includes(t as typeof ALLOWED_TENSES[number]))
  ) {
    return NextResponse.json({ error: 'Invalid tenses' }, { status: 400 });
  }

  if (
    !Array.isArray(verbIds) ||
    verbIds.length === 0 ||
    verbIds.length > 100 ||
    !verbIds.every(id => Number.isInteger(id) && id > 0)
  ) {
    return NextResponse.json({ error: 'Invalid verbIds' }, { status: 400 });
  }

  if (results.length > 500) {
    return NextResponse.json({ error: 'Too many results' }, { status: 400 });
  }
  if (!results.every(r => Number.isInteger(r.conjugationId) && r.conjugationId > 0 && typeof r.correct === 'boolean')) {
    return NextResponse.json({ error: 'Malformed result entry' }, { status: 400 });
  }

  const startedAtDate   = new Date(startedAt);
  const completedAtDate = new Date(completedAt);
  const durationSeconds = Math.round((completedAtDate.getTime() - startedAtDate.getTime()) / 1000);

  if (isNaN(startedAtDate.getTime()) || isNaN(completedAtDate.getTime())) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
  }
  if (durationSeconds < 0 || durationSeconds > 86400) {
    return NextResponse.json({ error: 'Invalid duration' }, { status: 400 });
  }

  // Validate that all conjugationIds actually exist in the DB
  // (prevents clients from writing progress for arbitrary IDs)
  const validConjugations = await prisma.conjugation.findMany({
    where: { id: { in: results.map(r => r.conjugationId) } },
    select: { id: true },
  });
  const validIds = new Set(validConjugations.map(c => c.id));
  const allValid = results.every(r => validIds.has(r.conjugationId));

  if (!allValid) {
    return NextResponse.json({ error: 'Invalid conjugationId in results' }, { status: 400 });
  }

  const correctCount   = results.filter(r => r.correct).length;
  const incorrectCount = results.length - correctCount;

  const [sessionRecord, totals] = await prisma.$transaction(async (tx) => {
    const serverNow = new Date(); // authoritative timestamp — never trust client for streak
    // a) Bulk-upsert UserProgress — max. 4 DB-Ops statt bis zu N sequenzieller upserts
    const existing = await tx.userProgress.findMany({
      where:  { userId, conjugationId: { in: results.map(r => r.conjugationId) } },
      select: { conjugationId: true },
    });
    const existingIds = new Set(existing.map(e => e.conjugationId));

    const toCreate = results.filter(r => !existingIds.has(r.conjugationId));
    const toUpdate = results.filter(r =>  existingIds.has(r.conjugationId));

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
        totalQuestions:  results.length,
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

  const accuracy = results.length > 0
    ? Math.round((correctCount / results.length) * 100)
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
