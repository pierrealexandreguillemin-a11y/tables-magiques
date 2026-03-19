/**
 * Tests - Framer Motion Page Transitions
 * Validates transition configs and route variant mapping.
 */

import { describe, it, expect } from 'vitest';
import {
  defaultPageTransition,
  quickPageTransition,
  springPageTransition,
  pageFadeVariants,
  pageSlideUpVariants,
  pageSlideDownVariants,
  pageScaleVariants,
  pageMagicVariants,
  routeVariants,
  getRouteVariants,
  layoutTransition,
  reducedMotionVariants,
} from '@/lib/animations/framer/transitions';

describe('Page Transitions', () => {
  describe('transition presets', () => {
    it('defaultPageTransition has duration 0.4', () => {
      expect(defaultPageTransition.duration).toBe(0.4);
    });

    it('quickPageTransition is faster than default', () => {
      expect(quickPageTransition.duration).toBeLessThan(
        defaultPageTransition.duration!
      );
    });

    it('springPageTransition uses spring type', () => {
      expect(springPageTransition.type).toBe('spring');
    });

    it('layoutTransition uses spring type', () => {
      expect(layoutTransition.type).toBe('spring');
    });
  });

  describe('page variants structure', () => {
    const allVariants = [
      { name: 'pageFadeVariants', variants: pageFadeVariants },
      { name: 'pageSlideUpVariants', variants: pageSlideUpVariants },
      { name: 'pageSlideDownVariants', variants: pageSlideDownVariants },
      { name: 'pageScaleVariants', variants: pageScaleVariants },
      { name: 'pageMagicVariants', variants: pageMagicVariants },
    ];

    allVariants.forEach(({ name, variants }) => {
      it(`${name} has initial, animate, and exit states`, () => {
        expect(variants).toHaveProperty('initial');
        expect(variants).toHaveProperty('animate');
        expect(variants).toHaveProperty('exit');
      });

      it(`${name} initial starts with opacity 0`, () => {
        expect((variants.initial as Record<string, unknown>).opacity).toBe(0);
      });

      it(`${name} animate ends with opacity 1`, () => {
        expect((variants.animate as Record<string, unknown>).opacity).toBe(1);
      });
    });
  });

  describe('pageMagicVariants', () => {
    it('uses blur effect', () => {
      expect(
        (pageMagicVariants.initial as Record<string, unknown>).filter
      ).toContain('blur');
    });

    it('clears blur on animate', () => {
      expect(
        (pageMagicVariants.animate as Record<string, unknown>).filter
      ).toBe('blur(0px)');
    });
  });

  describe('routeVariants', () => {
    it('maps / to pageMagicVariants', () => {
      expect(routeVariants['/']).toBe(pageMagicVariants);
    });

    it('maps /practice to pageSlideUpVariants', () => {
      expect(routeVariants['/practice']).toBe(pageSlideUpVariants);
    });

    it('maps /challenge to pageScaleVariants', () => {
      expect(routeVariants['/challenge']).toBe(pageScaleVariants);
    });

    it('maps /profile to pageFadeVariants', () => {
      expect(routeVariants['/profile']).toBe(pageFadeVariants);
    });

    it('has default fallback', () => {
      expect(routeVariants.default).toBe(pageSlideUpVariants);
    });
  });

  describe('getRouteVariants', () => {
    it('returns correct variants for known routes', () => {
      expect(getRouteVariants('/')).toBe(pageMagicVariants);
      expect(getRouteVariants('/practice')).toBe(pageSlideUpVariants);
    });

    it('returns pageSlideUpVariants for unknown routes', () => {
      expect(getRouteVariants('/unknown')).toBe(pageSlideUpVariants);
      expect(getRouteVariants('/foo/bar')).toBe(pageSlideUpVariants);
    });
  });

  describe('reducedMotionVariants', () => {
    it('has only opacity transitions (no transform)', () => {
      const initial = reducedMotionVariants.initial as Record<string, unknown>;
      const animate = reducedMotionVariants.animate as Record<string, unknown>;
      const exit = reducedMotionVariants.exit as Record<string, unknown>;

      expect(Object.keys(initial)).toEqual(['opacity']);
      expect(Object.keys(animate)).toEqual(['opacity']);
      expect(Object.keys(exit)).toEqual(['opacity']);
    });
  });
});
