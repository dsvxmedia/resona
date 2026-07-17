'use client';

import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CircularScoreDial } from '@/components/circular-score-dial';
import { CountUp } from '@/components/count-up';

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
      <div className="flex items-center gap-4">
        <CircularScoreDial value={totalPct} />
        <div className="flex flex-1 flex-col gap-1">
          <Badge variant="outline" className="w-fit">Deterministic score</Badge>
        </div>
      </div>

      <div className="grid gap-2">
        {COMPONENTS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-3">
            <span className="w-36 shrink-0 text-xs text-muted-foreground">{label}</span>
            <Progress value={breakdown[key] * 100} className="flex-1" />
            <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
              <CountUp value={Math.round(breakdown[key] * 100)} />%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
