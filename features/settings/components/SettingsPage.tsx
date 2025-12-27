'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Volume2,
  VolumeX,
  Palette,
  Gamepad2,
  Bell,
  Shield,
  Info,
  Accessibility,
  RotateCcw,
  Download,
  Upload,
} from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { SettingsSection } from './SettingsSection';
import { SettingsToggle } from './SettingsToggle';
import { SettingsSlider } from './SettingsSlider';
import { SettingsSelect } from './SettingsSelect';
import { Skeleton } from '@/components/effects/Skeleton';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import type { ThemeMode, AccentColor, DifficultyLevel } from '@/types/settings';

// =============================================================================
// OPTIONS
// =============================================================================

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Clair' },
  { value: 'dark', label: 'Sombre' },
  { value: 'system', label: 'Systeme' },
];

const ACCENT_OPTIONS: { value: AccentColor; label: string }[] = [
  { value: 'pink', label: 'Rose' },
  { value: 'purple', label: 'Violet' },
  { value: 'blue', label: 'Bleu' },
  { value: 'green', label: 'Vert' },
  { value: 'orange', label: 'Orange' },
  { value: 'rainbow', label: 'Arc-en-ciel' },
];

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string }[] = [
  { value: 'easy', label: 'Facile' },
  { value: 'normal', label: 'Normal' },
  { value: 'hard', label: 'Difficile' },
];

const DENSITY_OPTIONS: {
  value: 'compact' | 'normal' | 'comfortable';
  label: string;
}[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'normal', label: 'Normal' },
  { value: 'comfortable', label: 'Confortable' },
];

// =============================================================================
// LOADING SKELETON
// =============================================================================

function SettingsPageSkeleton() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-2xl bg-white/80 dark:bg-slate-800/80 p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <Skeleton variant="circle" width={40} height={40} />
            <div className="space-y-2">
              <Skeleton variant="text" width={150} height={20} />
              <Skeleton variant="text" width={200} height={14} />
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton variant="text" width="100%" height={48} />
            <Skeleton variant="text" width="100%" height={48} />
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function SettingsPage() {
  const {
    settings,
    isLoading,
    updateSetting,
    resetSettings,
    exportSettings,
    importSettings,
  } = useSettings();

  const shouldAnimate = !useReducedMotion();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Handle export
  const handleExport = () => {
    const json = exportSettings();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tables-magiques-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle import
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const target = e.target;
      if (!(target instanceof HTMLInputElement)) return;
      const file = target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const success = importSettings(text);
        if (!success) {
          setImportError('Format de fichier invalide');
          setTimeout(() => setImportError(null), 3000);
        }
      } catch {
        setImportError('Erreur lors de la lecture du fichier');
        setTimeout(() => setImportError(null), 3000);
      }
    };
    input.click();
  };

  // Handle reset with confirmation
  const handleReset = () => {
    if (showResetConfirm) {
      resetSettings();
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 3000);
    }
  };

  if (isLoading) {
    return <SettingsPageSkeleton />;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="space-y-6 max-w-2xl mx-auto p-4"
      variants={shouldAnimate ? containerVariants : undefined}
      initial={shouldAnimate ? 'hidden' : undefined}
      animate="visible"
    >
      {/* Accessibility */}
      <motion.div variants={shouldAnimate ? itemVariants : undefined}>
        <SettingsSection
          title="Accessibilite"
          description="Animations, contraste, taille du texte"
          icon={<Accessibility size={20} />}
          testId="settings-accessibility"
        >
          <SettingsToggle
            label="Reduire les animations"
            description="Desactive les animations pour plus de confort"
            checked={settings.accessibility.reducedMotion}
            onChange={(v) => updateSetting('accessibility.reducedMotion', v)}
            testId="toggle-reduced-motion"
          />
          <SettingsToggle
            label="Contraste eleve"
            description="Augmente le contraste pour une meilleure lisibilite"
            checked={settings.accessibility.highContrast}
            onChange={(v) => updateSetting('accessibility.highContrast', v)}
            testId="toggle-high-contrast"
          />
          <SettingsSlider
            label="Taille du texte"
            description="Ajuste la taille de la police"
            value={settings.accessibility.textScale}
            onChange={(v) => updateSetting('accessibility.textScale', v)}
            min={0.8}
            max={1.5}
            step={0.1}
            formatValue={(v) => `${Math.round(v * 100)}%`}
            testId="slider-text-scale"
          />
        </SettingsSection>
      </motion.div>

      {/* Audio */}
      <motion.div variants={shouldAnimate ? itemVariants : undefined}>
        <SettingsSection
          title="Audio"
          description="Sons et musique"
          icon={
            settings.audio.soundEnabled ? (
              <Volume2 size={20} />
            ) : (
              <VolumeX size={20} />
            )
          }
          testId="settings-audio"
        >
          <SettingsToggle
            label="Sons d'interface"
            description="Jouer les sons lors des interactions"
            checked={settings.audio.soundEnabled}
            onChange={(v) => updateSetting('audio.soundEnabled', v)}
            testId="toggle-sound"
          />
          <SettingsSlider
            label="Volume des sons"
            value={Math.round(settings.audio.soundVolume * 100)}
            onChange={(v) => updateSetting('audio.soundVolume', v / 100)}
            min={0}
            max={100}
            step={5}
            unit="%"
            disabled={!settings.audio.soundEnabled}
            testId="slider-sound-volume"
          />
          <SettingsToggle
            label="Musique de fond"
            description="Jouer une musique relaxante"
            checked={settings.audio.musicEnabled}
            onChange={(v) => updateSetting('audio.musicEnabled', v)}
            testId="toggle-music"
          />
          <SettingsSlider
            label="Volume de la musique"
            value={Math.round(settings.audio.musicVolume * 100)}
            onChange={(v) => updateSetting('audio.musicVolume', v / 100)}
            min={0}
            max={100}
            step={5}
            unit="%"
            disabled={!settings.audio.musicEnabled}
            testId="slider-music-volume"
          />
        </SettingsSection>
      </motion.div>

      {/* Display */}
      <motion.div variants={shouldAnimate ? itemVariants : undefined}>
        <SettingsSection
          title="Affichage"
          description="Theme, couleurs, densite"
          icon={<Palette size={20} />}
          testId="settings-display"
        >
          <SettingsSelect
            label="Theme"
            description="Choisir l'apparence de l'application"
            value={settings.display.theme}
            onChange={(v) => updateSetting('display.theme', v)}
            options={THEME_OPTIONS}
            testId="select-theme"
          />
          <SettingsSelect
            label="Couleur d'accent"
            description="Couleur principale de l'interface"
            value={settings.display.accentColor}
            onChange={(v) => updateSetting('display.accentColor', v)}
            options={ACCENT_OPTIONS}
            testId="select-accent"
          />
          <SettingsSelect
            label="Densite"
            description="Espacement des elements"
            value={settings.display.density}
            onChange={(v) => updateSetting('display.density', v)}
            options={DENSITY_OPTIONS}
            testId="select-density"
          />
        </SettingsSection>
      </motion.div>

      {/* Game */}
      <motion.div variants={shouldAnimate ? itemVariants : undefined}>
        <SettingsSection
          title="Jeu"
          description="Difficulte, temps, questions"
          icon={<Gamepad2 size={20} />}
          testId="settings-game"
        >
          <SettingsSelect
            label="Difficulte"
            description="Niveau de difficulte des exercices"
            value={settings.game.difficulty}
            onChange={(v) => updateSetting('game.difficulty', v)}
            options={DIFFICULTY_OPTIONS}
            testId="select-difficulty"
          />
          <SettingsSlider
            label="Temps par question"
            description="En mode challenge"
            value={settings.game.timePerQuestion}
            onChange={(v) => updateSetting('game.timePerQuestion', v)}
            min={5}
            max={30}
            step={1}
            unit="s"
            testId="slider-time"
          />
          <SettingsSlider
            label="Questions par session"
            value={settings.game.questionsPerSession}
            onChange={(v) => updateSetting('game.questionsPerSession', v)}
            min={5}
            max={30}
            step={5}
            testId="slider-questions"
          />
          <SettingsToggle
            label="Afficher les indices"
            description="Aide visuelle pendant les exercices"
            checked={settings.game.showHints}
            onChange={(v) => updateSetting('game.showHints', v)}
            testId="toggle-hints"
          />
        </SettingsSection>
      </motion.div>

      {/* Notifications */}
      <motion.div variants={shouldAnimate ? itemVariants : undefined}>
        <SettingsSection
          title="Notifications"
          description="Rappels et alertes"
          icon={<Bell size={20} />}
          testId="settings-notifications"
        >
          <SettingsToggle
            label="Rappels quotidiens"
            description="Recevoir un rappel pour s'entrainer"
            checked={settings.notifications.dailyReminders}
            onChange={(v) => updateSetting('notifications.dailyReminders', v)}
            testId="toggle-reminders"
          />
          <SettingsToggle
            label="Badges debloques"
            description="Notification lors d'un nouveau badge"
            checked={settings.notifications.badgeUnlockNotifications}
            onChange={(v) =>
              updateSetting('notifications.badgeUnlockNotifications', v)
            }
            testId="toggle-badge-notif"
          />
        </SettingsSection>
      </motion.div>

      {/* Privacy */}
      <motion.div variants={shouldAnimate ? itemVariants : undefined}>
        <SettingsSection
          title="Confidentialite"
          description="Donnees et consentement"
          icon={<Shield size={20} />}
          testId="settings-privacy"
        >
          <SettingsToggle
            label="Statistiques anonymes"
            description="Aide a ameliorer l'application"
            checked={settings.privacy.analyticsEnabled}
            onChange={(v) => updateSetting('privacy.analyticsEnabled', v)}
            testId="toggle-analytics"
          />
          <SettingsToggle
            label="Partager ma progression"
            description="Visible par les parents/enseignants"
            checked={settings.privacy.shareProgress}
            onChange={(v) => updateSetting('privacy.shareProgress', v)}
            testId="toggle-share"
          />
        </SettingsSection>
      </motion.div>

      {/* About / Actions */}
      <motion.div variants={shouldAnimate ? itemVariants : undefined}>
        <SettingsSection
          title="A propos"
          description="Version, aide, donnees"
          icon={<Info size={20} />}
          testId="settings-about"
        >
          {/* App info */}
          <div className="flex justify-between items-center py-3 border-b border-pink-100/50 dark:border-slate-700/50">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Tables Magiques
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Version 1.0.0
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={handleExport}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium',
                'bg-pink-100 dark:bg-pink-900/30',
                'text-pink-700 dark:text-pink-300',
                'hover:bg-pink-200 dark:hover:bg-pink-900/50',
                'transition-colors'
              )}
            >
              <Download size={16} />
              Exporter
            </button>

            <button
              onClick={handleImport}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium',
                'bg-purple-100 dark:bg-purple-900/30',
                'text-purple-700 dark:text-purple-300',
                'hover:bg-purple-200 dark:hover:bg-purple-900/50',
                'transition-colors'
              )}
            >
              <Upload size={16} />
              Importer
            </button>

            <button
              onClick={handleReset}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium',
                'transition-colors',
                showResetConfirm
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              )}
            >
              <RotateCcw size={16} />
              {showResetConfirm ? 'Confirmer ?' : 'Reinitialiser'}
            </button>
          </div>

          {/* Import error */}
          {importError && (
            <p className="text-sm text-red-500 mt-2">{importError}</p>
          )}
        </SettingsSection>
      </motion.div>
    </motion.div>
  );
}
