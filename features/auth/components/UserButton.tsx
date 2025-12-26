/**
 * UserButton - Bouton utilisateur avec menu
 * ISO/IEC 25010 - Composant etat connexion
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '../hooks/useAuth';
import { AuthModal } from './AuthModal';

export interface UserButtonProps {
  className?: string;
}

export function UserButton({ className }: UserButtonProps) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  if (isLoading) {
    return (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 flex items-center justify-center"
      >
        🌀
      </motion.div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Button
          onClick={() => setShowAuthModal(true)}
          className={`bg-white/20 hover:bg-white/30 text-white rounded-full px-6 backdrop-blur-sm ${className ?? ''}`}
        >
          Connexion 🔐
        </Button>
        <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      </>
    );
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setShowMenu(!showMenu)}
        className={`bg-white/20 hover:bg-white/30 text-white rounded-full px-6 backdrop-blur-sm ${className ?? ''}`}
      >
        {user?.username} 👋
      </Button>

      {showMenu && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50"
        >
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user?.username}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Connecte depuis{' '}
              {user?.lastLoginAt
                ? new Date(user.lastLoginAt).toLocaleDateString('fr-FR')
                : 'maintenant'}
            </p>
          </div>
          <button
            onClick={() => {
              logout();
              setShowMenu(false);
            }}
            className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Deconnexion 👋
          </button>
        </motion.div>
      )}

      {/* Overlay pour fermer le menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}

export default UserButton;
