/**
 * SoundToggle - Bouton toggle son on/off
 * ISO/IEC 25010 - Accessibilité WCAG 2.1 AA
 */

'use client';

import { motion } from 'framer-motion';
import { useSound } from '@/hooks/useSound';

/**
 * Icône Volume On
 */
function VolumeOnIcon({ className }: { className?: string }) {
  return (
    <svg
      data-testid="volume-on-icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

/**
 * Icône Volume Off
 */
function VolumeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      data-testid="volume-off-icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="22" y1="9" x2="16" y2="15" />
      <line x1="16" y1="9" x2="22" y2="15" />
    </svg>
  );
}

export interface SoundToggleProps {
  className?: string;
}

/**
 * Bouton toggle son avec animation
 * - Icône volume on/off selon état
 * - Animation scale au changement
 * - Accessible clavier + screen reader
 */
export function SoundToggle({ className }: SoundToggleProps) {
  const { enabled, toggle, reducedMotion } = useSound();

  return (
    <motion.button
      type="button"
      onClick={toggle}
      data-testid="sound-toggle"
      className={`
        relative inline-flex items-center justify-center
        w-10 h-10 rounded-full
        bg-white/20 dark:bg-black/20
        backdrop-blur-sm
        border border-white/30 dark:border-white/10
        text-purple-600 dark:text-purple-300
        hover:bg-white/30 dark:hover:bg-black/30
        focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-400
        transition-colors duration-200
        ${reducedMotion ? 'opacity-50' : ''}
        ${className ?? ''}
      `}
      aria-label={enabled ? 'Désactiver le son' : 'Activer le son'}
      aria-pressed={enabled}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        initial={false}
        animate={{ scale: enabled ? 1 : 0.9 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        {enabled ? (
          <VolumeOnIcon className="w-5 h-5" />
        ) : (
          <VolumeOffIcon className="w-5 h-5" />
        )}
      </motion.div>
    </motion.button>
  );
}

export default SoundToggle;
