/**
 * Types - Toast Notifications
 * ISO/IEC 25010 - SRP: Toast system only
 */

export type ToastType = 'success' | 'star' | 'crown' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  icon?: string;
}

export interface ToastOptions {
  type?: ToastType;
  duration?: number;
  icon?: string;
}

export interface UseToastResult {
  toasts: Toast[];
  toast: (message: string, options?: ToastOptions) => string;
  success: (message: string) => string;
  star: (message: string) => string;
  crown: (message: string) => string;
  error: (message: string) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}
