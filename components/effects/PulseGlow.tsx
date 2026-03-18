'use client';

/**
 * PulseGlow - Wrapper avec effet de glow pulsant
 * ISO/IEC 25010 - Mise en évidence visuelle
 */

import { motion } from 'framer-motion';
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
  subtle: { blur: 6, opacity: 0.25 },
  medium: { blur: 12, opacity: 0.4 },
  strong: { blur: 18, opacity: 0.55 },
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
      {/* Glow layer - opacity only animation for performance */}
      <motion.div
        className="absolute inset-0 rounded-inherit pointer-events-none"
        style={{
          background: color,
          filter: `blur(${config.blur}px)`,
          borderRadius: 'inherit',
          willChange: 'opacity',
        }}
        animate={{
          opacity: [config.opacity * 0.5, config.opacity, config.opacity * 0.5],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default PulseGlow;
