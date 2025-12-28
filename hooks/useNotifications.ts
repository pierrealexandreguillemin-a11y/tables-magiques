/**
 * useNotifications - PWA Notifications Hook
 * ISO/IEC 25010 - Push notifications for reminders and badges
 *
 * Features:
 * - Permission request with user-friendly flow
 * - Local notifications (no push server required)
 * - Daily reminder scheduling
 * - Badge unlock notifications
 */

'use client';

import { useState, useCallback } from 'react';

export type NotificationPermission = 'default' | 'granted' | 'denied';

/**
 * Extended notification options with vibration pattern
 */
interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[];
}

export interface UseNotificationsReturn {
  /** Whether notifications are supported */
  isSupported: boolean;
  /** Current permission status */
  permission: NotificationPermission;
  /** Whether permission is granted */
  isGranted: boolean;
  /** Request notification permission */
  requestPermission: () => Promise<boolean>;
  /** Show a local notification */
  showNotification: (
    title: string,
    options?: ExtendedNotificationOptions
  ) => void;
  /** Schedule a daily reminder */
  scheduleDailyReminder: (time: string, message: string) => void;
  /** Cancel all scheduled reminders */
  cancelReminders: () => void;
}

/**
 * Check if notifications are supported
 */
function checkSupport(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator
  );
}

/**
 * Get current permission status
 */
function getPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'default';
  }
  const perm = Notification.permission;
  // Type guard: ensure valid NotificationPermission
  if (perm === 'granted' || perm === 'denied' || perm === 'default') {
    return perm;
  }
  return 'default';
}

// Storage key for reminder settings
const REMINDER_KEY = 'tables-magiques-reminder';

interface ReminderSettings {
  time: string;
  message: string;
  enabled: boolean;
}

/**
 * Hook for PWA notifications
 *
 * @example
 * ```tsx
 * const { isGranted, requestPermission, showNotification } = useNotifications();
 *
 * const handleEnableNotifications = async () => {
 *   const granted = await requestPermission();
 *   if (granted) {
 *     showNotification('Notifications activees!', {
 *       body: 'Tu recevras des rappels pour t\'entrainer.',
 *       icon: '/icons/icon-192.png'
 *     });
 *   }
 * };
 * ```
 */
export function useNotifications(): UseNotificationsReturn {
  const [isSupported] = useState(checkSupport);
  // Lazy initialization of permission state
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    getPermission()
  );

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      // Type guard: ensure valid NotificationPermission
      if (result === 'granted' || result === 'denied' || result === 'default') {
        setPermission(result);
      }
      return result === 'granted';
    } catch {
      console.error('[useNotifications] Permission request failed');
      return false;
    }
  }, [isSupported]);

  // Show a local notification
  const showNotification = useCallback(
    (title: string, options?: ExtendedNotificationOptions) => {
      if (!isSupported || permission !== 'granted') return;

      const defaultOptions: ExtendedNotificationOptions = {
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-72.png',
        vibrate: [100, 50, 100],
        tag: 'tables-magiques',
        ...options,
      };

      // Use service worker for notifications when available
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((registration) => {
          // ServiceWorkerRegistration.showNotification accepts NotificationOptions
          // which includes vibrate in the spec, but TS types may lag behind
          const { vibrate: _v, ...swOptions } = defaultOptions;
          registration.showNotification(title, swOptions);
        });
      } else {
        // Fallback to direct notification (vibrate may not be supported)
        const { vibrate: _v, ...notificationOptions } = defaultOptions;
        new Notification(title, notificationOptions);
      }
    },
    [isSupported, permission]
  );

  // Schedule a daily reminder
  const scheduleDailyReminder = useCallback(
    (time: string, message: string) => {
      if (!isSupported) return;

      const settings: ReminderSettings = {
        time,
        message,
        enabled: true,
      };

      localStorage.setItem(REMINDER_KEY, JSON.stringify(settings));

      // Register with service worker
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SCHEDULE_REMINDER',
          payload: settings,
        });
      }
    },
    [isSupported]
  );

  // Cancel all scheduled reminders
  const cancelReminders = useCallback(() => {
    localStorage.removeItem(REMINDER_KEY);

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CANCEL_REMINDERS',
      });
    }
  }, []);

  return {
    isSupported,
    permission,
    isGranted: permission === 'granted',
    requestPermission,
    showNotification,
    scheduleDailyReminder,
    cancelReminders,
  };
}

export default useNotifications;
