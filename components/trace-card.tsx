'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { EASE_OUT } from '@/lib/motion';

export type TraceStageStatus = 'pending' | 'active' | 'done' | 'error';

export interface TraceStage {
  id: string;
  label: string;
  status: TraceStageStatus;
  technicalDetail?: { toolName: string; model: string; payload: unknown };
  errorMessage?: string;
}

function StatusDot({ status }: { status: TraceStageStatus }) {
  if (status === 'pending') {
    return <span className="size-2.5 shrink-0 rounded-full bg-muted-foreground/30" />;
  }
  if (status === 'active') {
    return (
      <span className="relative flex size-2.5 shrink-0 items-center justify-center">
        <motion.span
          className="absolute inline-flex size-2.5 rounded-full bg-primary"
          animate={{ scale: [1, 1.6, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="relative size-2.5 rounded-full bg-primary" />
      </span>
    );
  }
  if (status === 'done') {
    return <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-500" />;
  }
  return <AlertTriangle className="size-4 shrink-0 text-destructive" />;
}

export function TraceCard({ stage }: { stage: TraceStage }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card size="sm" className="flex-row items-start gap-3 p-4">
      <div className="pt-0.5">
        <StatusDot status={stage.status} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{stage.label}</p>

        {stage.status === 'active' && (
          <div className="mt-3 flex flex-col gap-2">
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
        )}

        {stage.status === 'error' && stage.errorMessage && (
          <div className="mt-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {stage.errorMessage}
          </div>
        )}

        {stage.status === 'done' && stage.technicalDetail && (
          <div className="mt-2">
            <button
              type="button"
              onClick={() => setExpanded(v => !v)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ChevronRight
                className={cn('size-3 transition-transform', expanded && 'rotate-90')}
              />
              show technical detail
            </button>
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: EASE_OUT }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 rounded-md bg-muted p-3 text-xs">
                    <dl className="mb-2 flex flex-wrap gap-x-4 gap-y-1 font-mono">
                      <div className="flex gap-1">
                        <dt className="text-muted-foreground">tool:</dt>
                        <dd>{stage.technicalDetail.toolName}</dd>
                      </div>
                      <div className="flex gap-1">
                        <dt className="text-muted-foreground">model:</dt>
                        <dd>{stage.technicalDetail.model}</dd>
                      </div>
                    </dl>
                    <pre className="max-h-64 overflow-y-auto overflow-x-auto font-mono">
                      {JSON.stringify(stage.technicalDetail.payload, null, 2)}
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </Card>
  );
}
