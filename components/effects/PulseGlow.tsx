'use client';

/**
 * PulseGlow - Wrapper avec effet de glow pulsant
 * ISO/IEC 25010 - Mise en evidence visuelle
 * CSS keyframes — zero JS per frame
 */

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

interface PulseGlowProps {
  children: React.ReactNode;
  color?: string;
  intensity?: 'subtle' | 'medium' | 'strong';
  speed?: 'slow' | 'normal' | 'fast';
  active?: boolean;
  className?: string;
}

const intensityMap = {
  subtle: { blur: 6, opacityMin: 0.12, opacityMax: 0.25 },
  medium: { blur: 12, opacityMin: 0.2, opacityMax: 0.4 },
  strong: { blur: 18, opacityMin: 0.28, opacityMax: 0.55 },
};

const speedMap = {
  slow: 3,
  normal: 2,
  fast: 1,
};

export function PulseGlow({
  children,
  color = '#ff69b4',
  intensity = 'medium',
  speed = 'normal',
  active = true,
  className,
}: PulseGlowProps) {
  const { shouldAnimate } = useReducedMotion();
  const config = intensityMap[intensity];
  const duration = speedMap[speed];

  if (!shouldAnimate || !active) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn('relative inline-block', className)}>
      {/* Glow layer — CSS animation only */}
      <div
        className="absolute inset-0 rounded-inherit pointer-events-none pulse-glow-layer"
        style={
          {
            background: color,
            filter: `blur(${config.blur}px)`,
            borderRadius: 'inherit',
            '--glow-opacity-min': config.opacityMin,
            '--glow-opacity-max': config.opacityMax,
            '--glow-duration': `${duration}s`,
          } as React.CSSProperties
        }
      />
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default PulseGlow;
