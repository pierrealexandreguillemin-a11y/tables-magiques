/**
 * useViewTransition - View Transitions API Hook
 * ISO/IEC 25010 - Native browser transitions for navigation
 *
 * Provides smooth page transitions using the View Transitions API (Chrome 111+)
 * Falls back gracefully on unsupported browsers
 *
 * @see https://developer.chrome.com/docs/web-platform/view-transitions/
 */

'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Check if View Transitions API is supported
 */
function supportsViewTransitions(): boolean {
  return (
    typeof document !== 'undefined' &&
    'startViewTransition' in document &&
    typeof (document as Document & { startViewTransition: unknown })
      .startViewTransition === 'function'
  );
}

/**
 * Type for View Transition result
 */
interface ViewTransitionResult {
  ready: Promise<void>;
  finished: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition: () => void;
}

/**
 * Start View Transition function type
 */
type StartViewTransition = (
  callback: () => void | Promise<void>
) => ViewTransitionResult;

export interface UseViewTransitionReturn {
  /** Navigate with View Transition if supported */
  navigate: (url: string) => void;
  /** Push with View Transition if supported */
  push: (url: string) => void;
  /** Replace with View Transition if supported */
  replace: (url: string) => void;
  /** Whether View Transitions API is supported */
  isSupported: boolean;
}

/**
 * Hook for View Transitions API navigation
 *
 * @example
 * ```tsx
 * const { navigate, isSupported } = useViewTransition();
 *
 * <button onClick={() => navigate('/practice')}>
 *   Commencer
 * </button>
 * ```
 */
export function useViewTransition(): UseViewTransitionReturn {
  const router = useRouter();
  const isSupported = supportsViewTransitions();

  /**
   * Navigate with View Transition
   */
  const navigate = useCallback(
    (url: string) => {
      if (!isSupported) {
        router.push(url);
        return;
      }

      const startViewTransition = (
        document as Document & { startViewTransition: StartViewTransition }
      ).startViewTransition;
      startViewTransition(() => {
        router.push(url);
      });
    },
    [router, isSupported]
  );

  /**
   * Push with View Transition
   */
  const push = useCallback(
    (url: string) => {
      if (!isSupported) {
        router.push(url);
        return;
      }

      const startViewTransition = (
        document as Document & { startViewTransition: StartViewTransition }
      ).startViewTransition;
      startViewTransition(() => {
        router.push(url);
      });
    },
    [router, isSupported]
  );

  /**
   * Replace with View Transition
   */
  const replace = useCallback(
    (url: string) => {
      if (!isSupported) {
        router.replace(url);
        return;
      }

      const startViewTransition = (
        document as Document & { startViewTransition: StartViewTransition }
      ).startViewTransition;
      startViewTransition(() => {
        router.replace(url);
      });
    },
    [router, isSupported]
  );

  return {
    navigate,
    push,
    replace,
    isSupported,
  };
}

export default useViewTransition;
