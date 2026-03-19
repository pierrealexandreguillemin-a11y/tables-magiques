/**
 * useRestartableAnimation - Re-triggerable CSS animation via class toggle
 * ISO/IEC 25010 - SRP: Animation restart logic only
 */

'use client';

import { useState, useCallback } from 'react';

/**
 * Returns a className (or '') and a trigger function.
 * Each call to trigger() restarts the CSS animation by cycling the class.
 */
export function useRestartableAnimation(animationClass: string) {
  const [active, setActive] = useState(false);

  const trigger = useCallback(() => {
    setActive(false);
    requestAnimationFrame(() => setActive(true));
  }, []);

  const reset = useCallback(() => {
    setActive(false);
  }, []);

  return {
    className: active ? animationClass : '',
    trigger,
    reset,
    active,
  };
}
