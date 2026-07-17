# Resona

**Find the creators who make songs travel.**

Resona is a working, deployed proof of concept: a multi-agent AI pipeline that takes a music marketing brief plus a real TikTok reference video, and produces a scored, explainable creator shortlist with drafted outreach — end to end, streamed live.

Built to accompany an application for the **AI Engineer** role at [Influur](https://www.influur.com/). **Not affiliated with Influur.** This is a deliberately scoped proof of concept, not a full product build — happy to walk through the fuller system design in conversation.

## What it does

1. You submit a campaign brief (song, genre/vibe, target audience, budget) and a public TikTok reference video URL.
2. A live agent trace streams as the pipeline runs:
   - **Video analysis** — real TikTok oEmbed + thumbnail + a Claude vision call classify the reference clip's storytelling pattern, pacing, energy, and aesthetic. No mocked results, no canned data — paste any public TikTok URL and it gets genuinely analyzed.
   - **Creator matching** — the brief and video signal are embedded and matched against a synthetic 33-creator roster using cosine similarity plus a fully deterministic scoring formula (audience fit, style match, sound engagement, engagement quality, reliability). No raw follower count in the score — a smaller, more engaged creator can and does outrank a much bigger, less-engaged one.
   - **Outreach drafting** — short, specific outreach DMs are drafted in parallel for the top matches, each citing a concrete reason from the match data. Clearly labeled drafts — nothing is ever sent.
3. You get a ranked shortlist with a transparent score breakdown per creator, plus the outreach drafts.

## Why it's built this way

- **Multi-agent orchestration, not a single prompt.** An orchestrator (`ToolLoopAgent`, AI SDK v6/v7) coordinates three tools — video analysis, creator search, outreach drafting — each backed by a different model chosen for the job, not out of convenience.
- **Deliberate model selection.** Claude Sonnet 5 for reasoning and vision (agentic tool-use, multimodal classification), Claude Haiku 4.5 for cheap parallel copy generation, OpenAI `text-embedding-3-small` for embeddings. Scoring itself is **not** an LLM call — a transparent, unit-tested TypeScript formula, because asking a model to do arithmetic is the wrong tool for the job.
- **Real RAG, no database.** At this corpus size (33 creators), an in-memory JSON dataset with precomputed embeddings and cosine similarity is the right engineering call — a real Postgres/pgvector layer would be pure overhead. (The production-scale schema is designed and ready; it's just not the right choice at this scale, and saying so is the point.)
- **Error handling that's actually exercised, not theoretical.** Every external call (TikTok oEmbed, embeddings, LLM calls) returns a typed `{ok, ...}` result rather than throwing. A bad, private, or short-link (`vm.tiktok.com`) TikTok URL degrades gracefully with an on-brand message in the trace UI instead of crashing. Outreach drafting uses `Promise.allSettled` — one failed draft never kills the batch.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 + shadcn/ui · AI SDK v7 · Vercel AI Gateway · Vitest

## Running locally

```bash
pnpm install
cp .env.example .env.local   # add your AI_GATEWAY_API_KEY
pnpm tsx scripts/generate-creators.ts   # generates data/creators.json with real embeddings
pnpm dev
```

## What's out of scope (on purpose)

No auth, no real payments, no live database, no multi-campaign dashboard, no actually-sent outreach. Each of these was a deliberate scope decision for a focused demo, not an oversight — see the code comments and commit history for the reasoning behind each one.
