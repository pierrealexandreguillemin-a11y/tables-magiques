/**
 * PrivacySection
 * ISO/IEC 25010 - SRP: Privacy settings only
 */

'use client';

import { Shield } from 'lucide-react';
import { SettingsSection } from '../SettingsSection';
import { SettingsToggle } from '../SettingsToggle';
import type { UserSettings as Settings } from '@/types/settings';

interface Props {
  settings: Settings;
  updateSetting: (path: string, value: unknown) => void;
}

export function PrivacySection({ settings, updateSetting }: Props) {
  return (
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
    </SettingsSection>
  );
}
