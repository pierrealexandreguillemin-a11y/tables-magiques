'use client';

import { useEffect, useState, useCallback, useSyncExternalStore } from 'react';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

// =============================================================================
// TYPES
// =============================================================================

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TourHighlightProps {
  /** Selecteur CSS de l'element cible */
  target: string;
  /** Padding autour de l'element */
  padding?: number;
  /** Autoriser clicks dans spotlight */
  spotlightClicks?: boolean;
  /** Callback click sur overlay */
  onOverlayClick?: () => void;
  /** Classes additionnelles */
  className?: string;
  /** Enfants (tooltip positionne) */
  children?: React.ReactNode;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Hook pour detecter si on est monte cote client
 */
function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Overlay avec spotlight sur element cible
 * Utilise Portal pour z-index eleve
 */
export function TourHighlight({
  target,
  padding = 8,
  spotlightClicks = false,
  onOverlayClick,
  className,
  children,
}: TourHighlightProps) {
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const mounted = useIsMounted();

  // Calculer position element cible
  const updateTargetRect = useCallback(() => {
    const element = document.querySelector(target);
    if (!element) {
      setTargetRect(null);
      return;
    }

    const rect = element.getBoundingClientRect();
    setTargetRect({
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    });

    // Scroll element into view si necessaire
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [target, padding]);

  // Mise a jour position (avec RAF pour eviter setState direct)
  useEffect(() => {
    if (!mounted) return;

    // Utiliser requestAnimationFrame pour differ le setState
    const rafId = requestAnimationFrame(() => {
      updateTargetRect();
    });

    // Observer resize et scroll
    const handleUpdate = () => updateTargetRect();
    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, true);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate, true);
    };
  }, [mounted, updateTargetRect]);

  // Bloquer scroll body pendant tour
  useEffect(() => {
    if (!mounted) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mounted]);

  if (!mounted) return null;

  // Pas de cible trouvee -> overlay complet
  if (!targetRect) {
    return createPortal(
      <div
        className={cn(
          'fixed inset-0 z-[9999] bg-black/60',
          'flex items-center justify-center',
          className
        )}
        onClick={onOverlayClick}
        role="presentation"
      >
        {children}
      </div>,
      document.body
    );
  }

  return createPortal(
    <div
      className={cn('fixed inset-0 z-[9999]', className)}
      role="presentation"
    >
      {/* Overlay avec trou (SVG clip-path) */}
      <svg className="absolute inset-0 h-full w-full" onClick={onOverlayClick}>
        <defs>
          <mask id="tour-spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={targetRect.left}
              y={targetRect.top}
              width={targetRect.width}
              height={targetRect.height}
              rx="8"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.6)"
          mask="url(#tour-spotlight-mask)"
        />
      </svg>

      {/* Zone spotlight (pour events si spotlightClicks) */}
      <div
        className={cn(
          'absolute rounded-lg ring-4 ring-primary/50',
          'animate-pulse',
          spotlightClicks ? 'pointer-events-auto' : 'pointer-events-none'
        )}
        style={{
          top: targetRect.top,
          left: targetRect.left,
          width: targetRect.width,
          height: targetRect.height,
        }}
        aria-hidden="true"
      />

      {/* Tooltip positionne */}
      {children}
    </div>,
    document.body
  );
}
