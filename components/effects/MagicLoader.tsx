/**
 * MagicLoader - Loader anime avec Lottie
 * ISO/IEC 25010 - Utilisabilite, Performance
 *
 * P0 Component - Chargement anime pour enfants
 */

'use client';

import Lottie from 'lottie-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

// Import des animations Lottie reelles
import magicWandAnimation from '@/lib/lottie/magic-wand.json';
import loadingStarsAnimation from '@/lib/lottie/loading-stars.json';
import confettiAnimation from '@/lib/lottie/confetti.json';
import starFavoriteAnimation from '@/lib/lottie/star-favorite.json';

/**
 * Types de loader disponibles
 */
export type LoaderType = 'wand' | 'sparkle' | 'unicorn' | 'star';

/**
 * Tailles disponibles
 */
export type LoaderSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Props du composant MagicLoader
 */
export interface MagicLoaderProps {
  /** Type d'animation */
  type?: LoaderType;
  /** Taille du loader */
  size?: LoaderSize;
  /** Texte de chargement */
  text?: string;
  /** Desactiver animations */
  disableAnimation?: boolean;
  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * Styles de taille
 */
const SIZE_STYLES: Record<LoaderSize, string> = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
};

/**
 * Mapping des animations Lottie par type
 */
const ANIMATION_DATA: Record<LoaderType, object> = {
  wand: magicWandAnimation,
  sparkle: loadingStarsAnimation,
  unicorn: confettiAnimation,
  star: starFavoriteAnimation,
};

/**
 * MagicLoader Component
 *
 * Loader anime avec Lottie pour une experience enfant magique.
 * Support de plusieurs types d'animations thematiques.
 *
 * @example
 * ```tsx
 * <MagicLoader type="unicorn" size="lg" text="Preparation de la magie..." />
 * ```
 */
export function MagicLoader({
  type = 'wand',
  size = 'md',
  text,
  disableAnimation = false,
  className,
}: MagicLoaderProps) {
  const { shouldAnimate } = useReducedMotion();
  const animate = shouldAnimate && !disableAnimation;

  const ariaLabel = text ?? 'Chargement en cours';

  return (
    <div
      data-testid="magic-loader"
      data-type={type}
      data-animate={animate ? 'true' : 'false'}
      role="status"
      aria-busy="true"
      aria-label={ariaLabel}
      className={cn(
        'flex flex-col items-center justify-center gap-2',
        className
      )}
    >
      <div className={cn(SIZE_STYLES[size])}>
        <Lottie
          data-testid="lottie-animation"
          animationData={ANIMATION_DATA[type]}
          loop={true}
          autoplay={animate}
          className="w-full h-full"
        />
      </div>

      {text && (
        <span
          data-testid="loader-text"
          className="text-sm text-gray-600 font-medium animate-pulse"
        >
          {text}
        </span>
      )}
    </div>
  );
}

export default MagicLoader;
