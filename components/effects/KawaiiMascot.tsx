'use client';

/**
 * KawaiiMascot Component - Tables Magiques
 * ISO/IEC 25010 - Illustrations interactives kawaii
 *
 * Features:
 * - Personnages mignons avec humeurs
 * - Feedback emotionnel pour enfants
 * - Animation douce au hover
 * - Support reduced motion
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Planet, Cat, Ghost, IceCream, Backpack } from 'react-kawaii';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import type { KawaiiMascotProps, KawaiiCharacter } from '@/types/effects';

/**
 * Type pour les moods react-kawaii
 */
type ReactKawaiiMood =
  | 'happy'
  | 'sad'
  | 'blissful'
  | 'lovestruck'
  | 'excited'
  | 'ko'
  | 'shocked';

/**
 * Type guard pour valider mood react-kawaii
 */
const VALID_MOOD_SET = new Set<string>([
  'happy',
  'sad',
  'blissful',
  'lovestruck',
  'excited',
  'ko',
  'shocked',
]);

function isValidMood(mood: string): mood is ReactKawaiiMood {
  return VALID_MOOD_SET.has(mood);
}

/**
 * Mapping des composants kawaii
 */
const KAWAII_COMPONENTS: Record<
  KawaiiCharacter,
  React.ComponentType<{
    size?: number | string;
    mood?: ReactKawaiiMood;
    color?: string;
  }>
> = {
  planet: Planet,
  cat: Cat,
  ghost: Ghost,
  iceCream: IceCream,
  backpack: Backpack,
};

/**
 * Couleurs par defaut par personnage
 */
const DEFAULT_COLORS: Record<KawaiiCharacter, string> = {
  planet: '#FFD93D',
  cat: '#FFB6C1',
  ghost: '#E8E8E8',
  iceCream: '#FFB6D9',
  backpack: '#87CEEB',
};

/**
 * Variants animation
 */
const containerVariants = {
  idle: { scale: 1, rotate: 0 },
  hover: {
    scale: 1.1,
    rotate: [-2, 2, -2, 0],
    transition: { rotate: { repeat: 0, duration: 0.4 } },
  },
  tap: { scale: 0.95 },
};

const reducedVariants = {
  idle: { scale: 1, rotate: 0 },
  hover: { scale: 1, rotate: 0 },
  tap: { scale: 1 },
};

/**
 * KawaiiMascot Component
 */
export const KawaiiMascot = memo(function KawaiiMascot({
  character = 'planet',
  mood = 'happy',
  size = 80,
  color,
  className,
}: KawaiiMascotProps) {
  const { shouldAnimate } = useReducedMotion();

  const KawaiiComponent = KAWAII_COMPONENTS[character];
  const finalColor = color || DEFAULT_COLORS[character];
  // Valide mood via type guard, fallback sur 'happy'
  const kawaiiMood: ReactKawaiiMood = isValidMood(mood) ? mood : 'happy';

  return (
    <motion.div
      className={cn(
        'inline-flex items-center justify-center cursor-pointer select-none',
        className
      )}
      variants={shouldAnimate ? containerVariants : reducedVariants}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      role="img"
      aria-label={`Mascotte ${character} avec humeur ${mood}`}
    >
      <KawaiiComponent size={size} mood={kawaiiMood} color={finalColor} />
    </motion.div>
  );
});

export default KawaiiMascot;
