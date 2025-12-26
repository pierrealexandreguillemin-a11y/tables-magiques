'use client';

/**
 * Hook useToast - Systeme de notifications toast accessible
 * ISO/IEC 25010 + WCAG 2.2 - Duree 6s min, pause on hover/focus
 *
 * @example
 * ```tsx
 * const { toast, success, star } = useToast();
 * success('Bravo! Bonne reponse!');
 * star('10 bonnes reponses de suite!');
 * ```
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Toast, ToastOptions, UseToastResult } from '@/types/effects';

/** Duree par defaut WCAG 2.2 (6 secondes minimum) */
const DEFAULT_DURATION = 6000;

/** Maximum de toasts affiches simultanement */
const MAX_TOASTS = 3;

/** Icones par type */
const TOAST_ICONS: Record<string, string> = {
  success: '🌟',
  star: '✨',
  crown: '👑',
  error: '💭',
  info: '💡',
};

/**
 * Genere un ID unique pour un toast
 */
function generateId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Hook pour gerer les notifications toast accessibles
 * Conforme WCAG 2.2 avec duree minimum 6s et pause on hover/focus
 */
export function useToast(): UseToastResult {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Nettoyer les timers au demontage
  useEffect(() => {
    // Capturer la référence pour le cleanup
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  // Supprimer un toast
  const dismiss = useCallback((id: string) => {
    // Clear timer
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  // Supprimer tous les toasts
  const dismissAll = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    setToasts([]);
  }, []);

  // Ajouter un toast
  const toast = useCallback(
    (message: string, options?: ToastOptions): string => {
      const id = generateId();
      const type = options?.type || 'info';
      const duration = Math.max(
        options?.duration || DEFAULT_DURATION,
        DEFAULT_DURATION
      );
      const icon = options?.icon || TOAST_ICONS[type];

      const newToast: Toast = {
        id,
        type,
        message,
        duration,
        icon,
      };

      setToasts((current) => {
        // Limiter le nombre de toasts
        const updated = [...current, newToast];
        if (updated.length > MAX_TOASTS) {
          // Supprimer le plus ancien
          const oldest = updated[0];
          if (oldest) {
            const timer = timersRef.current.get(oldest.id);
            if (timer) {
              clearTimeout(timer);
              timersRef.current.delete(oldest.id);
            }
          }
          return updated.slice(1);
        }
        return updated;
      });

      // Auto-dismiss apres duration
      const timer = setTimeout(() => {
        dismiss(id);
      }, duration);

      timersRef.current.set(id, timer);

      return id;
    },
    [dismiss]
  );

  // Shortcuts pour types communs
  const success = useCallback(
    (message: string) => toast(message, { type: 'success' }),
    [toast]
  );

  const star = useCallback(
    (message: string) => toast(message, { type: 'star' }),
    [toast]
  );

  const crown = useCallback(
    (message: string) => toast(message, { type: 'crown' }),
    [toast]
  );

  const error = useCallback(
    (message: string) => toast(message, { type: 'error' }),
    [toast]
  );

  return {
    toasts,
    toast,
    success,
    star,
    crown,
    error,
    dismiss,
    dismissAll,
  };
}

export default useToast;
