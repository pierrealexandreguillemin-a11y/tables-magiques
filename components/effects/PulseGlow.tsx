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
  subtle: { blur: 10, opacity: 0.3 },
  medium: { blur: 20, opacity: 0.5 },
  strong: { blur: 30, opacity: 0.7 },
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
      {/* Glow layer */}
      <motion.div
        className="absolute inset-0 rounded-inherit pointer-events-none"
        style={{
          background: color,
          filter: `blur(${config.blur}px)`,
          borderRadius: 'inherit',
        }}
        animate={{
          opacity: [config.opacity * 0.5, config.opacity, config.opacity * 0.5],
          scale: [0.95, 1.05, 0.95],
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
