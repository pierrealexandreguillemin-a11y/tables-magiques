/**
 * PracticeCompleted
 * ISO/IEC 25010 - SRP: Completed phase UI only
 */

'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LottieAnimation,
  NumberReveal,
  MagicCard,
  MagicButton,
  TextReveal,
} from '@/components/effects';
import { useSaveScore } from '../../hooks/useSaveScore';
import type { PracticeResult } from '@/types/game';

interface Props {
  result: PracticeResult;
  selectedTable: number | null;
  onBack: () => void;
  onReplay: () => void;
}

export function PracticeCompleted({
  result,
  selectedTable,
  onBack,
  onReplay,
}: Props) {
  const { saveScore } = useSaveScore();

  useEffect(() => {
    saveScore({
      mode: 'practice',
      table: selectedTable ?? undefined,
      correct: result.score,
      total: result.total,
      streak: result.bestStreak,
    });
  }, [saveScore, result, selectedTable]);

  return (
    <motion.div key="completed" className="text-center animate-fade-scale">
      <div className="mb-6">
        <LottieAnimation
          type={result.isPerfect ? 'crown' : 'celebration'}
          size={150}
          autoplay
        />
      </div>

      <TextReveal
        as="h2"
        variant="slide"
        duration={0.8}
        className="text-4xl font-bold text-white mb-4"
      >
        {result.isPerfect ? 'Parfait !' : 'Bien joue !'}
      </TextReveal>

      <MagicCard
        variant="rainbow"
        glow
        padding="p-8"
        className="mb-8 max-w-md mx-auto text-center"
      >
        <div className="text-6xl font-bold text-purple-700 mb-4">
          <NumberReveal value={result.score} duration={1.5} /> / {result.total}
        </div>
        <div className="text-2xl text-purple-600">
          {Math.round(result.accuracy * 100)}% de réussite
        </div>
        {result.bonus > 0 && (
          <div className="mt-4 text-yellow-600 text-xl font-bold">
            ⭐ +{result.bonus} points bonus !
          </div>
        )}
      </MagicCard>

      <div className="flex gap-4 justify-center">
        <MagicButton
          onClick={onBack}
          variant="unicorn"
          className="px-8 py-4 text-lg"
        >
          🔄 Changer de table
        </MagicButton>
        <MagicButton
          onClick={() => onReplay()}
          variant="star"
          className="px-8 py-4 text-lg"
        >
          ✨ Rejouer
        </MagicButton>
      </div>
    </motion.div>
  );
}
