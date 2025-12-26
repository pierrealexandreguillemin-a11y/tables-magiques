'use client';

/**
 * ProgressChart Component - Tables Magiques
 * ISO/IEC 25010 - Visualisation progression par table
 */

import { motion } from 'framer-motion';
import type { TableProgress } from '@/types/profile';

export interface ProgressChartProps {
  tables: TableProgress[];
  isLoading?: boolean;
}

function getProgressColor(accuracy: number, mastered: boolean): string {
  if (mastered) return 'bg-green-500';
  if (accuracy >= 70) return 'bg-yellow-500';
  if (accuracy > 0) return 'bg-orange-500';
  return 'bg-gray-300 dark:bg-gray-600';
}

function getProgressBg(accuracy: number, mastered: boolean): string {
  if (mastered) return 'bg-green-100 dark:bg-green-900/30';
  if (accuracy >= 70) return 'bg-yellow-100 dark:bg-yellow-900/30';
  if (accuracy > 0) return 'bg-orange-100 dark:bg-orange-900/30';
  return 'bg-gray-100 dark:bg-gray-800';
}

export function ProgressChart({ tables, isLoading }: ProgressChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
          Progression par table
        </h3>
        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className="h-20 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const masteredCount = tables.filter((t) => t.mastered).length;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Progression par table
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {masteredCount}/10 maitrisees
        </span>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {tables.map((table, index) => (
          <motion.div
            key={table.table}
            className={`relative p-3 rounded-xl text-center ${getProgressBg(
              table.accuracy,
              table.mastered
            )}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
          >
            {/* Badge maitrise */}
            {table.mastered && (
              <div className="absolute -top-2 -right-2 text-lg">⭐</div>
            )}

            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {table.table}
            </div>

            {/* Barre de progression */}
            <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${getProgressColor(table.accuracy, table.mastered)}`}
                initial={{ width: 0 }}
                animate={{ width: `${table.accuracy}%` }}
                transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
              />
            </div>

            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {table.accuracy > 0 ? `${table.accuracy}%` : '-'}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Legende */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-gray-600 dark:text-gray-400">Maitrise</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-gray-600 dark:text-gray-400">En cours</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600" />
          <span className="text-gray-600 dark:text-gray-400">
            Non travaille
          </span>
        </div>
      </div>
    </div>
  );
}

export default ProgressChart;
