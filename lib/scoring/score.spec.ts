import { describe, it, expect } from 'vitest';
import { scoreCreator, rankCandidates, type Creator } from '@/lib/scoring/score';

function makeCreator(overrides: Partial<Creator> = {}): Creator {
  return {
    id: 'c1',
    handle: 'testcreator',
    display_name: 'Test Creator',
    bio: 'A test creator.',
    follower_count: 100_000,
    engagement_rate: 0.04,
    avg_views: 50_000,
    genres: ['pop'],
    region: 'US',
    base_rate_usd: 1000,
    sound_usage_rate: 0.5,
    completion_reliability: 0.9,
    content_tags: ['neon', 'rapid_cuts'],
    profile_text: 'test',
    embedding: [],
    ...overrides,
  };
}

describe('scoreCreator', () => {
  it('ranks a smaller, more engaged creator above a huge but disengaged one (anti-follower-count principle)', () => {
    const smallEngaged = makeCreator({
      follower_count: 50_000,
      engagement_rate: 0.06,
      sound_usage_rate: 0.9,
      completion_reliability: 0.95,
      content_tags: ['neon', 'rapid_cuts', 'high_energy'],
    });
    const hugeDisengaged = makeCreator({
      follower_count: 5_000_000,
      engagement_rate: 0.005,
      sound_usage_rate: 0.1,
      completion_reliability: 0.5,
      content_tags: ['acoustic', 'slow_pan'],
    });
    const referenceTags = ['neon', 'rapid_cuts', 'high_energy'];

    const smallScore = scoreCreator(smallEngaged, 0.9, referenceTags);
    const hugeScore = scoreCreator(hugeDisengaged, 0.2, referenceTags);

    expect(smallScore.total).toBeGreaterThan(hugeScore.total);
  });

  it('style_match is 0 for fully disjoint tag sets', () => {
    const creator = makeCreator({ content_tags: ['neon', 'rapid_cuts'] });
    const result = scoreCreator(creator, 0.5, ['acoustic', 'slow_pan']);
    expect(result.style_match).toBe(0);
  });

  it('style_match is 1 for identical tag sets (case-insensitive)', () => {
    const creator = makeCreator({ content_tags: ['NEON', 'Rapid_Cuts'] });
    const result = scoreCreator(creator, 0.5, ['neon', 'rapid_cuts']);
    expect(result.style_match).toBe(1);
  });

  it('style_match is 0 when either tag set is empty', () => {
    const creator = makeCreator({ content_tags: [] });
    expect(scoreCreator(creator, 0.5, ['neon']).style_match).toBe(0);
    const creator2 = makeCreator({ content_tags: ['neon'] });
    expect(scoreCreator(creator2, 0.5, []).style_match).toBe(0);
  });

  it('total is always clamped to [0,1], including when engagement_rate wildly exceeds benchmark', () => {
    const overachiever = makeCreator({ follower_count: 10_000, engagement_rate: 5 });
    const result = scoreCreator(overachiever, 1, ['neon']);
    expect(result.total).toBeGreaterThanOrEqual(0);
    expect(result.total).toBeLessThanOrEqual(1);
    expect(result.engagement_quality).toBe(1);

    const zeroCreator = makeCreator({
      engagement_rate: 0,
      sound_usage_rate: 0,
      completion_reliability: 0,
      content_tags: [],
    });
    const zeroResult = scoreCreator(zeroCreator, 0, []);
    expect(zeroResult.total).toBe(0);
  });
});

describe('rankCandidates', () => {
  it('sorts descending by total score', () => {
    const a = { creator: makeCreator({ id: 'a', sound_usage_rate: 0.2 }), similarity: 0.3 };
    const b = { creator: makeCreator({ id: 'b', sound_usage_rate: 0.9 }), similarity: 0.9 };
    const c = { creator: makeCreator({ id: 'c', sound_usage_rate: 0.5 }), similarity: 0.6 };

    const ranked = rankCandidates([a, b, c], ['neon', 'rapid_cuts']);
    expect(ranked.map(r => r.creator.id)).toEqual(['b', 'c', 'a']);
  });
});
