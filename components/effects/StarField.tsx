/**
 * StarField - decorative canvas of drifting stars (replaces tsParticles star presets).
 * ISO/IEC 25010 - Performance: no particle engine, 30 fps cap, paused when the tab is
 * hidden or the canvas is off-screen; reduced motion draws one static frame.
 */

'use client';

import { memo, useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { startStarField } from '@/lib/animations/canvas/starField';
import {
  STAR_FIELD_PRESETS,
  scaledCount,
  type StarFieldPresetName,
} from '@/lib/animations/canvas/starFieldPresets';
import { cn } from '@/lib/utils';

export interface StarFieldProps {
  preset: StarFieldPresetName;
  /** Star count at the preset's reference area (scaled to the canvas area) */
  baseCount: number;
  /** Force a static frame even when motion is allowed */
  disableAnimation?: boolean;
  className?: string;
}

export const StarField = memo(function StarField({
  preset,
  baseCount,
  disableAnimation = false,
  className,
}: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { shouldAnimate } = useReducedMotion();
  const reducedMotion = !shouldAnimate || disableAnimation;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const field = startStarField(canvas, STAR_FIELD_PRESETS[preset], {
      count: scaledCount(
        preset,
        baseCount,
        canvas.clientWidth,
        canvas.clientHeight
      ),
      reducedMotion,
    });

    const resizeObserver = new ResizeObserver(() => field.resize());
    resizeObserver.observe(canvas);
    const visibilityObserver = new IntersectionObserver((entries) => {
      const visible = entries.some((entry) => entry.isIntersecting);
      if (visible) field.resume();
      else field.pause();
    });
    visibilityObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      field.destroy();
    };
  }, [preset, baseCount, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn('absolute inset-0 h-full w-full', className)}
    />
  );
});
