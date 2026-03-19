/**
 * Tests - Animation Color Palettes
 * Validates color exports exist, are non-empty, and have valid hex format.
 */

import { describe, it, expect } from 'vitest';
import {
  FAIRY_COLORS,
  CONFETTI_COLORS,
  FIREWORKS_COLORS,
  STAR_COLORS,
  THEME_GRADIENTS,
  THEME_GLOWS,
  THEME_OVERLAYS,
  ACCENT_PURPLE,
  ACCENT_ORANGE,
} from '@/lib/animations/colors';

const HEX_REGEX = /^#[0-9a-fA-F]{6}$/;

describe('Animation Color Palettes', () => {
  describe('FAIRY_COLORS', () => {
    it('has 5 colors', () => {
      expect(FAIRY_COLORS).toHaveLength(5);
    });

    it('all colors are valid hex', () => {
      FAIRY_COLORS.forEach((color) => {
        expect(color).toMatch(HEX_REGEX);
      });
    });
  });

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

  describe('FIREWORKS_COLORS', () => {
    it('has 5 colors', () => {
      expect(FIREWORKS_COLORS).toHaveLength(5);
    });

    it('all colors are valid hex', () => {
      FIREWORKS_COLORS.forEach((color) => {
        expect(color).toMatch(HEX_REGEX);
      });
    });
  });

  describe('STAR_COLORS', () => {
    it('has 3 colors', () => {
      expect(STAR_COLORS).toHaveLength(3);
    });

    it('includes gold', () => {
      expect(STAR_COLORS).toContain('#ffd700');
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
});
