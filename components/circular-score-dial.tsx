'use client';

import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { EASE_OUT } from '@/lib/motion';

const SIZE = 72;
const STROKE = 6;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CircularScoreDial({ value }: { value: number }) {
  const progress = useMotionValue(0);
  const displayed = useTransform(progress, v => Math.round(v));
  const strokeDashoffset = useTransform(progress, v => CIRCUMFERENCE * (1 - v / 100));

  useEffect(() => {
    const controls = animate(progress, value, { duration: 0.9, ease: EASE_OUT });
    return controls.stop;
  }, [value, progress]);

  return (
    <div className="relative flex shrink-0 items-center justify-center" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-muted"
        />
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          className="stroke-primary"
          style={{ strokeDasharray: CIRCUMFERENCE, strokeDashoffset }}
        />
      </svg>
      <motion.span className="absolute font-heading text-lg font-semibold tabular-nums">
        {displayed}
      </motion.span>
    </div>
  );
}
