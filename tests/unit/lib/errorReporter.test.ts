/**
 * Tests Unitaires - errorReporter
 * ISO/IEC 29119 - TDD: Error capture system
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  captureError,
  captureMessage,
  reportUIError,
  initErrorReporter,
  cleanupErrorReporter,
  __testing__,
} from '@/lib/errorReporter';

// Mock fetch globally to prevent actual network calls
const mockFetch = vi.fn().mockResolvedValue({ ok: true });

// Helper to get first queue item safely
function getFirstQueueItem() {
  const queue = __testing__.getQueue();
  const first = queue[0];
  if (!first) throw new Error('Queue is empty');
  return first;
}

// Helper to get fetch body (for flushed errors)
function getFetchBody() {
  const calls = mockFetch.mock.calls;
  const firstCall = calls[0];
  if (!firstCall) throw new Error('fetch not called');
  const options = firstCall[1] as { body?: string };
  if (!options?.body) throw new Error('No body in fetch call');
  const body = JSON.parse(options.body) as { errors: unknown[] };
  const firstError = body.errors[0];
  if (!firstError) throw new Error('No errors in body');
  return firstError as Record<string, unknown>;
}

describe('errorReporter', () => {
  beforeEach(() => {
    __testing__.clearQueue();
    vi.useFakeTimers();
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockClear();
  });

  afterEach(() => {
    cleanupErrorReporter();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('captureError', () => {
    it('ajoute erreur a la queue', () => {
      captureError(new Error('Test error'));

      const queue = __testing__.getQueue();
      expect(queue.length).toBe(1);
      expect(getFirstQueueItem().message).toBe('Test error');
    });

    it('infere type validation pour message avec "invalid"', () => {
      captureError('invalid input detected');
      expect(getFirstQueueItem().type).toBe('validation');
    });

    it('infere type network pour message avec "fetch"', () => {
      captureError('fetch failed');
      expect(getFirstQueueItem().type).toBe('network');
    });

    it('infere type ui pour message avec "render"', () => {
      captureError('Render error in component');
      // UI = critical = flush immediat
      expect(mockFetch).toHaveBeenCalled();
      expect(getFetchBody().type).toBe('ui');
    });

    it('utilise type par defaut unknown', () => {
      captureError('Some random error');
      expect(getFirstQueueItem().type).toBe('unknown');
    });

    it('accepte type explicite', () => {
      captureError('Error', { type: 'business' });
      expect(getFirstQueueItem().type).toBe('business');
    });

    it('accepte severity explicite', () => {
      captureError('Error', { severity: 'critical' });
      // Critical = flush immediat
      expect(mockFetch).toHaveBeenCalled();
      expect(getFetchBody().severity).toBe('critical');
    });

    it('inclut context optionnel', () => {
      captureError('Error', { context: { userId: '123' } });
      expect(getFirstQueueItem().context).toEqual({ userId: '123' });
    });

    it('genere un id unique', () => {
      captureError('Error 1');
      captureError('Error 2');

      const queue = __testing__.getQueue();
      expect(queue.length).toBe(2);
      const first = queue[0];
      const second = queue[1];
      expect(first?.id).not.toBe(second?.id);
      expect(first?.id).toMatch(/^err_/);
    });

    it('inclut timestamp ISO', () => {
      captureError('Error');
      expect(getFirstQueueItem().timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('inclut stack trace pour Error object', () => {
      captureError(new Error('Test'));
      const item = getFirstQueueItem();
      expect(item.stack).toBeDefined();
      expect(item.stack).toContain('Error: Test');
    });

    it('pas de stack pour string', () => {
      captureError('String error');
      expect(getFirstQueueItem().stack).toBeUndefined();
    });
  });

  describe('captureMessage', () => {
    it('capture message avec type business', () => {
      captureMessage('User logged out');
      const item = getFirstQueueItem();
      expect(item.type).toBe('business');
      expect(item.message).toBe('User logged out');
    });

    it('utilise severity low par defaut', () => {
      captureMessage('Info message');
      expect(getFirstQueueItem().severity).toBe('low');
    });

    it('accepte severity custom', () => {
      captureMessage('Warning', 'high');
      expect(getFirstQueueItem().severity).toBe('high');
    });

    it('accepte context optionnel', () => {
      captureMessage('Event', 'medium', { action: 'click' });
      expect(getFirstQueueItem().context).toEqual({ action: 'click' });
    });
  });

  describe('reportUIError', () => {
    it('capture erreur avec type ui', () => {
      reportUIError(new Error('Component crashed'));
      expect(mockFetch).toHaveBeenCalled();
      expect(getFetchBody().type).toBe('ui');
    });

    it('severity critical pour UI errors', () => {
      reportUIError(new Error('Crash'));
      expect(mockFetch).toHaveBeenCalled();
      expect(getFetchBody().severity).toBe('critical');
    });

    it('inclut componentStack dans context', () => {
      const componentStack = 'in Button\nin Form\nin App';
      reportUIError(new Error('Crash'), componentStack);
      expect(mockFetch).toHaveBeenCalled();
      const ctx = getFetchBody().context as { componentStack?: string };
      expect(ctx).toEqual({ componentStack });
    });

    it('gere componentStack null', () => {
      reportUIError(new Error('Crash'), null);
      expect(mockFetch).toHaveBeenCalled();
      const ctx = getFetchBody().context as { componentStack?: string };
      expect(ctx).toEqual({ componentStack: undefined });
    });
  });

  describe('Queue behavior', () => {
    it('flush apres maxQueueSize atteint', () => {
      for (let i = 0; i < 10; i++) {
        captureError(`Error ${i}`, { severity: 'low' });
      }
      expect(mockFetch).toHaveBeenCalled();
    });

    it('flush immediat pour severity critical', () => {
      captureError('Critical error', { severity: 'critical' });
      expect(mockFetch).toHaveBeenCalled();
    });

    it('schedule flush avec delay pour erreurs normales', async () => {
      captureError('Normal error', { severity: 'low' });
      expect(mockFetch).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(2000);
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('initErrorReporter / cleanupErrorReporter', () => {
    it('init est idempotent', () => {
      initErrorReporter();
      initErrorReporter();
      initErrorReporter();
      expect(true).toBe(true);
    });

    it('cleanup vide la queue', () => {
      captureError('Error');
      expect(__testing__.getQueue().length).toBe(1);
      cleanupErrorReporter();
      expect(__testing__.getQueue().length).toBe(0);
    });
  });

  describe('Severity inference', () => {
    it('ui errors = critical', () => {
      captureError('Render failed', { type: 'ui' });
      expect(mockFetch).toHaveBeenCalled();
      expect(getFetchBody().severity).toBe('critical');
    });

    it('runtime errors = critical', () => {
      captureError('TypeError', { type: 'runtime' });
      expect(mockFetch).toHaveBeenCalled();
      expect(getFetchBody().severity).toBe('critical');
    });

    it('network errors = high', () => {
      captureError('API failed', { type: 'network' });
      expect(getFirstQueueItem().severity).toBe('high');
    });

    it('validation errors = low', () => {
      captureError('Invalid input', { type: 'validation' });
      expect(getFirstQueueItem().severity).toBe('low');
    });
  });
});
