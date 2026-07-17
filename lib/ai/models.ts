/**
 * Role to model-id adapter, resolved through the Vercel AI Gateway.
 * IDs reverified live against https://ai-gateway.vercel.sh/v1/models on 2026-07-17.
 * Do not trust this list from memory in a future session. Re-check before relying on it.
 *
 * Why three different models for three different jobs (the "which model when" story):
 * - orchestrator/vision: Claude Sonnet 5, best in class for an agentic tool-use loop
 *   and multimodal frame analysis with structured output.
 * - outreach: Claude Haiku 4.5, for parallel short-copy generation. The fast and cheap
 *   tier is the correct tool for this, not the same model used for reasoning steps.
 * - embedding: OpenAI text-embedding-3-small, a purpose-built embedding model. An LLM
 *   has no business generating vector embeddings. At this corpus size (about 30 to 40
 *   rows), the large variant is not worth about 6.5x the cost for negligible recall gain.
 */
export const models = {
  orchestrator: 'anthropic/claude-sonnet-5',
  vision: 'anthropic/claude-sonnet-5',
  outreach: 'anthropic/claude-haiku-4.5',
  embedding: 'openai/text-embedding-3-small',
} as const;

export const EMBEDDING_DIMENSIONS = 1536;
