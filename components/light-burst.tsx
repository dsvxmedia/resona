'use client';

import { motion, useReducedMotion } from 'motion/react';

const RAYS = 10;

export function LightBurst() {
  const reduced = useReducedMotion();

  if (reduced) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
    >
      {Array.from({ length: RAYS }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-px w-1/2 origin-left"
          style={{
            rotate: (360 / RAYS) * i,
            background:
              'linear-gradient(90deg, var(--hero-glow), transparent 70%)',
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: [0, 1, 0.6], opacity: [0, 0.8, 0] }}
          transition={{ duration: 1.1, ease: 'easeOut', delay: i * 0.02 }}
        />
      ))}
    </div>
  );
}
