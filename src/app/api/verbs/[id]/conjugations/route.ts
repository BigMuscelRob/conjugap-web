import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const verbId = parseInt(id, 10);

  if (isNaN(verbId)) {
    return NextResponse.json({ error: 'Invalid verb id' }, { status: 400 });
  }

  const tense = req.nextUrl.searchParams.get('tense');

  const verb = await prisma.verb.findUnique({
    where: { id: verbId },
    include: {
      conjugations: {
        where: tense ? { tense } : undefined,
        orderBy: [{ tense: 'asc' }, { id: 'asc' }],
      },
    },
  });

  if (!verb) {
    return NextResponse.json({ error: 'Verb not found' }, { status: 404 });
  }

  return NextResponse.json(verb);
}
