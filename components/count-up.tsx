'use client';

import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { EASE_OUT } from '@/lib/motion';

export function CountUp({
  value,
  duration = 0.8,
  className,
  format,
}: {
  value: number;
  duration?: number;
  className?: string;
  format?: (n: number) => string;
}) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, v => (format ? format(Math.round(v)) : String(Math.round(v))));

  useEffect(() => {
    const controls = animate(mv, value, { duration, ease: EASE_OUT });
    return controls.stop;
  }, [value, duration, mv]);

  return <motion.span className={className}>{rounded}</motion.span>;
}
