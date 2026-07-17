import { z } from 'zod';

export const videoClassificationSchema = z.object({
  storytelling_pattern: z.enum([
    'hook_payoff',
    'narrative_arc',
    'tutorial',
    'vibe_montage',
    'skit',
    'dance_performance',
    'lipsync_performance',
    'pov',
  ]),
  pacing: z.object({
    cuts_estimate: z.enum(['slow', 'moderate', 'rapid']),
    rationale: z.string(),
  }),
  energy: z.object({
    level: z.number().min(1).max(10),
    descriptor: z.string(),
  }),
  format: z.enum([
    'talking_head',
    'dance',
    'transition_edit',
    'day_in_life',
    'duet_style',
    'performance',
    'montage',
  ]),
  aesthetic_tags: z.array(z.string()).min(3).max(6),
  tonal_identity: z.string(),
  hook_style: z.string(),
  sound_relationship: z.enum(['music_forward', 'music_supporting', 'music_background']),
  evidence: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  analysis_depth: z.enum(['deep', 'preview']),
});

export type VideoClassification = z.infer<typeof videoClassificationSchema>;

export const CLASSIFICATION_PROMPT_INSTRUCTIONS = `You are classifying a short-form vertical video (TikTok) using its thumbnail image plus its caption and hashtags. Pick the single best-fitting "storytelling_pattern" and "format" from the enums provided. Do not invent new values. Estimate "pacing" and "energy" from visual cues in the thumbnail (motion blur, framing, subject count, expression) combined with tonal cues in the caption and hashtags. Write a one-sentence "rationale" or "descriptor" for each, not just a bare label. List 3-6 concise "aesthetic_tags" (for example "warm-lit", "high-contrast", "minimal-set") and cite what you actually observed in "evidence" (short phrases referencing the thumbnail or caption, not generic claims). Set "confidence" (0-1) honestly lower when working from a single thumbnail frame rather than full video, and set "analysis_depth" to "preview" for thumbnail-only analysis or "deep" only if given multiple frames or full video context. Never use an em dash anywhere in your output.`;
