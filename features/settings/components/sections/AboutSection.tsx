/**
 * AboutSection
 * ISO/IEC 25010 - SRP: About & actions only
 */

'use client';

import { Info, Download, Upload, RotateCcw } from 'lucide-react';
import { SettingsSection } from '../SettingsSection';
import { cn } from '@/lib/utils';

interface Props {
  showResetConfirm: boolean;
  importError: string | null;
  onExport: () => void;
  onImport: () => void;
  onReset: () => void;
}

export function AboutSection({
  showResetConfirm,
  importError,
  onExport,
  onImport,
  onReset,
}: Props) {
  return (
    <SettingsSection
      title="A propos"
      description="Version, aide, donnees"
      icon={<Info size={20} />}
      testId="settings-about"
    >
      <div className="flex justify-between items-center py-3 border-b border-pink-100/50 dark:border-slate-700/50">
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Tables Magiques
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Version 1.0.0
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <button
          onClick={onExport}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium',
            'bg-pink-100 dark:bg-pink-900/30',
            'text-pink-700 dark:text-pink-300',
            'hover:bg-pink-200 dark:hover:bg-pink-900/50',
            'transition-colors'
          )}
        >
          <Download size={16} />
          Exporter
        </button>

        <button
          onClick={onImport}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium',
            'bg-purple-100 dark:bg-purple-900/30',
            'text-purple-700 dark:text-purple-300',
            'hover:bg-purple-200 dark:hover:bg-purple-900/50',
            'transition-colors'
          )}
        >
          <Upload size={16} />
          Importer
        </button>

        <button
          onClick={onReset}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium',
            'transition-colors',
            showResetConfirm
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
          )}
        >
          <RotateCcw size={16} />
          {showResetConfirm ? 'Confirmer ?' : 'Reinitialiser'}
        </button>
      </div>

      {importError && (
        <p className="text-sm text-red-500 mt-2">{importError}</p>
      )}
    </SettingsSection>
  );
}
