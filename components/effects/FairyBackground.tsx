/**
 * FairyBackground - Fond magique feerie
 * ISO/IEC 25010 - Utilisabilite, Performance
 *
 * P0 Component - Ambiance magique essentielle
 * 3 nuages animes + etoiles scintillantes
 */

'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import type { AnimatedComponentProps } from '@/types/effects';

/**
 * Props du composant FairyBackground
 */
export interface FairyBackgroundProps extends AnimatedComponentProps {
  /** Nombre d'etoiles a afficher (defaut: 20) */
  starCount?: number;
}

/**
 * Configuration d'un nuage
 */
interface CloudConfig {
  id: string;
  color: string;
  size: number;
  position: React.CSSProperties;
  opacity: number;
  blur: number;
  animation: {
    x: number[];
    y: number[];
    scale: number[];
  };
  duration: number;
  delay?: number;
}

/**
 * Configuration des nuages
 */
const CLOUDS: CloudConfig[] = [
  {
    id: 'pink',
    color: 'radial-gradient(circle, #FFB6D9 0%, #FFE5F0 100%)',
    size: 600,
    position: { top: '10%', left: '-5%' },
    opacity: 0.4,
    blur: 100,
    animation: {
      x: [0, 80, -60, 0],
      y: [0, -60, 40, 0],
      scale: [1, 1.15, 0.95, 1],
    },
    duration: 25,
  },
  {
    id: 'purple',
    color: 'radial-gradient(circle, #DDA0DD 0%, #F0E5FF 100%)',
    size: 500,
    position: { top: '50%', right: '0%' },
    opacity: 0.35,
    blur: 90,
    animation: {
      x: [0, -100, 70, 0],
      y: [0, 80, -50, 0],
      scale: [1, 0.85, 1.1, 1],
    },
    duration: 30,
    delay: 8,
  },
  {
    id: 'blue',
    color: 'radial-gradient(circle, #87CEEB 0%, #E0F4FF 100%)',
    size: 450,
    position: { bottom: '10%', left: '30%' },
    opacity: 0.3,
    blur: 80,
    animation: {
      x: [0, 50, -40, 0],
      y: [0, -30, 50, 0],
      scale: [1, 1.1, 0.9, 1],
    },
    duration: 35,
    delay: 15,
  },
];

/**
 * Generer des positions aleatoires pour les etoiles
 */
function generateStars(count: number): Array<{
  id: number;
  left: string;
  top: string;
  delay: number;
  duration: number;
  size: number;
}> {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 2,
    size: 4 + Math.random() * 4,
  }));
}

/**
 * FairyBackground Component
 *
 * Cree une ambiance feerique avec des nuages pastel flottants
 * et des etoiles scintillantes. Optimise pour 60fps.
 *
 * @example
 * ```tsx
 * <FairyBackground />
 * // ou avec personnalisation
 * <FairyBackground starCount={30} className="opacity-50" />
 * ```
 */
export function FairyBackground({
  className,
  disableAnimation = false,
  starCount = 20,
}: FairyBackgroundProps) {
  const { shouldAnimate } = useReducedMotion();
  const animate = shouldAnimate && !disableAnimation;

  // Memoize stars to prevent regeneration on re-render
  const stars = useMemo(() => generateStars(starCount), [starCount]);

  return (
    <div
      data-testid="fairy-background"
      role="presentation"
      aria-hidden="true"
      className={cn(
        'fixed inset-0 -z-10 overflow-hidden',
        'bg-gradient-to-b from-purple-50 to-pink-50',
        className
      )}
    >
      {/* Nuages colores */}
      {CLOUDS.map((cloud) => (
        <motion.div
          key={cloud.id}
          data-testid={`cloud-${cloud.id}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: cloud.size,
            height: cloud.size,
            background: cloud.color,
            opacity: cloud.opacity,
            filter: `blur(${cloud.blur}px)`,
            ...cloud.position,
          }}
          animate={animate ? cloud.animation : undefined}
          transition={
            animate
              ? {
                  duration: cloud.duration,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: cloud.delay ?? 0,
                }
              : undefined
          }
        />
      ))}

      {/* Etoiles scintillantes */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          data-testid={`star-${star.id}`}
          className="absolute rounded-full bg-yellow-200 pointer-events-none"
          style={{
            width: star.size,
            height: star.size,
            left: star.left,
            top: star.top,
          }}
          animate={
            animate
              ? {
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.5, 1],
                }
              : undefined
          }
          transition={
            animate
              ? {
                  duration: star.duration,
                  repeat: Infinity,
                  delay: star.delay,
                  ease: 'easeInOut',
                }
              : undefined
          }
        />
      ))}
    </div>
  );
}

export default FairyBackground;
