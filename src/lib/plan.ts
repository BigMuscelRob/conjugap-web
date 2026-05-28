export type UserPlan = 'free' | 'pro';

export function isPro(user: { plan: string; planUntil?: Date | null }): boolean {
  if (user.plan !== 'pro') return false;
  if (user.planUntil && new Date(user.planUntil) < new Date()) return false;
  return true;
}
