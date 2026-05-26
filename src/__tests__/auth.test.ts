/** @jest-environment node */
/**
 * Auth smoke tests — verifies the Prisma adapter schema is in sync with the DB.
 *
 * These tests use the real Prisma client against the configured DATABASE_URL.
 * Run with: npx jest src/__tests__/auth.test.ts --no-coverage
 *
 * They are intentionally simple: if the DB is missing columns that the schema
 * expects, Prisma will throw and the test fails — exactly the class of error
 * that broke production.
 */

import { prisma } from '@/lib/prisma';

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Auth / Prisma schema smoke tests', () => {

  it('can query the User table including streak columns', async () => {
    // If currentStreak / longestStreak / lastPracticeDate columns are missing,
    // this throws PrismaClientKnownRequestError — same error as in production.
    await expect(
      prisma.user.findMany({
        take: 1,
        select: {
          id:               true,
          email:            true,
          currentStreak:    true,
          longestStreak:    true,
          lastPracticeDate: true,
          createdAt:        true,
        },
      })
    ).resolves.toBeDefined();
  });

  it('can query the Account table', async () => {
    await expect(
      prisma.account.findMany({
        take: 1,
        select: { id: true, provider: true, userId: true },
      })
    ).resolves.toBeDefined();
  });

  it('can query the Session table', async () => {
    await expect(
      prisma.session.findMany({
        take: 1,
        select: { id: true, sessionToken: true, expires: true },
      })
    ).resolves.toBeDefined();
  });

  it('can query UserProgress with all expected columns', async () => {
    await expect(
      prisma.userProgress.findMany({
        take: 1,
        select: {
          id:            true,
          userId:        true,
          conjugationId: true,
          correct:       true,
          incorrect:     true,
          lastPracticed: true,
        },
      })
    ).resolves.toBeDefined();
  });

  it('can query PracticeSession with all expected columns', async () => {
    await expect(
      prisma.practiceSession.findMany({
        take: 1,
        select: {
          id:              true,
          userId:          true,
          mode:            true,
          tenses:          true,
          correctCount:    true,
          incorrectCount:  true,
          durationSeconds: true,
        },
      })
    ).resolves.toBeDefined();
  });

  it('NextAuth adapter can look up a user by email (simulates sign-in)', async () => {
    // Creates a throwaway user, finds it by email, then cleans up.
    const testEmail = `auth-test-${Date.now()}@conjugap.test`;

    const created = await prisma.user.create({
      data: {
        email:         testEmail,
        currentStreak: 0,
        longestStreak: 0,
      },
    });

    const found = await prisma.user.findUnique({
      where: { email: testEmail },
      select: { id: true, currentStreak: true, longestStreak: true },
    });

    expect(found?.id).toBe(created.id);
    expect(found?.currentStreak).toBe(0);

    // Cleanup
    await prisma.user.delete({ where: { id: created.id } });
  });

});
