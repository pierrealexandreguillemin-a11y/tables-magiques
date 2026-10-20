/**
 * Tests - Animation Color Palettes
 * Validates color exports exist, are non-empty, and have valid hex format.
 */

import { describe, it, expect } from 'vitest';
import {
  CONFETTI_COLORS,
  FAIRY_STAR_COLORS,
  FAIRY_STAR_GLOW,
  SPARKLE_COLORS,
  THEME_GRADIENTS,
  THEME_GLOWS,
  THEME_OVERLAYS,
  ACCENT_PURPLE,
  ACCENT_ORANGE,
} from '@/lib/animations/colors';

const HEX_REGEX = /^#[0-9a-fA-F]{6}$/;

describe('Animation Color Palettes', () => {
  describe('CONFETTI_COLORS', () => {
    it('has 5 colors', () => {
      expect(CONFETTI_COLORS).toHaveLength(5);
    });

    it('all colors are valid hex', () => {
      CONFETTI_COLORS.forEach((color) => {
        expect(color).toMatch(HEX_REGEX);
      });
    });
  });

  describe('THEME_GRADIENTS', () => {
    it('has princess, unicorn, star, rainbow themes', () => {
      expect(Object.keys(THEME_GRADIENTS)).toEqual(
        expect.arrayContaining(['princess', 'unicorn', 'star', 'rainbow'])
      );
    });

    it('all values contain linear-gradient', () => {
      Object.values(THEME_GRADIENTS).forEach((gradient) => {
        expect(gradient).toContain('linear-gradient');
      });
    });
  });

  describe('THEME_GLOWS', () => {
    it('has same keys as THEME_GRADIENTS', () => {
      expect(Object.keys(THEME_GLOWS).sort()).toEqual(
        Object.keys(THEME_GRADIENTS).sort()
      );
    });

    it('all values contain rgba', () => {
      Object.values(THEME_GLOWS).forEach((glow) => {
        expect(glow).toContain('rgba');
      });
    });
  });

  describe('THEME_OVERLAYS', () => {
    it('has same keys as THEME_GRADIENTS', () => {
      expect(Object.keys(THEME_OVERLAYS).sort()).toEqual(
        Object.keys(THEME_GRADIENTS).sort()
      );
    });
  });

  describe('accent colors', () => {
    it('ACCENT_PURPLE is valid hex', () => {
      expect(ACCENT_PURPLE).toMatch(HEX_REGEX);
    });

    it('ACCENT_ORANGE is valid hex', () => {
      expect(ACCENT_ORANGE).toMatch(HEX_REGEX);
    });
  });
  describe('canvas palettes', () => {
    it('are valid hex colours', () => {
      for (const color of [
        ...FAIRY_STAR_COLORS,
        ...SPARKLE_COLORS,
        FAIRY_STAR_GLOW,
      ]) {
        expect(color).toMatch(HEX_REGEX);
      }
    });
  });
});
