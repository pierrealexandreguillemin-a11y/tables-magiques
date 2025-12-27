'use client';

import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface TourProgressProps {
  /** Nombre total d'etapes */
  total: number;
  /** Etape courante (0-indexed) */
  current: number;
  /** Classes additionnelles */
  className?: string;
  /** Callback navigation directe */
  onStepClick?: (index: number) => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Dots de progression pour tour guide
 * Accessible via clavier
 */
export function TourProgress({
  total,
  current,
  className,
  onStepClick,
}: TourProgressProps) {
  return (
    <div
      className={cn('flex items-center gap-1.5', className)}
      role="tablist"
      aria-label="Progression du tour"
    >
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === current;
        const isPast = index < current;

        return (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`Etape ${index + 1} sur ${total}`}
            className={cn(
              'h-2 rounded-full transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              isActive ? 'w-6 bg-primary' : 'w-2',
              isPast ? 'bg-primary/60' : 'bg-muted-foreground/30',
              onStepClick && 'cursor-pointer hover:bg-primary/80'
            )}
            onClick={() => onStepClick?.(index)}
            disabled={!onStepClick}
            tabIndex={isActive ? 0 : -1}
          />
        );
      })}
    </div>
  );
}
