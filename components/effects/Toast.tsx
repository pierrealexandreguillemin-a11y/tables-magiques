'use client';

/**
 * Toast Components - Tables Magiques
 * ISO/IEC 25010 + WCAG 2.2 - Notifications accessibles
 *
 * Features:
 * - Duree minimum 6s (WCAG 2.2.1)
 * - Pause on hover/focus
 * - aria-live="polite" + role="alert"
 * - Animations Framer Motion avec reduced motion
 * - Theme princesse/licorne
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import type { Toast, ToastType } from '@/types/effects';

// =============================================================================
// STYLES PAR TYPE
// =============================================================================

const TOAST_STYLES: Record<
  ToastType,
  { bg: string; border: string; text: string }
> = {
  success: {
    bg: 'bg-green-500/20 dark:bg-green-500/30',
    border: 'border-green-400/50',
    text: 'text-green-700 dark:text-green-300',
  },
  star: {
    bg: 'bg-yellow-500/20 dark:bg-yellow-500/30',
    border: 'border-yellow-400/50',
    text: 'text-yellow-700 dark:text-yellow-300',
  },
  crown: {
    bg: 'bg-purple-500/20 dark:bg-purple-500/30',
    border: 'border-purple-400/50',
    text: 'text-purple-700 dark:text-purple-300',
  },
  error: {
    bg: 'bg-pink-500/20 dark:bg-pink-500/30',
    border: 'border-pink-400/50',
    text: 'text-pink-700 dark:text-pink-300',
  },
  info: {
    bg: 'bg-blue-500/20 dark:bg-blue-500/30',
    border: 'border-blue-400/50',
    text: 'text-blue-700 dark:text-blue-300',
  },
};

// =============================================================================
// TOAST ITEM
// =============================================================================

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
  isPaused: boolean;
  onPauseChange: (paused: boolean) => void;
}

function ToastItem({
  toast,
  onDismiss,
  isPaused,
  onPauseChange,
}: ToastItemProps) {
  const { shouldAnimate } = useReducedMotion();
  const styles = TOAST_STYLES[toast.type];

  // Pause/resume timer on hover/focus
  const handleMouseEnter = useCallback(
    () => onPauseChange(true),
    [onPauseChange]
  );
  const handleMouseLeave = useCallback(
    () => onPauseChange(false),
    [onPauseChange]
  );
  const handleFocus = useCallback(() => onPauseChange(true), [onPauseChange]);
  const handleBlur = useCallback(() => onPauseChange(false), [onPauseChange]);

  return (
    <motion.div
      layout
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      tabIndex={0}
      initial={
        shouldAnimate ? { opacity: 0, y: -20, scale: 0.95 } : { opacity: 0 }
      }
      animate={shouldAnimate ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1 }}
      exit={
        shouldAnimate ? { opacity: 0, y: -10, scale: 0.95 } : { opacity: 0 }
      }
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={cn(
        'relative flex items-center gap-3 px-4 py-3 rounded-xl border-2',
        'backdrop-blur-md shadow-lg',
        'min-w-[280px] max-w-[400px]',
        'cursor-pointer select-none',
        'focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2',
        styles.bg,
        styles.border
      )}
      onClick={() => onDismiss(toast.id)}
    >
      {/* Icon */}
      <span className="text-2xl flex-shrink-0" aria-hidden="true">
        {toast.icon}
      </span>

      {/* Message */}
      <p className={cn('text-sm font-medium flex-1', styles.text)}>
        {toast.message}
      </p>

      {/* Close button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(toast.id);
        }}
        className={cn(
          'flex-shrink-0 p-1 rounded-full',
          'hover:bg-black/10 dark:hover:bg-white/10',
          'focus:outline-none focus:ring-2 focus:ring-pink-400',
          'transition-colors'
        )}
        aria-label="Fermer la notification"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Progress bar (WCAG: visual timer indicator) */}
      {toast.duration && (
        <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl overflow-hidden">
          <motion.div
            className={cn(
              'h-full',
              toast.type === 'success' && 'bg-green-400',
              toast.type === 'star' && 'bg-yellow-400',
              toast.type === 'crown' && 'bg-purple-400',
              toast.type === 'error' && 'bg-pink-400',
              toast.type === 'info' && 'bg-blue-400'
            )}
            initial={{ width: '100%' }}
            animate={{ width: isPaused ? undefined : '0%' }}
            transition={{
              duration: toast.duration / 1000,
              ease: 'linear',
            }}
            style={isPaused ? { animationPlayState: 'paused' } : undefined}
          />
        </div>
      )}
    </motion.div>
  );
}

// =============================================================================
// TOAST CONTAINER
// =============================================================================

export interface ToastContainerProps {
  /** Liste des toasts a afficher */
  toasts: Toast[];
  /** Callback pour supprimer un toast */
  onDismiss: (id: string) => void;
  /** Position du container */
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

/**
 * Container pour afficher les toasts
 * A placer dans le layout principal de l'application
 */
export function ToastContainer({
  toasts,
  onDismiss,
  position = 'top-right',
}: ToastContainerProps) {
  const [pausedToasts, setPausedToasts] = useState<Set<string>>(new Set());

  // Position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  const handlePauseChange = useCallback((id: string, paused: boolean) => {
    setPausedToasts((prev) => {
      const next = new Set(prev);
      if (paused) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  return (
    <div
      role="region"
      className={cn(
        'fixed z-50 flex flex-col gap-2',
        positionClasses[position]
      )}
      aria-label="Notifications"
      data-testid="toast-container"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={onDismiss}
            isPaused={pausedToasts.has(toast.id)}
            onPauseChange={(paused) => handlePauseChange(toast.id, paused)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export default ToastContainer;
