/**
 * Vitest Setup - Tables Magiques
 * ISO/IEC 29119 - Test Infrastructure
 *
 * MSW = Mock TRANSPORT, pas mock données
 * Fixtures = DONNÉES RÉELLES
 */

import '@testing-library/jest-dom';
import { vi, beforeAll, afterAll, afterEach } from 'vitest';
import { server } from './mocks/server';

// ============================================================================
// MSW Server Setup - Mock réseau, pas données
// ============================================================================

beforeAll(() => {
  // Start MSW server before all tests
  server.listen({ onUnhandledRequest: 'warn' });
});

afterEach(() => {
  // Reset handlers after each test (removes runtime handlers)
  server.resetHandlers();
});

afterAll(() => {
  // Clean up after all tests
  server.close();
});

// ============================================================================
// Browser API Mocks (jsdom limitations)
// ============================================================================

// Mock pour window.matchMedia (prefers-reduced-motion, etc.)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock pour ResizeObserver (tsParticles, etc.)
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock pour IntersectionObserver (lazy loading, etc.)
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}));

// Mock pour HTMLCanvasElement (lottie-web)
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  fillStyle: '',
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn().mockReturnValue({ data: [] }),
  putImageData: vi.fn(),
  createImageData: vi.fn().mockReturnValue({ data: [] }),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  measureText: vi.fn().mockReturnValue({ width: 0 }),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
});

// Mock lottie-web pour éviter les erreurs canvas
vi.mock('lottie-web', () => ({
  default: {
    loadAnimation: vi.fn().mockReturnValue({
      destroy: vi.fn(),
      play: vi.fn(),
      pause: vi.fn(),
      stop: vi.fn(),
      setSpeed: vi.fn(),
      goToAndPlay: vi.fn(),
      goToAndStop: vi.fn(),
      setDirection: vi.fn(),
      getDuration: vi.fn().mockReturnValue(1),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
    setQuality: vi.fn(),
  },
}));

// ============================================================================
// Animation Library Mocks (UNIT tests only - integration tests use real libs)
// ============================================================================

// GSAP Mock - pour tests unitaires rapides
// Les tests d'intégration peuvent importer le vrai GSAP
const mockGsap = {
  to: vi.fn().mockReturnValue({ kill: vi.fn() }),
  from: vi.fn().mockReturnValue({ kill: vi.fn() }),
  fromTo: vi.fn().mockReturnValue({ kill: vi.fn() }),
  set: vi.fn(),
  timeline: vi.fn(() => ({
    to: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    fromTo: vi.fn().mockReturnThis(),
    add: vi.fn().mockReturnThis(),
    play: vi.fn().mockReturnThis(),
    pause: vi.fn().mockReturnThis(),
    kill: vi.fn(),
  })),
  registerPlugin: vi.fn(),
  defaults: vi.fn(),
  ticker: {
    lagSmoothing: vi.fn(),
    fps: vi.fn(),
  },
  context: vi.fn(() => ({
    revert: vi.fn(),
    add: vi.fn(),
  })),
};

vi.mock('gsap', () => ({
  gsap: mockGsap,
  default: mockGsap,
}));

// useGSAP Mock - simule le hook React
vi.mock('@gsap/react', () => ({
  useGSAP: vi.fn((callback?: () => void) => {
    // Exécute le callback immédiatement en test
    if (typeof callback === 'function') {
      try {
        callback();
      } catch {
        // Ignore errors in test environment
      }
    }
    return {
      context: { revert: vi.fn() },
      contextSafe: vi.fn((fn: unknown) => fn),
    };
  }),
}));

// ============================================================================
// Console Warnings Suppression (dev only)
// ============================================================================

// Suppress React 18 StrictMode warnings in tests
const originalError = console.error;
console.error = (...args: unknown[]) => {
  const message = args[0];
  if (
    typeof message === 'string' &&
    (message.includes('ReactDOM.render is no longer supported') ||
      message.includes('Warning: An update to') ||
      message.includes('act(...)'))
  ) {
    return;
  }
  originalError.apply(console, args);
};
