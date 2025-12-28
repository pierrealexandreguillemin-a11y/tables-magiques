/**
 * Settings Constants
 * ISO/IEC 25010 - SRP: Constants only
 */

import type { ThemeMode, AccentColor, DifficultyLevel } from '@/types/settings';

export const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Clair' },
  { value: 'dark', label: 'Sombre' },
  { value: 'system', label: 'Systeme' },
];

export const ACCENT_OPTIONS: { value: AccentColor; label: string }[] = [
  { value: 'pink', label: 'Rose' },
  { value: 'purple', label: 'Violet' },
  { value: 'blue', label: 'Bleu' },
  { value: 'green', label: 'Vert' },
  { value: 'orange', label: 'Orange' },
  { value: 'rainbow', label: 'Arc-en-ciel' },
];

export const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string }[] = [
  { value: 'easy', label: 'Facile' },
  { value: 'normal', label: 'Normal' },
  { value: 'hard', label: 'Difficile' },
];

export const DENSITY_OPTIONS: {
  value: 'compact' | 'normal' | 'comfortable';
  label: string;
}[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'normal', label: 'Normal' },
  { value: 'comfortable', label: 'Confortable' },
];
