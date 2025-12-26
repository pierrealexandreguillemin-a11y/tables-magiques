'use client';

/**
 * Offline Page - Tables Magiques
 * ISO/IEC 25010 - Page affichee quand l'utilisateur est hors ligne
 */

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-500 dark:from-indigo-900 dark:via-purple-900 dark:to-slate-900">
      <div className="text-center p-8">
        <div className="text-8xl mb-6">📡</div>

        <h1 className="text-4xl font-bold text-white mb-4">Hors ligne</h1>

        <p className="text-xl text-white/80 mb-8 max-w-md">
          Tu n&apos;es pas connecte a Internet. Reconnecte-toi pour continuer a
          jouer avec les tables magiques !
        </p>

        <button
          onClick={() => window.location.reload()}
          className="px-8 py-4 text-lg font-bold bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-sm transition-colors"
        >
          Reessayer
        </button>
      </div>
    </div>
  );
}
