/**
 * useSettingsActions Hook
 * ISO/IEC 25010 - SRP: Settings actions only
 */

'use client';

import { useState, useCallback } from 'react';

interface UseSettingsActionsProps {
  exportSettings: () => string;
  importSettings: (json: string) => boolean;
  resetSettings: () => void;
}

export function useSettingsActions({
  exportSettings,
  importSettings,
  resetSettings,
}: UseSettingsActionsProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleExport = useCallback(() => {
    const json = exportSettings();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tables-magiques-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [exportSettings]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const target = e.target;
      if (!(target instanceof HTMLInputElement)) return;
      const file = target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const success = importSettings(text);
        if (!success) {
          setImportError('Format de fichier invalide');
          setTimeout(() => setImportError(null), 3000);
        }
      } catch {
        setImportError('Erreur lors de la lecture du fichier');
        setTimeout(() => setImportError(null), 3000);
      }
    };
    input.click();
  }, [importSettings]);

  const handleReset = useCallback(() => {
    if (showResetConfirm) {
      resetSettings();
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 3000);
    }
  }, [showResetConfirm, resetSettings]);

  return {
    showResetConfirm,
    importError,
    handleExport,
    handleImport,
    handleReset,
  };
}
