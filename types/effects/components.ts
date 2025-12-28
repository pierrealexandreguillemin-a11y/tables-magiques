/**
 * Types - Effect Components Props
 * ISO/IEC 25010 - SRP: Component props only
 */

import type { AnimatedComponentProps } from './animations';

// GentleShake
export interface GentleShakeProps extends AnimatedComponentProps {
  trigger: boolean;
  onShakeComplete?: () => void;
  amplitude?: number;
  message?: string;
  children: React.ReactNode;
}

// GradientText
export type GradientVariant = 'fairy' | 'unicorn' | 'rainbow' | 'gold';
export interface GradientTextProps {
  children: React.ReactNode;
  variant?: GradientVariant;
  animate?: boolean;
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'p';
  className?: string;
}

// Announcer
export type AnnouncerPoliteness = 'polite' | 'assertive';
export interface UseAnnouncerResult {
  announcePolite: (message: string) => void;
  announceAssertive: (message: string) => void;
  announce: (message: string, politeness?: AnnouncerPoliteness) => void;
}

// Lottie
export type LottieAnimationType =
  | 'success'
  | 'error'
  | 'loading'
  | 'celebration'
  | 'streak'
  | 'crown'
  | 'sparkles';
export interface LottieAnimationProps {
  type: LottieAnimationType;
  autoplay?: boolean;
  loop?: boolean;
  size?: number;
  onComplete?: () => void;
  className?: string;
}

// Kawaii
export type KawaiiCharacter =
  | 'planet'
  | 'cat'
  | 'ghost'
  | 'iceCream'
  | 'backpack';
export type KawaiiMood =
  | 'happy'
  | 'sad'
  | 'blissful'
  | 'lovestruck'
  | 'excited'
  | 'ko';
export interface KawaiiMascotProps {
  character?: KawaiiCharacter;
  mood?: KawaiiMood;
  size?: number;
  color?: string;
  className?: string;
}

// Skeleton
export type SkeletonVariant = 'text' | 'circle' | 'rect' | 'badge' | 'card';
export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  animate?: boolean;
  className?: string;
  lines?: number;
}

// TextReveal
export type TextRevealVariant = 'fade' | 'slide' | 'typewriter' | 'blur';
export interface TextRevealProps {
  children: string;
  variant?: TextRevealVariant;
  delay?: number;
  duration?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  onComplete?: () => void;
}

// ScrollReveal
export type ScrollRevealVariant =
  | 'fade-up'
  | 'fade-down'
  | 'scale'
  | 'slide-left'
  | 'slide-right';
export interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: ScrollRevealVariant;
  delay?: number;
  duration?: number;
  threshold?: number;
  triggerOnce?: boolean;
  className?: string;
}

// AnimatedCheckbox
export type AnimatedCheckboxVariant = 'checkbox' | 'switch';
export type AnimatedCheckboxSize = 'sm' | 'md' | 'lg';
export interface AnimatedCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  variant?: AnimatedCheckboxVariant;
  size?: AnimatedCheckboxSize;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  description?: string;
  className?: string;
}

// Ripple
export interface RipplePosition {
  x: number;
  y: number;
  id: string;
}
export interface RippleEffectProps {
  children: React.ReactNode;
  color?: string;
  duration?: number;
  disabled?: boolean;
  className?: string;
}
export interface UseRippleResult {
  ripples: RipplePosition[];
  addRipple: (event: React.MouseEvent<HTMLElement>) => void;
  clearRipples: () => void;
}

// Badge
export type BadgeId =
  | 'first'
  | 'streak5'
  | 'streak10'
  | 'perfect5'
  | 'streak20'
  | 'perfect10'
  | 'streak30'
  | 'streak50'
  | 'speed5'
  | 'speed10'
  | 'speed15'
  | 'speed20'
  | 'perfectChallenge';
export interface BadgeIconProps {
  badgeId: BadgeId;
  size?: number;
  locked?: boolean;
  className?: string;
  animate?: boolean;
}
