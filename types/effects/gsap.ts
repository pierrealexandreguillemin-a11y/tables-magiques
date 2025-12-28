/**
 * Types - GSAP Effects
 * ISO/IEC 25010 - SRP: GSAP animation types only
 */

export type GsapEffectType =
  | 'confetti'
  | 'fireworks'
  | 'shake'
  | 'badgeUnlock'
  | 'timerPulse'
  | 'staggerReveal'
  | 'pageTransition'
  | 'numberWave'
  | 'celebrationCascade'
  | 'glowPulse'
  | 'scoreAnimate'
  | 'magneticHover';

export interface GsapConfettiConfig {
  count?: number;
  colors?: string[];
}

export interface GsapFireworksConfig {
  burstCount?: number;
  burstDelay?: number;
}

export interface GsapShakeConfig {
  intensity?: number;
  oscillations?: number;
}

export interface GsapScoreConfig {
  from: number;
  to: number;
  duration?: number;
}

export interface GsapGlowConfig {
  color?: string;
  intensity?: number;
}

export interface GsapTimerPulseConfig {
  alertColor?: string;
  scale?: number;
}

export interface GsapCleanupFunction {
  (): void;
}

export interface GsapEffectResult {
  cleanup: GsapCleanupFunction;
  timeline?: gsap.core.Timeline;
}

export interface UseGsapEffectsResult {
  confettiExplosion: (
    container: HTMLElement,
    config?: GsapConfettiConfig
  ) => void;
  fireworksDisplay: (container: HTMLElement) => void;
  shakeError: (element: HTMLElement) => void;
  badgeUnlock: (element: HTMLElement) => void;
  timerPulse: (element: HTMLElement) => GsapCleanupFunction;
  staggerReveal: (elements: HTMLElement[] | NodeListOf<Element>) => void;
  pageTransition: {
    enter: (element: HTMLElement) => void;
    exit: (element: HTMLElement, onComplete: () => void) => void;
  };
  numberWave: (elements: HTMLElement[] | NodeListOf<Element>) => void;
  celebrationCascade: (container: HTMLElement) => void;
  glowPulse: (
    element: HTMLElement,
    config?: GsapGlowConfig
  ) => GsapCleanupFunction;
  animateScore: (element: HTMLElement, config: GsapScoreConfig) => void;
  magneticHover: (element: HTMLElement) => GsapCleanupFunction;
  isReady: boolean;
}
