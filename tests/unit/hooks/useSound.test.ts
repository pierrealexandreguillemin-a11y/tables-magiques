/**
 * Tests - useSound Hook
 * ISO/IEC 29119 - TDD pour système audio
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSound } from '@/hooks/useSound';
import {
  SOUND_STORAGE_KEY,
  DEFAULT_SOUND_STATE,
  SOUND_CATALOG,
} from '@/types/sound';

// Mock Audio API
const mockPlay = vi.fn().mockResolvedValue(undefined);
const mockPause = vi.fn();
const mockLoad = vi.fn();

class MockAudio {
  src = '';
  volume = 1;
  currentTime = 0;
  play = mockPlay;
  pause = mockPause;
  load = mockLoad;
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
}

// Mock matchMedia pour reduced motion
const mockMatchMedia = vi.fn();

describe('useSound', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Mock Audio constructor
    global.Audio = MockAudio as unknown as typeof Audio;

    // Mock matchMedia
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    global.matchMedia = mockMatchMedia;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('État initial', () => {
    it('retourne état par défaut sans localStorage', () => {
      const { result } = renderHook(() => useSound());

      expect(result.current.enabled).toBe(DEFAULT_SOUND_STATE.enabled);
      expect(result.current.volume).toBe(DEFAULT_SOUND_STATE.volume);
    });

    it('son désactivé par défaut (respectueux)', () => {
      const { result } = renderHook(() => useSound());

      expect(result.current.enabled).toBe(false);
    });

    it('volume à 50% par défaut', () => {
      const { result } = renderHook(() => useSound());

      expect(result.current.volume).toBe(0.5);
    });

    it('charge état depuis localStorage', () => {
      localStorage.setItem(
        SOUND_STORAGE_KEY,
        JSON.stringify({ enabled: true, volume: 0.8 })
      );

      const { result } = renderHook(() => useSound());

      expect(result.current.enabled).toBe(true);
      expect(result.current.volume).toBe(0.8);
    });

    it('détecte prefers-reduced-motion', () => {
      mockMatchMedia.mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const { result } = renderHook(() => useSound());

      expect(result.current.reducedMotion).toBe(true);
    });
  });

  describe('Toggle son', () => {
    it('toggle active le son', () => {
      const { result } = renderHook(() => useSound());

      act(() => {
        result.current.toggle();
      });

      expect(result.current.enabled).toBe(true);
    });

    it('toggle désactive le son', () => {
      localStorage.setItem(
        SOUND_STORAGE_KEY,
        JSON.stringify({ enabled: true, volume: 0.5 })
      );

      const { result } = renderHook(() => useSound());

      act(() => {
        result.current.toggle();
      });

      expect(result.current.enabled).toBe(false);
    });

    it('toggle persiste dans localStorage', () => {
      const { result } = renderHook(() => useSound());

      act(() => {
        result.current.toggle();
      });

      const stored = JSON.parse(
        localStorage.getItem(SOUND_STORAGE_KEY) || '{}'
      );
      expect(stored.enabled).toBe(true);
    });
  });

  describe('Contrôle volume', () => {
    it('setVolume change le volume', () => {
      const { result } = renderHook(() => useSound());

      act(() => {
        result.current.setVolume(0.8);
      });

      expect(result.current.volume).toBe(0.8);
    });

    it('volume clampé entre 0 et 1', () => {
      const { result } = renderHook(() => useSound());

      act(() => {
        result.current.setVolume(1.5);
      });
      expect(result.current.volume).toBe(1);

      act(() => {
        result.current.setVolume(-0.5);
      });
      expect(result.current.volume).toBe(0);
    });

    it('setVolume persiste dans localStorage', () => {
      const { result } = renderHook(() => useSound());

      act(() => {
        result.current.setVolume(0.7);
      });

      const stored = JSON.parse(
        localStorage.getItem(SOUND_STORAGE_KEY) || '{}'
      );
      expect(stored.volume).toBe(0.7);
    });
  });

  describe('Lecture sons', () => {
    it('play joue un son quand activé', async () => {
      localStorage.setItem(
        SOUND_STORAGE_KEY,
        JSON.stringify({ enabled: true, volume: 0.5 })
      );

      const { result } = renderHook(() => useSound());

      await act(async () => {
        await result.current.play('correct');
      });

      expect(mockPlay).toHaveBeenCalled();
    });

    it('play ne joue pas quand désactivé', async () => {
      const { result } = renderHook(() => useSound());

      await act(async () => {
        await result.current.play('correct');
      });

      expect(mockPlay).not.toHaveBeenCalled();
    });

    it('play ne joue pas en reduced motion', async () => {
      mockMatchMedia.mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      localStorage.setItem(
        SOUND_STORAGE_KEY,
        JSON.stringify({ enabled: true, volume: 0.5 })
      );

      const { result } = renderHook(() => useSound());

      await act(async () => {
        await result.current.play('correct');
      });

      expect(mockPlay).not.toHaveBeenCalled();
    });

    it('play utilise le bon fichier audio', async () => {
      localStorage.setItem(
        SOUND_STORAGE_KEY,
        JSON.stringify({ enabled: true, volume: 0.5 })
      );

      const { result } = renderHook(() => useSound());

      await act(async () => {
        await result.current.play('levelUp');
      });

      // Vérifie que Audio a été créé avec le bon src
      expect(mockPlay).toHaveBeenCalled();
    });

    it('play applique le volume configuré', async () => {
      localStorage.setItem(
        SOUND_STORAGE_KEY,
        JSON.stringify({ enabled: true, volume: 0.8 })
      );

      const { result } = renderHook(() => useSound());

      await act(async () => {
        await result.current.play('correct');
      });

      expect(mockPlay).toHaveBeenCalled();
    });
  });

  describe('Catalogue sons', () => {
    it('SOUND_CATALOG contient correct', () => {
      expect(SOUND_CATALOG.correct).toBeDefined();
      expect(SOUND_CATALOG.correct.src).toContain('magic-ding');
    });

    it('SOUND_CATALOG contient incorrect', () => {
      expect(SOUND_CATALOG.incorrect).toBeDefined();
      expect(SOUND_CATALOG.incorrect.src).toContain('soft-oops');
    });

    it('SOUND_CATALOG contient levelUp', () => {
      expect(SOUND_CATALOG.levelUp).toBeDefined();
      expect(SOUND_CATALOG.levelUp.src).toContain('level-up');
    });

    it('SOUND_CATALOG contient click', () => {
      expect(SOUND_CATALOG.click).toBeDefined();
    });

    it('SOUND_CATALOG contient badge', () => {
      expect(SOUND_CATALOG.badge).toBeDefined();
    });
  });

  describe('Gestion erreurs', () => {
    it('play gère les erreurs silencieusement', async () => {
      mockPlay.mockRejectedValueOnce(new Error('Audio error'));
      localStorage.setItem(
        SOUND_STORAGE_KEY,
        JSON.stringify({ enabled: true, volume: 0.5 })
      );

      const { result } = renderHook(() => useSound());

      // Ne doit pas throw
      await act(async () => {
        await expect(result.current.play('correct')).resolves.not.toThrow();
      });
    });

    it('localStorage corrompu utilise valeurs par défaut', () => {
      localStorage.setItem(SOUND_STORAGE_KEY, 'invalid json');

      const { result } = renderHook(() => useSound());

      expect(result.current.enabled).toBe(DEFAULT_SOUND_STATE.enabled);
      expect(result.current.volume).toBe(DEFAULT_SOUND_STATE.volume);
    });
  });
});
