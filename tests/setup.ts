/**
 * Vitest Setup - Tables Magiques
 * ISO/IEC 29119 - Test Infrastructure (Unit Tests)
 *
 * Tests unitaires = mocks naturels (fonctions isolées)
 * Tests E2E = données réelles (Playwright contre production)
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

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
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

// Mock pour IntersectionObserver (lazy loading, etc.)
class MockIntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn().mockReturnValue([]);
}
global.IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver;

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
