/**
 * GSAP Plugin Registration - Tables Magiques
 * ISO/IEC 25010 - Registration unique des plugins
 *
 * Import ce fichier UNE SEULE FOIS au niveau app
 */

import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

// Register useGSAP hook
gsap.registerPlugin(useGSAP);

// Export gsap configured
export { gsap, useGSAP };

/**
 * Configuration globale GSAP pour enfants
 * - Durees plus longues (perception)
 * - Easing doux
 */
gsap.defaults({
  ease: 'power2.out',
  duration: 0.5,
});

/**
 * Ticker config pour performance
 */
gsap.ticker.lagSmoothing(500, 33);

export default gsap;
