/**
 * ConfettiBurst - celebration confetti over its parent (replaces tsParticles confetti).
 * Scatters once on mount, clears on unmount; nothing under reduced motion.
 */

'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { scatterConfetti } from '@/lib/animations/canvas/confettiScatter';
import { cn } from '@/lib/utils';

export function ConfettiBurst({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { shouldAnimate } = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const burst = scatterConfetti(canvas, { reducedMotion: !shouldAnimate });
    return () => burst.stop();
  }, [shouldAnimate]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full',
        className
      )}
    />
  );
}
