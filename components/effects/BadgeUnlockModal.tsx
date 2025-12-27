'use client';

/**
 * BadgeUnlockModal - Modal de déblocage de badge
 * ISO/IEC 25010 - Célébration des accomplissements
 */

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useGsapEffects } from '@/hooks/useGsapEffects';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { LottieAnimation } from './LottieAnimation';
import { BadgeIcon, type BadgeId } from './BadgeIcon';
import { MagicButton } from './MagicButton';
import { GradientText } from './GradientText';
import { cn } from '@/lib/utils';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface BadgeUnlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badge: Badge | null;
}

const rarityColors = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 via-orange-500 to-red-500',
};

const rarityGlow = {
  common: 'shadow-gray-400/50',
  rare: 'shadow-blue-400/50',
  epic: 'shadow-purple-400/50',
  legendary: 'shadow-yellow-400/50',
};

export function BadgeUnlockModal({
  open,
  onOpenChange,
  badge,
}: BadgeUnlockModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const { confettiExplosion, badgeUnlock, glowPulse } = useGsapEffects();
  const { shouldAnimate } = useReducedMotion();

  useEffect(() => {
    if (open && badge && shouldAnimate) {
      // Lancer confetti
      if (containerRef.current) {
        confettiExplosion(containerRef.current, { count: 80 });
      }
      // Animation badge
      if (badgeRef.current) {
        badgeUnlock(badgeRef.current);
        const cleanup = glowPulse(badgeRef.current, {
          color: badge.rarity === 'legendary' ? '#ffd700' : '#ff69b4',
          intensity: 1.5,
        });
        return cleanup;
      }
    }
    return undefined;
  }, [open, badge, shouldAnimate, confettiExplosion, badgeUnlock, glowPulse]);

  if (!badge) return null;

  return (
    <AnimatePresence>
      {open && (
        <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                ref={containerRef}
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content asChild forceMount>
              <motion.div
                className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 text-center"
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  transition: { type: 'spring', stiffness: 200, damping: 20 },
                }}
                exit={{ opacity: 0, scale: 0.8, y: 30 }}
              >
                {/* Titre */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <LottieAnimation type="crown" size={60} />
                  <h2 className="text-2xl font-bold text-white mt-2">
                    Nouveau Badge !
                  </h2>
                </motion.div>

                {/* Badge */}
                <motion.div
                  ref={badgeRef}
                  className={cn(
                    'mx-auto my-8 w-32 h-32 rounded-full flex items-center justify-center',
                    'bg-gradient-to-br shadow-2xl',
                    rarityColors[badge.rarity],
                    rarityGlow[badge.rarity]
                  )}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{
                    scale: 1,
                    rotate: 0,
                    transition: { type: 'spring', stiffness: 150, delay: 0.3 },
                  }}
                >
                  <BadgeIcon
                    badgeId={badge.id as BadgeId}
                    size={64}
                    animate={true}
                  />
                </motion.div>

                {/* Nom et description */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <GradientText className="text-3xl font-bold mb-2">
                    {badge.name}
                  </GradientText>
                  <p className="text-white/80 text-lg max-w-xs mx-auto">
                    {badge.description}
                  </p>
                  <span
                    className={cn(
                      'inline-block mt-3 px-3 py-1 rounded-full text-sm font-medium',
                      'bg-gradient-to-r text-white',
                      rarityColors[badge.rarity]
                    )}
                  >
                    {badge.rarity.charAt(0).toUpperCase() +
                      badge.rarity.slice(1)}
                  </span>
                </motion.div>

                {/* Bouton */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-8"
                >
                  <MagicButton onClick={() => onOpenChange(false)}>
                    Continuer
                  </MagicButton>
                </motion.div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      )}
    </AnimatePresence>
  );
}

export default BadgeUnlockModal;
