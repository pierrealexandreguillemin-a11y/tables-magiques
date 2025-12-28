/**
 * PracticePage - Composant UI pour le mode Practice
 * ISO/IEC 25010 - Séparation UI / logique métier
 */

'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { InstallButton } from '@/components/pwa/InstallButton';
import {
  GentleShake,
  LottieAnimation,
  GradientText,
  TextReveal,
  useToastContext,
  NumberReveal,
  PulseGlow,
  MagicCard,
  MagicButton,
  CrownProgress,
  StaggerList,
} from '@/components/effects';
import {
  LazyFairyBackground,
  LazySuccessExplosion,
  preloadHeavyComponents,
} from '@/lib/animations';
import { useAnnouncer } from '@/hooks/useAnnouncer';
import {
  usePractice,
  QuestionDisplay,
  NumberPad,
  ScoreBoard,
} from '@/features/game';
import { AuthGate } from '@/features/auth';

gsap.registerPlugin(useGSAP);

export function PracticePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { success, error: toastError } = useToastContext();
  const { announcePolite, announceAssertive } = useAnnouncer();
  const [explosionVisible, setExplosionVisible] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);

  // Précharger les composants lourds après le premier rendu
  useEffect(() => {
    preloadHeavyComponents();
  }, []);

  const {
    state,
    currentQuestion,
    result,
    startGame,
    handleNumberClick,
    handleClear,
    handleSubmit,
    handleBack,
    canSubmit,
    isPlaying,
    isSelection,
    isCompleted,
    progress,
  } = usePractice();

  // Feedback sonore et visuel sur reponse
  useEffect(() => {
    if (state.showFeedback && state.isCorrect !== null) {
      if (state.isCorrect) {
        success('Bravo !');
        announcePolite(`Correct ! Score: ${state.score}`);
        if (state.streak >= 5) {
          // Déférer setState pour éviter rendu synchrone en cascade
          const showTimer = setTimeout(() => setExplosionVisible(true), 0);
          const hideTimer = setTimeout(() => setExplosionVisible(false), 2500);
          return () => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
          };
        }
      } else {
        toastError('Essaie encore !');
        announceAssertive('Incorrect. Essaie encore !');
      }
    }
    return undefined;
  }, [
    state.showFeedback,
    state.isCorrect,
    state.score,
    state.streak,
    success,
    toastError,
    announcePolite,
    announceAssertive,
  ]);

  // Annonce completion
  useEffect(() => {
    if (isCompleted && result) {
      announcePolite(
        `Session terminée ! Score: ${result.score} sur ${result.total}`
      );
    }
  }, [isCompleted, result, announcePolite]);

  // Animation de fond
  useGSAP(
    () => {
      if (!containerRef.current) return;

      gsap.to(containerRef.current, {
        backgroundPosition: '200% 50%',
        duration: 20,
        ease: 'none',
        repeat: -1,
      });
    },
    { scope: containerRef }
  );

  // Contenu de la page (utilisé par AuthGate)
  const pageContent = (
    <div
      ref={containerRef}
      className="min-h-screen flex items-center justify-center overflow-hidden relative"
    >
      {/* Fond avec particules féériques (lazy loaded) - VISIBLE car pas de bg opaque */}
      <LazyFairyBackground />

      {/* Explosion de célébration (lazy loaded, streak 5+) */}
      <LazySuccessExplosion show={explosionVisible} type="confetti" size="lg" />

      {/* Header fixe - Theme Toggle + Install Button */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <InstallButton />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20"
              aria-label="Retour accueil"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </Button>
          </Link>

          {isPlaying && (
            <ScoreBoard
              score={state.score}
              total={state.currentIndex + 1}
              streak={state.streak}
            />
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* Phase Selection */}
          {isSelection && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <h1 className="text-4xl sm:text-5xl font-bold mb-8">
                <GradientText variant="unicorn" animate as="span">
                  <TextReveal variant="slide" delay={0.2}>
                    Mode Entraînement
                  </TextReveal>
                </GradientText>
              </h1>
              <p className="text-xl text-white/80 mb-12">
                Choisis une table de multiplication
              </p>

              <StaggerList
                items={Array.from({ length: 10 }, (_, i) => i + 1)}
                keyExtractor={(table) => `table-${table}`}
                className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8"
                staggerDelay={0.05}
                renderItem={(table) => (
                  <MagicCard
                    variant="unicorn"
                    glow
                    onClick={() => startGame(table)}
                    padding="p-0"
                    className="h-20 flex items-center justify-center text-2xl font-bold text-purple-700 hover:text-purple-900 transition-colors"
                    aria-label={`Table de ${table}`}
                  >
                    <span className="flex flex-col items-center">
                      <span className="text-3xl">✨</span>
                      <span>Table {table}</span>
                    </span>
                  </MagicCard>
                )}
              />

              <MagicButton
                onClick={() => startGame(null)}
                variant="rainbow"
                className="px-12 py-6 text-xl"
                aria-label="Toutes les tables"
              >
                🌈 Toutes les tables
              </MagicButton>
            </motion.div>
          )}

          {/* Phase Playing */}
          {isPlaying && currentQuestion && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <Button
                onClick={handleBack}
                variant="ghost"
                className="absolute top-4 right-4 text-white hover:bg-white/20"
                aria-label="Retour selection"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Changer de table
              </Button>

              {/* Progression avec CrownProgress */}
              <div className="mb-8 flex items-center justify-center gap-6">
                <CrownProgress
                  progress={progress}
                  variant="star"
                  size="lg"
                  showText={false}
                />
                <div className="text-center">
                  <div className="text-3xl font-bold text-white dark:text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] dark:drop-shadow-none">
                    Question {state.currentIndex + 1} / {state.questions.length}
                  </div>
                  <div className="w-48 h-3 bg-white/20 rounded-full overflow-hidden mt-2">
                    <motion.div
                      className="h-full bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ type: 'spring', stiffness: 100 }}
                    />
                  </div>
                </div>
                <CrownProgress
                  progress={progress}
                  variant="star"
                  size="lg"
                  showText={false}
                />
              </div>

              {/* Question Display Component avec GentleShake pour erreur */}
              <GentleShake
                trigger={state.showFeedback && state.isCorrect === false}
                message="Presque ! Essaie encore"
              >
                <QuestionDisplay
                  question={currentQuestion}
                  userAnswer={state.userAnswer}
                  isCorrect={state.isCorrect}
                  showFeedback={state.showFeedback}
                  className="mb-8"
                />
              </GentleShake>

              {/* Lottie Animation feedback */}
              <AnimatePresence>
                {state.showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
                  >
                    <LottieAnimation
                      type={state.isCorrect ? 'success' : 'error'}
                      size={200}
                      autoplay
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* NumberPad Component */}
              <NumberPad
                onNumberClick={handleNumberClick}
                onClear={handleClear}
                onSubmit={handleSubmit}
                disabled={state.showFeedback}
                canSubmit={canSubmit}
              />

              {/* Streak avec PulseGlow */}
              {state.streak >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 text-xl font-bold"
                >
                  <PulseGlow color="#fbbf24" intensity="strong" speed="fast">
                    <span className="text-yellow-300">
                      Série de {state.streak} !
                    </span>
                  </PulseGlow>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Phase Completed */}
          {isCompleted && result && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              {/* Lottie Celebration */}
              <div className="mb-6">
                <LottieAnimation
                  type={result.isPerfect ? 'crown' : 'celebration'}
                  size={150}
                  autoplay
                />
              </div>

              <h2 className="text-4xl font-bold text-white mb-4">
                {result.isPerfect ? 'Parfait !' : 'Bien joue !'}
              </h2>

              <MagicCard
                variant="rainbow"
                glow
                padding="p-8"
                className="mb-8 max-w-md mx-auto text-center"
              >
                <div className="text-6xl font-bold text-purple-700 mb-4">
                  <NumberReveal value={result.score} duration={1.5} /> /{' '}
                  {result.total}
                </div>
                <div className="text-2xl text-purple-600">
                  {Math.round(result.accuracy * 100)}% de réussite
                </div>

                {result.bonus > 0 && (
                  <PulseGlow color="#fbbf24" intensity="strong" speed="normal">
                    <div className="mt-4 text-yellow-600 text-xl font-bold">
                      ⭐ +{result.bonus} points bonus !
                    </div>
                  </PulseGlow>
                )}
              </MagicCard>

              <div className="flex gap-4 justify-center">
                <MagicButton
                  onClick={handleBack}
                  variant="unicorn"
                  className="px-8 py-4 text-lg"
                >
                  🔄 Changer de table
                </MagicButton>

                <MagicButton
                  onClick={() => startGame(state.selectedTable)}
                  variant="star"
                  className="px-8 py-4 text-lg"
                >
                  ✨ Rejouer
                </MagicButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  // Si mode invité activé, afficher directement le contenu
  if (isGuestMode) {
    return pageContent;
  }

  // Sinon, protéger avec AuthGate
  return (
    <AuthGate
      message="Connecte-toi pour sauvegarder tes scores ! 🦄"
      onGuestMode={() => setIsGuestMode(true)}
    >
      {pageContent}
    </AuthGate>
  );
}

export default PracticePage;
