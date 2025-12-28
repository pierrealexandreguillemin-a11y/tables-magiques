/**
 * GameSection
 * ISO/IEC 25010 - SRP: Game settings only
 */

'use client';

import { Gamepad2 } from 'lucide-react';
import { SettingsSection } from '../SettingsSection';
import { SettingsToggle } from '../SettingsToggle';
import { SettingsSlider } from '../SettingsSlider';
import { SettingsSelect } from '../SettingsSelect';
import { DIFFICULTY_OPTIONS } from '../../constants';
import type { UserSettings as Settings } from '@/types/settings';

interface Props {
  settings: Settings;
  updateSetting: (path: string, value: unknown) => void;
}

export function GameSection({ settings, updateSetting }: Props) {
  return (
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
  );
}
