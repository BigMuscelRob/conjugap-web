import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 86400;

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('verbIds') ?? '';
  const verbIds = raw
    .split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter(n => !isNaN(n) && n > 0);

  if (verbIds.length === 0 || verbIds.length > 100) {
    return NextResponse.json({ error: 'verbIds must be 1–100 comma-separated integers' }, { status: 400 });
  }

  const tense = req.nextUrl.searchParams.get('tense');

  const verbs = await prisma.verb.findMany({
    where: { id: { in: verbIds } },
    include: {
      conjugations: {
        where: tense ? { tense } : undefined,
        orderBy: [{ tense: 'asc' }, { id: 'asc' }],
      },
    },
  });

  return NextResponse.json(verbs, {
    headers: {
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=86400',
    },
  });
}
