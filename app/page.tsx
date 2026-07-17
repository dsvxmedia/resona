'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { motion } from 'motion/react';
import { BriefForm, type CampaignBrief } from '@/components/brief-form';
import { AgentTrace } from '@/components/agent-trace';
import type { TraceStage, TraceStageStatus } from '@/components/trace-card';
import { ShortlistTable, type ShortlistEntry } from '@/components/shortlist-table';
import { OutreachCard, type OutreachCardData } from '@/components/outreach-card';
import { FooterDisclaimer } from '@/components/footer-disclaimer';
import { Button } from '@/components/ui/button';
import { Equalizer } from '@/components/equalizer';
import { ScrollReveal } from '@/components/scroll-reveal';
import { ProgressRail } from '@/components/progress-rail';
import { HowItWorks } from '@/components/how-it-works';
import { HeroGlow } from '@/components/hero-glow';
import { CompletionMoment } from '@/components/completion-moment';
import { EASE_OUT } from '@/lib/motion';

const HeroShader = dynamic(() => import('@/components/hero-shader').then(m => m.HeroShader), {
  ssr: false,
});

const STAGE_DEFS: Array<{ id: string; toolName: string; label: string; requiresVideo?: boolean }> = [
  { id: 'video', toolName: 'analyze_video_reference', label: 'Analyzing your reference video…', requiresVideo: true },
  { id: 'search', toolName: 'search_creators', label: 'Finding & scoring your creators…' },
  { id: 'draft', toolName: 'draft_outreach', label: 'Drafting outreach for your top picks…' },
];

interface ToolPart {
  type: string;
  state?: string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
}

function statusFromToolPart(part: ToolPart | undefined): TraceStageStatus {
  if (!part) return 'pending';
  if (part.state === 'output-error') return 'error';
  if (part.state === 'output-available') {
    const output = part.output as { ok?: boolean } | undefined;
    if (output && output.ok === false) return 'error';
    return 'done';
  }
  return 'active';
}

function errorMessageFromToolPart(part: ToolPart | undefined): string | undefined {
  if (!part) return undefined;
  if (part.state === 'output-error') return part.errorText ?? 'Something went wrong.';
  const output = part.output as { ok?: boolean; suggestion?: string; error?: string } | undefined;
  if (output && output.ok === false) return output.suggestion ?? output.error ?? 'Something went wrong.';
  return undefined;
}

export default function Home() {
  const [submittedBrief, setSubmittedBrief] = useState<CampaignBrief | null>(null);
  const [urlError] = useState<string | undefined>(undefined);

  const { messages, sendMessage, setMessages, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/campaign' }),
  });

  const isRunning = status === 'submitted' || status === 'streaming';

  function handleSubmit(brief: CampaignBrief) {
    setSubmittedBrief(brief);
    // Per-call body override. Cleaner than a dynamic transport body function,
    // and it avoids any render-time ref/state-closure timing issues.
    sendMessage({ text: `Run the campaign for "${brief.song}".` }, { body: { brief } });
  }

  function handleReset() {
    setMessages([]);
    setSubmittedBrief(null);
  }

  const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
  const parts = (lastAssistantMessage?.parts ?? []) as ToolPart[];

  const includeVideo = Boolean(submittedBrief?.tiktokUrl);
  const stages: TraceStage[] = STAGE_DEFS.filter(s => !s.requiresVideo || includeVideo).map(
    def => {
      const part = parts.find(p => p.type === `tool-${def.toolName}`);
      const stageStatus = statusFromToolPart(part);
      return {
        id: def.id,
        label: def.label,
        status: stageStatus,
        errorMessage: stageStatus === 'error' ? errorMessageFromToolPart(part) : undefined,
        technicalDetail:
          stageStatus === 'done'
            ? { toolName: def.toolName, model: 'anthropic/claude-sonnet-5', payload: part?.output }
            : undefined,
      };
    },
  );

  const searchPart = parts.find(p => p.type === 'tool-search_creators');
  const searchOutput = searchPart?.output as
    | { ok: true; creators: ShortlistEntry[] }
    | { ok: false }
    | undefined;

  const draftPart = parts.find(p => p.type === 'tool-draft_outreach');
  const draftOutput = draftPart?.output as
    | {
        ok: true;
        drafts: Array<{
          creatorId: string;
          handle: string;
          displayName: string;
          draftText: string | null;
          matchRationale: string;
        }>;
      }
    | { ok: false }
    | undefined;

  const shortlist: ShortlistEntry[] =
    searchOutput && 'ok' in searchOutput && searchOutput.ok ? searchOutput.creators : [];

  const outreachCards: OutreachCardData[] =
    draftOutput && 'ok' in draftOutput && draftOutput.ok
      ? draftOutput.drafts.map(d => ({
          creatorHandle: d.handle,
          creatorDisplayName: d.displayName,
          draftText: d.draftText,
          matchRationale: d.matchRationale,
        }))
      : [];

  const summaryText = (lastAssistantMessage?.parts ?? [])
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map(p => p.text)
    .join('\n');

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="hero-band relative overflow-hidden">
        <HeroShader />
        <HeroGlow />
        <div className="relative z-10 mx-auto w-full max-w-4xl px-6 py-16">
          <Equalizer />
          <p className="wordmark mt-4 text-8xl sm:text-9xl">Resona</p>
          <h1 className="mt-3 font-heading text-2xl font-medium tracking-tight text-hero-foreground/90 sm:text-3xl">
            Find the creators who make songs travel.
          </h1>
          <p className="mt-2 max-w-xl text-hero-foreground/60">
            Tell Resona about your song and a reference video. Watch a live multi-agent
            pipeline classify it, match it against a creator roster, and draft outreach,
            all in one run.
          </p>
        </div>
      </div>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-16">
        <HowItWorks />

        <div className="grid gap-8 lg:grid-cols-[400px_1fr] lg:items-start">
          <div className="flex flex-col gap-6 lg:sticky lg:top-8">
            <ScrollReveal>
              <BriefForm onSubmit={handleSubmit} disabled={isRunning} urlError={urlError} />
            </ScrollReveal>
            {submittedBrief && <ProgressRail stages={stages} />}
          </div>

          <div className="flex flex-col gap-10">
            {submittedBrief && (
              <section className="flex flex-col gap-3">
                <h2 className="font-heading text-lg font-medium">Agent trace</h2>
                <AgentTrace stages={stages} />
              </section>
            )}

            {shortlist.length > 0 && (
              <section className="flex flex-col gap-3">
                <h2 className="font-heading text-lg font-medium">Shortlist</h2>
                <ShortlistTable entries={shortlist} />
              </section>
            )}

            {outreachCards.length > 0 && (
              <section className="flex flex-col gap-3">
                <h2 className="font-heading text-lg font-medium">Outreach drafts</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {outreachCards.map((card, index) => (
                    <motion.div
                      key={card.creatorHandle}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06, duration: 0.3, ease: EASE_OUT }}
                    >
                      <OutreachCard data={card} />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {summaryText && status === 'ready' && (
              <CompletionMoment>
                <section className="flex flex-col gap-3 rounded-lg bg-muted/50 p-4 text-sm">
                  <p>{summaryText}</p>
                  <Button variant="outline" size="sm" className="w-fit" onClick={handleReset}>
                    Run another campaign
                  </Button>
                </section>
              </CompletionMoment>
            )}

            {!submittedBrief && (
              <div className="hidden flex-1 items-center justify-center rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground lg:flex">
                Your live agent trace and results will stream in here.
              </div>
            )}
          </div>
        </div>
      </main>
      <FooterDisclaimer />
    </div>
  );
}
