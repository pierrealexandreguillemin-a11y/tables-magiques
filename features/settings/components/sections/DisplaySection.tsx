/**
 * DisplaySection
 * ISO/IEC 25010 - SRP: Display settings only
 */

'use client';

import { Palette } from 'lucide-react';
import { SettingsSection } from '../SettingsSection';
import { SettingsSelect } from '../SettingsSelect';
import {
  THEME_OPTIONS,
  ACCENT_OPTIONS,
  DENSITY_OPTIONS,
} from '../../constants';
import type { UserSettings as Settings } from '@/types/settings';

interface Props {
  settings: Settings;
  updateSetting: (path: string, value: unknown) => void;
}

export function DisplaySection({ settings, updateSetting }: Props) {
  return (
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
  );
}
