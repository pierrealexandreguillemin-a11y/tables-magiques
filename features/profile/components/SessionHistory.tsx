'use client';

/**
 * SessionHistory Component - Tables Magiques
 * ISO/IEC 25010 - Liste des sessions recentes
 */

import { motion } from 'framer-motion';
import type { SessionSummary } from '@/types/profile';

export interface SessionHistoryProps {
  sessions: SessionSummary[];
  isLoading?: boolean;
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getModeEmoji(mode: 'practice' | 'challenge'): string {
  return mode === 'practice' ? '📚' : '🔥';
}

function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 90) return 'text-green-500';
  if (accuracy >= 70) return 'text-yellow-500';
  return 'text-red-500';
}

export function SessionHistory({ sessions, isLoading }: SessionHistoryProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
          Sessions recentes
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
          Sessions recentes
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          Aucune session pour le moment. Commence a jouer !
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
        Sessions recentes
      </h3>
      <div className="space-y-3">
        {sessions.map((session, index) => (
          <motion.div
            key={session.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getModeEmoji(session.mode)}</span>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {session.mode === 'practice'
                    ? `Table de ${session.table}`
                    : 'Challenge'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(session.timestamp)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div
                className={`font-bold ${getAccuracyColor(session.accuracy)}`}
              >
                {session.accuracy}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {session.score}/{session.total}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default SessionHistory;
