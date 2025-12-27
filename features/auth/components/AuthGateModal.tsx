/**
 * AuthGateModal - Modal bloquante pour pages protégées
 * ISO/IEC 25010 - UX bienveillante pour enfants
 *
 * Affiche un modal friendly quand l'utilisateur n'est pas connecté
 * sur une page protégée. Options: Login, Register, ou Mode Invité.
 */

'use client';

import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
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
import { useAuth } from '../hooks/useAuth';
import { Sparkles, UserCircle, Play } from 'lucide-react';

export interface AuthGateModalProps {
  /** Message personnalisé affiché dans le modal */
  message?: string;
  /** Callback quand l'utilisateur choisit le mode invité */
  onGuestMode?: () => void;
  /** Désactiver le mode invité */
  disableGuestMode?: boolean;
}

type AuthMode = 'choice' | 'login' | 'register';

export function AuthGateModal({
  message = 'Connecte-toi pour sauvegarder ta progression !',
  onGuestMode,
  disableGuestMode = false,
}: AuthGateModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('choice');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [guestModeActive, setGuestModeActive] = useState(false);

  const { login, register, isLoading, error, loginError, registerError } =
    useAuth();

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setFormError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (username.length < 4) {
      setFormError('Le pseudo doit faire au moins 4 caractères');
      return;
    }
    if (password.length < 4) {
      setFormError('Le mot de passe doit faire au moins 4 caractères');
      return;
    }

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setFormError('Les mots de passe ne correspondent pas');
        return;
      }

      await register({
        username,
        password,
        confirmPassword,
      });
    } else if (mode === 'login') {
      await login({ username, password });
    }
  };

  const handleGuestMode = () => {
    setGuestModeActive(true);
    onGuestMode?.();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  // Si mode invité activé, ne pas afficher le modal
  if (guestModeActive) {
    return null;
  }

  const apiError = mode === 'login' ? loginError : registerError;
  const displayError = formError || apiError || error;

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2"
            >
              <Sparkles className="w-6 h-6 text-yellow-500" />
              {mode === 'choice' && 'Bienvenue !'}
              {mode === 'login' && '🦄 Connexion'}
              {mode === 'register' && '✨ Inscription'}
            </motion.span>
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {mode === 'choice' && message}
            {mode === 'login' &&
              'Entre ton pseudo et ton mot de passe magique !'}
            {mode === 'register' &&
              'Crée ton compte pour sauvegarder ta progression !'}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Écran de choix */}
          {mode === 'choice' && (
            <motion.div
              key="choice"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 mt-4"
            >
              <Button
                onClick={() => setMode('login')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-6 rounded-full text-lg"
              >
                <UserCircle className="w-5 h-5 mr-2" />
                J&apos;ai déjà un compte
              </Button>

              <Button
                onClick={() => setMode('register')}
                variant="outline"
                className="w-full border-2 border-purple-300 dark:border-purple-600 font-bold py-6 rounded-full text-lg hover:bg-purple-50 dark:hover:bg-purple-900/50"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Créer mon compte
              </Button>

              {!disableGuestMode && (
                <Button
                  onClick={handleGuestMode}
                  variant="ghost"
                  className="w-full font-medium py-4 text-muted-foreground hover:text-foreground"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Jouer en invité (sans sauvegarde)
                </Button>
              )}

              <Button
                onClick={handleGoHome}
                variant="link"
                className="w-full text-sm text-muted-foreground"
              >
                ← Retour à l&apos;accueil
              </Button>
            </motion.div>
          )}

          {/* Formulaire Login/Register */}
          {(mode === 'login' || mode === 'register') && (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleSubmit}
              className="space-y-4 mt-4"
            >
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
                <Label htmlFor="gate-username">Pseudo</Label>
                <Input
                  id="gate-username"
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
                <Label htmlFor="gate-password">Mot de passe</Label>
                <Input
                  id="gate-password"
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
                    <Label htmlFor="gate-confirmPassword">
                      Confirme ton mot de passe
                    </Label>
                    <Input
                      id="gate-confirmPassword"
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
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="inline-block"
                  >
                    🌀
                  </motion.span>
                ) : mode === 'login' ? (
                  "C'est parti ! 🚀"
                ) : (
                  'Créer mon compte ! ✨'
                )}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setMode('choice');
                    resetForm();
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ← Retour
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login');
                    resetForm();
                  }}
                  className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                >
                  {mode === 'login'
                    ? 'Pas de compte ? Inscris-toi !'
                    : 'Déjà un compte ? Connecte-toi !'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

export default AuthGateModal;
