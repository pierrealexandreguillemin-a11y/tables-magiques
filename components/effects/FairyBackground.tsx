/**
 * FairyBackground - Fond magique feerie
 * ISO/IEC 25010 - Utilisabilite, Performance
 *
 * P0 Component - Ambiance magique essentielle
 * tsParticles pour etoiles (performance) + Framer Motion pour nuages
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { Container, ISourceOptions } from '@tsparticles/engine';
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
 * Configuration des nuages (Framer Motion - elements larges)
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
 * Generer la configuration tsParticles pour les etoiles
 */
function createStarParticlesConfig(
  starCount: number,
  animate: boolean
): ISourceOptions {
  return {
    fullScreen: false,
    fpsLimit: 60,
    pauseOnBlur: true,
    pauseOnOutsideViewport: true,
    particles: {
      number: {
        value: starCount,
        density: {
          enable: true,
        },
      },
      color: {
        value: ['#fef08a', '#fde047', '#facc15', '#ffffff'],
      },
      shape: {
        type: 'circle',
      },
      opacity: {
        value: { min: 0.3, max: 1 },
        animation: animate
          ? {
              enable: true,
              speed: 0.5,
              sync: false,
            }
          : { enable: false },
      },
      size: {
        value: { min: 2, max: 6 },
        animation: animate
          ? {
              enable: true,
              speed: 2,
              sync: false,
            }
          : { enable: false },
      },
      move: {
        enable: animate,
        speed: 0.3,
        direction: 'none',
        random: true,
        straight: false,
        outModes: {
          default: 'bounce',
        },
      },
      twinkle: {
        particles: {
          enable: animate,
          frequency: 0.05,
          opacity: 1,
        },
      },
    },
    detectRetina: true,
  };
}

/**
 * FairyBackground Component
 *
 * Cree une ambiance feerique avec des nuages pastel flottants
 * et des etoiles scintillantes via tsParticles (60fps GPU).
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
  const [engineReady, setEngineReady] = useState(false);
  const [particlesReady, setParticlesReady] = useState(false);

  // Initialize tsParticles engine (once per app lifetime)
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setEngineReady(true);
    });
  }, []);

  // Callback when particles container is loaded
  const particlesLoaded = useCallback(async (_container?: Container) => {
    setParticlesReady(true);
  }, []);

  // Memoize particles config
  const particlesConfig = useMemo(
    () => createStarParticlesConfig(starCount, animate),
    [starCount, animate]
  );

  return (
    <div
      data-testid="fairy-background"
      data-particles-ready={particlesReady.toString()}
      role="presentation"
      aria-hidden="true"
      className={cn(
        'fixed inset-0 -z-10 overflow-hidden',
        'bg-gradient-to-b from-purple-50 to-pink-50',
        className
      )}
    >
      {/* Etoiles scintillantes via tsParticles (GPU accelere) */}
      {engineReady && (
        <Particles
          id="fairy-stars"
          data-testid="particles-container"
          className="absolute inset-0"
          particlesLoaded={particlesLoaded}
          options={particlesConfig}
        />
      )}

      {/* Nuages colores (Framer Motion - elements larges) */}
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
    </div>
  );
}

export default FairyBackground;
