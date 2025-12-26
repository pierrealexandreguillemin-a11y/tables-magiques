/**
 * ThemeToggle - Bouton toggle dark/light mode
 * ISO/IEC 25010 - Accessibilite WCAG 2.1 AA
 */

'use client';

import { useTheme } from '@/hooks/useTheme';
import { motion } from 'framer-motion';

/**
 * Icone Soleil (mode light)
 */
function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      data-testid="sun-icon"
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
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

/**
 * Icone Lune (mode dark)
 */
function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      data-testid="moon-icon"
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
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

export interface ThemeToggleProps {
  className?: string;
}

/**
 * Bouton toggle theme avec animation
 * - Icone soleil/lune selon mode actuel
 * - Animation rotation au changement
 * - Accessible clavier + screen reader
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      data-testid="theme-toggle"
      className={`
        relative inline-flex items-center justify-center
        w-10 h-10 rounded-full
        bg-white/20 dark:bg-black/20
        backdrop-blur-sm
        border border-white/30 dark:border-white/10
        text-pink-600 dark:text-yellow-300
        hover:bg-white/30 dark:hover:bg-black/30
        focus:outline-none focus:ring-2 focus:ring-pink-400 dark:focus:ring-yellow-400
        transition-colors duration-200
        ${className ?? ''}
      `}
      aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {isDark ? (
          <MoonIcon className="w-5 h-5" />
        ) : (
          <SunIcon className="w-5 h-5" />
        )}
      </motion.div>
    </motion.button>
  );
}
