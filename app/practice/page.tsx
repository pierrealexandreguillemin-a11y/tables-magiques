'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import {
  generateRandomQuestion,
  generateAllQuestionsForTable,
  shuffleArray,
} from '@/lib/game/questions';
import {
  checkAnswer,
  updateStreak,
  calculateAccuracy,
  calculateBonus,
  checkPerfect,
} from '@/lib/game/scoring';
import type { Question } from '@/types/game';

gsap.registerPlugin(useGSAP);

type GamePhase = 'selection' | 'playing' | 'completed';

interface GameState {
  phase: GamePhase;
  selectedTable: number | null;
  questions: Question[];
  currentIndex: number;
  userAnswer: string;
  score: number;
  streak: number;
  isCorrect: boolean | null;
  showFeedback: boolean;
}

const INITIAL_STATE: GameState = {
  phase: 'selection',
  selectedTable: null,
  questions: [],
  currentIndex: 0,
  userAnswer: '',
  score: 0,
  streak: 0,
  isCorrect: null,
  showFeedback: false,
};

export default function PracticePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [game, setGame] = useState<GameState>(INITIAL_STATE);

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

  const startGame = useCallback((table: number | null) => {
    let questions: Question[];

    if (table === null) {
      // Toutes les tables: 10 questions aleatoires
      questions = Array.from({ length: 10 }, () => generateRandomQuestion());
    } else {
      // Table specifique: toutes les questions melangees
      questions = shuffleArray(generateAllQuestionsForTable(table));
    }

    setGame({
      ...INITIAL_STATE,
      phase: 'playing',
      selectedTable: table,
      questions,
    });
  }, []);

  const handleNumberClick = useCallback((num: number) => {
    setGame((prev) => {
      if (prev.showFeedback) return prev;
      if (prev.userAnswer.length >= 3) return prev;
      return { ...prev, userAnswer: prev.userAnswer + num.toString() };
    });
  }, []);

  const handleClear = useCallback(() => {
    setGame((prev) => {
      if (prev.showFeedback) return prev;
      return { ...prev, userAnswer: prev.userAnswer.slice(0, -1) };
    });
  }, []);

  const handleSubmit = useCallback(() => {
    setGame((prev) => {
      if (prev.showFeedback || !prev.userAnswer) return prev;

      const currentQuestion = prev.questions[prev.currentIndex];
      if (!currentQuestion) return prev;

      const userNum = parseInt(prev.userAnswer, 10);
      const isCorrect = checkAnswer(userNum, currentQuestion.answer);

      return {
        ...prev,
        isCorrect,
        showFeedback: true,
        score: isCorrect ? prev.score + 1 : prev.score,
        streak: updateStreak(prev.streak, isCorrect),
      };
    });

    // Auto-avancer apres feedback
    setTimeout(() => {
      setGame((prev) => {
        const nextIndex = prev.currentIndex + 1;

        if (nextIndex >= prev.questions.length) {
          return { ...prev, phase: 'completed', showFeedback: false };
        }

        return {
          ...prev,
          currentIndex: nextIndex,
          userAnswer: '',
          isCorrect: null,
          showFeedback: false,
        };
      });
    }, 1500);
  }, []);

  const handleBack = useCallback(() => {
    setGame(INITIAL_STATE);
  }, []);

  const currentQuestion = game.questions[game.currentIndex];

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex items-center justify-center overflow-hidden relative"
      style={{
        background:
          'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        backgroundSize: '400% 400%',
      }}
    >
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

          {game.phase === 'playing' && (
            <div className="text-white text-lg font-medium">
              Score: {game.score} / {game.currentIndex + 1}
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* Phase Selection */}
          {game.phase === 'selection' && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-8">
                🎮 Mode Pratique
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
                  🌟 Toutes les tables
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* Phase Playing */}
          {game.phase === 'playing' && currentQuestion && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              {/* Bouton retour */}
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
                  Question {game.currentIndex + 1} / {game.questions.length}
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${((game.currentIndex + 1) / game.questions.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Question */}
              <motion.div
                className="bg-white/20 backdrop-blur-md rounded-3xl p-8 mb-8"
                animate={
                  game.showFeedback
                    ? {
                        backgroundColor: game.isCorrect
                          ? 'rgba(34, 197, 94, 0.3)'
                          : 'rgba(239, 68, 68, 0.3)',
                      }
                    : {}
                }
              >
                <div className="text-6xl sm:text-8xl font-bold text-white mb-6">
                  {currentQuestion.a} × {currentQuestion.b} = ?
                </div>

                {/* Reponse utilisateur */}
                <div className="min-h-[80px] flex items-center justify-center">
                  <span className="text-5xl font-bold text-white">
                    {game.userAnswer || '...'}
                  </span>
                </div>

                {/* Feedback */}
                {game.showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4"
                    data-testid={
                      game.isCorrect ? 'feedback-correct' : 'feedback-incorrect'
                    }
                  >
                    {game.isCorrect ? (
                      <span className="text-4xl">✨ Bravo ! ✨</span>
                    ) : (
                      <span className="text-2xl text-white">
                        La réponse était {currentQuestion.answer}
                      </span>
                    )}
                  </motion.div>
                )}
              </motion.div>

              {/* Clavier numerique */}
              <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <motion.div key={num} whileTap={{ scale: 0.9 }}>
                    <Button
                      onClick={() => handleNumberClick(num)}
                      disabled={game.showFeedback}
                      className="w-full h-16 text-2xl font-bold bg-white/20 hover:bg-white/30 text-white rounded-xl"
                    >
                      {num}
                    </Button>
                  </motion.div>
                ))}

                <motion.div whileTap={{ scale: 0.9 }}>
                  <Button
                    onClick={handleClear}
                    disabled={game.showFeedback}
                    className="w-full h-16 text-xl font-bold bg-red-500/30 hover:bg-red-500/50 text-white rounded-xl"
                    aria-label="Effacer"
                  >
                    ⌫
                  </Button>
                </motion.div>

                <motion.div whileTap={{ scale: 0.9 }}>
                  <Button
                    onClick={() => handleNumberClick(0)}
                    disabled={game.showFeedback}
                    className="w-full h-16 text-2xl font-bold bg-white/20 hover:bg-white/30 text-white rounded-xl"
                  >
                    0
                  </Button>
                </motion.div>

                <motion.div whileTap={{ scale: 0.9 }}>
                  <Button
                    onClick={handleSubmit}
                    disabled={game.showFeedback || !game.userAnswer}
                    className="w-full h-16 text-xl font-bold bg-green-500/30 hover:bg-green-500/50 text-white rounded-xl"
                    aria-label="Valider"
                  >
                    ✓
                  </Button>
                </motion.div>
              </div>

              {/* Streak */}
              {game.streak >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 text-yellow-300 text-xl font-bold"
                >
                  🔥 Série de {game.streak} !
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Phase Completed */}
          {game.phase === 'completed' && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="text-8xl mb-6">
                {checkPerfect(game.score, game.questions.length) ? '🏆' : '⭐'}
              </div>

              <h2 className="text-4xl font-bold text-white mb-4">
                {checkPerfect(game.score, game.questions.length)
                  ? 'Parfait !'
                  : 'Bien joué !'}
              </h2>

              <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 mb-8 max-w-md mx-auto">
                <div className="text-6xl font-bold text-white mb-4">
                  {game.score} / {game.questions.length}
                </div>
                <div className="text-2xl text-white/80">
                  {Math.round(
                    calculateAccuracy(game.score, game.questions.length) * 100
                  )}
                  % de réussite
                </div>

                {calculateBonus(
                  game.streak,
                  checkPerfect(game.score, game.questions.length)
                ) > 0 && (
                  <div className="mt-4 text-yellow-300 text-xl">
                    +
                    {calculateBonus(
                      game.streak,
                      checkPerfect(game.score, game.questions.length)
                    )}{' '}
                    points bonus !
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
                    onClick={() => startGame(game.selectedTable)}
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
