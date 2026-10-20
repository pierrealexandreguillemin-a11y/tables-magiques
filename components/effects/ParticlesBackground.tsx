/**
 * ParticlesBackground - Fond d'etincelles (mode defi)
 * ISO/IEC 25010 - Performance: StarField canvas (remplace tsParticles)
 */

'use client';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import {
  BASE_COUNT,
  type StarFieldPresetName,
} from '@/lib/animations/canvas/starFieldPresets';
import { cn } from '@/lib/utils';
import { StarField } from './StarField';

interface ParticlesBackgroundProps {
  preset?: StarFieldPresetName;
  className?: string;
  opacity?: number;
}

export function ParticlesBackground({
  preset = 'sparkles',
  className,
  opacity = 1,
}: ParticlesBackgroundProps) {
  const { shouldAnimate } = useReducedMotion();

  // Decorative only: nothing at all under reduced motion (unchanged behaviour).
  if (!shouldAnimate) return null;

  return (
    <div
      className={cn(
        'absolute inset-0 pointer-events-none particle-layer',
        className
      )}
      style={{ opacity }}
    >
      <StarField
        preset={preset}
        baseCount={BASE_COUNT[preset]}
        className="gpu-accelerated"
      />
    </div>
  );
}

export default ParticlesBackground;
