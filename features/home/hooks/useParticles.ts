/**
 * useParticles Hook
 * ISO/IEC 25010 - SRP: Particle generation only
 *
 * Client-only: Math.sin produces different float precision between
 * Node.js (SSR) and browser, causing hydration mismatches.
 * Particles are decorative — no SEO/UX value in SSR.
 */

'use client';

import { useMemo, useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};
const returnTrue = () => true;
const returnFalse = () => false;

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

function generateParticles(): Particle[] {
  return Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${seededRandom(i * 3 + 1) * 100}%`,
    top: `${seededRandom(i * 3 + 2) * 100}%`,
    size: seededRandom(i * 3 + 3) * 8 + 4,
    duration: 3 + seededRandom(i * 3 + 4) * 4,
    delay: seededRandom(i * 3 + 5) * 3,
    xOffset: seededRandom(i * 3 + 6) * 30 - 15,
  }));
}

function generateStars(): Star[] {
  return Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: `${seededRandom(i * 4 + 100) * 100}%`,
    top: `${seededRandom(i * 4 + 101) * 100}%`,
    duration: 1 + seededRandom(i * 4 + 102) * 2,
    delay: seededRandom(i * 4 + 103) * 2,
  }));
}

const EMPTY_PARTICLES: Particle[] = [];
const EMPTY_STARS: Star[] = [];

export function useParticles() {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    returnTrue,
    returnFalse
  );

  const particles = useMemo(
    () => (isClient ? generateParticles() : EMPTY_PARTICLES),
    [isClient]
  );

  const stars = useMemo(
    () => (isClient ? generateStars() : EMPTY_STARS),
    [isClient]
  );

  return { particles, stars };
}
