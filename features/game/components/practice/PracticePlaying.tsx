/**
 * PracticePlaying
 * ISO/IEC 25010 - SRP: Playing phase UI only
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  GentleShake,
  LottieAnimation,
  PulseGlow,
  CrownProgress,
} from '@/components/effects';
import { QuestionDisplay } from '../QuestionDisplay';
import { NumberPad } from '../NumberPad';
import type { Question, PracticeState } from '@/types/game';

interface Props {
  state: PracticeState;
  question: Question;
  progress: number;
  canSubmit: boolean;
  onBack: () => void;
  onNumber: (n: number) => void;
  onClear: () => void;
  onSubmit: () => void;
}

export function PracticePlaying({
  state,
  question,
  progress,
  canSubmit,
  onBack,
  onNumber,
  onClear,
  onSubmit,
}: Props) {
  return (
    <motion.div
      key="playing"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="text-center"
    >
      <Button
        onClick={onBack}
        variant="ghost"
        className="absolute top-4 right-4 text-white hover:bg-white/20"
        aria-label="Retour selection"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Changer de table
      </Button>

      <div className="mb-8 flex items-center justify-center gap-6">
        <CrownProgress
          progress={progress}
          variant="star"
          size="lg"
          showText={false}
        />
        <div className="text-center">
          <div className="text-3xl font-bold text-white dark:text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
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

      <GentleShake
        trigger={state.showFeedback && state.isCorrect === false}
        message="Presque ! Essaie encore"
      >
        <QuestionDisplay
          question={question}
          userAnswer={state.userAnswer}
          isCorrect={state.isCorrect}
          showFeedback={state.showFeedback}
          className="mb-8"
        />
      </GentleShake>

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

      <NumberPad
        onNumberClick={onNumber}
        onClear={onClear}
        onSubmit={onSubmit}
        disabled={state.showFeedback}
        canSubmit={canSubmit}
      />

      {state.streak >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-xl font-bold"
        >
          <PulseGlow color="#fbbf24" intensity="strong" speed="fast">
            <span className="text-yellow-300">Série de {state.streak} !</span>
          </PulseGlow>
        </motion.div>
      )}
    </motion.div>
  );
}
