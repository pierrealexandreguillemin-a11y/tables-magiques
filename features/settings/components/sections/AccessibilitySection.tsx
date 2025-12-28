/**
 * AccessibilitySection
 * ISO/IEC 25010 - SRP: Accessibility settings only
 */

'use client';

import { Accessibility } from 'lucide-react';
import { SettingsSection } from '../SettingsSection';
import { SettingsToggle } from '../SettingsToggle';
import { SettingsSlider } from '../SettingsSlider';
import type { UserSettings as Settings } from '@/types/settings';

interface Props {
  settings: Settings;
  updateSetting: (path: string, value: unknown) => void;
}

export function AccessibilitySection({ settings, updateSetting }: Props) {
  return (
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
  );
}
