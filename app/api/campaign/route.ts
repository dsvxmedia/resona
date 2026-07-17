import { createAgentUIStreamResponse } from 'ai';
import { createCampaignAgent, type CampaignBrief } from '@/lib/agents/campaign-agent';

export const maxDuration = 120;

export async function POST(request: Request) {
  const startedAt = Date.now();
  try {
    const { messages, brief } = (await request.json()) as {
      messages: unknown[];
      brief: CampaignBrief;
    };

    console.log('[campaign] run started', {
      song: brief?.song,
      hasTiktokUrl: Boolean(brief?.tiktokUrl),
    });

    const { agent } = createCampaignAgent(brief);

    return createAgentUIStreamResponse({
      agent,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      uiMessages: messages as any,
      onError: error => {
        console.error('[campaign] stream error', error);
        return 'Something went wrong running the campaign pipeline. Please try again.';
      },
    });
  } catch (error) {
    console.error('[campaign] request failed', error, { durationMs: Date.now() - startedAt });
    return new Response(
      JSON.stringify({ error: 'Failed to start campaign run.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
