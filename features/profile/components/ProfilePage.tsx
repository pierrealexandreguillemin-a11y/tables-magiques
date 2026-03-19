'use client';

/**
 * ProfilePage Component - Tables Magiques
 * ISO/IEC 25010 - Page profil utilisateur
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ProfileSkeleton } from '@/components/effects/Skeleton';
import { useProfile } from '../hooks/useProfile';
import { StatsCard } from './StatsCard';
import { SessionHistory } from './SessionHistory';
import { ProgressChart } from './ProgressChart';

export function ProfilePage() {
  const {
    user,
    stats,
    modeStats,
    recentSessions,
    progress,
    badgeCount,
    isLoading,
    error,
  } = useProfile();

  // Etat de chargement
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <ProfileSkeleton />
        </div>
      </main>
    );
  }

  // Erreur ou non authentifie
  if (error || !user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {error || 'Connexion requise'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Connecte-toi pour voir ton profil
          </p>
          <Link href="/">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              Retour a l&apos;accueil
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 p-4 sm:p-8">
      {/* Header */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back button */}
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            ← Retour
          </Button>
        </Link>

        {/* User Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg animate-fade-up">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-3xl">
              🦄
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.username}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Membre depuis{' '}
                {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-up"
          style={{ '--delay': '0.2s' } as React.CSSProperties}
        >
          <StatsCard
            icon="🎮"
            label="Parties jouees"
            value={stats?.totalGames ?? 0}
            color="purple"
          />
          <StatsCard
            icon="✅"
            label="Réponses correctes"
            value={stats?.totalCorrect ?? 0}
            sublabel={`sur ${stats?.totalQuestions ?? 0}`}
            color="green"
          />
          <StatsCard
            icon="📊"
            label="Precision moyenne"
            value={`${stats?.averageAccuracy ?? 0}%`}
            color="blue"
          />
          <StatsCard
            icon="🏆"
            label="Badges gagnes"
            value={badgeCount}
            color="orange"
          />
        </div>

        {/* Mode Stats */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-up"
          style={{ '--delay': '0.3s' } as React.CSSProperties}
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📚</span>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Mode Entraînement
              </h2>
            </div>
            <div className="space-y-2 text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Parties</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {modeStats?.practice.totalGames ?? 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Précision</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {modeStats?.practice.averageAccuracy ?? 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Meilleur score</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {modeStats?.practice.bestScore ?? 0}/10
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🔥</span>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Mode Challenge
              </h2>
            </div>
            <div className="space-y-2 text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Parties</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {modeStats?.challenge.totalGames ?? 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Précision</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {modeStats?.challenge.averageAccuracy ?? 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Meilleur score</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {modeStats?.challenge.bestScore ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Chart */}
        <div
          className="animate-fade-up"
          style={{ '--delay': '0.4s' } as React.CSSProperties}
        >
          <ProgressChart
            tables={progress?.tables ?? []}
            isLoading={isLoading}
          />
        </div>

        {/* Session History */}
        <div
          className="animate-fade-up"
          style={{ '--delay': '0.5s' } as React.CSSProperties}
        >
          <SessionHistory sessions={recentSessions} isLoading={isLoading} />
        </div>
      </div>
    </main>
  );
}

export default ProfilePage;
