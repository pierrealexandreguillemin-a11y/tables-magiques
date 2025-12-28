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
import type { ISourceOptions } from '@tsparticles/engine';
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
        value: starCount * 2, // Plus d'etoiles
        density: {
          enable: true,
        },
      },
      color: {
        // Couleurs vives pour visibilite dark mode
        value: [
          '#fef08a',
          '#fde047',
          '#facc15',
          '#ffffff',
          '#f472b6',
          '#c084fc',
        ],
      },
      shape: {
        type: 'star', // Forme etoile
        options: {
          star: {
            sides: 5,
          },
        },
      },
      opacity: {
        value: { min: 0.5, max: 1 }, // Plus opaque
        animation: animate
          ? {
              enable: true,
              speed: 1,
              sync: false,
            }
          : { enable: false },
      },
      size: {
        value: { min: 3, max: 8 }, // Plus gros
        animation: animate
          ? {
              enable: true,
              speed: 3,
              sync: false,
            }
          : { enable: false },
      },
      move: {
        enable: animate,
        speed: 0.5, // Plus rapide
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
          frequency: 0.08, // Scintillement plus frequent
          opacity: 1,
        },
      },
      // Effet glow
      shadow: {
        enable: true,
        color: '#fbbf24',
        blur: 10,
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
  const particlesLoaded = useCallback(async () => {
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
        // Light mode: fond pastel feerie
        'bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100',
        // Dark mode: fond sombre magique
        'dark:from-slate-900 dark:via-purple-950 dark:to-indigo-950',
        'particle-layer scroll-optimized',
        className
      )}
    >
      {/* Etoiles scintillantes via tsParticles (GPU accelere) */}
      {engineReady && (
        <Particles
          id="fairy-stars"
          data-testid="particles-container"
          className="absolute inset-0 gpu-accelerated"
          particlesLoaded={particlesLoaded}
          options={particlesConfig}
        />
      )}

      {/* Nuages colores (Framer Motion - elements larges) */}
      {CLOUDS.map((cloud) => (
        <motion.div
          key={cloud.id}
          data-testid={`cloud-${cloud.id}`}
          className="absolute rounded-full pointer-events-none gpu-accelerated"
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
