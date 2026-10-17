/**
 * Confetti scatter - celebration confetti on a given canvas (replaces tsParticles confetti).
 *
 * Parity target = what tsParticles actually rendered (2026-10-17): @tsparticles/slim has no
 * emitters plugin, so the configured top emitter never ran; 100 squares/circles appeared at
 * random positions, fell with gravity while rotating, and died after 3 s.
 */

import confetti from 'canvas-confetti';
import { CONFETTI_COLORS } from '@/lib/animations/colors';
import type { Random } from './starField';

const TOTAL_PARTICLES = 100;
/** canvas-confetti size multiplier range, matching tsParticles sizes 3-8 px */
const SCALAR_RANGE = [0.6, 1.4] as const;
/** 3 s life at canvas-confetti's 60 ticks per second */
const LIFE_TICKS = 180;

export interface ConfettiScatter {
  stop(): void;
}

export function scatterConfetti(
  canvas: HTMLCanvasElement,
  {
    reducedMotion,
    random = Math.random,
  }: { reducedMotion: boolean; random?: Random }
): ConfettiScatter {
  const fire = confetti.create(canvas, { resize: true, useWorker: false });
  if (!reducedMotion) {
    // One particle per call: each gets its own random origin, like tsParticles' random spawn.
    for (let i = 0; i < TOTAL_PARTICLES; i += 1) {
      void fire({
        particleCount: 1,
        origin: { x: random(), y: random() },
        spread: 360,
        startVelocity: 4,
        gravity: 0.4,
        // No tilt/wobble: @tsparticles/slim had no tilt updater, confetti stayed flat.
        flat: true,
        ticks: LIFE_TICKS,
        shapes: ['square', 'circle'],
        // One colour per call: canvas-confetti cycles colours by index within a call.
        colors: [
          CONFETTI_COLORS[Math.floor(random() * CONFETTI_COLORS.length)]!,
        ],
        scalar:
          SCALAR_RANGE[0] + random() * (SCALAR_RANGE[1] - SCALAR_RANGE[0]),
      });
    }
  }
  return { stop: () => fire.reset() };
}
