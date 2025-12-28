'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface SettingsSectionProps {
  /** Section title */
  title: string;
  /** Optional description */
  description?: string;
  /** Icon name (lucide) */
  icon?: ReactNode;
  /** Section content */
  children: ReactNode;
  /** Additional class names */
  className?: string;
  /** Test ID */
  testId?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function SettingsSection({
  title,
  description,
  icon,
  children,
  className,
  testId,
}: SettingsSectionProps) {
  const shouldAnimate = !useReducedMotion();

  return (
    <motion.section
      data-testid={testId}
      className={cn(
        'rounded-2xl bg-white/80 dark:bg-slate-800/90',
        'backdrop-blur-sm shadow-lg shadow-pink-500/5',
        'border border-pink-200/30 dark:border-pink-400/30',
        'overflow-hidden',
        className
      )}
      initial={shouldAnimate ? { opacity: 0, y: 20 } : undefined}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div
        className={cn(
          'px-5 py-4 border-b border-pink-200/20 dark:border-pink-500/10',
          'bg-gradient-to-r from-pink-50/50 to-purple-50/50',
          'dark:from-slate-700/50 dark:to-slate-700/30'
        )}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-xl',
                'bg-gradient-to-br from-pink-400 to-purple-500',
                'text-white shadow-md shadow-pink-500/30'
              )}
            >
              {icon}
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">{children}</div>
    </motion.section>
  );
}
