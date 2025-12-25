/**
 * AuthModal - Modal d'authentification
 * ISO/IEC 25010 - Login/Register modal avec animations
 */

'use client';

import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type AuthMode = 'login' | 'register';

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const { login, register, isLoading, error } = useAuth();

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setFormError(null);
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    resetForm();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation basique
    if (username.length < 4) {
      setFormError('Le pseudo doit faire au moins 4 caracteres');
      return;
    }
    if (password.length < 4) {
      setFormError('Le mot de passe doit faire au moins 4 caracteres');
      return;
    }

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setFormError('Les mots de passe ne correspondent pas');
        return;
      }

      const success = await register({
        username,
        password,
        confirmPassword,
      });

      if (success) {
        onOpenChange(false);
        resetForm();
      }
    } else {
      const success = await login({ username, password });

      if (success) {
        onOpenChange(false);
        resetForm();
      }
    }
  };

  const displayError = formError || error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            <motion.span
              key={mode}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="inline-block"
            >
              {mode === 'login' ? '🦄 Connexion' : '✨ Inscription'}
            </motion.span>
          </DialogTitle>
          <DialogDescription className="text-center">
            {mode === 'login'
              ? 'Entre ton pseudo et ton mot de passe magique !'
              : 'Cree ton compte pour sauvegarder ta progression !'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <AnimatePresence mode="wait">
            {displayError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg text-sm"
              >
                {displayError}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <Label htmlFor="username">Pseudo</Label>
            <Input
              id="username"
              type="text"
              placeholder="Ton pseudo magique"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              autoComplete="username"
              error={!!displayError}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="Ton mot de passe secret"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete={
                mode === 'login' ? 'current-password' : 'new-password'
              }
              error={!!displayError}
            />
          </div>

          <AnimatePresence mode="wait">
            {mode === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <Label htmlFor="confirmPassword">
                  Confirme ton mot de passe
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Retape ton mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="new-password"
                  error={!!displayError}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block"
              >
                🌀
              </motion.span>
            ) : mode === 'login' ? (
              "C'est parti ! 🚀"
            ) : (
              'Creer mon compte ! ✨'
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            {mode === 'login' ? (
              <span>
                Pas encore de compte ?{' '}
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                >
                  Inscris-toi !
                </button>
              </span>
            ) : (
              <span>
                Deja un compte ?{' '}
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                >
                  Connecte-toi !
                </button>
              </span>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AuthModal;
