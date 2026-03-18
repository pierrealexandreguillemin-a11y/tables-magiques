/**
 * Types - Animations Core
 * ISO/IEC 25010 - SRP: Animation primitives only
 */

export type ThemeVariant = 'princess' | 'unicorn' | 'star' | 'rainbow';
export type AnimationState =
  | 'idle'
  | 'entering'
  | 'active'
  | 'exiting'
  | 'disabled';
export type EasingType = 'bounce' | 'spring' | 'smooth' | 'elastic';

export interface EffectConfig {
  readonly duration: number;
  readonly easing: EasingType;
  readonly delay?: number;
  readonly repeat?: number;
}

export interface AnimatedComponentProps {
  className?: string;
  variant?: ThemeVariant;
  disableAnimation?: boolean;
}

export interface ReducedMotionResult {
  prefersReducedMotion: boolean;
  shouldAnimate: boolean;
}

export const TIMING = {
  instant: 100,
  fast: 200,
  normal: 400,
  celebration: 800,
  dramatic: 1200,
} as const;

export type TimingKey = keyof typeof TIMING;
