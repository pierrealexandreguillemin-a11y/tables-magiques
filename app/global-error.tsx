'use client';

/**
 * Global Error Boundary - Tables Magiques
 * ISO/IEC 25010 - Reliability (Critical Error Recovery)
 *
 * Capture les erreurs dans le root layout (html/body)
 * DOIT inclure ses propres <html>/<body> tags
 * Design minimaliste (CSS inline pour fiabilite)
 */

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log l'erreur (pas de reportUIError car le contexte peut etre casse)
    console.error('[GlobalError]', error);

    // Essayer d'envoyer l'erreur directement
    try {
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errors: [
            {
              id: `global_${Date.now()}`,
              message: error.message,
              type: 'ui',
              severity: 'critical',
              stack: error.stack,
              context: { global: true, digest: error.digest },
              url:
                typeof window !== 'undefined'
                  ? window.location.href
                  : undefined,
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      }).catch(() => {
        // Silently fail
      });
    } catch {
      // Silently fail
    }
  }, [error]);

  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #fdf2f8 0%, #f3e8ff 100%)',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: '400px',
            padding: '32px',
            textAlign: 'center',
          }}
        >
          {/* Mascotte */}
          <div
            style={{
              fontSize: '80px',
              marginBottom: '24px',
            }}
            role="img"
            aria-label="Licorne fatiguee"
          >
            🦄
          </div>

          <h1
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '12px',
            }}
          >
            Oh non ! Un probleme magique...
          </h1>

          <p
            style={{
              fontSize: '16px',
              color: '#6b7280',
              marginBottom: '24px',
              lineHeight: 1.5,
            }}
          >
            La licorne a besoin de se reposer un peu.
            <br />
            Essaie de recharger la page !
          </p>

          {/* Boutons */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <button
              onClick={reset}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'white',
                background: 'linear-gradient(90deg, #ec4899, #a855f7)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Reessayer
            </button>

            <button
              onClick={() => (window.location.href = '/')}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#6b7280',
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Retour a l&apos;accueil
            </button>
          </div>

          {/* Info technique en dev */}
          {process.env.NODE_ENV === 'development' && (
            <div
              style={{
                marginTop: '24px',
                padding: '16px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                textAlign: 'left',
              }}
            >
              <p
                style={{
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  color: '#b91c1c',
                  wordBreak: 'break-word',
                  margin: 0,
                }}
              >
                {error.message}
              </p>
              {error.digest && (
                <p
                  style={{
                    fontSize: '11px',
                    color: '#dc2626',
                    marginTop: '8px',
                    marginBottom: 0,
                  }}
                >
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
