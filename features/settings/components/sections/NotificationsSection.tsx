/**
 * NotificationsSection
 * ISO/IEC 25010 - SRP: Notification settings only
 */

'use client';

import { Bell, BellOff, BellRing } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { SettingsSection } from '../SettingsSection';
import { SettingsToggle } from '../SettingsToggle';
import type { UserSettings as Settings } from '@/types/settings';
import { cn } from '@/lib/utils';

interface Props {
  settings: Settings;
  updateSetting: (path: string, value: unknown) => void;
}

export function NotificationsSection({ settings, updateSetting }: Props) {
  const {
    isSupported,
    permission,
    isGranted,
    requestPermission,
    showNotification,
  } = useNotifications();

  const handleDailyRemindersChange = async (enabled: boolean) => {
    if (enabled && !isGranted) {
      const granted = await requestPermission();
      if (!granted) {
        return; // Don't enable if permission denied
      }
      // Show confirmation notification
      showNotification('Rappels actives !', {
        body: "Tu recevras un rappel quotidien pour t'entrainer.",
      });
    }
    updateSetting('notifications.dailyReminders', enabled);
  };

  const handleBadgeNotificationsChange = async (enabled: boolean) => {
    if (enabled && !isGranted) {
      const granted = await requestPermission();
      if (!granted) {
        return;
      }
    }
    updateSetting('notifications.badgeUnlockNotifications', enabled);
  };

  // Permission status display
  const getPermissionStatus = () => {
    if (!isSupported) {
      return {
        icon: <BellOff size={16} className="text-slate-400" />,
        text: 'Non supporte',
        color: 'text-slate-500',
      };
    }
    if (permission === 'granted') {
      return {
        icon: <BellRing size={16} className="text-green-500" />,
        text: 'Autorise',
        color: 'text-green-600 dark:text-green-400',
      };
    }
    if (permission === 'denied') {
      return {
        icon: <BellOff size={16} className="text-red-500" />,
        text: 'Bloque',
        color: 'text-red-600 dark:text-red-400',
      };
    }
    return {
      icon: <Bell size={16} className="text-yellow-500" />,
      text: 'Non demande',
      color: 'text-yellow-600 dark:text-yellow-400',
    };
  };

  const status = getPermissionStatus();

  return (
    <SettingsSection
      title="Notifications"
      description="Rappels et alertes"
      icon={<Bell size={20} />}
      testId="settings-notifications"
    >
      {/* Permission status */}
      <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-slate-100/50 dark:bg-slate-700/50 mb-3">
        {status.icon}
        <span className={cn('text-sm font-medium', status.color)}>
          {status.text}
        </span>
        {permission === 'denied' && (
          <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">
            Modifie dans les parametres du navigateur
          </span>
        )}
      </div>

      <SettingsToggle
        label="Rappels quotidiens"
        description="Recevoir un rappel pour s'entrainer"
        checked={settings.notifications.dailyReminders}
        onChange={handleDailyRemindersChange}
        disabled={!isSupported || permission === 'denied'}
        testId="toggle-reminders"
      />
      <SettingsToggle
        label="Badges debloques"
        description="Notification lors d'un nouveau badge"
        checked={settings.notifications.badgeUnlockNotifications}
        onChange={handleBadgeNotificationsChange}
        disabled={!isSupported || permission === 'denied'}
        testId="toggle-badge-notif"
      />
    </SettingsSection>
  );
}
