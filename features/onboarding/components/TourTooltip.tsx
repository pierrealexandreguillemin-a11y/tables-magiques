'use client';

import { cn } from '@/lib/utils';
import { TourProgress } from './TourProgress';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import type { TourPlacement } from '@/types/onboarding';

// =============================================================================
// TYPES
// =============================================================================

interface TourTooltipProps {
  /** Titre de l'etape */
  title: string;
  /** Contenu */
  content: string;
  /** Placement */
  placement?: TourPlacement;
  /** Index etape courante */
  currentIndex: number;
  /** Nombre total d'etapes */
  totalSteps: number;
  /** Peut aller en arriere */
  canGoPrev: boolean;
  /** Peut aller en avant */
  canGoNext: boolean;
  /** Peut skip */
  canSkip: boolean;
  /** Est derniere etape */
  isLast: boolean;
  /** Callback precedent */
  onPrev?: () => void;
  /** Callback suivant */
  onNext?: () => void;
  /** Callback skip */
  onSkip?: () => void;
  /** Callback completion */
  onComplete?: () => void;
  /** Classes additionnelles */
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Tooltip/bulle du tour guide
 * Contient titre, contenu, navigation et progression
 */
export function TourTooltip({
  title,
  content,
  placement = 'bottom',
  currentIndex,
  totalSteps,
  canGoPrev,
  canGoNext,
  canSkip,
  isLast,
  onPrev,
  onNext,
  onSkip,
  onComplete,
  className,
}: TourTooltipProps) {
  // Classes pour la fleche selon placement
  const arrowClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 border-b-background border-x-transparent border-t-transparent',
    bottom:
      'top-full left-1/2 -translate-x-1/2 border-t-background border-x-transparent border-b-transparent',
    left: 'right-full top-1/2 -translate-y-1/2 border-r-background border-y-transparent border-l-transparent',
    right:
      'left-full top-1/2 -translate-y-1/2 border-l-background border-y-transparent border-r-transparent',
    center: 'hidden',
  };

  return (
    <div
      className={cn(
        'relative w-80 rounded-xl bg-background p-4 shadow-2xl',
        'border border-border',
        'animate-in fade-in-0 zoom-in-95 duration-200',
        className
      )}
      role="dialog"
      aria-labelledby="tour-title"
      aria-describedby="tour-content"
    >
      {/* Fleche */}
      <div
        className={cn('absolute h-0 w-0 border-[8px]', arrowClasses[placement])}
        aria-hidden="true"
      />

      {/* Header avec titre et bouton fermer */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 id="tour-title" className="text-lg font-bold text-foreground">
          {title}
        </h3>
        {canSkip && (
          <button
            type="button"
            onClick={onSkip}
            className={cn(
              'shrink-0 rounded-full p-1 text-muted-foreground',
              'hover:bg-muted hover:text-foreground',
              'focus:outline-none focus:ring-2 focus:ring-primary'
            )}
            aria-label="Fermer le guide"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Contenu */}
      <p id="tour-content" className="mb-4 text-sm text-muted-foreground">
        {content}
      </p>

      {/* Footer avec progression et navigation */}
      <div className="flex items-center justify-between gap-2">
        <TourProgress total={totalSteps} current={currentIndex} />

        <div className="flex items-center gap-2">
          {/* Bouton precedent */}
          {canGoPrev && (
            <button
              type="button"
              onClick={onPrev}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full',
                'bg-muted text-muted-foreground',
                'hover:bg-accent hover:text-accent-foreground',
                'focus:outline-none focus:ring-2 focus:ring-primary'
              )}
              aria-label="Etape precedente"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          {/* Bouton suivant ou terminer */}
          {isLast ? (
            <button
              type="button"
              onClick={onComplete}
              className={cn(
                'flex h-8 items-center gap-1 rounded-full px-3',
                'bg-primary text-primary-foreground',
                'hover:bg-primary/90',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
              )}
              aria-label="Terminer le guide"
            >
              <Check className="h-4 w-4" />
              <span className="text-sm font-medium">Terminer</span>
            </button>
          ) : (
            canGoNext && (
              <button
                type="button"
                onClick={onNext}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full',
                  'bg-primary text-primary-foreground',
                  'hover:bg-primary/90',
                  'focus:outline-none focus:ring-2 focus:ring-primary'
                )}
                aria-label="Etape suivante"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
