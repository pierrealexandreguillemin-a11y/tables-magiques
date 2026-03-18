'use client';

/**
 * ParticlesBackground - Fond avec particules tsParticles
 * ISO/IEC 25010 - Ambiance visuelle immersive
 */

import { useCallback, useMemo } from 'react';
import Particles from '@tsparticles/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useParticlesEngine } from '@/hooks/useParticlesEngine';
import { getParticleConfig, type ParticlePreset } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface ParticlesBackgroundProps {
  preset?: ParticlePreset;
  className?: string;
  opacity?: number;
}

export function ParticlesBackground({
  preset = 'fairy',
  className,
  opacity = 1,
}: ParticlesBackgroundProps) {
  const { shouldAnimate } = useReducedMotion();
  const engineReady = useParticlesEngine();

  const particlesLoaded = useCallback(async () => {
    // Particles loaded
  }, []);

  const options = useMemo(() => {
    const config = getParticleConfig(preset);
    return {
      ...config,
      fullScreen: false,
    };
  }, [preset]);

  if (!shouldAnimate || !engineReady) {
    return null;
  }

  return (
    <div
      className={cn(
        'absolute inset-0 pointer-events-none particle-layer',
        className
      )}
      style={{ opacity }}
    >
      <Particles
        id={`particles-${preset}`}
        particlesLoaded={particlesLoaded}
        options={options}
        className="absolute inset-0 gpu-accelerated"
      />
    </div>
  );
}

export default ParticlesBackground;
