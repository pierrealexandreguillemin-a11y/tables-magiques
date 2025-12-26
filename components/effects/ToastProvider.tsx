'use client';

/**
 * ToastProvider - Context provider pour les toasts
 * ISO/IEC 25010 - Notifications accessibles globales
 */

import { createContext, useContext, ReactNode } from 'react';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from './Toast';
import type { UseToastResult } from '@/types/effects';

// Context pour les toasts
const ToastContext = createContext<UseToastResult | null>(null);

/**
 * Hook pour utiliser les toasts dans les composants
 */
export function useToastContext(): UseToastResult {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

/**
 * Provider pour le systeme de toasts
 * A integrer dans le layout principal
 */
export function ToastProvider({
  children,
  position = 'top-right',
}: ToastProviderProps) {
  const toastState = useToast();

  return (
    <ToastContext.Provider value={toastState}>
      {children}
      <ToastContainer
        toasts={toastState.toasts}
        onDismiss={toastState.dismiss}
        position={position}
      />
    </ToastContext.Provider>
  );
}

export default ToastProvider;
