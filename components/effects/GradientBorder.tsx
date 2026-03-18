'use client';

/**
 * GradientBorder - Bordure gradient animee
 * ISO/IEC 25010 - Effet visuel premium pour elements speciaux
 * CSS keyframes — zero JS per frame
 */

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import { THEME_GRADIENTS, THEME_GLOWS } from '@/lib/animations/colors';
import type { ThemeVariant } from '@/types/effects';

export interface GradientBorderProps {
  children: React.ReactNode;
  variant?: ThemeVariant;
  borderWidth?: number;
  borderRadius?: string;
  animate?: boolean;
  animationDuration?: number;
  glow?: boolean;
  className?: string;
  contentClassName?: string;
}

export function GradientBorder({
  children,
  variant = 'unicorn',
  borderWidth = 2,
  borderRadius = '1rem',
  animate = false,
  glow = false,
  className,
  contentClassName,
}: GradientBorderProps) {
  const { shouldAnimate } = useReducedMotion();
  const shouldAnimateGradient = animate && shouldAnimate;

  return (
    <div
      className={cn('relative', className)}
      style={{
        padding: borderWidth,
        borderRadius,
      }}
    >
      {/* Gradient border layer — CSS animation */}
      <div
        className={cn(
          'absolute inset-0 rounded-[inherit]',
          shouldAnimateGradient && 'animate-gradient-x'
        )}
        style={{
          background: THEME_GRADIENTS[variant],
          backgroundSize: animate ? '200% 100%' : '100% 100%',
          boxShadow: glow ? `0 0 20px ${THEME_GLOWS[variant]}` : undefined,
        }}
        aria-hidden="true"
      />

      {/* Content layer */}
      <div
        className={cn(
          'relative bg-white dark:bg-gray-900 rounded-[inherit]',
          contentClassName
        )}
        style={{
          borderRadius: `calc(${borderRadius} - ${borderWidth}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export interface GradientBorderCardProps extends GradientBorderProps {
  padding?: string;
}

export function GradientBorderCard({
  children,
  padding = 'p-4',
  contentClassName,
  ...props
}: GradientBorderCardProps) {
  return (
    <GradientBorder {...props} contentClassName={cn(padding, contentClassName)}>
      {children}
    </GradientBorder>
  );
}

export default GradientBorder;
