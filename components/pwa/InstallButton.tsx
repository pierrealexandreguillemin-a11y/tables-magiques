/**
 * InstallButton Component - PWA Install Button
 * ISO/IEC 25010 - Bouton d'installation PWA
 */

'use client';

import { motion } from 'framer-motion';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

interface InstallButtonProps {
  className?: string;
}

function DownloadIcon() {
  return (
    <svg
      data-testid="download-icon"
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

/**
 * Bouton d'installation PWA
 * N'apparait que si l'app est installable
 */
export function InstallButton({ className = '' }: InstallButtonProps) {
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();

  // Ne rien afficher si pas installable ou deja installe
  if (!isInstallable || isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    await promptInstall();
  };

  return (
    <motion.button
      onClick={handleInstall}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-sm transition-colors ${className}`}
      aria-label="Installer l'application Tables Magiques"
    >
      <DownloadIcon />
      <span>Installer</span>
    </motion.button>
  );
}
