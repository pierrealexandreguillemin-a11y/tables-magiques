/**
 * PracticePage - Composant UI pour le mode Practice
 * ISO/IEC 25010 - Séparation UI / logique métier
 */

'use client';

import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { InstallButton } from '@/components/pwa/InstallButton';
import {
  usePractice,
  QuestionDisplay,
  NumberPad,
  ScoreBoard,
} from '@/features/game';

gsap.registerPlugin(useGSAP);

export function PracticePage() {
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex items-center justify-center overflow-hidden relative bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-400 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900"
      style={{
        backgroundSize: '400% 400%',
      }}
    >
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
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-8">
                Mode Pratique
              </h1>
              <p className="text-xl text-white/80 mb-12">
                Choisis une table de multiplication
              </p>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((table) => (
                  <motion.div
                    key={table}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => startGame(table)}
                      className="w-full h-20 text-2xl font-bold bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 rounded-2xl backdrop-blur-sm"
                      aria-label={`Table de ${table}`}
                    >
                      Table {table}
                    </Button>
                  </motion.div>
                ))}
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => startGame(null)}
                  className="px-12 py-6 text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white rounded-full shadow-xl"
                  aria-label="Toutes les tables"
                >
                  Toutes les tables
                </Button>
              </motion.div>
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

              {/* Progression */}
              <div className="mb-8">
                <div className="text-white/60 text-sm mb-2">
                  Question {state.currentIndex + 1} / {state.questions.length}
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Question Display Component */}
              <QuestionDisplay
                question={currentQuestion}
                userAnswer={state.userAnswer}
                isCorrect={state.isCorrect}
                showFeedback={state.showFeedback}
                className="mb-8"
              />

              {/* NumberPad Component */}
              <NumberPad
                onNumberClick={handleNumberClick}
                onClear={handleClear}
                onSubmit={handleSubmit}
                disabled={state.showFeedback}
                canSubmit={canSubmit}
              />

              {/* Streak */}
              {state.streak >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 text-yellow-300 text-xl font-bold"
                >
                  Serie de {state.streak} !
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
              <div className="text-8xl mb-6">
                {result.isPerfect ? '🏆' : '⭐'}
              </div>

              <h2 className="text-4xl font-bold text-white mb-4">
                {result.isPerfect ? 'Parfait !' : 'Bien joue !'}
              </h2>

              <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 mb-8 max-w-md mx-auto">
                <div className="text-6xl font-bold text-white mb-4">
                  {result.score} / {result.total}
                </div>
                <div className="text-2xl text-white/80">
                  {Math.round(result.accuracy * 100)}% de reussite
                </div>

                {result.bonus > 0 && (
                  <div className="mt-4 text-yellow-300 text-xl">
                    +{result.bonus} points bonus !
                  </div>
                )}
              </div>

              <div className="flex gap-4 justify-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleBack}
                    className="px-8 py-4 text-lg font-bold bg-white/20 hover:bg-white/30 text-white rounded-full"
                  >
                    Changer de table
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => startGame(state.selectedTable)}
                    className="px-8 py-4 text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white rounded-full"
                  >
                    Rejouer
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default PracticePage;
