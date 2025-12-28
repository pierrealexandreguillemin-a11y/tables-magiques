/**
 * useHighContrast - Hook pour detecter le mode contraste eleve
 * ISO/IEC 25010 - Accessibilite WCAG 2.2 AAA
 */

'use client';

import { useState, useEffect } from 'react';

export interface UseHighContrastResult {
  /** Mode contraste eleve actif */
  isHighContrast: boolean;
  /** Couleur texte adaptee */
  textColor: string;
  /** Couleur fond adaptee */
  backgroundColor: string;
  /** Style bordure adaptee */
  borderStyle: string;
}

/**
 * Hook pour detecter prefers-contrast: high
 *
 * @example
 * ```tsx
 * const { isHighContrast, borderStyle } = useHighContrast();
 * return <div style={{ border: isHighContrast ? borderStyle : 'none' }}>...</div>;
 * ```
 */
export function useHighContrast(): UseHighContrastResult {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check high contrast preference
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Defer initial state to avoid cascading renders (ESLint react-hooks/set-state-in-effect)
    const timer = setTimeout(() => {
      setIsHighContrast(contrastQuery.matches);
      setIsDark(darkQuery.matches);
    }, 0);

    const handleContrastChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };

    const handleDarkChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
    };

    contrastQuery.addEventListener('change', handleContrastChange);
    darkQuery.addEventListener('change', handleDarkChange);

    return () => {
      clearTimeout(timer);
      contrastQuery.removeEventListener('change', handleContrastChange);
      darkQuery.removeEventListener('change', handleDarkChange);
    };
  }, []);

  // Compute colors based on contrast + dark mode
  const textColor = isHighContrast
    ? isDark
      ? '#ffffff'
      : '#000000'
    : 'inherit';

  const backgroundColor = isHighContrast
    ? isDark
      ? '#000000'
      : '#ffffff'
    : 'inherit';

  const borderStyle = isHighContrast
    ? isDark
      ? '2px solid #ffffff'
      : '2px solid #000000'
    : 'none';

  return {
    isHighContrast,
    textColor,
    backgroundColor,
    borderStyle,
  };
}

export default useHighContrast;
