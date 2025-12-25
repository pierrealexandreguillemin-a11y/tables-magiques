/**
 * MagicCounter - Compteur anime avec GSAP
 * ISO/IEC 25010 - Utilisabilite, Performance
 *
 * P0 Component - Animation fluide des scores/points
 */

'use client';

import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// Register GSAP plugin for React
gsap.registerPlugin(useGSAP);
import { cn } from '@/lib/utils';
import type { ThemeVariant } from '@/types/effects';

/**
 * Format de nombre
 */
export type CounterFormat = 'integer' | 'decimal' | 'percent';

/**
 * Tailles disponibles
 */
export type CounterSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Props du composant MagicCounter
 */
export interface MagicCounterProps {
  /** Valeur a afficher */
  value: number;
  /** Format du nombre */
  format?: CounterFormat;
  /** Taille du texte */
  size?: CounterSize;
  /** Variante de theme */
  variant?: ThemeVariant;
  /** Prefixe (ex: "+") */
  prefix?: string;
  /** Suffixe (ex: " pts") */
  suffix?: string;
  /** Duree animation en secondes */
  duration?: number;
  /** Desactiver animations */
  disableAnimation?: boolean;
  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * Styles de taille
 */
const SIZE_STYLES: Record<CounterSize, string> = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
  xl: 'text-6xl',
};

/**
 * Couleurs par variante
 */
const VARIANT_COLORS: Record<ThemeVariant, string> = {
  princess: 'text-pink-600',
  unicorn: 'text-purple-600',
  star: 'text-yellow-600',
  rainbow:
    'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500',
};

/**
 * Formater le nombre selon le format
 */
function formatNumber(value: number, format: CounterFormat): string {
  switch (format) {
    case 'decimal':
      return value.toFixed(1);
    case 'percent':
      return `${Math.round(value)}%`;
    case 'integer':
    default:
      return Math.round(value).toString();
  }
}

/**
 * MagicCounter Component
 *
 * Compteur avec animation GSAP fluide pour les transitions de valeur.
 * Ideal pour scores, points, progression.
 *
 * @example
 * ```tsx
 * <MagicCounter value={score} prefix="+" suffix=" pts" variant="star" />
 * ```
 */
export function MagicCounter({
  value,
  format = 'integer',
  size = 'md',
  variant = 'princess',
  prefix,
  suffix,
  duration = 0.8,
  disableAnimation = false,
  className,
}: MagicCounterProps) {
  const { shouldAnimate } = useReducedMotion();
  const animate = shouldAnimate && !disableAnimation;

  // For non-animated mode, display value directly
  const [animatedValue, setAnimatedValue] = useState(value);
  const counterRef = useRef({ value: value });
  const containerRef = useRef<HTMLSpanElement>(null);

  // Determine display value: animated or direct
  const displayValue = animate ? animatedValue : value;

  // Use GSAP hook for proper React integration
  useGSAP(
    () => {
      // Only animate if animation is enabled
      if (!animate) {
        counterRef.current.value = value;
        setAnimatedValue(value);
        return;
      }

      // Animate with GSAP (contextSafe automatically handles cleanup)
      gsap.to(counterRef.current, {
        value: value,
        duration: duration,
        ease: 'power2.out',
        onUpdate: () => {
          setAnimatedValue(counterRef.current.value);
        },
      });
    },
    { dependencies: [value, duration, animate], scope: containerRef }
  );

  return (
    <span
      ref={containerRef}
      data-testid="magic-counter"
      data-format={format}
      data-animate={animate ? 'true' : 'false'}
      data-duration={duration.toString()}
      role="status"
      aria-live="polite"
      className={cn(
        // Base
        'font-bold tabular-nums',
        // Size
        SIZE_STYLES[size],
        // Color
        VARIANT_COLORS[variant],
        // Custom
        className
      )}
    >
      {prefix && (
        <span data-testid="counter-prefix" className="mr-0.5">
          {prefix}
        </span>
      )}
      <span data-testid="counter-value">
        {formatNumber(displayValue, format)}
      </span>
      {suffix && (
        <span data-testid="counter-suffix" className="ml-0.5">
          {suffix}
        </span>
      )}
    </span>
  );
}

export default MagicCounter;
