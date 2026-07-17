import { tool, generateText, Output } from 'ai';
import { z } from 'zod';
import { models } from '@/lib/ai/models';
import {
  normalizeTikTokUrl,
  fetchTikTokOEmbed,
  extractCaptionSignals,
} from '@/lib/video/tiktok';
import {
  videoClassificationSchema,
  CLASSIFICATION_PROMPT_INSTRUCTIONS,
  type VideoClassification,
} from '@/lib/video/classification-schema';

export type AnalyzeReferenceVideoResult =
  | { ok: true; data: VideoClassification }
  | { ok: false; error: string; suggestion: string };

/**
 * Live tier only, keyless, Vercel-safe: TikTok oEmbed + thumbnail + one Claude
 * vision call. Feeds the oEmbed caption/hashtags into the vision prompt
 * alongside the thumbnail image, not thumbnail-only (per gstack review finding).
 * Never throws. Always returns a typed {ok:false, error, suggestion} on failure
 * so the orchestrator/UI can degrade gracefully instead of crashing.
 */
export async function analyzeReferenceVideo(
  url: string,
): Promise<AnalyzeReferenceVideoResult> {
  const normalized = await normalizeTikTokUrl(url);
  if (!normalized.ok) {
    return {
      ok: false,
      error: normalized.error,
      suggestion:
        'Paste a public tiktok.com video URL (short links like vm.tiktok.com are also fine).',
    };
  }

  const oembed = await fetchTikTokOEmbed(normalized.url);
  if (!oembed.ok) {
    return { ok: false, error: oembed.error, suggestion: oembed.suggestion };
  }

  const { caption, hashtags } = extractCaptionSignals(oembed.data.title);

  let thumbnailBase64: string;
  let thumbnailMediaType = 'image/jpeg';
  try {
    const res = await fetch(oembed.data.thumbnail_url, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`thumbnail fetch failed: ${res.status}`);
    thumbnailMediaType = res.headers.get('content-type') ?? thumbnailMediaType;
    const buf = await res.arrayBuffer();
    thumbnailBase64 = Buffer.from(buf).toString('base64');
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Failed to fetch thumbnail',
      suggestion:
        "Couldn't load that clip's preview image. Try a different public TikTok link.",
    };
  }

  try {
    const { output } = await generateText({
      model: models.vision,
      output: Output.object({ schema: videoClassificationSchema }),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: CLASSIFICATION_PROMPT_INSTRUCTIONS },
            {
              type: 'text',
              text: `Caption: ${caption}\nHashtags: ${hashtags.join(', ') || '(none)'}\nCreator: ${oembed.data.author_name}\n\nSet analysis_depth to "preview" since this is thumbnail + metadata only, not full video frames.`,
            },
            {
              type: 'image',
              image: `data:${thumbnailMediaType};base64,${thumbnailBase64}`,
            },
          ],
        },
      ],
      abortSignal: AbortSignal.timeout(30_000),
    });
    return { ok: true, data: output };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Video classification failed',
      suggestion:
        "Couldn't read that clip. Continuing with your genre and vibe instead.",
    };
  }
}

export const analyzeReferenceVideoTool = tool({
  description:
    "Analyze a public TikTok video's storytelling pattern, pacing, energy, format, and aesthetic from its thumbnail and caption. Returns a typed failure with a suggestion if the video can't be read.",
  inputSchema: z.object({
    url: z.string().describe('A public TikTok video URL, including short links'),
  }),
  execute: async ({ url }) => analyzeReferenceVideo(url),
});
