/**
 * useParticlesEngine - tsParticles engine initialization
 * ISO/IEC 25010 - SRP: Engine init only, shared across all particle components
 *
 * Lazy: engine initializes on first hook call, not on module import.
 * Idempotent: multiple components can call this hook safely.
 * Uses useSyncExternalStore for React Compiler compatibility.
 */

'use client';

import { useSyncExternalStore } from 'react';
import { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

let engineReady = false;
let initStarted = false;
const listeners = new Set<() => void>();

function ensureInit() {
  if (initStarted) return;
  initStarted = true;
  initParticlesEngine(async (engine) => {
    await loadSlim(engine);
  }).then(() => {
    engineReady = true;
    listeners.forEach((fn) => fn());
  });
}

function subscribe(callback: () => void) {
  ensureInit();
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
