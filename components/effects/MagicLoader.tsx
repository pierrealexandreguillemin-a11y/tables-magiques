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
 * Donnees d'animation placeholder par type
 * Note: Remplacer par de vraies animations Lottie
 */
const ANIMATION_DATA: Record<LoaderType, object> = {
  wand: createPlaceholderAnimation('#f472b6'), // Pink
  sparkle: createPlaceholderAnimation('#fbbf24'), // Yellow
  unicorn: createPlaceholderAnimation('#a855f7'), // Purple
  star: createPlaceholderAnimation('#facc15'), // Gold
};

/**
 * Creer une animation Lottie placeholder simple
 * (Cercle qui pulse - remplacer par vraies animations)
 */
function createPlaceholderAnimation(color: string): object {
  return {
    v: '5.7.4',
    fr: 60,
    ip: 0,
    op: 60,
    w: 100,
    h: 100,
    nm: 'Loader',
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: 'Circle',
        sr: 1,
        ks: {
          o: {
            a: 1,
            k: [
              { t: 0, s: [100], h: 0 },
              { t: 30, s: [50], h: 0 },
              { t: 60, s: [100], h: 0 },
            ],
          },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [50, 50] },
          a: { a: 0, k: [0, 0] },
          s: {
            a: 1,
            k: [
              { t: 0, s: [100, 100], h: 0 },
              { t: 30, s: [120, 120], h: 0 },
              { t: 60, s: [100, 100], h: 0 },
            ],
          },
        },
        ao: 0,
        shapes: [
          {
            ty: 'el',
            d: 1,
            s: { a: 0, k: [60, 60] },
            p: { a: 0, k: [0, 0] },
            nm: 'Ellipse',
          },
          {
            ty: 'fl',
            c: { a: 0, k: hexToRgb(color) },
            o: { a: 0, k: 100 },
            r: 1,
            nm: 'Fill',
          },
        ],
        ip: 0,
        op: 60,
        st: 0,
      },
    ],
  };
}

/**
 * Convertir hex en RGB pour Lottie
 */
function hexToRgb(hex: string): number[] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result || result.length < 4) return [1, 0.5, 0.7, 1];

  const r = result[1];
  const g = result[2];
  const b = result[3];

  if (!r || !g || !b) return [1, 0.5, 0.7, 1];

  return [
    parseInt(r, 16) / 255,
    parseInt(g, 16) / 255,
    parseInt(b, 16) / 255,
    1,
  ];
}

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
        SIZE_STYLES[size],
        className
      )}
    >
      <Lottie
        data-testid="lottie-animation"
        animationData={ANIMATION_DATA[type]}
        loop={true}
        autoplay={animate}
        className="w-full h-full"
      />

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
