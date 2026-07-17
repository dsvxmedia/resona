'use client';

import { motion, useReducedMotion } from 'motion/react';

export function CompletionMoment({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, boxShadow: '0 0 0 0 var(--hero-glow)' }}
      animate={{
        opacity: 1,
        y: 0,
        boxShadow: reduced
          ? '0 0 0 0 transparent'
          : ['0 0 0 0 var(--hero-glow)', '0 0 28px 4px var(--hero-glow)', '0 0 0 0 transparent'],
      }}
      transition={{
        duration: reduced ? 0.3 : 1.4,
        times: reduced ? undefined : [0, 0.3, 1],
        ease: 'easeOut',
      }}
      className="rounded-lg"
    >
      {children}
    </motion.div>
  );
}
