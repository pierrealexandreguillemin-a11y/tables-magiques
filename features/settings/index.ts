/**
 * Feature Settings - Export Public
 * ISO/IEC 25010 - Encapsulation feature
 */

// API
export {
  loadSettings,
  saveSettings,
  clearSettings,
  exportSettingsToJson,
  importSettingsFromJson,
  getInitialSettings,
  mergeWithDefaults,
  migrateSettings,
  isStoredSettings,
  isSettingsCategory,
} from './api/settingsStorage';

// Hooks
export { useSettings } from './hooks/useSettings';

// Components
export { SettingsPage } from './components/SettingsPage';
export { SettingsSection } from './components/SettingsSection';
export { SettingsToggle } from './components/SettingsToggle';
export { SettingsSlider } from './components/SettingsSlider';
export { SettingsSelect } from './components/SettingsSelect';
