import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TraceStage } from '@/components/trace-card';

const SHORT_LABELS: Record<string, string> = {
  video: 'Analyze',
  search: 'Match',
  draft: 'Draft',
};

export function ProgressRail({ stages }: { stages: TraceStage[] }) {
  return (
    <ol className="flex flex-col rounded-xl border border-border bg-card/60 p-4">
      {stages.map((stage, i) => (
        <li key={stage.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={cn(
                'flex size-6 shrink-0 items-center justify-center rounded-full border text-xs',
                stage.status === 'done' && 'border-primary bg-primary text-primary-foreground',
                stage.status === 'active' && 'border-primary text-primary',
                stage.status === 'error' && 'border-destructive text-destructive',
                stage.status === 'pending' && 'border-border text-muted-foreground',
              )}
            >
              {stage.status === 'done' ? <CheckCircle2 className="size-3.5" /> : i + 1}
            </span>
            {i < stages.length - 1 && (
              <span
                className={cn(
                  'my-1 h-6 w-px',
                  stage.status === 'done' ? 'bg-primary' : 'bg-border',
                )}
              />
            )}
          </div>
          <span
            className={cn(
              'pb-6 text-sm',
              stage.status === 'pending' ? 'text-muted-foreground' : 'text-foreground',
            )}
          >
            {SHORT_LABELS[stage.id] ?? stage.label}
          </span>
        </li>
      ))}
    </ol>
  );
}
