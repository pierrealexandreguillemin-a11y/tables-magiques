/**
 * Async loader for the motion feature bundle: features arrive after hydration,
 * so they stay off the critical path. m.* components render their initial
 * state until then.
 */

import type { FeatureBundle } from 'motion/react';

export const loadMotionFeatures = (): Promise<FeatureBundle> =>
  import('./features').then((mod) => mod.default);
