/**
 * Tests useParticlesEngine
 * ISO/IEC 29119 - Tests unitaires
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

// Mock tsParticles
vi.mock('@tsparticles/react', () => ({
  initParticlesEngine: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@tsparticles/slim', () => ({
  loadSlim: vi.fn().mockResolvedValue(undefined),
}));

// Import after mocks
import { useParticlesEngine } from '@/hooks/useParticlesEngine';

describe('useParticlesEngine', () => {
  it('returns a boolean', () => {
    const { result } = renderHook(() => useParticlesEngine());
    expect(typeof result.current).toBe('boolean');
  });

  it('returns true after engine initializes', async () => {
    const { result } = renderHook(() => useParticlesEngine());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('is stable across re-renders', async () => {
    const { result, rerender } = renderHook(() => useParticlesEngine());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });

    rerender();
    expect(result.current).toBe(true);
  });
});
