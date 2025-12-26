'use client';

/**
 * StatsCard Component - Tables Magiques
 * ISO/IEC 25010 - Carte statistiques utilisateur
 */

import { motion } from 'framer-motion';

export interface StatsCardProps {
  icon: string;
  label: string;
  value: string | number;
  sublabel?: string;
  color?: 'purple' | 'blue' | 'green' | 'orange' | 'pink';
}

const colorClasses = {
  purple: 'from-purple-500 to-purple-600',
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  orange: 'from-orange-500 to-orange-600',
  pink: 'from-pink-500 to-pink-600',
};

export function StatsCard({
  icon,
  label,
  value,
  sublabel,
  color = 'purple',
}: StatsCardProps) {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br ${colorClasses[color]} shadow-lg`}
      whileHover={{ scale: 1.02, y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />

      <div className="relative z-10">
        <div className="text-3xl mb-2">{icon}</div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm text-white/80">{label}</div>
        {sublabel && (
          <div className="text-xs text-white/60 mt-1">{sublabel}</div>
        )}
      </div>
    </motion.div>
  );
}

export default StatsCard;
