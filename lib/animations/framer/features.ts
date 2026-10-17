/**
 * Motion feature bundle, loaded asynchronously by LazyMotion (app/providers.tsx).
 * domMax (not domAnimation): Toast uses the `layout` prop, which domAnimation lacks.
 * https://motion.dev/docs/react-lazy-motion
 */

import { domMax } from 'motion/react';

export default domMax;
