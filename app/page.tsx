'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { BriefForm, type CampaignBrief } from '@/components/brief-form';
import { AgentTrace } from '@/components/agent-trace';
import type { TraceStage, TraceStageStatus } from '@/components/trace-card';
import { ShortlistTable, type ShortlistEntry } from '@/components/shortlist-table';
import { OutreachCard, type OutreachCardData } from '@/components/outreach-card';
import { FooterDisclaimer } from '@/components/footer-disclaimer';

function Waveform() {
  const heights = [6, 14, 22, 12, 28, 18, 8, 24, 16, 10, 20, 6];
  return (
    <svg aria-hidden="true" viewBox="0 0 120 32" className="h-8 w-28 text-primary/50">
      {heights.map((h, i) => (
        <rect key={i} x={i * 10} y={(32 - h) / 2} width={4} height={h} rx={2} fill="currentColor" />
      ))}
    </svg>
  );
}

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

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/campaign' }),
  });

  const isRunning = status === 'submitted' || status === 'streaming';

  function handleSubmit(brief: CampaignBrief) {
    setSubmittedBrief(brief);
    // Per-call body override. Cleaner than a dynamic transport body function,
    // and it avoids any render-time ref/state-closure timing issues.
    sendMessage({ text: `Run the campaign for "${brief.song}".` }, { body: { brief } });
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
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-6 py-16">
        <div>
          <Waveform />
          <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight">
            Find the creators who make songs travel.
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Tell Resona about your song and a reference video. Watch a live multi-agent
            pipeline classify it, match it against a creator roster, and draft outreach,
            all in one run.
          </p>
        </div>

        <BriefForm onSubmit={handleSubmit} disabled={isRunning} urlError={urlError} />

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
              {outreachCards.map(card => (
                <OutreachCard key={card.creatorHandle} data={card} />
              ))}
            </div>
          </section>
        )}

        {summaryText && status === 'ready' && (
          <section className="rounded-lg bg-muted/50 p-4 text-sm">{summaryText}</section>
        )}
      </main>
      <FooterDisclaimer />
    </div>
  );
}
