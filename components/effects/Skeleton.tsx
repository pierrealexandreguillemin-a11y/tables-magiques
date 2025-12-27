'use client';

/**
 * Skeleton - Placeholder de chargement
 * ISO/IEC 25010 - Feedback visuel async
 *
 * Features:
 * - Variants: text, circle, rect, badge, card
 * - Animation shimmer (respect reduced-motion)
 * - Tailles personnalisables
 */

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import type { SkeletonProps } from '@/types/effects';

// =============================================================================
// VARIANT STYLES
// =============================================================================

const variantStyles: Record<string, string> = {
  text: 'h-4 rounded',
  circle: 'rounded-full aspect-square',
  rect: 'rounded-md',
  badge: 'h-24 w-20 rounded-xl',
  card: 'h-32 w-full rounded-2xl',
};

const roundedStyles: Record<string, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

// =============================================================================
// COMPONENT
// =============================================================================

export function Skeleton({
  variant = 'rect',
  width,
  height,
  rounded,
  animate = true,
  className,
  lines = 1,
}: SkeletonProps) {
  const { shouldAnimate } = useReducedMotion();
  const showAnimation = animate && shouldAnimate;

  // Style inline pour dimensions custom
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height)
    style.height = typeof height === 'number' ? `${height}px` : height;

  const baseClasses = cn(
    'bg-muted',
    variantStyles[variant],
    rounded && roundedStyles[rounded],
    showAnimation && 'animate-pulse',
    className
  );

  // Multi-lines pour variant text
  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2" role="status" aria-label="Chargement">
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={cn(baseClasses, i === lines - 1 && 'w-3/4')}
            style={i === 0 ? style : undefined}
          />
        ))}
        <span className="sr-only">Chargement en cours...</span>
      </div>
    );
  }

  return (
    <div
      className={baseClasses}
      style={style}
      role="status"
      aria-label="Chargement"
    >
      <span className="sr-only">Chargement en cours...</span>
    </div>
  );
}

// =============================================================================
// PRESET SKELETONS
// =============================================================================

/**
 * Skeleton pour BadgeCard
 */
export function BadgeSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center text-center rounded-xl bg-white/80 p-4',
        className
      )}
      role="status"
      aria-label="Chargement badge"
    >
      <Skeleton variant="circle" width={48} height={48} className="mb-2" />
      <Skeleton variant="text" width="80%" className="mb-1" />
      <Skeleton variant="text" width="60%" height={12} />
      <span className="sr-only">Chargement du badge...</span>
    </div>
  );
}

/**
 * Skeleton pour liste de badges
 */
export function BadgeGridSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn('grid grid-cols-3 gap-4', className)}
      role="status"
      aria-label="Chargement badges"
    >
      {Array.from({ length: count }, (_, i) => (
        <BadgeSkeleton key={i} />
      ))}
      <span className="sr-only">Chargement des badges...</span>
    </div>
  );
}

/**
 * Skeleton pour profil utilisateur
 */
export function ProfileSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('space-y-6', className)}
      role="status"
      aria-label="Chargement profil"
    >
      {/* Avatar + Nom */}
      <div className="flex items-center gap-4">
        <Skeleton variant="circle" width={80} height={80} />
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" width="50%" height={24} />
          <Skeleton variant="text" width="30%" height={16} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Skeleton variant="card" height={80} />
        <Skeleton variant="card" height={80} />
        <Skeleton variant="card" height={80} />
      </div>

      {/* Badges section */}
      <div className="space-y-4">
        <Skeleton variant="text" width="40%" height={20} />
        <BadgeGridSkeleton count={6} />
      </div>

      <span className="sr-only">Chargement du profil...</span>
    </div>
  );
}

export default Skeleton;
