import { ToolLoopAgent, tool, isStepCount } from 'ai';
import { z } from 'zod';
import { models } from '@/lib/ai/models';
import { analyzeReferenceVideo } from '@/lib/tools/analyze-reference-video';
import { matchCreators, type MatchedCreator } from '@/lib/tools/match-creators';
import { draftOutreach } from '@/lib/tools/draft-outreach';
import type { VideoClassification } from '@/lib/video/classification-schema';

export interface CampaignBrief {
  song: string;
  vibe: string;
  audience: string;
  budgetUsd: number;
  tiktokUrl: string;
}

/** Trimmed creator shape sent to the LLM/UI. Never includes the raw embedding vector. */
function trimMatch(m: MatchedCreator) {
  return {
    creatorId: m.creator.id,
    handle: m.creator.handle,
    displayName: m.creator.display_name,
    followerCount: m.creator.follower_count,
    region: m.creator.region,
    bio: m.creator.bio,
    contentTags: m.creator.content_tags,
    similarity: m.similarity,
    breakdown: m.breakdown,
  };
}

/**
 * One agent instance per request, never a module-level singleton. The tools
 * close over `runState`, a per-run scratch space that lets match_creators hand
 * its full result to draft_outreach without shuttling embedding vectors or
 * bulky payloads through the model's own context. The model only ever sees
 * and passes forward trimmed, human-readable data, and runState carries the rest.
 * This is also where "memory" concretely shows up within a run. The video
 * signal informs the search query, and the search result informs drafting.
 */
export function createCampaignAgent(brief: CampaignBrief) {
  const runState: {
    referenceTags: string[];
    videoClassification?: VideoClassification;
    matches: MatchedCreator[];
  } = { referenceTags: [], matches: [] };

  const analyzeVideoTool = tool({
    description:
      "Analyze the campaign's reference TikTok video for storytelling pattern, pacing, energy, format, and aesthetic. Always call this first if a video URL was provided.",
    inputSchema: z.object({
      url: z.string().describe('The public TikTok reference video URL'),
    }),
    execute: async ({ url }) => {
      const result = await analyzeReferenceVideo(url);
      if (result.ok) {
        runState.videoClassification = result.data;
        runState.referenceTags = [
          ...result.data.aesthetic_tags,
          result.data.storytelling_pattern,
          result.data.format,
        ];
      }
      return result;
    },
  });

  const searchCreatorsTool = tool({
    description:
      'Search and rank the creator roster against the campaign brief and any video signal already gathered. Scoring is deterministic and uses no LLM math: audience fit, style match, sound engagement, engagement quality, reliability.',
    inputSchema: z.object({
      queryText: z
        .string()
        .describe(
          'Combined description of the campaign brief and video style, for embedding-based search',
        ),
      budgetPerCreatorUsd: z.number(),
    }),
    execute: async ({ queryText, budgetPerCreatorUsd }) => {
      const result = await matchCreators({
        queryText,
        budgetPerCreatorUsd,
        referenceTags: runState.referenceTags,
      });
      if (result.ok) {
        runState.matches = result.data;
        return { ok: true, degraded: result.degraded, creators: result.data.map(trimMatch) };
      }
      return result;
    },
  });

  const draftOutreachTool = tool({
    description:
      'Draft short, personalized outreach DMs for the top 3-5 matched creators, in parallel. Call this after search_creators has returned results.',
    inputSchema: z.object({
      creatorIds: z
        .array(z.string())
        .describe('IDs of the top creators (from search_creators results) to draft outreach for, 3-5 of them')
        .optional(),
    }),
    execute: async ({ creatorIds }) => {
      const pool =
        creatorIds && creatorIds.length > 0
          ? runState.matches.filter(m => creatorIds.includes(m.creator.id))
          : runState.matches;
      if (pool.length === 0) {
        return {
          ok: false,
          error: 'No matched creators available to draft outreach for.',
          suggestion: 'Run search_creators first.',
        };
      }
      const drafts = await draftOutreach(
        pool,
        { song: brief.song, vibe: brief.vibe, audience: brief.audience },
        runState.referenceTags,
      );
      return { ok: true, drafts };
    },
  });

  const budgetPerCreatorUsd = Math.max(1, Math.round(brief.budgetUsd / 8));

  const agent = new ToolLoopAgent({
    model: models.orchestrator,
    instructions: `You run one campaign-matching pipeline for a music marketing brief. Narrate each phase to the user in one plain, non-technical sentence before acting. Do not use raw tool or function names in your narration. Write in plain prose. Never use an em dash. Use a period, a comma, or a normal joining word like "and" or "so" instead.

THE CAMPAIGN BRIEF (already collected, do not ask the user for it, use it directly):
- Song/artist: ${brief.song}
- Genre/vibe: ${brief.vibe}
- Target audience: ${brief.audience}
- Total budget: $${brief.budgetUsd} (use budgetPerCreatorUsd = ${budgetPerCreatorUsd} when calling search_creators)
- Reference TikTok URL: ${brief.tiktokUrl ? brief.tiktokUrl : '(none provided)'}

Steps, in order:
1. If a reference TikTok URL was provided above, call analyze_video_reference with that exact URL to understand its storytelling pattern, pacing, energy, and aesthetic. If it fails, say so plainly and continue anyway using the brief's genre and vibe alone. Never stop the pipeline over a failed video analysis. If no URL was provided, skip straight to step 2.
2. Call search_creators with queryText combining the song, vibe, and audience above, plus any video signal tags from step 1, and budgetPerCreatorUsd as given above.
3. Call draft_outreach for the top 3-5 creators from search_creators's results.
4. Write a closing summary in under 120 words for a marketer: how many creators were found, the top pick and why, and whether the video reference was used.

If any tool returns {ok:false}, explain the failure plainly to the user in one sentence and follow its suggestion. Never let a single tool failure silently end the run without explanation. Never ask the user for brief details, since they are already given above.`,
    tools: {
      analyze_video_reference: analyzeVideoTool,
      search_creators: searchCreatorsTool,
      draft_outreach: draftOutreachTool,
    },
    stopWhen: isStepCount(12),
  });

  return { agent, runState };
}

export type CampaignAgent = ReturnType<typeof createCampaignAgent>['agent'];
