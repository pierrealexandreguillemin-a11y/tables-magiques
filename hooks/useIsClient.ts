/**
 * useIsClient - false on the server AND during hydration, true afterwards
 *
 * For values that only exist in the browser (window APIs, localStorage...): reading them in a
 * useState initializer makes the first client render differ from the server HTML (hydration
 * mismatch, React #418). Gate them on this instead.
 */

'use client';

import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};
const returnTrue = () => true;
const returnFalse = () => false;

export function useIsClient(): boolean {
  return useSyncExternalStore(emptySubscribe, returnTrue, returnFalse);
}
