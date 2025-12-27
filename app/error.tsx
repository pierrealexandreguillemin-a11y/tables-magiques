'use client';

/**
 * Error Boundary - Tables Magiques
 * ISO/IEC 25010 - Reliability (Error Recovery)
 *
 * Capture les erreurs de rendu dans l'app (hors layout root)
 * Design enfant-friendly avec mascotte triste
 */

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { reportUIError } from '@/lib/errorReporter';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Reporter l'erreur au backend
    reportUIError(error);
    console.error('[ErrorBoundary]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-purple-950">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Mascotte triste */}
        <div
          className="text-8xl animate-bounce"
          role="img"
          aria-label="Licorne triste"
        >
          🦄
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Oups ! La magie s&apos;est envolee...
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Ne t&apos;inquiete pas, les licornes travaillent pour reparer ca !
          </p>
        </div>

        {/* Message technique (optionnel) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800 text-left">
            <p className="text-sm font-mono text-red-700 dark:text-red-300 break-words">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-500 mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
          >
            Reessayer la magie
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/')}
          >
            Retour a l&apos;accueil
          </Button>
        </div>

        {/* Message rassurant pour les enfants */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Tout va bien ! Tes progres sont sauvegardes.
        </p>
      </div>
    </div>
  );
}
