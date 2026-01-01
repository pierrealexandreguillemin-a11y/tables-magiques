/**
 * GSAP Effects - Tables Magiques
 * ISO/IEC 25010 - Effets d'animation complexes
 */

import { gsap } from './register';

// =============================================================================
// TYPES
// =============================================================================

export interface ConfettiConfig {
  count?: number;
  colors?: string[];
}

export interface FireworksConfig {
  burstCount?: number;
  burstDelay?: number;
}

export interface ShakeConfig {
  intensity?: number;
  oscillations?: number;
}

export interface ScoreConfig {
  from: number;
  to: number;
  duration?: number;
}

export interface GlowConfig {
  color?: string;
  intensity?: number;
}

// =============================================================================
// COULEURS THEME ENFANT
// =============================================================================

const CONFETTI_COLORS = [
  '#ff69b4', // Hot pink
  '#ba55d3', // Medium orchid
  '#ffd700', // Gold
  '#00ff00', // Lime
  '#00ffff', // Cyan
  '#ff6b6b', // Coral
];

const FIREWORKS_COLORS = [
  '#ff69b4',
  '#ffd700',
  '#00ff00',
  '#00ffff',
  '#ba55d3',
];

// =============================================================================
// EFFETS CELEBRATION
// =============================================================================

/**
 * Explosion de confettis pour bonnes reponses
 */
export function confettiExplosion(
  container: HTMLElement,
  config: ConfettiConfig = {}
): void {
  const { count = 50, colors = CONFETTI_COLORS } = config;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: absolute;
      width: ${8 + Math.random() * 8}px;
      height: ${8 + Math.random() * 8}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      left: 50%;
      top: 50%;
      pointer-events: none;
      z-index: 1000;
    `;
    container.appendChild(particle);

    gsap.to(particle, {
      x: (Math.random() - 0.5) * 500,
      y: (Math.random() - 0.5) * 500,
      rotation: Math.random() * 720 - 360,
      opacity: 0,
      scale: Math.random() * 0.5 + 0.5,
      duration: 1.5 + Math.random(),
      ease: 'power2.out',
      onComplete: () => particle.remove(),
    });
  }
}

/**
 * Feux d'artifice multi-niveaux
 * Retourne une fonction de cleanup pour annuler les timeouts en attente
 */
export function fireworksDisplay(
  container: HTMLElement,
  config: FireworksConfig = {}
): () => void {
  const { burstCount = 5, burstDelay = 300 } = config;
  const timeoutIds: ReturnType<typeof setTimeout>[] = [];

  for (let f = 0; f < burstCount; f++) {
    const timeoutId = setTimeout(() => {
      // Vérifier que le container existe toujours dans le DOM
      if (!container.isConnected) return;

      const centerX = Math.random() * 60 + 20;
      const centerY = Math.random() * 40 + 20;
      const particleCount = 30;

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        const color = FIREWORKS_COLORS[f % FIREWORKS_COLORS.length];
        particle.style.cssText = `
          position: absolute;
          width: 6px;
          height: 6px;
          background: ${color};
          border-radius: 50%;
          left: ${centerX}%;
          top: ${centerY}%;
          pointer-events: none;
          z-index: 1000;
          box-shadow: 0 0 10px ${color}, 0 0 20px ${color};
        `;
        container.appendChild(particle);

        const angle = (i / particleCount) * Math.PI * 2;
        const distance = 100 + Math.random() * 100;

        gsap.to(particle, {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance + 50,
          opacity: 0,
          scale: 0.3,
          duration: 1 + Math.random() * 0.5,
          ease: 'power2.out',
          onComplete: () => particle.remove(),
        });
      }
    }, f * burstDelay);
    timeoutIds.push(timeoutId);
  }

  // Retourner fonction de cleanup
  return () => {
    timeoutIds.forEach((id) => clearTimeout(id));
  };
}

/**
 * Cascade d'emojis celebration
 * Retourne une fonction de cleanup pour annuler les timeouts en attente
 */
export function celebrationCascade(container: HTMLElement): () => void {
  const emojis = ['🎉', '🌟', '✨', '💫', '🦄', '👑', '🌈', '💖'];
  const timeoutIds: ReturnType<typeof setTimeout>[] = [];

  for (let i = 0; i < 20; i++) {
    const timeoutId = setTimeout(() => {
      // Vérifier que le container existe toujours dans le DOM
      if (!container.isConnected) return;

      const emoji = document.createElement('div');
      emoji.textContent =
        emojis[Math.floor(Math.random() * emojis.length)] ?? '✨';
      emoji.style.cssText = `
        position: absolute;
        font-size: ${24 + Math.random() * 24}px;
        left: ${Math.random() * 100}%;
        top: -50px;
        pointer-events: none;
        z-index: 1000;
      `;
      container.appendChild(emoji);

      gsap.to(emoji, {
        y: window.innerHeight + 100,
        x: (Math.random() - 0.5) * 200,
        rotation: Math.random() * 720 - 360,
        duration: 2 + Math.random() * 2,
        ease: 'power1.in',
        onComplete: () => emoji.remove(),
      });
    }, i * 150);
    timeoutIds.push(timeoutId);
  }

  // Retourner fonction de cleanup
  return () => {
    timeoutIds.forEach((id) => clearTimeout(id));
  };
}

// =============================================================================
// EFFETS FEEDBACK
// =============================================================================

/**
 * Shake pour erreur (doux, non-punitif)
 */
export function shakeError(
  element: HTMLElement,
  config: ShakeConfig = {}
): gsap.core.Timeline {
  const { intensity = 10, oscillations = 3 } = config;
  const tl = gsap.timeline();

  for (let i = 0; i < oscillations; i++) {
    const amount = intensity * (1 - i / oscillations);
    tl.to(element, { x: -amount, duration: 0.05 }).to(element, {
      x: amount,
      duration: 0.05,
    });
  }
  tl.to(element, { x: 0, duration: 0.05 });

  return tl;
}

/**
 * Animation score qui monte
 */
export function animateScore(
  element: HTMLElement,
  config: ScoreConfig
): gsap.core.Tween {
  const { from, to, duration = 1.5 } = config;
  const obj = { value: from };

  return gsap.to(obj, {
    value: to,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      element.textContent = Math.round(obj.value).toString();
    },
  });
}

/**
 * Pop-in pour badge debloque
 */
export function badgeUnlock(element: HTMLElement): gsap.core.Timeline {
  const tl = gsap.timeline();

  tl.from(element, {
    scale: 0,
    rotation: -180,
    opacity: 0,
    duration: 0.8,
    ease: 'back.out(1.7)',
  });

  tl.to(element, {
    boxShadow: '0 0 30px rgba(255,215,0,0.8)',
    duration: 0.5,
    yoyo: true,
    repeat: 3,
  });

  return tl;
}

// =============================================================================
// EFFETS TIMER
// =============================================================================

/**
 * Pulse pour timer critique
 */
export function timerPulse(element: HTMLElement): gsap.core.Tween {
  return gsap.to(element, {
    scale: 1.1,
    color: '#ff4444',
    duration: 0.3,
    yoyo: true,
    repeat: -1,
    ease: 'power1.inOut',
  });
}

/**
 * Glow pulsant
 */
export function glowPulse(
  element: HTMLElement,
  config: GlowConfig = {}
): gsap.core.Tween {
  const { color = '#ff69b4', intensity = 40 } = config;

  return gsap.to(element, {
    boxShadow: `0 0 ${intensity / 2}px ${color}, 0 0 ${intensity}px ${color}`,
    duration: 0.8,
    yoyo: true,
    repeat: -1,
    ease: 'sine.inOut',
  });
}

// =============================================================================
// EFFETS UI
// =============================================================================

/**
 * Hover magnetique sur boutons
 */
export function magneticHover(element: HTMLElement): () => void {
  const handleMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(element, {
      x: x * 0.25,
      y: y * 0.25,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.3)',
    });
  };

  element.addEventListener('mousemove', handleMouseMove);
  element.addEventListener('mouseleave', handleMouseLeave);

  return () => {
    element.removeEventListener('mousemove', handleMouseMove);
    element.removeEventListener('mouseleave', handleMouseLeave);
  };
}

/**
 * Stagger reveal pour listes
 */
export function staggerReveal(
  elements: HTMLElement[] | NodeListOf<Element>
): gsap.core.Tween {
  return gsap.from(elements, {
    y: 50,
    opacity: 0,
    scale: 0.8,
    duration: 0.6,
    stagger: 0.1,
    ease: 'back.out(1.7)',
  });
}

/**
 * Vague de chiffres pour clavier
 */
export function numberWave(
  elements: HTMLElement[] | NodeListOf<Element>
): gsap.core.Tween {
  return gsap.from(elements, {
    scale: 0,
    rotation: -90,
    duration: 0.4,
    stagger: 0.05,
    ease: 'back.out(2)',
  });
}

// =============================================================================
// TRANSITIONS PAGE
// =============================================================================

export const pageTransition = {
  enter: (element: HTMLElement): gsap.core.Tween => {
    return gsap.from(element, {
      opacity: 0,
      y: 50,
      duration: 0.5,
      ease: 'power2.out',
    });
  },
  exit: (element: HTMLElement, onComplete: () => void): gsap.core.Tween => {
    return gsap.to(element, {
      opacity: 0,
      y: -50,
      duration: 0.3,
      ease: 'power2.in',
      onComplete,
    });
  },
};
