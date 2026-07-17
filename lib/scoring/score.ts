import { benchmarkEngagementRate } from '@/lib/scoring/benchmarks';

export interface Creator {
  id: string;
  handle: string;
  display_name: string;
  bio: string;
  follower_count: number;
  engagement_rate: number; // 0..1
  avg_views: number;
  genres: string[];
  region: string;
  base_rate_usd: number;
  sound_usage_rate: number; // 0..1
  completion_reliability: number; // 0..1
  content_tags: string[];
  profile_text: string;
  embedding: number[];
}

export interface ScoreBreakdown {
  audience_fit: number;
  style_match: number;
  sound_engagement: number;
  engagement_quality: number;
  reliability: number;
  total: number;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setA = new Set(a.map(s => s.toLowerCase()));
  const setB = new Set(b.map(s => s.toLowerCase()));
  let intersection = 0;
  for (const tag of setA) if (setB.has(tag)) intersection++;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Deterministic, no LLM. Deliberately does NOT include raw follower_count as
 * a scoring factor — a 50k-follower creator who drives sound usage should be
 * able to outrank a 5M-follower creator who doesn't.
 */
export function scoreCreator(
  creator: Creator,
  similarity: number,
  referenceTags: string[],
): ScoreBreakdown {
  const audience_fit = clamp(similarity, 0, 1);
  const style_match = jaccard(creator.content_tags, referenceTags);
  const sound_engagement = clamp(creator.sound_usage_rate, 0, 1);
  const engagement_quality = clamp(
    creator.engagement_rate / benchmarkEngagementRate(creator.follower_count),
    0,
    1,
  );
  const reliability = clamp(creator.completion_reliability, 0, 1);

  const total = clamp(
    0.3 * audience_fit +
      0.25 * style_match +
      0.2 * sound_engagement +
      0.15 * engagement_quality +
      0.1 * reliability,
    0,
    1,
  );

  return { audience_fit, style_match, sound_engagement, engagement_quality, reliability, total };
}

export function rankCandidates(
  creators: Array<{ creator: Creator; similarity: number }>,
  referenceTags: string[],
): Array<{ creator: Creator; breakdown: ScoreBreakdown }> {
  return creators
    .map(({ creator, similarity }) => ({
      creator,
      breakdown: scoreCreator(creator, similarity, referenceTags),
    }))
    .sort((a, b) => b.breakdown.total - a.breakdown.total);
}
