/**
 * useSound Hook - Système audio
 * ISO/IEC 25010 - Feedback audio pour enfants
 *
 * Principes:
 * - Son OFF par défaut (respectueux)
 * - Volume 50% par défaut
 * - Respect prefers-reduced-motion
 * - Persistance localStorage
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  SoundType,
  SoundState,
  SOUND_CATALOG,
  SOUND_STORAGE_KEY,
  DEFAULT_SOUND_STATE,
} from '@/types/sound';

/**
 * Interface retournée par useSound
 */
export interface UseSoundReturn extends SoundState {
  /** Jouer un son */
  play: (type: SoundType) => Promise<void>;
  /** Toggle activation son */
  toggle: () => void;
  /** Définir le volume (0-1) */
  setVolume: (volume: number) => void;
}

/**
 * Charge l'état depuis localStorage
 */
function loadSoundState(): SoundState {
  if (typeof window === 'undefined') {
    return DEFAULT_SOUND_STATE;
  }

  try {
    const stored = localStorage.getItem(SOUND_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        enabled: Boolean(parsed.enabled),
        volume: typeof parsed.volume === 'number' ? parsed.volume : 0.5,
        reducedMotion: false, // Sera mis à jour par useEffect
      };
    }
  } catch {
    // localStorage corrompu, utiliser défaut
  }

  return DEFAULT_SOUND_STATE;
}

/**
 * Sauvegarde l'état dans localStorage
 */
function saveSoundState(state: Partial<SoundState>): void {
  if (typeof window === 'undefined') return;

  try {
    const current = loadSoundState();
    const updated = { ...current, ...state };
    localStorage.setItem(
      SOUND_STORAGE_KEY,
      JSON.stringify({
        enabled: updated.enabled,
        volume: updated.volume,
      })
    );
  } catch {
    // Ignore les erreurs localStorage
  }
}

/**
 * Hook pour gestion des sons
 */
export function useSound(): UseSoundReturn {
  // Lazy initialization depuis localStorage
  const [state, setState] = useState<SoundState>(() => loadSoundState());
  const audioCache = useRef<Map<SoundType, HTMLAudioElement>>(new Map());

  // Détecter reduced motion
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setState((prev) => ({ ...prev, reducedMotion: e.matches }));
    };

    // État initial
    handleChange(mediaQuery);

    // Écouter changements
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  /**
   * Jouer un son
   */
  const play = useCallback(
    async (type: SoundType): Promise<void> => {
      // Ne pas jouer si désactivé ou reduced motion
      if (!state.enabled || state.reducedMotion) {
        return;
      }

      const config = SOUND_CATALOG[type];
      if (!config) return;

      try {
        // Créer ou réutiliser l'audio
        let audio = audioCache.current.get(type);

        if (!audio) {
          audio = new Audio(config.src);
          audioCache.current.set(type, audio);
        }

        // Appliquer volume (config * global)
        audio.volume = config.volume * state.volume;
        audio.currentTime = 0;

        await audio.play();
      } catch {
        // Ignorer les erreurs audio (autoplay blocked, etc.)
      }
    },
    [state.enabled, state.reducedMotion, state.volume]
  );

  /**
   * Toggle activation son
   */
  const toggle = useCallback(() => {
    setState((prev) => {
      const newEnabled = !prev.enabled;
      saveSoundState({ enabled: newEnabled });
      return { ...prev, enabled: newEnabled };
    });
  }, []);

  /**
   * Définir le volume
   */
  const setVolume = useCallback((volume: number) => {
    // Clamper entre 0 et 1
    const clampedVolume = Math.max(0, Math.min(1, volume));

    setState((prev) => {
      saveSoundState({ volume: clampedVolume });
      return { ...prev, volume: clampedVolume };
    });
  }, []);

  return {
    enabled: state.enabled,
    volume: state.volume,
    reducedMotion: state.reducedMotion,
    play,
    toggle,
    setVolume,
  };
}

export default useSound;
