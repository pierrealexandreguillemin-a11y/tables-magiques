// Parity harness, OLD side: master's real tsParticles configs (2026-10-17).
import type { ISourceOptions } from '@tsparticles/engine';
import { tsParticles } from '@tsparticles/engine';
import { loadSlim } from '@tsparticles/slim';
import {
  sparklesConfig,
  confettiConfig,
} from '@/lib/animations/particles/configs';

// Copied verbatim from master components/effects/FairyBackground.tsx (not exported there).
function createStarParticlesConfig(
  starCount: number,
  animate: boolean
): ISourceOptions {
  return {
    fullScreen: false,
    fpsLimit: 30,
    pauseOnBlur: true,
    pauseOnOutsideViewport: true,
    particles: {
      number: {
        value: starCount * 2, // Plus d'etoiles
        density: {
          enable: true,
        },
      },
      color: {
        // Couleurs vives pour visibilite dark mode
        value: [
          '#fef08a',
          '#fde047',
          '#facc15',
          '#ffffff',
          '#f472b6',
          '#c084fc',
        ],
      },
      shape: {
        type: 'star', // Forme etoile
        options: {
          star: {
            sides: 5,
          },
        },
      },
      opacity: {
        value: { min: 0.5, max: 1 }, // Plus opaque
        animation: animate
          ? {
              enable: true,
              speed: 1,
              sync: false,
            }
          : { enable: false },
      },
      size: {
        value: { min: 3, max: 8 }, // Plus gros
        animation: { enable: false }, // Static size - perf: avoids per-particle recalc
      },
      move: {
        enable: animate,
        speed: 0.5, // Plus rapide
        direction: 'none',
        random: true,
        straight: false,
        outModes: {
          default: 'bounce',
        },
      },
      twinkle: {
        particles: {
          enable: animate,
          frequency: 0.08, // Scintillement plus frequent
          opacity: 1,
        },
      },
      // Effet glow
      shadow: {
        enable: true,
        color: '#fbbf24',
        blur: 10,
      },
    },
    detectRetina: true,
  };
}

const ready = loadSlim(tsParticles);
let n = 0;
async function mount(element: HTMLElement, options: ISourceOptions) {
  await ready;
  n += 1;
  return tsParticles.load({ id: `old-${n}`, element, options });
}

(window as unknown as Record<string, unknown>).ParityOld = {
  fairy: (el: HTMLElement) => mount(el, createStarParticlesConfig(20, true)),
  sparkles: (el: HTMLElement) => mount(el, sparklesConfig),
  confetti: (el: HTMLElement) => mount(el, confettiConfig),
};
