'use client';

/**
 * useAnnouncer Hook - Tables Magiques
 * ISO/IEC 25010 + WCAG 2.2 - Screen Reader Announcements
 *
 * Features:
 * - aria-live regions (polite/assertive)
 * - Auto-cleanup des messages
 * - Debounce pour eviter spam
 * - Pattern @react-aria/live-announcer inspire
 */

import { useCallback, useRef, useEffect } from 'react';
import type { UseAnnouncerResult, AnnouncerPoliteness } from '@/types/effects';

// Duree avant cleanup du message (ms)
const MESSAGE_TIMEOUT = 1000;

// Debounce entre messages (ms) - evite spam screen reader
const DEBOUNCE_DELAY = 150;

/**
 * Creer ou recuperer une region aria-live dans le DOM
 */
function getOrCreateLiveRegion(
  politeness: AnnouncerPoliteness
): HTMLDivElement {
  const id = `announcer-${politeness}`;
  const existingRegion = document.getElementById(id);
  let region: HTMLDivElement | null =
    existingRegion instanceof HTMLDivElement ? existingRegion : null;

  if (!region) {
    region = document.createElement('div');
    region.id = id;
    region.setAttribute('aria-live', politeness);
    region.setAttribute('aria-atomic', 'true');
    region.setAttribute(
      'role',
      politeness === 'assertive' ? 'alert' : 'status'
    );
    // Visuellement cache mais accessible aux screen readers
    Object.assign(region.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: '0',
    });
    document.body.appendChild(region);
  }

  return region;
}

/**
 * Supprimer les regions aria-live du DOM
 */
function cleanupLiveRegions(): void {
  const polite = document.getElementById('announcer-polite');
  const assertive = document.getElementById('announcer-assertive');
  polite?.remove();
  assertive?.remove();
}

/**
 * useAnnouncer Hook
 *
 * Permet d'annoncer des messages aux screen readers via aria-live regions.
 * Utilise 'polite' par defaut (non-interruptif).
 *
 * @example
 * ```tsx
 * const { announce, announcePolite, announceAssertive } = useAnnouncer();
 *
 * // Annonce non-interruptive (defaut)
 * announcePolite('Score: 10 points');
 *
 * // Annonce urgente (interrompt)
 * announceAssertive('Erreur: Temps ecoule!');
 *
 * // Avec choix de politeness
 * announce('Message', 'polite');
 * ```
 */
export function useAnnouncer(): UseAnnouncerResult {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAnnounceRef = useRef<number>(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /**
   * Annonce un message avec la politeness specifiee
   */
  const announce = useCallback(
    (message: string, politeness: AnnouncerPoliteness = 'polite') => {
      if (!message.trim()) return;

      // Debounce - evite spam screen reader
      const now = Date.now();
      if (now - lastAnnounceRef.current < DEBOUNCE_DELAY) {
        return;
      }
      lastAnnounceRef.current = now;

      // Obtenir la region aria-live
      const region = getOrCreateLiveRegion(politeness);

      // Clear timeout precedent
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Vider puis remplir (force re-announce)
      region.textContent = '';

      // Utilise requestAnimationFrame pour garantir la detection du changement
      requestAnimationFrame(() => {
        region.textContent = message;

        // Cleanup apres lecture
        timeoutRef.current = setTimeout(() => {
          region.textContent = '';
        }, MESSAGE_TIMEOUT);
      });
    },
    []
  );

  /**
   * Annonce non-interruptive (polite)
   * Pour: scores, progressions, feedbacks positifs
   */
  const announcePolite = useCallback(
    (message: string) => announce(message, 'polite'),
    [announce]
  );

  /**
   * Annonce urgente (assertive)
   * Pour: erreurs critiques, temps ecoule, alertes importantes
   */
  const announceAssertive = useCallback(
    (message: string) => announce(message, 'assertive'),
    [announce]
  );

  return {
    announce,
    announcePolite,
    announceAssertive,
  };
}

/**
 * Cleanup global des regions aria-live
 * A appeler si necessaire lors du demontage de l'app
 */
export { cleanupLiveRegions };

export default useAnnouncer;
