/**
 * tsParticles Configs - Tables Magiques
 * ISO/IEC 25010 - Configurations particules
 *
 * A utiliser avec @tsparticles/react
 */

import type { ISourceOptions } from '@tsparticles/engine';

// =============================================================================
// TYPES
// =============================================================================

export type ParticlePreset =
  | 'fairy'
  | 'stars'
  | 'confetti'
  | 'snow'
  | 'bubbles'
  | 'sparkles';

// =============================================================================
// COULEURS THEME
// =============================================================================

const FAIRY_COLORS = ['#ff69b4', '#ba55d3', '#ffd700', '#87ceeb', '#dda0dd'];
const CONFETTI_COLORS = ['#ff69b4', '#ffd700', '#00ff00', '#00ffff', '#ff6b6b'];
const STAR_COLORS = ['#ffd700', '#ffffff', '#fffacd'];

// =============================================================================
// CONFIG FAIRY BACKGROUND
// =============================================================================

export const fairyConfig: ISourceOptions = {
  fullScreen: false,
  background: {
    color: {
      value: 'transparent',
    },
  },
  fpsLimit: 60,
  particles: {
    color: {
      value: FAIRY_COLORS,
    },
    links: {
      enable: false,
    },
    move: {
      enable: true,
      speed: 0.5,
      direction: 'none',
      random: true,
      straight: false,
      outModes: {
        default: 'out',
      },
    },
    number: {
      density: {
        enable: true,
        width: 800,
        height: 800,
      },
      value: 40,
    },
    opacity: {
      value: { min: 0.3, max: 0.8 },
      animation: {
        enable: true,
        speed: 0.5,
        sync: false,
      },
    },
    shape: {
      type: 'circle',
    },
    size: {
      value: { min: 2, max: 6 },
      animation: {
        enable: true,
        speed: 2,
        sync: false,
      },
    },
  },
  detectRetina: true,
};

// =============================================================================
// CONFIG STARS
// =============================================================================

export const starsConfig: ISourceOptions = {
  fullScreen: false,
  background: {
    color: {
      value: 'transparent',
    },
  },
  fpsLimit: 30,
  particles: {
    color: {
      value: STAR_COLORS,
    },
    move: {
      enable: true,
      speed: 0.2,
      direction: 'none',
      random: true,
    },
    number: {
      density: {
        enable: true,
        width: 1000,
        height: 1000,
      },
      value: 50,
    },
    opacity: {
      value: { min: 0.2, max: 1 },
      animation: {
        enable: true,
        speed: 1,
        sync: false,
      },
    },
    shape: {
      type: 'star',
    },
    size: {
      value: { min: 1, max: 4 },
    },
  },
  detectRetina: true,
};

// =============================================================================
// CONFIG CONFETTI
// =============================================================================

export const confettiConfig: ISourceOptions = {
  fullScreen: false,
  background: {
    color: {
      value: 'transparent',
    },
  },
  fpsLimit: 60,
  particles: {
    color: {
      value: CONFETTI_COLORS,
    },
    move: {
      enable: true,
      speed: 3,
      direction: 'bottom',
      random: true,
      straight: false,
      gravity: {
        enable: true,
        acceleration: 0.5,
      },
    },
    number: {
      value: 100,
    },
    opacity: {
      value: { min: 0.5, max: 1 },
    },
    shape: {
      type: ['square', 'circle'],
    },
    size: {
      value: { min: 3, max: 8 },
    },
    rotate: {
      value: { min: 0, max: 360 },
      animation: {
        enable: true,
        speed: 30,
      },
    },
    tilt: {
      enable: true,
      value: { min: 0, max: 360 },
      animation: {
        enable: true,
        speed: 30,
      },
    },
    life: {
      duration: {
        value: 3,
      },
      count: 1,
    },
  },
  detectRetina: true,
  emitters: {
    position: {
      x: 50,
      y: 0,
    },
    rate: {
      quantity: 10,
      delay: 0.1,
    },
    size: {
      width: 100,
      height: 0,
    },
  },
};

// =============================================================================
// CONFIG SNOW
// =============================================================================

export const snowConfig: ISourceOptions = {
  fullScreen: false,
  background: {
    color: {
      value: 'transparent',
    },
  },
  fpsLimit: 30,
  particles: {
    color: {
      value: '#ffffff',
    },
    move: {
      enable: true,
      speed: 1,
      direction: 'bottom',
      straight: false,
    },
    number: {
      density: {
        enable: true,
        width: 800,
        height: 800,
      },
      value: 60,
    },
    opacity: {
      value: { min: 0.3, max: 0.8 },
    },
    shape: {
      type: 'circle',
    },
    size: {
      value: { min: 1, max: 4 },
    },
    wobble: {
      enable: true,
      distance: 10,
      speed: 5,
    },
  },
  detectRetina: true,
};

// =============================================================================
// CONFIG BUBBLES
// =============================================================================

export const bubblesConfig: ISourceOptions = {
  fullScreen: false,
  background: {
    color: {
      value: 'transparent',
    },
  },
  fpsLimit: 30,
  particles: {
    color: {
      value: ['#ff69b4', '#87ceeb', '#dda0dd'],
    },
    move: {
      enable: true,
      speed: 1,
      direction: 'top',
      random: true,
    },
    number: {
      density: {
        enable: true,
        width: 800,
        height: 800,
      },
      value: 30,
    },
    opacity: {
      value: { min: 0.2, max: 0.6 },
    },
    shape: {
      type: 'circle',
    },
    size: {
      value: { min: 5, max: 20 },
    },
    stroke: {
      width: 1,
      color: {
        value: '#ffffff',
      },
    },
  },
  detectRetina: true,
};

// =============================================================================
// CONFIG SPARKLES
// =============================================================================

export const sparklesConfig: ISourceOptions = {
  fullScreen: false,
  background: {
    color: {
      value: 'transparent',
    },
  },
  fpsLimit: 60,
  particles: {
    color: {
      value: ['#ffd700', '#ffffff', '#ff69b4'],
    },
    move: {
      enable: true,
      speed: 0.3,
      direction: 'none',
      random: true,
    },
    number: {
      density: {
        enable: true,
        width: 600,
        height: 600,
      },
      value: 30,
    },
    opacity: {
      value: { min: 0, max: 1 },
      animation: {
        enable: true,
        speed: 2,
        sync: false,
      },
    },
    shape: {
      type: 'star',
    },
    size: {
      value: { min: 1, max: 3 },
      animation: {
        enable: true,
        speed: 3,
        sync: false,
      },
    },
  },
  detectRetina: true,
};

// =============================================================================
// REGISTRY
// =============================================================================

export const PARTICLE_CONFIGS: Record<ParticlePreset, ISourceOptions> = {
  fairy: fairyConfig,
  stars: starsConfig,
  confetti: confettiConfig,
  snow: snowConfig,
  bubbles: bubblesConfig,
  sparkles: sparklesConfig,
};

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Obtenir une config par preset
 */
export function getParticleConfig(preset: ParticlePreset): ISourceOptions {
  return PARTICLE_CONFIGS[preset];
}

/**
 * Liste des presets disponibles
 * Définie explicitement pour éviter type assertion
 */
const PRESET_IDS: readonly ParticlePreset[] = [
  'fairy',
  'stars',
  'confetti',
  'snow',
  'bubbles',
  'sparkles',
] as const;

export function listParticlePresets(): ParticlePreset[] {
  return [...PRESET_IDS];
}
