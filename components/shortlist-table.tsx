'use client';

import { motion } from 'motion/react';
import { Card, CardHeader, CardTitle, CardAction, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScoreBreakdown, type ScoreBreakdownData } from '@/components/score-breakdown';
import { CountUp } from '@/components/count-up';
import { EASE_OUT } from '@/lib/motion';

export interface ShortlistEntry {
  creatorId: string;
  handle: string;
  displayName: string;
  followerCount: number;
  region: string;
  bio: string;
  breakdown: ScoreBreakdownData;
  matchRationale: string;
}

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function ShortlistTable({ entries }: { entries: ShortlistEntry[] }) {
  return (
    <div className="flex flex-col gap-4">
      {entries.map((entry, index) => (
        <motion.div
          key={entry.creatorId}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08, duration: 0.3, ease: EASE_OUT }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-lg">
                <Badge variant="outline">#{index + 1}</Badge>
                {entry.displayName}{' '}
                <span className="font-normal text-muted-foreground">@{entry.handle}</span>
              </CardTitle>
              <CardAction className="text-sm text-muted-foreground">
                <CountUp value={entry.followerCount} format={formatFollowers} duration={1} /> ·{' '}
                {entry.region}
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground line-clamp-2">{entry.bio}</p>
              <ScoreBreakdown breakdown={entry.breakdown} />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Why this creator</p>
                <p className="text-sm">{entry.matchRationale}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
