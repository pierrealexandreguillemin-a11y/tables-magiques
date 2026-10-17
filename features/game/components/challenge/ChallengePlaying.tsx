/**
 * ChallengePlaying
 * ISO/IEC 25010 - SRP: Playing phase UI only
 */

'use client';

import * as m from 'motion/react-m';
import { AnimatePresence } from 'motion/react';
import { GentleShake } from '@/components/effects/GentleShake';
import { LottieAnimation } from '@/components/effects/LottieAnimation';
import { QuestionDisplay } from '../QuestionDisplay';
import { NumberPad } from '../NumberPad';
import { QuestionTimer } from '../QuestionTimer';
import type { Question } from '@/types/game';

interface Props {
  question: Question;
  userAnswer: string;
  timeRemaining: number;
  maxTime: number;
  streak: number;
  feedback: { show: boolean; isCorrect: boolean | null };
  canSubmit: boolean;
  onDigit: (d: number) => void;
  onDelete: () => void;
  onSubmit: () => void;
}

export function ChallengePlaying({
  question,
  userAnswer,
  timeRemaining,
  maxTime,
  streak,
  feedback,
  canSubmit,
  onDigit,
  onDelete,
  onSubmit,
}: Props) {
  return (
    <m.div
      key="playing"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="text-center"
    >
      <div className="mb-8 max-w-md mx-auto">
        <QuestionTimer timeRemaining={timeRemaining} maxTime={maxTime} />
      </div>

      <GentleShake
        trigger={feedback.show && feedback.isCorrect === false}
        message="Vite, la suivante !"
      >
        <QuestionDisplay
          question={question}
          userAnswer={userAnswer}
          className="mb-8"
        />
      </GentleShake>

      <AnimatePresence>
        {feedback.show && (
          <m.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
          >
            <LottieAnimation
              type={feedback.isCorrect ? 'success' : 'error'}
              size={150}
              autoplay
            />
          </m.div>
        )}
      </AnimatePresence>

      <NumberPad
        onNumberClick={onDigit}
        onClear={onDelete}
        onSubmit={onSubmit}
        canSubmit={canSubmit}
      />

      {streak >= 3 && (
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-xl font-bold"
        >
          <span className="text-yellow-300">Série de {streak} !</span>
        </m.div>
      )}
    </m.div>
  );
}
