/**
 * useParticles Hook
 * ISO/IEC 25010 - SRP: Particle generation only
 */

import { useMemo } from 'react';

const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

export interface Particle {
  id: number;
  left: string;
  top: string;
  size: number;
  duration: number;
  delay: number;
  xOffset: number;
}

export interface Star {
  id: number;
  left: string;
  top: string;
  duration: number;
  delay: number;
}

export function useParticles() {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: `${seededRandom(i * 3 + 1) * 100}%`,
        top: `${seededRandom(i * 3 + 2) * 100}%`,
        size: seededRandom(i * 3 + 3) * 8 + 4,
        duration: 3 + seededRandom(i * 3 + 4) * 4,
        delay: seededRandom(i * 3 + 5) * 3,
        xOffset: seededRandom(i * 3 + 6) * 30 - 15,
      })),
    []
  );

  const stars = useMemo<Star[]>(
    () =>
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: `${seededRandom(i * 4 + 100) * 100}%`,
        top: `${seededRandom(i * 4 + 101) * 100}%`,
        duration: 1 + seededRandom(i * 4 + 102) * 2,
        delay: seededRandom(i * 4 + 103) * 2,
      })),
    []
  );

  return { particles, stars };
}
