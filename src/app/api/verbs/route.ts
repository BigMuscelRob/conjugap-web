import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 86400; // 24 Stunden

export async function GET(req: NextRequest) {
  const cls = req.nextUrl.searchParams.get('cls');

  const verbs = await prisma.verb.findMany({
    where: cls ? { cls } : undefined,
    orderBy: { infinitive: 'asc' },
    select: {
      id:         true,
      infinitive: true,
      cls:        true,
      irregular:  true,
      meaningDe:  true,
      meaningEn:  true,
    },
  });

  return NextResponse.json(verbs, {
    headers: {
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=86400',
    },
  });
}
