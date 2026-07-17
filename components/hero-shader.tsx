'use client';

import { useState } from 'react';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';

export function HeroShader() {
  // Safe to read window here: this component is only ever rendered client-side
  // (dynamically imported with ssr: false), never during SSR.
  const [reducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  return (
    <ShaderGradientCanvas
      style={{ position: 'absolute', inset: 0 }}
      pixelDensity={1}
      fov={40}
    >
      <ShaderGradient
        control="props"
        type="plane"
        animate={reducedMotion ? 'off' : 'on'}
        color1="#4a2614"
        color2="#c97a4a"
        color3="#1a0d06"
        brightness={1.1}
        cAzimuthAngle={180}
        cPolarAngle={90}
        cDistance={3.9}
        cameraZoom={1}
        lightType="3d"
        reflection={0}
        uSpeed={0.15}
        uStrength={1.2}
        uDensity={0.8}
        uFrequency={2.5}
        uAmplitude={0}
        positionX={0}
        positionY={0}
        positionZ={0}
        rotationX={0}
        rotationY={0}
        rotationZ={0}
        grain="off"
      />
    </ShaderGradientCanvas>
  );
}
