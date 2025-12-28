/**
 * AudioSection
 * ISO/IEC 25010 - SRP: Audio settings only
 */

'use client';

import { Volume2, VolumeX } from 'lucide-react';
import { SettingsSection } from '../SettingsSection';
import { SettingsToggle } from '../SettingsToggle';
import { SettingsSlider } from '../SettingsSlider';
import type { UserSettings as Settings } from '@/types/settings';

interface Props {
  settings: Settings;
  updateSetting: (path: string, value: unknown) => void;
}

export function AudioSection({ settings, updateSetting }: Props) {
  return (
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
  );
}
