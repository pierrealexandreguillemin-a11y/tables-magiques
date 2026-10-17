/**
 * FairyBackground - Fond magique feerie
 * ISO/IEC 25010 - Utilisabilite, Performance
 *
 * P0 Component - Ambiance magique essentielle
 * StarField canvas pour etoiles (performance) + CSS keyframes pour nuages
 */

'use client';

import { memo } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import { StarField } from './StarField';
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
 * Configuration des nuages (CSS keyframes — GPU compositor)
 * Opacite augmentee pour meilleure visibilite
 */
const CLOUDS: CloudConfig[] = [
  {
    id: 'pink',
    color:
      'radial-gradient(circle, rgba(255,182,217,0.8) 0%, rgba(255,105,180,0.4) 100%)',
    size: 700,
    position: { top: '5%', left: '-10%' },
    opacity: 0.6,
    blur: 80,
    animation: {
      x: [0, 100, -80, 0],
      y: [0, -80, 60, 0],
      scale: [1, 1.2, 0.9, 1],
    },
    duration: 20,
  },
  {
    id: 'purple',
    color:
      'radial-gradient(circle, rgba(168,85,247,0.7) 0%, rgba(139,92,246,0.3) 100%)',
    size: 600,
    position: { top: '40%', right: '-5%' },
    opacity: 0.55,
    blur: 70,
    animation: {
      x: [0, -120, 90, 0],
      y: [0, 100, -70, 0],
      scale: [1, 0.85, 1.15, 1],
    },
    duration: 25,
    delay: 5,
  },
  {
    id: 'blue',
    color:
      'radial-gradient(circle, rgba(59,130,246,0.6) 0%, rgba(99,102,241,0.3) 100%)',
    size: 550,
    position: { bottom: '5%', left: '20%' },
    opacity: 0.5,
    blur: 60,
    animation: {
      x: [0, 70, -50, 0],
      y: [0, -50, 70, 0],
      scale: [1, 1.15, 0.85, 1],
    },
    duration: 30,
    delay: 10,
  },
  {
    id: 'gold',
    color:
      'radial-gradient(circle, rgba(251,191,36,0.5) 0%, rgba(245,158,11,0.2) 100%)',
    size: 400,
    position: { top: '60%', left: '60%' },
    opacity: 0.4,
    blur: 50,
    animation: {
      x: [0, -60, 40, 0],
      y: [0, 40, -60, 0],
      scale: [1, 1.1, 0.95, 1],
    },
    duration: 22,
    delay: 12,
  },
];

/**
 * FairyBackground Component
 *
 * Cree une ambiance feerique avec des nuages pastel flottants
 * et des etoiles (StarField canvas, 30 fps, pause hors ecran).
 *
 * @example
 * ```tsx
 * <FairyBackground />
 * // ou avec personnalisation
 * <FairyBackground starCount={30} className="opacity-50" />
 * ```
 */
export const FairyBackground = memo(function FairyBackground({
  className,
  disableAnimation = false,
  starCount = 20,
}: FairyBackgroundProps) {
  const { shouldAnimate } = useReducedMotion();
  const animate = shouldAnimate && !disableAnimation;
  return (
    <div
      data-testid="fairy-background"
      role="presentation"
      aria-hidden="true"
      className={cn(
        'fixed inset-0 -z-10 overflow-hidden',
        // Light mode: fond pastel feerie
        'bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100',
        // Dark mode: fond sombre magique
        'dark:from-slate-900 dark:via-purple-950 dark:to-indigo-950',
        'particle-layer scroll-optimized',
        className
      )}
    >
      {/* Etoiles (canvas, voir lib/animations/canvas/starField.ts) */}
      <StarField
        preset="fairy"
        baseCount={starCount * 2}
        disableAnimation={!animate}
        className="gpu-accelerated"
      />

      {/* Nuages colores (CSS keyframes — GPU compositor) */}
      {CLOUDS.map((cloud) => (
        <div
          key={cloud.id}
          data-testid={`cloud-${cloud.id}`}
          className={cn(
            'absolute rounded-full pointer-events-none gpu-accelerated',
            animate && 'cloud'
          )}
          style={
            {
              width: cloud.size,
              height: cloud.size,
              background: cloud.color,
              opacity: cloud.opacity,
              filter: `blur(${cloud.blur}px)`,
              ...cloud.position,
              ...(animate
                ? {
                    '--duration': `${cloud.duration}s`,
                    '--delay': `${cloud.delay ?? 0}s`,
                    '--x1': `${cloud.animation.x[1]}px`,
                    '--y1': `${cloud.animation.y[1]}px`,
                    '--s1': cloud.animation.scale[1],
                    '--x2': `${cloud.animation.x[2]}px`,
                    '--y2': `${cloud.animation.y[2]}px`,
                    '--s2': cloud.animation.scale[2],
                  }
                : {}),
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
});

export default FairyBackground;
