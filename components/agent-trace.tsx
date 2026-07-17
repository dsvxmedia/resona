'use client';

import { motion } from 'motion/react';
import { TraceCard, type TraceStage } from '@/components/trace-card';

export function AgentTrace({ stages }: { stages: TraceStage[] }) {
  return (
    <div className="flex flex-col gap-3">
      {stages.map(stage => (
        <motion.div
          key={stage.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <TraceCard stage={stage} />
        </motion.div>
      ))}
    </div>
  );
}
