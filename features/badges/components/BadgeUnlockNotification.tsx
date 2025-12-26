/**
 * BadgeUnlockNotification - Modal celebration deblocage badge
 * ISO/IEC 25010 - UI component
 */

'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { BadgeDefinition } from '@/types/badge';

export interface BadgeUnlockNotificationProps {
  badge?: BadgeDefinition;
  badges?: BadgeDefinition[];
  onClose: () => void;
}

export function BadgeUnlockNotification({
  badge,
  badges,
  onClose,
}: BadgeUnlockNotificationProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const allBadges = badges || (badge ? [badge] : []);
  const isMultiple = allBadges.length > 1;

  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  if (allBadges.length === 0) return null;

  // TypeScript type guard - après le check length === 0, on sait que [0] existe
  const firstBadge = allBadges[0]!;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-label="Nouveau badge debloque"
      aria-modal="true"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 300 }}
        className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-8 text-center text-white shadow-2xl max-w-sm mx-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {isMultiple ? (
            <div className="flex justify-center gap-2 text-6xl mb-4">
              {allBadges.map((b) => (
                <span key={b.id}>{b.emoji}</span>
              ))}
            </div>
          ) : (
            <span className="text-8xl block mb-4">{firstBadge.emoji}</span>
          )}
        </motion.div>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-bold mb-2"
        >
          {isMultiple
            ? `${allBadges.length} nouveaux badges!`
            : 'Nouveau badge!'}
        </motion.h2>

        {!isMultiple && (
          <>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl font-semibold mb-1"
            >
              {firstBadge.name}
            </motion.p>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-white/80"
            >
              {firstBadge.description}
            </motion.p>
          </>
        )}

        {isMultiple && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-1 mb-2"
          >
            {allBadges.map((b) => (
              <p key={b.id} className="text-sm">
                <span className="font-semibold">{b.name}</span>
              </p>
            ))}
          </motion.div>
        )}

        <motion.button
          ref={buttonRef}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          onClick={onClose}
          className="mt-6 px-8 py-3 bg-white text-purple-600 font-bold rounded-full shadow-lg hover:bg-purple-50 transition-colors focus:outline-none focus:ring-4 focus:ring-white/50"
        >
          Continuer
        </motion.button>
      </motion.div>
    </div>
  );
}
