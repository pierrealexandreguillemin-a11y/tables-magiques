/**
 * Tests Unitaires - useInstallPrompt Hook
 * ISO/IEC 29119 - TDD: Tests AVANT implementation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

// Mock BeforeInstallPromptEvent
interface MockBeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function createMockEvent(
  outcome: 'accepted' | 'dismissed' = 'accepted'
): MockBeforeInstallPromptEvent {
  const event = new Event(
    'beforeinstallprompt'
  ) as MockBeforeInstallPromptEvent;
  event.prompt = vi.fn().mockResolvedValue(undefined);
  event.userChoice = Promise.resolve({ outcome });
  return event;
}

describe('useInstallPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('etat initial', () => {
    it('isInstallable est false par defaut', () => {
      const { result } = renderHook(() => useInstallPrompt());

      expect(result.current.isInstallable).toBe(false);
    });

    it('isInstalled est false par defaut', () => {
      const { result } = renderHook(() => useInstallPrompt());

      expect(result.current.isInstalled).toBe(false);
    });

    it('promptInstall est une fonction', () => {
      const { result } = renderHook(() => useInstallPrompt());

      expect(typeof result.current.promptInstall).toBe('function');
    });
  });

  describe('beforeinstallprompt event', () => {
    it('isInstallable devient true quand event beforeinstallprompt', () => {
      const { result } = renderHook(() => useInstallPrompt());

      act(() => {
        const event = createMockEvent();
        window.dispatchEvent(event);
      });

      expect(result.current.isInstallable).toBe(true);
    });

    it('stocke le deferredPrompt', () => {
      const { result } = renderHook(() => useInstallPrompt());

      act(() => {
        const event = createMockEvent();
        window.dispatchEvent(event);
      });

      // Le prompt devrait etre disponible via promptInstall
      expect(result.current.promptInstall).toBeDefined();
    });
  });

  describe('promptInstall', () => {
    it('appelle prompt() sur deferredPrompt', async () => {
      const { result } = renderHook(() => useInstallPrompt());
      const mockEvent = createMockEvent('accepted');

      act(() => {
        window.dispatchEvent(mockEvent);
      });

      await act(async () => {
        await result.current.promptInstall();
      });

      expect(mockEvent.prompt).toHaveBeenCalledTimes(1);
    });

    it('retourne true si utilisateur accepte', async () => {
      const { result } = renderHook(() => useInstallPrompt());
      const mockEvent = createMockEvent('accepted');

      act(() => {
        window.dispatchEvent(mockEvent);
      });

      let accepted: boolean | undefined;
      await act(async () => {
        accepted = await result.current.promptInstall();
      });

      expect(accepted).toBe(true);
    });

    it('retourne false si utilisateur refuse', async () => {
      const { result } = renderHook(() => useInstallPrompt());
      const mockEvent = createMockEvent('dismissed');

      act(() => {
        window.dispatchEvent(mockEvent);
      });

      let accepted: boolean | undefined;
      await act(async () => {
        accepted = await result.current.promptInstall();
      });

      expect(accepted).toBe(false);
    });

    it('isInstallable devient false apres prompt', async () => {
      const { result } = renderHook(() => useInstallPrompt());
      const mockEvent = createMockEvent('accepted');

      act(() => {
        window.dispatchEvent(mockEvent);
      });

      await act(async () => {
        await result.current.promptInstall();
      });

      expect(result.current.isInstallable).toBe(false);
    });

    it('retourne false si pas de deferredPrompt', async () => {
      const { result } = renderHook(() => useInstallPrompt());

      let accepted: boolean | undefined;
      await act(async () => {
        accepted = await result.current.promptInstall();
      });

      expect(accepted).toBe(false);
    });
  });

  describe('appinstalled event', () => {
    it('isInstalled devient true apres installation', () => {
      const { result } = renderHook(() => useInstallPrompt());

      act(() => {
        window.dispatchEvent(new Event('appinstalled'));
      });

      expect(result.current.isInstalled).toBe(true);
    });

    it('isInstallable devient false apres installation', () => {
      const { result } = renderHook(() => useInstallPrompt());

      // D'abord rendre installable
      act(() => {
        window.dispatchEvent(createMockEvent());
      });

      expect(result.current.isInstallable).toBe(true);

      // Puis installer
      act(() => {
        window.dispatchEvent(new Event('appinstalled'));
      });

      expect(result.current.isInstallable).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('retire les event listeners au unmount', () => {
      const addSpy = vi.spyOn(window, 'addEventListener');
      const removeSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useInstallPrompt());

      expect(addSpy).toHaveBeenCalledWith(
        'beforeinstallprompt',
        expect.any(Function)
      );
      expect(addSpy).toHaveBeenCalledWith('appinstalled', expect.any(Function));

      unmount();

      expect(removeSpy).toHaveBeenCalledWith(
        'beforeinstallprompt',
        expect.any(Function)
      );
      expect(removeSpy).toHaveBeenCalledWith(
        'appinstalled',
        expect.any(Function)
      );
    });
  });
});
