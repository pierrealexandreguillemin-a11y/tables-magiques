/**
 * NotificationsSection
 * ISO/IEC 25010 - SRP: Notification settings only
 */

'use client';

import { Bell } from 'lucide-react';
import { SettingsSection } from '../SettingsSection';
import { SettingsToggle } from '../SettingsToggle';
import type { UserSettings as Settings } from '@/types/settings';

interface Props {
  settings: Settings;
  updateSetting: (path: string, value: unknown) => void;
}

export function NotificationsSection({ settings, updateSetting }: Props) {
  return (
    <SettingsSection
      title="Notifications"
      description="Rappels et alertes"
      icon={<Bell size={20} />}
      testId="settings-notifications"
    >
      <SettingsToggle
        label="Rappels quotidiens"
        description="Recevoir un rappel pour s'entraîner"
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
  );
}
