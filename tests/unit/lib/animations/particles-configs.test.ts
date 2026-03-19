/**
 * Tests - tsParticles Configs
 * Validates particle configurations have correct structure and performance settings.
 */

import { describe, it, expect } from 'vitest';
import {
  fairyConfig,
  starsConfig,
  confettiConfig,
  snowConfig,
  bubblesConfig,
  sparklesConfig,
  PARTICLE_CONFIGS,
  getParticleConfig,
  listParticlePresets,
} from '@/lib/animations/particles/configs';
import type { ISourceOptions } from '@tsparticles/engine';

const ALL_CONFIGS: Record<string, ISourceOptions> = {
  fairy: fairyConfig,
  stars: starsConfig,
  confetti: confettiConfig,
  snow: snowConfig,
  bubbles: bubblesConfig,
  sparkles: sparklesConfig,
};

describe('tsParticles Configs', () => {
  describe('performance settings', () => {
    Object.entries(ALL_CONFIGS).forEach(([name, config]) => {
      it(`${name} has fullScreen disabled`, () => {
        expect(config.fullScreen).toBe(false);
      });

      it(`${name} has pauseOnBlur enabled`, () => {
        expect(config.pauseOnBlur).toBe(true);
      });

      it(`${name} has pauseOnOutsideViewport enabled`, () => {
        expect(config.pauseOnOutsideViewport).toBe(true);
      });

      it(`${name} has fpsLimit set`, () => {
        expect(config.fpsLimit).toBeGreaterThan(0);
        expect(config.fpsLimit).toBeLessThanOrEqual(60);
      });

      it(`${name} has transparent background`, () => {
        expect(config.background?.color).toEqual({ value: 'transparent' });
      });

      it(`${name} has detectRetina enabled`, () => {
        expect(config.detectRetina).toBe(true);
      });
    });
  });

  describe('confetti specifics', () => {
    it('has gravity enabled', () => {
      expect(confettiConfig.particles?.move?.gravity?.enable).toBe(true);
    });

    it('has emitters configured', () => {
      expect(confettiConfig.emitters).toBeDefined();
    });

    it('particles have limited life', () => {
      const life = confettiConfig.particles?.life as { count?: number };
      expect(life?.count).toBe(1);
    });
  });

  describe('PARTICLE_CONFIGS registry', () => {
    it('contains all 6 presets', () => {
      expect(Object.keys(PARTICLE_CONFIGS)).toHaveLength(6);
    });

    it('maps to correct configs', () => {
      expect(PARTICLE_CONFIGS.fairy).toBe(fairyConfig);
      expect(PARTICLE_CONFIGS.stars).toBe(starsConfig);
      expect(PARTICLE_CONFIGS.confetti).toBe(confettiConfig);
    });
  });

  describe('getParticleConfig', () => {
    it('returns correct config for each preset', () => {
      expect(getParticleConfig('fairy')).toBe(fairyConfig);
      expect(getParticleConfig('stars')).toBe(starsConfig);
      expect(getParticleConfig('confetti')).toBe(confettiConfig);
      expect(getParticleConfig('snow')).toBe(snowConfig);
      expect(getParticleConfig('bubbles')).toBe(bubblesConfig);
      expect(getParticleConfig('sparkles')).toBe(sparklesConfig);
    });
  });

  describe('listParticlePresets', () => {
    it('returns all 6 presets', () => {
      const presets = listParticlePresets();
      expect(presets).toHaveLength(6);
    });

    it('includes all expected presets', () => {
      const presets = listParticlePresets();
      expect(presets).toEqual(
        expect.arrayContaining([
          'fairy',
          'stars',
          'confetti',
          'snow',
          'bubbles',
          'sparkles',
        ])
      );
    });

    it('returns a new array each call (no mutation risk)', () => {
      const a = listParticlePresets();
      const b = listParticlePresets();
      expect(a).not.toBe(b);
      expect(a).toEqual(b);
    });
  });
});
