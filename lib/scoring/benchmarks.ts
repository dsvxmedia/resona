/**
 * The one place follower count legitimately enters the scoring math — as a
 * benchmark denominator to normalize engagement_rate, never as a direct score
 * input. This preserves the plan's anti-follower-count principle: a 50k
 * creator who drives sound usage should be able to outrank a 5M creator who
 * doesn't, because raw follower_count never appears in ScoreBreakdown.
 */
export const MICRO_TIER_MAX = 50_000;
export const MID_TIER_MAX = 500_000;

export function benchmarkEngagementRate(followerCount: number): number {
  if (followerCount < MICRO_TIER_MAX) return 0.06;
  if (followerCount <= MID_TIER_MAX) return 0.04;
  return 0.02;
}
