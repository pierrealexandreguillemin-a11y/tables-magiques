/**
 * AuthGate - Wrapper pour pages protégées
 * ISO/IEC 25010 - Protection avec UX bienveillante
 *
 * Affiche le contenu si authentifié, sinon affiche AuthGateModal
 * avec le contenu visible en arrière-plan (effet teaser).
 */

'use client';

import { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AuthGateModal } from './AuthGateModal';

export interface AuthGateProps {
  /** Contenu protégé à afficher */
  children: ReactNode;
  /** Message personnalisé pour le modal */
  message?: string;
  /** Callback mode invité - si fourni, active le mode invité */
  onGuestMode?: () => void;
  /** Désactiver le mode invité */
  disableGuestMode?: boolean;
  /** Afficher un loader pendant la vérification */
  showLoader?: boolean;
}

export function AuthGate({
  children,
  message,
  onGuestMode,
  disableGuestMode = false,
  showLoader = true,
}: AuthGateProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Loading state
  if (isLoading && showLoader) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-400 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900">
        <div className="text-center text-white">
          <div className="text-4xl mb-4 animate-bounce">🦄</div>
          <p className="text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  // Authentifié - afficher le contenu normalement
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Non authentifié - afficher le contenu avec le modal par-dessus
  return (
    <>
      {/* Contenu en arrière-plan (effet teaser) avec blur */}
      <div
        className="pointer-events-none select-none"
        style={{ filter: 'blur(4px)' }}
      >
        {children}
      </div>

      {/* Modal d'authentification */}
      <AuthGateModal
        message={message}
        onGuestMode={onGuestMode}
        disableGuestMode={disableGuestMode}
      />
    </>
  );
}

export default AuthGate;
