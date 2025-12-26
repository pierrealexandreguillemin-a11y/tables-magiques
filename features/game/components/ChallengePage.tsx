'use client';

/**
 * ChallengePage Component - Tables Magiques
 * ISO/IEC 25010 - UI Challenge mode
 */

import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { InstallButton } from '@/components/pwa/InstallButton';
import { useChallenge } from '../hooks/useChallenge';
import { QuestionDisplay } from './QuestionDisplay';
import { NumberPad } from './NumberPad';
import { ScoreBoard } from './ScoreBoard';
import { GlobalTimer } from './GlobalTimer';
import { QuestionTimer } from './QuestionTimer';

gsap.registerPlugin(useGSAP);

export function ChallengePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    state,
    userAnswer,
    result,
    start,
    answerQuestion,
    appendDigit,
    deleteDigit,
    replay,
    canSubmit,
    isPlaying,
    isReady,
    isGameOver,
  } = useChallenge();

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
      className="min-h-screen flex items-center justify-center overflow-hidden relative bg-gradient-to-br from-pink-400 via-red-400 to-blue-400 dark:from-slate-900 dark:via-red-900 dark:to-indigo-900"
      style={{ backgroundSize: '400% 400%' }}
    >
      {/* Header fixe */}
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
            <div className="flex items-center gap-4">
              <GlobalTimer timeRemaining={state.globalTimeRemaining} />
              <ScoreBoard
                score={state.score}
                total={state.questionsAnswered}
                streak={state.streak}
              />
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* Phase Ready */}
          {isReady && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-8">
                Mode Challenge
              </h1>

              <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 mb-8 max-w-md mx-auto">
                <h2 className="text-2xl font-bold text-white mb-4">Regles</h2>
                <ul className="text-white/90 text-left space-y-2">
                  <li>3 minutes pour repondre a un maximum de questions</li>
                  <li>5 secondes par question</li>
                  <li>+10 points par bonne reponse</li>
                  <li>Bonus streak si 3+ reponses consecutives</li>
                  <li>Bonus temps pour les secondes restantes</li>
                </ul>
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={start}
                  className="px-12 py-6 text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white rounded-full shadow-xl"
                  aria-label="Commencer le challenge"
                >
                  Commencer
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* Phase Playing */}
          {isPlaying && state.currentQuestion && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <div className="mb-8 max-w-md mx-auto">
                <QuestionTimer
                  timeRemaining={state.questionTimeRemaining}
                  maxTime={state.config.questionTime}
                />
              </div>

              <QuestionDisplay
                question={state.currentQuestion}
                userAnswer={userAnswer}
                className="mb-8"
              />

              <NumberPad
                onNumberClick={appendDigit}
                onClear={deleteDigit}
                onSubmit={answerQuestion}
                canSubmit={canSubmit}
              />

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

          {/* Phase Game Over */}
          {isGameOver && result && (
            <motion.div
              key="game_over"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="text-8xl mb-6">
                {result.accuracy >= 0.9
                  ? '🏆'
                  : result.accuracy >= 0.7
                    ? '🌟'
                    : '⭐'}
              </div>

              <h2 className="text-4xl font-bold text-white mb-4">
                Challenge termine !
              </h2>

              <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 mb-8 max-w-md mx-auto">
                <div className="text-6xl font-bold text-white mb-4">
                  {result.totalScore}
                </div>
                <div className="text-xl text-white/80 mb-4">points</div>

                <div className="grid grid-cols-2 gap-4 text-white/80">
                  <div>
                    <div className="text-3xl font-bold text-white">
                      {result.correctAnswers}
                    </div>
                    <div>Bonnes reponses</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">
                      {Math.round(result.accuracy * 100)}%
                    </div>
                    <div>Precision</div>
                  </div>
                </div>

                {(result.timeBonus > 0 || result.streakBonus > 0) && (
                  <div className="mt-4 pt-4 border-t border-white/20">
                    {result.timeBonus > 0 && (
                      <div className="text-yellow-300">
                        +{result.timeBonus} bonus temps
                      </div>
                    )}
                    {result.streakBonus > 0 && (
                      <div className="text-orange-300">
                        +{result.streakBonus} bonus serie
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-4 justify-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/">
                    <Button className="px-8 py-4 text-lg font-bold bg-white/20 hover:bg-white/30 text-white rounded-full">
                      Accueil
                    </Button>
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={replay}
                    className="px-8 py-4 text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white rounded-full"
                    aria-label="Rejouer"
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
