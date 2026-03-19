/**
 * Tests useRestartableAnimation
 * ISO/IEC 29119 - Tests unitaires
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRestartableAnimation } from '@/hooks/useRestartableAnimation';

describe('useRestartableAnimation', () => {
  it('returns empty className initially', () => {
    const { result } = renderHook(() => useRestartableAnimation('my-anim'));
    expect(result.current.className).toBe('');
    expect(result.current.active).toBe(false);
  });

  it('returns animation className after trigger', async () => {
    const { result } = renderHook(() => useRestartableAnimation('my-anim'));

    await act(async () => {
      result.current.trigger();
      // rAF fires in jsdom synchronously after act
      await new Promise((r) => requestAnimationFrame(r));
    });

    expect(result.current.className).toBe('my-anim');
    expect(result.current.active).toBe(true);
  });

  it('resets className after reset()', async () => {
    const { result } = renderHook(() => useRestartableAnimation('my-anim'));

    await act(async () => {
      result.current.trigger();
      await new Promise((r) => requestAnimationFrame(r));
    });

    expect(result.current.active).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.className).toBe('');
    expect(result.current.active).toBe(false);
  });

  it('trigger and reset are stable references', () => {
    const { result, rerender } = renderHook(() =>
      useRestartableAnimation('my-anim')
    );

    const trigger1 = result.current.trigger;
    const reset1 = result.current.reset;

    rerender();

    expect(result.current.trigger).toBe(trigger1);
    expect(result.current.reset).toBe(reset1);
  });
});
