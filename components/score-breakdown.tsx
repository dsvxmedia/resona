'use client';

import { motion } from 'motion/react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { EASE_OUT } from '@/lib/motion';

export interface ScoreBreakdownData {
  audience_fit: number;
  style_match: number;
  sound_engagement: number;
  engagement_quality: number;
  reliability: number;
  total: number;
}

const COMPONENTS: Array<{ key: keyof Omit<ScoreBreakdownData, 'total'>; label: string }> = [
  { key: 'audience_fit', label: 'Audience fit' },
  { key: 'style_match', label: 'Style match' },
  { key: 'sound_engagement', label: 'Sound engagement' },
  { key: 'engagement_quality', label: 'Engagement quality' },
  { key: 'reliability', label: 'Reliability' },
];

export function ScoreBreakdown({ breakdown }: { breakdown: ScoreBreakdownData }) {
  const totalPct = Math.round(breakdown.total * 100);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="font-heading text-3xl font-semibold tabular-nums">{totalPct}</span>
        <div className="flex-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${totalPct}%` }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
            />
          </div>
        </div>
        <Badge variant="outline">Deterministic score</Badge>
      </div>

      <div className="grid gap-2">
        {COMPONENTS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-3">
            <span className="w-36 shrink-0 text-xs text-muted-foreground">{label}</span>
            <Progress value={breakdown[key] * 100} className="flex-1" />
            <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
              {Math.round(breakdown[key] * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
