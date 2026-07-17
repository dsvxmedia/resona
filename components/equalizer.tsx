'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const HEIGHTS = [6, 14, 22, 12, 28, 18, 8, 24, 16, 10, 20, 6];

export function Equalizer() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const bars = svgRef.current?.querySelectorAll('rect');
    if (!bars || bars.length === 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      bars.forEach((bar, i) => {
        gsap.to(bar, {
          scaleY: gsap.utils.random(0.4, 1.7),
          transformOrigin: 'center',
          duration: gsap.utils.random(0.5, 1.1),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.05,
        });
      });
    }, svgRef);

    return () => ctx.revert();
  }, []);

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      viewBox="0 0 120 32"
      className="h-8 w-28 text-primary/70"
    >
      {HEIGHTS.map((h, i) => (
        <rect key={i} x={i * 10} y={(32 - h) / 2} width={4} height={h} rx={2} fill="currentColor" />
      ))}
    </svg>
  );
}
