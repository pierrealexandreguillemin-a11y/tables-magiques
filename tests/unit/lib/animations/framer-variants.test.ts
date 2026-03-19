/**
 * Tests - Framer Motion Variants
 * Validates variant structure for reusable animation presets.
 */

import { describe, it, expect } from 'vitest';
import {
  springTransition,
  bounceTransition,
  smoothTransition,
  cardVariants,
  buttonVariants,
  magicButtonVariants,
  fadeUpVariants,
  fadeDownVariants,
  popVariants,
  slideLeftVariants,
  slideRightVariants,
  staggerContainerVariants,
  staggerItemVariants,
  mascotVariants,
  toastVariants,
  shakeVariants,
  celebrationVariants,
} from '@/lib/animations/framer/variants';

describe('Framer Motion Variants', () => {
  describe('transition presets', () => {
    it('springTransition uses spring type', () => {
      expect(springTransition.type).toBe('spring');
    });

    it('bounceTransition has lower damping than spring', () => {
      expect(bounceTransition.damping).toBeLessThan(springTransition.damping!);
    });

    it('smoothTransition uses tween type', () => {
      expect(smoothTransition.type).toBe('tween');
    });
  });

  describe('cardVariants', () => {
    it('has hidden, visible, hover, tap, exit states', () => {
      expect(cardVariants).toHaveProperty('hidden');
      expect(cardVariants).toHaveProperty('visible');
      expect(cardVariants).toHaveProperty('hover');
      expect(cardVariants).toHaveProperty('tap');
      expect(cardVariants).toHaveProperty('exit');
    });

    it('hover scales up', () => {
      const hover = cardVariants.hover as Record<string, unknown>;
      expect(hover.scale).toBeGreaterThan(1);
    });

    it('tap scales down', () => {
      const tap = cardVariants.tap as Record<string, unknown>;
      expect(tap.scale).toBeLessThan(1);
    });
  });

  describe('buttonVariants', () => {
    it('hover scales up, tap scales down', () => {
      const hover = buttonVariants.hover as Record<string, unknown>;
      const tap = buttonVariants.tap as Record<string, unknown>;
      expect(hover.scale).toBeGreaterThan(1);
      expect(tap.scale).toBeLessThan(1);
    });

    it('disabled has reduced opacity', () => {
      const disabled = buttonVariants.disabled as Record<string, unknown>;
      expect(disabled.opacity).toBe(0.5);
    });
  });

  describe('magicButtonVariants', () => {
    it('has boxShadow in all states', () => {
      const initial = magicButtonVariants.initial as Record<string, unknown>;
      const hover = magicButtonVariants.hover as Record<string, unknown>;
      const tap = magicButtonVariants.tap as Record<string, unknown>;
      expect(initial.boxShadow).toBeDefined();
      expect(hover.boxShadow).toBeDefined();
      expect(tap.boxShadow).toBeDefined();
    });
  });

  describe('directional variants', () => {
    it('fadeUpVariants hidden has positive y offset', () => {
      const hidden = fadeUpVariants.hidden as Record<string, unknown>;
      expect(hidden.y).toBeGreaterThan(0);
    });

    it('fadeDownVariants hidden has negative y offset', () => {
      const hidden = fadeDownVariants.hidden as Record<string, unknown>;
      expect(hidden.y).toBeLessThan(0);
    });

    it('slideLeftVariants hidden has negative x offset', () => {
      const hidden = slideLeftVariants.hidden as Record<string, unknown>;
      expect(hidden.x).toBeLessThan(0);
    });

    it('slideRightVariants hidden has positive x offset', () => {
      const hidden = slideRightVariants.hidden as Record<string, unknown>;
      expect(hidden.x).toBeGreaterThan(0);
    });
  });

  describe('stagger variants', () => {
    it('container has staggerChildren', () => {
      const visible = staggerContainerVariants.visible as Record<
        string,
        unknown
      >;
      const transition = visible.transition as Record<string, unknown>;
      expect(transition.staggerChildren).toBeGreaterThan(0);
    });

    it('item has hidden and visible states', () => {
      expect(staggerItemVariants).toHaveProperty('hidden');
      expect(staggerItemVariants).toHaveProperty('visible');
    });
  });

  describe('special variants', () => {
    it('mascotVariants has idle, hover, tap, happy, sad states', () => {
      expect(mascotVariants).toHaveProperty('idle');
      expect(mascotVariants).toHaveProperty('hover');
      expect(mascotVariants).toHaveProperty('tap');
      expect(mascotVariants).toHaveProperty('happy');
      expect(mascotVariants).toHaveProperty('sad');
    });

    it('shakeVariants shake uses x array for shake effect', () => {
      const shake = shakeVariants.shake as Record<string, unknown>;
      expect(Array.isArray(shake.x)).toBe(true);
    });

    it('celebrationVariants uses rotation', () => {
      const hidden = celebrationVariants.hidden as Record<string, unknown>;
      expect(hidden.rotate).toBeDefined();
    });

    it('popVariants starts at scale 0', () => {
      const hidden = popVariants.hidden as Record<string, unknown>;
      expect(hidden.scale).toBe(0);
    });

    it('toastVariants starts above (negative y)', () => {
      const hidden = toastVariants.hidden as Record<string, unknown>;
      expect(hidden.y).toBeLessThan(0);
    });
  });
});
