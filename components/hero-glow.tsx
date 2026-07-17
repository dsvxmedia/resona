'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function HeroGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = ref.current;
    const parent = glow?.parentElement;
    if (!glow || !parent) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const xTo = gsap.quickTo(glow, 'x', { duration: 0.6, ease: 'power3.out' });
    const yTo = gsap.quickTo(glow, 'y', { duration: 0.6, ease: 'power3.out' });

    function onMove(e: MouseEvent) {
      const rect = parent!.getBoundingClientRect();
      xTo(e.clientX - rect.left);
      yTo(e.clientY - rect.top);
    }

    parent.addEventListener('mousemove', onMove);
    return () => parent.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute top-0 left-0 z-[5] size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 mix-blend-screen"
      style={{
        background: 'radial-gradient(circle, var(--hero-glow), transparent 70%)',
      }}
    />
  );
}
