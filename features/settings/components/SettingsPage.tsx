/**
 * SettingsPage - Thin Orchestrator
 * ISO/IEC 25010 - SRP: Orchestration only (<50 lines)
 */

'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useSettings } from '../hooks/useSettings';
import { useSettingsActions } from '../hooks/useSettingsActions';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SettingsPageSkeleton } from './SettingsPageSkeleton';
import {
  AccessibilitySection,
  AudioSection,
  DisplaySection,
  GameSection,
  NotificationsSection,
  PrivacySection,
  AboutSection,
} from './sections';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function SettingsPage() {
  const {
    settings,
    isLoading,
    updateSetting: updateSettingTyped,
    resetSettings,
    exportSettings,
    importSettings,
  } = useSettings();
  // Cast pour compatibilité avec sections - type interne géré par useSettings
  const updateSetting = updateSettingTyped as (
    path: string,
    value: unknown
  ) => void;
  const {
    showResetConfirm,
    importError,
    handleExport,
    handleImport,
    handleReset,
  } = useSettingsActions({ exportSettings, importSettings, resetSettings });
  const shouldAnimate = !useReducedMotion();

  if (isLoading) return <SettingsPageSkeleton />;

  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8 max-w-2xl mx-auto">
          <div className="w-10" />
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Parametres
          </h1>
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 dark:bg-slate-700 text-pink-600 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-slate-600 transition-colors"
            aria-label="Fermer"
          >
            <X size={20} />
          </Link>
        </div>
        <motion.div
          className="space-y-6 max-w-2xl mx-auto p-4"
          variants={shouldAnimate ? containerVariants : undefined}
          initial={shouldAnimate ? 'hidden' : undefined}
          animate="visible"
        >
          <motion.div variants={shouldAnimate ? itemVariants : undefined}>
            <AccessibilitySection
              settings={settings}
              updateSetting={updateSetting}
            />
          </motion.div>
          <motion.div variants={shouldAnimate ? itemVariants : undefined}>
            <AudioSection settings={settings} updateSetting={updateSetting} />
          </motion.div>
          <motion.div variants={shouldAnimate ? itemVariants : undefined}>
            <DisplaySection settings={settings} updateSetting={updateSetting} />
          </motion.div>
          <motion.div variants={shouldAnimate ? itemVariants : undefined}>
            <GameSection settings={settings} updateSetting={updateSetting} />
          </motion.div>
          <motion.div variants={shouldAnimate ? itemVariants : undefined}>
            <NotificationsSection
              settings={settings}
              updateSetting={updateSetting}
            />
          </motion.div>
          <motion.div variants={shouldAnimate ? itemVariants : undefined}>
            <PrivacySection settings={settings} updateSetting={updateSetting} />
          </motion.div>
          <motion.div variants={shouldAnimate ? itemVariants : undefined}>
            <AboutSection
              showResetConfirm={showResetConfirm}
              importError={importError}
              onExport={handleExport}
              onImport={handleImport}
              onReset={handleReset}
            />
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
