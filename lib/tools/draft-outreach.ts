import { tool, generateText, Output } from 'ai';
import { z } from 'zod';
import { models } from '@/lib/ai/models';
import type { MatchedCreator } from '@/lib/tools/match-creators';

export interface OutreachDraft {
  creatorId: string;
  handle: string;
  displayName: string;
  draftText: string | null;
  matchRationale: string;
}

const draftOutputSchema = z.object({
  draftText: z.string(),
  matchRationale: z
    .string()
    .describe('One sentence citing a specific match reason from the score/classification data'),
});

async function draftOne(
  match: MatchedCreator,
  brief: { song: string; vibe: string; audience: string },
  referenceTags: string[],
): Promise<OutreachDraft> {
  const { creator, breakdown } = match;
  const { output } = await generateText({
    model: models.outreach,
    output: Output.object({ schema: draftOutputSchema }),
    instructions:
      'You write short, specific, non-generic creator outreach DMs for a music marketing campaign. 2-4 sentences. Cite a concrete detail about the creator or the match, never a generic template. Never invent facts not given to you.',
    prompt: [
      `Song: ${brief.song}`,
      `Vibe: ${brief.vibe}`,
      `Target audience: ${brief.audience}`,
      `Creator: @${creator.handle} (${creator.display_name}), ${creator.follower_count.toLocaleString()} followers, ${creator.region}`,
      `Creator bio: ${creator.bio}`,
      `Creator content tags: ${creator.content_tags.join(', ')}`,
      `Reference video style tags: ${referenceTags.join(', ') || '(not analyzed)'}`,
      `Match score: ${(breakdown.total * 100).toFixed(0)}/100 (style match ${(breakdown.style_match * 100).toFixed(0)}%, sound engagement ${(breakdown.sound_engagement * 100).toFixed(0)}%)`,
      'Draft a short outreach DM and a one-sentence match rationale.',
    ].join('\n'),
    abortSignal: AbortSignal.timeout(20_000),
  });

  return {
    creatorId: creator.id,
    handle: creator.handle,
    displayName: creator.display_name,
    draftText: output.draftText,
    matchRationale: output.matchRationale,
  };
}

/**
 * Promise.allSettled, not Promise.all — one creator's draft failing must never
 * fail the whole batch. Failed drafts come back with draftText: null so the UI
 * can render a graceful "draft unavailable" card instead of losing the run.
 */
export async function draftOutreach(
  matches: MatchedCreator[],
  brief: { song: string; vibe: string; audience: string },
  referenceTags: string[],
): Promise<OutreachDraft[]> {
  const top = matches.slice(0, 5);
  const results = await Promise.allSettled(
    top.map(m => draftOne(m, brief, referenceTags)),
  );

  return results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    const creator = top[i].creator;
    return {
      creatorId: creator.id,
      handle: creator.handle,
      displayName: creator.display_name,
      draftText: null,
      matchRationale: 'Draft unavailable for this creator.',
    };
  });
}

export const draftOutreachTool = tool({
  description:
    'Draft short, personalized outreach DMs for the top matched creators, in parallel. Failures degrade per-creator, never the whole batch.',
  inputSchema: z.object({
    matches: z.array(z.any()).describe('Top MatchedCreator objects from match_creators'),
    brief: z.object({
      song: z.string(),
      vibe: z.string(),
      audience: z.string(),
    }),
    referenceTags: z.array(z.string()),
  }),
  execute: async ({ matches, brief, referenceTags }) =>
    draftOutreach(matches as MatchedCreator[], brief, referenceTags),
});
