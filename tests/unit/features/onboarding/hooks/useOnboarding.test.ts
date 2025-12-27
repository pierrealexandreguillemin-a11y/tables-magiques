/**
 * Tests unitaires useOnboarding
 * ISO 29119 - Tests contre production
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useOnboarding } from '@/features/onboarding/hooks/useOnboarding';
import { MAIN_TOUR_STEPS } from '@/types/onboarding';

// =============================================================================
// TESTS
// =============================================================================

describe('useOnboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('starts with isActive=false', () => {
      const { result } = renderHook(() => useOnboarding());

      expect(result.current.state.isActive).toBe(false);
    });

    it('starts with currentStep=0', () => {
      const { result } = renderHook(() => useOnboarding());

      expect(result.current.state.currentStep).toBe(0);
    });

    it('starts with isCompleted=false', () => {
      const { result } = renderHook(() => useOnboarding());

      expect(result.current.state.isCompleted).toBe(false);
    });

    it('uses MAIN_TOUR_STEPS by default', () => {
      const { result } = renderHook(() => useOnboarding());

      expect(result.current.steps).toBe(MAIN_TOUR_STEPS);
    });

    it('accepts custom steps', () => {
      const customSteps = [
        { id: 'test', target: '.test', title: 'Test', content: 'Content' },
      ];
      const { result } = renderHook(() =>
        useOnboarding({ steps: customSteps })
      );

      expect(result.current.steps).toBe(customSteps);
    });

    it('returns null currentStep when not active', () => {
      const { result } = renderHook(() => useOnboarding());

      expect(result.current.currentStep).toBeNull();
    });
  });

  describe('start()', () => {
    it('sets isActive to true', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.start();
      });

      expect(result.current.state.isActive).toBe(true);
    });

    it('resets currentStep to 0', () => {
      const { result } = renderHook(() => useOnboarding());

      // Advance to step 2 then restart
      act(() => {
        result.current.start();
        result.current.next();
        result.current.next();
      });
      expect(result.current.state.currentStep).toBe(2);

      act(() => {
        result.current.start();
      });
      expect(result.current.state.currentStep).toBe(0);
    });

    it('returns correct currentStep object when active', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.start();
      });

      expect(result.current.currentStep).toEqual(MAIN_TOUR_STEPS[0]);
    });
  });

  describe('next()', () => {
    it('increments currentStep', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.start();
        result.current.next();
      });

      expect(result.current.state.currentStep).toBe(1);
    });

    it('returns next step object', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.start();
        result.current.next();
      });

      expect(result.current.currentStep).toEqual(MAIN_TOUR_STEPS[1]);
    });

    it('sets isCompleted=true on last step', () => {
      const customSteps = [
        { id: 'step1', target: '.s1', title: 'S1', content: 'C1' },
        { id: 'step2', target: '.s2', title: 'S2', content: 'C2' },
      ];
      const { result } = renderHook(() =>
        useOnboarding({ steps: customSteps })
      );

      act(() => {
        result.current.start();
        result.current.next();
        result.current.next(); // Go past last step
      });

      expect(result.current.state.isCompleted).toBe(true);
      expect(result.current.state.isActive).toBe(false);
    });

    it('calls onComplete callback on completion', () => {
      const onComplete = vi.fn();
      const customSteps = [
        { id: 'step1', target: '.s1', title: 'S1', content: 'C1' },
      ];
      const { result } = renderHook(() =>
        useOnboarding({ steps: customSteps, onComplete })
      );

      act(() => {
        result.current.start();
        result.current.next();
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('prev()', () => {
    it('decrements currentStep', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.start();
        result.current.next();
        result.current.next();
        result.current.prev();
      });

      expect(result.current.state.currentStep).toBe(1);
    });

    it('does not go below 0', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.start();
        result.current.prev();
        result.current.prev();
      });

      expect(result.current.state.currentStep).toBe(0);
    });
  });

  describe('skip()', () => {
    it('sets isActive to false', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.start();
        result.current.skip();
      });

      expect(result.current.state.isActive).toBe(false);
    });

    it('sets isCompleted to true', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.start();
        result.current.skip();
      });

      expect(result.current.state.isCompleted).toBe(true);
    });

    it('calls onSkip callback', () => {
      const onSkip = vi.fn();
      const { result } = renderHook(() => useOnboarding({ onSkip }));

      act(() => {
        result.current.start();
        result.current.skip();
      });

      expect(onSkip).toHaveBeenCalledTimes(1);
    });
  });

  describe('complete()', () => {
    it('sets isCompleted to true', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.start();
        result.current.complete();
      });

      expect(result.current.state.isCompleted).toBe(true);
    });

    it('calls onComplete callback', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() => useOnboarding({ onComplete }));

      act(() => {
        result.current.start();
        result.current.complete();
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('reset()', () => {
    it('resets all state to defaults', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.start();
        result.current.next();
        result.current.next();
        result.current.reset();
      });

      expect(result.current.state.isActive).toBe(false);
      expect(result.current.state.currentStep).toBe(0);
      expect(result.current.state.isCompleted).toBe(false);
    });
  });

  describe('goToStep()', () => {
    it('goes to specific step', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.start();
        result.current.goToStep(3);
      });

      expect(result.current.state.currentStep).toBe(3);
    });

    it('ignores invalid step indices (negative)', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.start();
        result.current.goToStep(-1);
      });

      expect(result.current.state.currentStep).toBe(0);
    });

    it('ignores invalid step indices (too large)', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.start();
        result.current.goToStep(100);
      });

      expect(result.current.state.currentStep).toBe(0);
    });
  });

  describe('pause() and resume()', () => {
    it('pause() sets isPaused to true', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.start();
        result.current.pause();
      });

      expect(result.current.state.isPaused).toBe(true);
    });

    it('resume() sets isPaused to false', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.start();
        result.current.pause();
        result.current.resume();
      });

      expect(result.current.state.isPaused).toBe(false);
    });
  });
});
