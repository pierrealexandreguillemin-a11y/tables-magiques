'use client';

import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirstVisit, useOnboarding } from '@/features/onboarding';
import { useCallback } from 'react';

// =============================================================================
// TYPES
// =============================================================================

interface HelpButtonProps {
  /** Classes additionnelles */
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Bouton d'aide pour relancer le tour onboarding
 * A placer dans le Header
 */
export function HelpButton({ className }: HelpButtonProps) {
  const { reset: resetFirstVisit } = useFirstVisit();
  const { start, reset } = useOnboarding();

  const handleClick = useCallback(() => {
    // Reset l'etat pour pouvoir relancer
    resetFirstVisit();
    reset();
    // Petit delai pour laisser le reset s'appliquer
    setTimeout(() => {
      start();
    }, 100);
  }, [resetFirstVisit, reset, start]);

  return (
    <button
      type="button"
      onClick={handleClick}
      data-tour="help-button"
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full',
        'text-muted-foreground',
        'hover:bg-accent hover:text-accent-foreground',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'transition-colors',
        className
      )}
      aria-label="Afficher le guide d'aide"
    >
      <HelpCircle className="h-5 w-5" />
    </button>
  );
}
