/**
 * Tests unitaires - Settings Section Components
 * ISO 29119 - Tests composants UI sections parametres
 *
 * Covers:
 * - GameSection (was 20% coverage)
 * - AudioSection (was 40% coverage)
 * - DisplaySection (was 50% coverage)
 * - NotificationsSection (was 33% coverage)
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameSection } from '@/features/settings/components/sections/GameSection';
import { AudioSection } from '@/features/settings/components/sections/AudioSection';
import { DisplaySection } from '@/features/settings/components/sections/DisplaySection';
import { NotificationsSection } from '@/features/settings/components/sections/NotificationsSection';
import { useNotifications } from '@/hooks/useNotifications';
import type { UserSettings } from '@/types/settings';

// =============================================================================
// MOCKS
// =============================================================================

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: vi.fn(() => ({ shouldAnimate: true })),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      className,
      'data-testid': testId,
      ...rest
    }: React.HTMLAttributes<HTMLDivElement> & { 'data-testid'?: string }) => (
      <div className={className} data-testid={testId} {...rest}>
        {children}
      </div>
    ),
    section: ({
      children,
      className,
      'data-testid': testId,
      ...rest
    }: React.HTMLAttributes<HTMLElement> & { 'data-testid'?: string }) => (
      <section className={className} data-testid={testId} {...rest}>
        {children}
      </section>
    ),
    span: ({
      children,
      className,
      ...rest
    }: React.HTMLAttributes<HTMLSpanElement>) => (
      <span className={className} {...rest}>
        {children}
      </span>
    ),
    path: (props: React.SVGProps<SVGPathElement>) => <path {...props} />,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock('@/hooks/useNotifications', () => ({
  useNotifications: vi.fn(() => ({
    isSupported: true,
    permission: 'default' as const,
    isGranted: false,
    requestPermission: vi.fn().mockResolvedValue(true),
    showNotification: vi.fn(),
    scheduleDailyReminder: vi.fn(),
    cancelReminders: vi.fn(),
  })),
}));

// =============================================================================
// TEST FIXTURES
// =============================================================================

const defaultSettings: UserSettings = {
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    textScale: 1.0,
    screenReaderOptimized: false,
    animationSpeed: 1.0,
  },
  audio: {
    soundEnabled: false,
    soundVolume: 0.5,
    musicEnabled: false,
    musicVolume: 0.3,
  },
  display: {
    theme: 'system',
    accentColor: 'pink',
    density: 'normal',
  },
  game: {
    difficulty: 'normal',
    timePerQuestion: 10,
    questionsPerSession: 10,
    favoriteTables: [],
    showHints: true,
  },
  notifications: {
    dailyReminders: false,
    reminderTime: '17:00',
    badgeUnlockNotifications: true,
    appUpdatesNotifications: false,
  },
  privacy: {
    parentalConsent: false,
    consentDate: null,
    analyticsEnabled: false,
    shareProgress: false,
  },
};

const mockUseNotifications = vi.mocked(useNotifications);

function setNotificationsMock(
  overrides: Partial<ReturnType<typeof useNotifications>>
) {
  mockUseNotifications.mockReturnValue({
    isSupported: true,
    permission: 'default',
    isGranted: false,
    requestPermission: vi.fn().mockResolvedValue(true),
    showNotification: vi.fn(),
    scheduleDailyReminder: vi.fn(),
    cancelReminders: vi.fn(),
    ...overrides,
  });
}

// =============================================================================
// GAME SECTION TESTS
// =============================================================================

describe('GameSection', () => {
  let updateSetting: (path: string, value: unknown) => void;

  beforeEach(() => {
    updateSetting = vi.fn();
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <GameSection settings={defaultSettings} updateSetting={updateSetting} />
    );
    expect(screen.getByTestId('settings-game')).toBeInTheDocument();
  });

  it('shows the correct title', () => {
    render(
      <GameSection settings={defaultSettings} updateSetting={updateSetting} />
    );
    expect(screen.getByText('Jeu')).toBeInTheDocument();
  });

  it('shows the description', () => {
    render(
      <GameSection settings={defaultSettings} updateSetting={updateSetting} />
    );
    expect(
      screen.getByText('Difficulte, temps, questions')
    ).toBeInTheDocument();
  });

  it('renders the difficulty select', () => {
    render(
      <GameSection settings={defaultSettings} updateSetting={updateSetting} />
    );
    expect(screen.getByTestId('select-difficulty')).toBeInTheDocument();
  });

  it('renders the time per question slider', () => {
    render(
      <GameSection settings={defaultSettings} updateSetting={updateSetting} />
    );
    expect(screen.getByTestId('slider-time')).toBeInTheDocument();
  });

  it('renders the questions per session slider', () => {
    render(
      <GameSection settings={defaultSettings} updateSetting={updateSetting} />
    );
    expect(screen.getByTestId('slider-questions')).toBeInTheDocument();
  });

  it('renders the show hints toggle', () => {
    render(
      <GameSection settings={defaultSettings} updateSetting={updateSetting} />
    );
    expect(screen.getByTestId('toggle-hints')).toBeInTheDocument();
  });

  it('shows current difficulty value in select', () => {
    render(
      <GameSection settings={defaultSettings} updateSetting={updateSetting} />
    );
    const selectEl = screen
      .getByTestId('select-difficulty')
      .querySelector('select');
    expect(selectEl).toHaveValue('normal');
  });

  it('calls updateSetting when difficulty select changes', async () => {
    const user = userEvent.setup();
    render(
      <GameSection settings={defaultSettings} updateSetting={updateSetting} />
    );
    const selectEl = screen
      .getByTestId('select-difficulty')
      .querySelector('select');
    if (selectEl) {
      await user.selectOptions(selectEl, 'hard');
      expect(updateSetting).toHaveBeenCalledWith('game.difficulty', 'hard');
    }
  });

  it('calls updateSetting when show hints toggle is clicked', async () => {
    const user = userEvent.setup();
    render(
      <GameSection settings={defaultSettings} updateSetting={updateSetting} />
    );
    const toggle = screen.getByTestId('toggle-hints');
    const switchEl = toggle.querySelector('[role="switch"]');
    if (switchEl) {
      await user.click(switchEl);
      expect(updateSetting).toHaveBeenCalledWith('game.showHints', false);
    }
  });

  it('reflects showHints=false state on toggle', () => {
    const settingsWithHintsOff: UserSettings = {
      ...defaultSettings,
      game: { ...defaultSettings.game, showHints: false },
    };
    render(
      <GameSection
        settings={settingsWithHintsOff}
        updateSetting={updateSetting}
      />
    );
    const toggle = screen.getByTestId('toggle-hints');
    const switchEl = toggle.querySelector('[role="switch"]');
    expect(switchEl).toHaveAttribute('aria-checked', 'false');
  });

  it('calls updateSetting with easy when difficulty changed to easy', async () => {
    const user = userEvent.setup();
    render(
      <GameSection settings={defaultSettings} updateSetting={updateSetting} />
    );
    const selectEl = screen
      .getByTestId('select-difficulty')
      .querySelector('select');
    if (selectEl) {
      await user.selectOptions(selectEl, 'easy');
      expect(updateSetting).toHaveBeenCalledWith('game.difficulty', 'easy');
    }
  });
});

// =============================================================================
// AUDIO SECTION TESTS
// =============================================================================

describe('AudioSection', () => {
  let updateSetting: (path: string, value: unknown) => void;

  beforeEach(() => {
    updateSetting = vi.fn();
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <AudioSection settings={defaultSettings} updateSetting={updateSetting} />
    );
    expect(screen.getByTestId('settings-audio')).toBeInTheDocument();
  });

  it('shows the correct title', () => {
    render(
      <AudioSection settings={defaultSettings} updateSetting={updateSetting} />
    );
    expect(screen.getByText('Audio')).toBeInTheDocument();
  });

  it('shows the description', () => {
    render(
      <AudioSection settings={defaultSettings} updateSetting={updateSetting} />
    );
    expect(screen.getByText('Sons et musique')).toBeInTheDocument();
  });

  it('renders the sound toggle', () => {
    render(
      <AudioSection settings={defaultSettings} updateSetting={updateSetting} />
    );
    expect(screen.getByTestId('toggle-sound')).toBeInTheDocument();
  });

  it('renders the music toggle', () => {
    render(
      <AudioSection settings={defaultSettings} updateSetting={updateSetting} />
    );
    expect(screen.getByTestId('toggle-music')).toBeInTheDocument();
  });

  it('renders the sound volume slider', () => {
    render(
      <AudioSection settings={defaultSettings} updateSetting={updateSetting} />
    );
    expect(screen.getByTestId('slider-sound-volume')).toBeInTheDocument();
  });

  it('renders the music volume slider', () => {
    render(
      <AudioSection settings={defaultSettings} updateSetting={updateSetting} />
    );
    expect(screen.getByTestId('slider-music-volume')).toBeInTheDocument();
  });

  it('disables sound volume slider when sound is off', () => {
    render(
      <AudioSection settings={defaultSettings} updateSetting={updateSetting} />
    );
    // soundEnabled is false in defaultSettings
    const soundVolumeSlider = screen.getByTestId('slider-sound-volume');
    const inputEl = soundVolumeSlider.querySelector('input');
    expect(inputEl).toBeDisabled();
  });

  it('disables music volume slider when music is off', () => {
    render(
      <AudioSection settings={defaultSettings} updateSetting={updateSetting} />
    );
    // musicEnabled is false in defaultSettings
    const musicVolumeSlider = screen.getByTestId('slider-music-volume');
    const inputEl = musicVolumeSlider.querySelector('input');
    expect(inputEl).toBeDisabled();
  });

  it('enables sound volume slider when sound is on', () => {
    const settingsWithSoundOn: UserSettings = {
      ...defaultSettings,
      audio: { ...defaultSettings.audio, soundEnabled: true },
    };
    render(
      <AudioSection
        settings={settingsWithSoundOn}
        updateSetting={updateSetting}
      />
    );
    const soundVolumeSlider = screen.getByTestId('slider-sound-volume');
    const inputEl = soundVolumeSlider.querySelector('input');
    expect(inputEl).not.toBeDisabled();
  });

  it('enables music volume slider when music is on', () => {
    const settingsWithMusicOn: UserSettings = {
      ...defaultSettings,
      audio: { ...defaultSettings.audio, musicEnabled: true },
    };
    render(
      <AudioSection
        settings={settingsWithMusicOn}
        updateSetting={updateSetting}
      />
    );
    const musicVolumeSlider = screen.getByTestId('slider-music-volume');
    const inputEl = musicVolumeSlider.querySelector('input');
    expect(inputEl).not.toBeDisabled();
  });

  it('calls updateSetting when sound toggle is clicked', async () => {
    const user = userEvent.setup();
    render(
      <AudioSection settings={defaultSettings} updateSetting={updateSetting} />
    );
    const toggle = screen.getByTestId('toggle-sound');
    const switchEl = toggle.querySelector('[role="switch"]');
    if (switchEl) {
      await user.click(switchEl);
      expect(updateSetting).toHaveBeenCalledWith('audio.soundEnabled', true);
    }
  });

  it('calls updateSetting when music toggle is clicked', async () => {
    const user = userEvent.setup();
    render(
      <AudioSection settings={defaultSettings} updateSetting={updateSetting} />
    );
    const toggle = screen.getByTestId('toggle-music');
    const switchEl = toggle.querySelector('[role="switch"]');
    if (switchEl) {
      await user.click(switchEl);
      expect(updateSetting).toHaveBeenCalledWith('audio.musicEnabled', true);
    }
  });

  it('toggles sound off when it is currently on', async () => {
    const user = userEvent.setup();
    const settingsWithSoundOn: UserSettings = {
      ...defaultSettings,
      audio: { ...defaultSettings.audio, soundEnabled: true },
    };
    render(
      <AudioSection
        settings={settingsWithSoundOn}
        updateSetting={updateSetting}
      />
    );
    const toggle = screen.getByTestId('toggle-sound');
    const switchEl = toggle.querySelector('[role="switch"]');
    if (switchEl) {
      await user.click(switchEl);
      expect(updateSetting).toHaveBeenCalledWith('audio.soundEnabled', false);
    }
  });
});

// =============================================================================
// DISPLAY SECTION TESTS
// =============================================================================

describe('DisplaySection', () => {
  let updateSetting: (path: string, value: unknown) => void;

  beforeEach(() => {
    updateSetting = vi.fn();
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <DisplaySection
        settings={defaultSettings}
        updateSetting={updateSetting}
      />
    );
    expect(screen.getByTestId('settings-display')).toBeInTheDocument();
  });

  it('shows the correct title', () => {
    render(
      <DisplaySection
        settings={defaultSettings}
        updateSetting={updateSetting}
      />
    );
    expect(screen.getByText('Affichage')).toBeInTheDocument();
  });

  it('shows the description', () => {
    render(
      <DisplaySection
        settings={defaultSettings}
        updateSetting={updateSetting}
      />
    );
    expect(screen.getByText('Theme, couleurs, densite')).toBeInTheDocument();
  });

  it('renders the theme select', () => {
    render(
      <DisplaySection
        settings={defaultSettings}
        updateSetting={updateSetting}
      />
    );
    expect(screen.getByTestId('select-theme')).toBeInTheDocument();
  });

  it('renders the accent color select', () => {
    render(
      <DisplaySection
        settings={defaultSettings}
        updateSetting={updateSetting}
      />
    );
    expect(screen.getByTestId('select-accent')).toBeInTheDocument();
  });

  it('renders the density select', () => {
    render(
      <DisplaySection
        settings={defaultSettings}
        updateSetting={updateSetting}
      />
    );
    expect(screen.getByTestId('select-density')).toBeInTheDocument();
  });

  it('shows current theme value in select', () => {
    render(
      <DisplaySection
        settings={defaultSettings}
        updateSetting={updateSetting}
      />
    );
    const selectEl = screen.getByTestId('select-theme').querySelector('select');
    expect(selectEl).toHaveValue('system');
  });

  it('shows current accent color value in select', () => {
    render(
      <DisplaySection
        settings={defaultSettings}
        updateSetting={updateSetting}
      />
    );
    const selectEl = screen
      .getByTestId('select-accent')
      .querySelector('select');
    expect(selectEl).toHaveValue('pink');
  });

  it('shows current density value in select', () => {
    render(
      <DisplaySection
        settings={defaultSettings}
        updateSetting={updateSetting}
      />
    );
    const selectEl = screen
      .getByTestId('select-density')
      .querySelector('select');
    expect(selectEl).toHaveValue('normal');
  });

  it('calls updateSetting when theme select changes', async () => {
    const user = userEvent.setup();
    render(
      <DisplaySection
        settings={defaultSettings}
        updateSetting={updateSetting}
      />
    );
    const selectEl = screen.getByTestId('select-theme').querySelector('select');
    if (selectEl) {
      await user.selectOptions(selectEl, 'dark');
      expect(updateSetting).toHaveBeenCalledWith('display.theme', 'dark');
    }
  });

  it('calls updateSetting when accent color select changes', async () => {
    const user = userEvent.setup();
    render(
      <DisplaySection
        settings={defaultSettings}
        updateSetting={updateSetting}
      />
    );
    const selectEl = screen
      .getByTestId('select-accent')
      .querySelector('select');
    if (selectEl) {
      await user.selectOptions(selectEl, 'purple');
      expect(updateSetting).toHaveBeenCalledWith(
        'display.accentColor',
        'purple'
      );
    }
  });

  it('calls updateSetting when density select changes', async () => {
    const user = userEvent.setup();
    render(
      <DisplaySection
        settings={defaultSettings}
        updateSetting={updateSetting}
      />
    );
    const selectEl = screen
      .getByTestId('select-density')
      .querySelector('select');
    if (selectEl) {
      await user.selectOptions(selectEl, 'compact');
      expect(updateSetting).toHaveBeenCalledWith('display.density', 'compact');
    }
  });

  it('renders all theme options', () => {
    render(
      <DisplaySection
        settings={defaultSettings}
        updateSetting={updateSetting}
      />
    );
    expect(screen.getByText('Clair')).toBeInTheDocument();
    expect(screen.getByText('Sombre')).toBeInTheDocument();
    expect(screen.getByText('Systeme')).toBeInTheDocument();
  });

  it('renders all accent color options', () => {
    render(
      <DisplaySection
        settings={defaultSettings}
        updateSetting={updateSetting}
      />
    );
    expect(screen.getByText('Rose')).toBeInTheDocument();
    expect(screen.getByText('Violet')).toBeInTheDocument();
    expect(screen.getByText('Bleu')).toBeInTheDocument();
  });
});

// =============================================================================
// NOTIFICATIONS SECTION TESTS
// =============================================================================

describe('NotificationsSection', () => {
  let updateSetting: (path: string, value: unknown) => void;

  beforeEach(() => {
    updateSetting = vi.fn();
    vi.clearAllMocks();
    // Reset to default mock
    setNotificationsMock({});
  });

  it('renders without crashing', () => {
    render(
      <NotificationsSection
        settings={defaultSettings}
        updateSetting={updateSetting}
      />
    );
    expect(screen.getByTestId('settings-notifications')).toBeInTheDocument();
  });

  it('shows the correct title', () => {
    render(
      <NotificationsSection
        settings={defaultSettings}
        updateSetting={updateSetting}
      />
    );
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('shows the description', () => {
    render(
      <NotificationsSection
        settings={defaultSettings}
        updateSetting={updateSetting}
      />
    );
    expect(screen.getByText('Rappels et alertes')).toBeInTheDocument();
  });

  it('renders the daily reminders toggle', () => {
    render(
      <NotificationsSection
        settings={defaultSettings}
        updateSetting={updateSetting}
      />
    );
    expect(screen.getByTestId('toggle-reminders')).toBeInTheDocument();
  });

  it('renders the badge notifications toggle', () => {
    render(
      <NotificationsSection
        settings={defaultSettings}
        updateSetting={updateSetting}
      />
    );
    expect(screen.getByTestId('toggle-badge-notif')).toBeInTheDocument();
  });

  it('shows "Non demande" permission status when permission is default', () => {
    setNotificationsMock({ permission: 'default', isGranted: false });
    render(
      <NotificationsSection
        settings={defaultSettings}
        updateSetting={updateSetting}
      />
    );
    expect(screen.getByText('Non demande')).toBeInTheDocument();
  });

  it('shows "Autorise" permission status when permission is granted', () => {
    setNotificationsMock({ permission: 'granted', isGranted: true });
    render(
      <NotificationsSection
        settings={defaultSettings}
        updateSetting={updateSetting}
      />
    );
    expect(screen.getByText('Autorise')).toBeInTheDocument();
  });

  it('shows "Bloque" status when permission is denied', () => {
    setNotificationsMock({ permission: 'denied', isGranted: false });
    render(
      <NotificationsSection
        settings={defaultSettings}
        updateSetting={updateSetting}
      />
    );
    expect(screen.getByText('Bloque')).toBeInTheDocument();
  });

  it('shows "Non supporte" status when notifications not supported', () => {
    setNotificationsMock({
      isSupported: false,
      permission: 'default',
      isGranted: false,
    });
    render(
      <NotificationsSection
        settings={defaultSettings}
        updateSetting={updateSetting}
      />
    );
    expect(screen.getByText('Non supporte')).toBeInTheDocument();
  });

  it('disables reminders toggle when notifications not supported', () => {
    setNotificationsMock({
      isSupported: false,
      permission: 'default',
      isGranted: false,
    });
    render(
      <NotificationsSection
        settings={defaultSettings}
        updateSetting={updateSetting}
      />
    );
    const toggle = screen.getByTestId('toggle-reminders');
    const switchEl = toggle.querySelector('[role="switch"]');
    expect(switchEl).toBeDisabled();
  });

  it('disables reminders toggle when permission is denied', () => {
    setNotificationsMock({
      isSupported: true,
      permission: 'denied',
      isGranted: false,
    });
    render(
      <NotificationsSection
        settings={defaultSettings}
        updateSetting={updateSetting}
      />
    );
    const toggle = screen.getByTestId('toggle-reminders');
    const switchEl = toggle.querySelector('[role="switch"]');
    expect(switchEl).toBeDisabled();
  });

  it('disables badge notif toggle when notifications not supported', () => {
    setNotificationsMock({
      isSupported: false,
      permission: 'default',
      isGranted: false,
    });
    render(
      <NotificationsSection
        settings={defaultSettings}
        updateSetting={updateSetting}
      />
    );
    const toggle = screen.getByTestId('toggle-badge-notif');
    const switchEl = toggle.querySelector('[role="switch"]');
    expect(switchEl).toBeDisabled();
  });

  it('calls updateSetting when reminders toggle is clicked and permission is granted', async () => {
    const user = userEvent.setup();
    setNotificationsMock({ permission: 'granted', isGranted: true });
    render(
      <NotificationsSection
        settings={defaultSettings}
        updateSetting={updateSetting}
      />
    );
    const toggle = screen.getByTestId('toggle-reminders');
    const switchEl = toggle.querySelector('[role="switch"]');
    if (switchEl) {
      await user.click(switchEl);
      expect(updateSetting).toHaveBeenCalledWith(
        'notifications.dailyReminders',
        true
      );
    }
  });

  it('calls updateSetting when badge toggle is clicked and permission is granted', async () => {
    const user = userEvent.setup();
    const settingsWithBadgeOff: UserSettings = {
      ...defaultSettings,
      notifications: {
        ...defaultSettings.notifications,
        badgeUnlockNotifications: false,
      },
    };
    setNotificationsMock({ permission: 'granted', isGranted: true });
    render(
      <NotificationsSection
        settings={settingsWithBadgeOff}
        updateSetting={updateSetting}
      />
    );
    const toggle = screen.getByTestId('toggle-badge-notif');
    const switchEl = toggle.querySelector('[role="switch"]');
    if (switchEl) {
      await user.click(switchEl);
      expect(updateSetting).toHaveBeenCalledWith(
        'notifications.badgeUnlockNotifications',
        true
      );
    }
  });

  it('shows browser settings hint when permission is denied', () => {
    setNotificationsMock({ permission: 'denied', isGranted: false });
    render(
      <NotificationsSection
        settings={defaultSettings}
        updateSetting={updateSetting}
      />
    );
    expect(
      screen.getByText('Modifie dans les parametres du navigateur')
    ).toBeInTheDocument();
  });

  it('does not show browser settings hint when permission is default', () => {
    setNotificationsMock({ permission: 'default', isGranted: false });
    render(
      <NotificationsSection
        settings={defaultSettings}
        updateSetting={updateSetting}
      />
    );
    expect(
      screen.queryByText('Modifie dans les parametres du navigateur')
    ).not.toBeInTheDocument();
  });
});
