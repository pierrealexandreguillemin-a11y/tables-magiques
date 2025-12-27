/**
 * Error Reporter - Tables Magiques
 * Adapté de chess-app pour Upstash Redis
 * ISO/IEC 25010 - Reliability & Maintainability
 *
 * Fonctionnalités:
 * - Batching d'erreurs (réduction appels API)
 * - Inférence type/sévérité
 * - Handlers globaux (unhandledrejection, error)
 * - Intégration React ErrorBoundary
 */

// =============================================================================
// TYPES
// =============================================================================

export type ErrorType =
  | 'validation'
  | 'network'
  | 'runtime'
  | 'business'
  | 'ui'
  | 'unknown';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorReport {
  message: string;
  type: ErrorType;
  severity: ErrorSeverity;
  stack?: string;
  context?: Record<string, unknown>;
  url?: string;
  userAgent?: string;
  timestamp: string;
}

interface ErrorQueueItem extends ErrorReport {
  id: string;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
  endpoint: '/api/errors',
  maxQueueSize: 10,
  flushDelayMs: 2000,
  enableConsoleLog: process.env.NODE_ENV === 'development',
};

// =============================================================================
// STATE
// =============================================================================

let errorQueue: ErrorQueueItem[] = [];
let flushTimeout: ReturnType<typeof setTimeout> | null = null;
let isInitialized = false;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function generateId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function inferErrorType(error: Error | string): ErrorType {
  const message =
    typeof error === 'string' ? error : error.message?.toLowerCase() || '';

  if (message.includes('validation') || message.includes('invalid')) {
    return 'validation';
  }
  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('api')
  ) {
    return 'network';
  }
  if (message.includes('render') || message.includes('component')) {
    return 'ui';
  }
  if (typeof error !== 'string' && error.name === 'TypeError') {
    return 'runtime';
  }

  return 'unknown';
}

function inferSeverity(type: ErrorType, error?: Error): ErrorSeverity {
  // Les erreurs UI/runtime sont critiques (crash possible)
  if (type === 'ui' || type === 'runtime') {
    return 'critical';
  }

  // Erreurs réseau = high (impact UX)
  if (type === 'network') {
    return 'high';
  }

  // Erreurs validation = low (attendues)
  if (type === 'validation') {
    return 'low';
  }

  // Erreurs non catchées = high
  if (error && !error.name) {
    return 'high';
  }

  return 'medium';
}

// =============================================================================
// FLUSH LOGIC
// =============================================================================

async function flushQueue(): Promise<void> {
  if (errorQueue.length === 0) return;

  const errorsToSend = [...errorQueue];
  errorQueue = [];

  if (flushTimeout) {
    clearTimeout(flushTimeout);
    flushTimeout = null;
  }

  try {
    const response = await fetch(CONFIG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ errors: errorsToSend }),
    });

    if (!response.ok) {
      // Re-queue en cas d'échec (une seule fois)
      if (CONFIG.enableConsoleLog) {
        console.warn('[ErrorReporter] Failed to send errors, re-queuing');
      }
      errorQueue = [...errorsToSend, ...errorQueue].slice(
        0,
        CONFIG.maxQueueSize
      );
    }
  } catch (err) {
    // Silently fail - on ne veut pas de boucle infinie
    if (CONFIG.enableConsoleLog) {
      console.error('[ErrorReporter] Network error:', err);
    }
  }
}

function scheduleFlush(): void {
  if (flushTimeout) return;

  flushTimeout = setTimeout(() => {
    flushTimeout = null;
    flushQueue();
  }, CONFIG.flushDelayMs);
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Capture une erreur et l'ajoute à la queue
 */
export function captureError(
  error: Error | string,
  options?: {
    type?: ErrorType;
    severity?: ErrorSeverity;
    context?: Record<string, unknown>;
  }
): void {
  const message = typeof error === 'string' ? error : error.message;
  const stack = typeof error === 'string' ? undefined : error.stack;
  const type = options?.type || inferErrorType(error);
  const severity =
    options?.severity ||
    inferSeverity(type, typeof error === 'string' ? undefined : error);

  const report: ErrorQueueItem = {
    id: generateId(),
    message,
    type,
    severity,
    stack,
    context: options?.context,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userAgent:
      typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    timestamp: new Date().toISOString(),
  };

  if (CONFIG.enableConsoleLog) {
    console.error(
      `[ErrorReporter] ${severity.toUpperCase()} ${type}:`,
      message
    );
  }

  errorQueue.push(report);

  // Flush immédiat si queue pleine ou erreur critique
  if (errorQueue.length >= CONFIG.maxQueueSize || severity === 'critical') {
    flushQueue();
  } else {
    scheduleFlush();
  }
}

/**
 * Capture un message d'information (non-erreur)
 */
export function captureMessage(
  message: string,
  severity: ErrorSeverity = 'low',
  context?: Record<string, unknown>
): void {
  captureError(message, {
    type: 'business',
    severity,
    context,
  });
}

/**
 * Capture une erreur UI (React ErrorBoundary)
 */
export function reportUIError(
  error: Error,
  componentStack?: string | null
): void {
  captureError(error, {
    type: 'ui',
    severity: 'critical',
    context: {
      componentStack: componentStack || undefined,
    },
  });
}

// =============================================================================
// GLOBAL HANDLERS
// =============================================================================

function handleUnhandledRejection(event: PromiseRejectionEvent): void {
  const error =
    event.reason instanceof Error
      ? event.reason
      : new Error(String(event.reason));
  captureError(error, {
    type: 'runtime',
    severity: 'high',
    context: { unhandledRejection: true },
  });
}

function handleGlobalError(event: ErrorEvent): void {
  captureError(event.error || event.message, {
    type: 'runtime',
    severity: 'critical',
    context: {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    },
  });
}

function handleBeforeUnload(): void {
  // Flush synchrone avant fermeture
  if (errorQueue.length > 0) {
    const data = JSON.stringify({ errors: errorQueue });
    // sendBeacon pour garantir l'envoi
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon(CONFIG.endpoint, data);
    }
  }
}

/**
 * Initialise les handlers globaux (appeler une seule fois)
 */
export function initErrorReporter(): void {
  if (isInitialized || typeof window === 'undefined') return;

  window.addEventListener('unhandledrejection', handleUnhandledRejection);
  window.addEventListener('error', handleGlobalError);
  window.addEventListener('beforeunload', handleBeforeUnload);

  isInitialized = true;

  if (CONFIG.enableConsoleLog) {
    console.log('[ErrorReporter] Initialized');
  }
}

/**
 * Cleanup (pour tests)
 */
export function cleanupErrorReporter(): void {
  if (typeof window === 'undefined') return;

  window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  window.removeEventListener('error', handleGlobalError);
  window.removeEventListener('beforeunload', handleBeforeUnload);

  errorQueue = [];
  if (flushTimeout) {
    clearTimeout(flushTimeout);
    flushTimeout = null;
  }

  isInitialized = false;
}

// =============================================================================
// EXPORTS FOR TESTING
// =============================================================================

export const __testing__ = {
  getQueue: () => [...errorQueue],
  clearQueue: () => {
    errorQueue = [];
  },
  forceFlush: flushQueue,
};
