/**
 * Hook useTheme - Gestion theme dark/light
 * ISO/IEC 25010 - Persistance localStorage + system preference
 */

import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

/**
 * Detecte la preference systeme (prefers-color-scheme)
 */
function getSystemPreference(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/**
 * Recupere le theme depuis localStorage ou system preference
 */
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }

  return getSystemPreference();
}

/**
 * Applique la classe dark au document
 */
function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;

  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export interface UseThemeReturn {
  theme: Theme;
  isDark: boolean;
  systemPreference: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

/**
 * Hook de gestion du theme dark/light
 * - Persistance localStorage
 * - Detection preference systeme
 * - Toggle et setTheme
 */
export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [systemPreference, setSystemPreference] =
    useState<Theme>(getSystemPreference);

  // Appliquer le theme au montage et changement
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Ecouter les changements de preference systeme
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return {
    theme,
    isDark: theme === 'dark',
    systemPreference,
    setTheme,
    toggleTheme,
  };
}
