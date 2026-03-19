/**
 * Tests - Lottie Animations Registry
 * Validates animation registry helpers and data structure.
 */

import { describe, it, expect } from 'vitest';
import {
  getAnimation,
  getAnimationData,
  getAnimationFallback,
  listAnimations,
} from '@/lib/animations/lottie/animations';

describe('Lottie Animations Registry', () => {
  describe('listAnimations', () => {
    it('returns all 11 animation IDs', () => {
      const ids = listAnimations();
      expect(ids).toHaveLength(11);
    });

    it('includes expected animations', () => {
      const ids = listAnimations();
      expect(ids).toContain('success');
      expect(ids).toContain('error');
      expect(ids).toContain('crown');
      expect(ids).toContain('celebration');
      expect(ids).toContain('unicorn');
    });

    it('returns new array each call (no mutation risk)', () => {
      const a = listAnimations();
      const b = listAnimations();
      expect(a).not.toBe(b);
      expect(a).toEqual(b);
    });
  });

  describe('getAnimation', () => {
    it('returns animation data with required fields', () => {
      const anim = getAnimation('success');
      expect(anim).toHaveProperty('data');
      expect(anim).toHaveProperty('loop');
      expect(anim).toHaveProperty('autoplay');
      expect(anim).toHaveProperty('fallbackEmoji');
      expect(anim).toHaveProperty('description');
    });

    it('returns correct data for each animation', () => {
      const ids = listAnimations();
      ids.forEach((id) => {
        const anim = getAnimation(id);
        expect(anim.fallbackEmoji).toBeTruthy();
        expect(anim.description).toBeTruthy();
      });
    });
  });

  describe('getAnimationData', () => {
    it('returns an object for each animation', () => {
      const ids = listAnimations();
      ids.forEach((id) => {
        const data = getAnimationData(id);
        expect(typeof data).toBe('object');
        expect(data).not.toBeNull();
      });
    });
  });

  describe('getAnimationFallback', () => {
    it('returns emoji string for each animation', () => {
      const ids = listAnimations();
      ids.forEach((id) => {
        const emoji = getAnimationFallback(id);
        expect(typeof emoji).toBe('string');
        expect(emoji.length).toBeGreaterThan(0);
      });
    });

    it('returns specific emojis for known animations', () => {
      expect(getAnimationFallback('success')).toBeTruthy();
      expect(getAnimationFallback('error')).toBeTruthy();
      expect(getAnimationFallback('crown')).toBeTruthy();
    });
  });
});
