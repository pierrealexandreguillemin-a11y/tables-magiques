/**
 * Hook useInstallPrompt - PWA Install Prompt
 * ISO/IEC 25010 - Gestion du prompt d'installation PWA
 */

import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Type guard pour BeforeInstallPromptEvent
 */
function isBeforeInstallPromptEvent(
  event: Event
): event is BeforeInstallPromptEvent {
  return 'prompt' in event && 'userChoice' in event;
}

export interface UseInstallPromptReturn {
  isInstallable: boolean;
  isInstalled: boolean;
  promptInstall: () => Promise<boolean>;
}

/**
 * Hook pour gerer le prompt d'installation PWA
 * - Detecte si l'app est installable
 * - Permet de declencher le prompt
 * - Detecte si l'app est installee
 */
export function useInstallPrompt(): UseInstallPromptReturn {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Empecher le comportement par defaut (affichage auto)
      e.preventDefault();
      // Stocker l'evenement pour l'utiliser plus tard (avec type guard)
      if (isBeforeInstallPromptEvent(e)) {
        setDeferredPrompt(e);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }

    // Afficher le prompt
    await deferredPrompt.prompt();

    // Attendre le choix de l'utilisateur
    const { outcome } = await deferredPrompt.userChoice;

    // Nettoyer le prompt (ne peut etre utilise qu'une fois)
    setDeferredPrompt(null);

    return outcome === 'accepted';
  }, [deferredPrompt]);

  return {
    isInstallable: deferredPrompt !== null,
    isInstalled,
    promptInstall,
  };
}
