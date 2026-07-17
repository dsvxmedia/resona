import { tool, embed, cosineSimilarity } from 'ai';
import { z } from 'zod';
import { models, EMBEDDING_DIMENSIONS } from '@/lib/ai/models';
import { rankCandidates, type Creator, type ScoreBreakdown } from '@/lib/scoring/score';
import creatorsFile from '@/data/creators.json';

interface CreatorsFile {
  embedding_model: string;
  embedding_dimensions: number;
  generated_at: string;
  placeholder?: boolean;
  creators: Creator[];
}

const creatorsData = creatorsFile as unknown as CreatorsFile;

export interface MatchedCreator {
  creator: Creator;
  similarity: number;
  breakdown: ScoreBreakdown;
}

export type MatchCreatorsResult =
  | { ok: true; data: MatchedCreator[]; degraded?: string }
  | { ok: false; error: string; suggestion: string };

/**
 * In-memory RAG over a static, checked-in creator dataset. No database.
 * Data-integrity guard: asserts the runtime embedding model/dimension matches
 * what data/creators.json was generated with, so a model bump in models.ts
 * can never silently compare vectors from two different embedding spaces.
 */
export async function matchCreators(params: {
  queryText: string;
  budgetPerCreatorUsd: number;
  referenceTags: string[];
  limit?: number;
}): Promise<MatchCreatorsResult> {
  const { queryText, budgetPerCreatorUsd, referenceTags, limit = 8 } = params;

  if (creatorsData.placeholder) {
    return {
      ok: false,
      error: 'creators.json is still a placeholder (no real embeddings generated yet)',
      suggestion:
        'Run `pnpm tsx scripts/generate-creators.ts` with API keys configured to generate real embeddings.',
    };
  }

  if (
    creatorsData.embedding_model !== models.embedding ||
    creatorsData.embedding_dimensions !== EMBEDDING_DIMENSIONS
  ) {
    return {
      ok: false,
      error: `Embedding space mismatch: data/creators.json was generated with ${creatorsData.embedding_model} (${creatorsData.embedding_dimensions}d), but the app is configured for ${models.embedding} (${EMBEDDING_DIMENSIONS}d).`,
      suggestion:
        'Re-run `pnpm tsx scripts/generate-creators.ts` to regenerate the dataset with the current embedding model before matching creators.',
    };
  }

  const pool = creatorsData.creators.filter(
    c => c.base_rate_usd <= budgetPerCreatorUsd,
  );
  const searchPool = pool.length > 0 ? pool : creatorsData.creators;
  const degraded =
    pool.length === 0
      ? 'No creators fit the exact budget per creator, so we are showing the closest matches anyway.'
      : undefined;

  let queryEmbedding: number[];
  try {
    const result = await embed({
      model: models.embedding,
      value: queryText,
      abortSignal: AbortSignal.timeout(15_000),
    });
    queryEmbedding = result.embedding;
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Embedding request failed',
      suggestion:
        'Vector search is temporarily unavailable. Try again in a moment.',
    };
  }

  const withSimilarity = searchPool.map(creator => ({
    creator,
    similarity: cosineSimilarity(queryEmbedding, creator.embedding),
  }));

  const ranked = rankCandidates(withSimilarity, referenceTags).slice(0, limit);

  return {
    ok: true,
    data: ranked.map(r => ({
      creator: r.creator,
      similarity: withSimilarity.find(w => w.creator.id === r.creator.id)!.similarity,
      breakdown: r.breakdown,
    })),
    degraded,
  };
}

export const matchCreatorsTool = tool({
  description:
    'Find and rank creators from the roster who best match a campaign brief and reference video style. Uses vector similarity plus deterministic scoring (no LLM does the ranking math).',
  inputSchema: z.object({
    queryText: z
      .string()
      .describe('Combined text of the campaign brief and video classification tags'),
    budgetPerCreatorUsd: z.number(),
    referenceTags: z.array(z.string()).describe('Aesthetic/style tags from video classification'),
  }),
  execute: async ({ queryText, budgetPerCreatorUsd, referenceTags }) =>
    matchCreators({ queryText, budgetPerCreatorUsd, referenceTags }),
});
