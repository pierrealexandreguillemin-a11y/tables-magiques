/**
 * Tests Unitaires - useTheme Hook
 * ISO/IEC 29119 - TDD: Tests hook gestion theme dark/light
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '@/hooks/useTheme';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

// Mock matchMedia
const createMatchMedia = (matches: boolean) => {
  return vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('dark') ? matches : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

describe('useTheme Hook', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', localStorageMock);
    vi.stubGlobal('matchMedia', createMatchMedia(false));
    localStorageMock.clear();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('initialisation', () => {
    it('retourne theme light par defaut', () => {
      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('light');
    });

    it('retourne isDark false par defaut', () => {
      const { result } = renderHook(() => useTheme());

      expect(result.current.isDark).toBe(false);
    });

    it('charge theme depuis localStorage', () => {
      localStorageMock.getItem.mockReturnValueOnce('dark');

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('dark');
      expect(result.current.isDark).toBe(true);
    });

    it('detecte preference systeme dark', () => {
      vi.stubGlobal('matchMedia', createMatchMedia(true));

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('dark');
    });

    it('localStorage prioritaire sur system preference', () => {
      localStorageMock.getItem.mockReturnValueOnce('light');
      vi.stubGlobal('matchMedia', createMatchMedia(true));

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('light');
    });
  });

  describe('setTheme', () => {
    it('change vers dark', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe('dark');
      expect(result.current.isDark).toBe(true);
    });

    it('change vers light', () => {
      localStorageMock.getItem.mockReturnValueOnce('dark');
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme('light');
      });

      expect(result.current.theme).toBe('light');
      expect(result.current.isDark).toBe(false);
    });

    it('persiste dans localStorage', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme('dark');
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    it('ajoute classe dark au document', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme('dark');
      });

      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('retire classe dark pour light', () => {
      document.documentElement.classList.add('dark');
      localStorageMock.getItem.mockReturnValueOnce('dark');
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme('light');
      });

      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('toggleTheme', () => {
    it('toggle de light vers dark', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('dark');
    });

    it('toggle de dark vers light', () => {
      localStorageMock.getItem.mockReturnValueOnce('dark');
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('light');
    });
  });

  describe('system preference', () => {
    it('expose systemPreference', () => {
      vi.stubGlobal('matchMedia', createMatchMedia(true));

      const { result } = renderHook(() => useTheme());

      expect(result.current.systemPreference).toBe('dark');
    });

    it('systemPreference light quand pas de preference', () => {
      vi.stubGlobal('matchMedia', createMatchMedia(false));

      const { result } = renderHook(() => useTheme());

      expect(result.current.systemPreference).toBe('light');
    });
  });
});
