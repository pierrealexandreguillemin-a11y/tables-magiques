/**
 * useParticlesEngine - tsParticles engine initialization
 * ISO/IEC 25010 - SRP: Engine init only, shared across all particle components
 *
 * Initializes the tsParticles slim engine once per app lifetime.
 * Multiple components can call this hook — init is idempotent.
 * Uses useSyncExternalStore for React Compiler compatibility.
 */

'use client';

import { useSyncExternalStore } from 'react';
import { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

let engineReady = false;
const listeners = new Set<() => void>();

// Start init immediately on module load (not in a hook)
const initPromise = initParticlesEngine(async (engine) => {
  await loadSlim(engine);
}).then(() => {
  engineReady = true;
  listeners.forEach((fn) => fn());
});

// Prevent unhandled rejection if init fails before any subscriber
initPromise.catch(() => {});

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot() {
  return engineReady;
}

function getServerSnapshot() {
  return false;
}

export function useParticlesEngine() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
