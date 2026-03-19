/**
 * PracticeCompleted
 * ISO/IEC 25010 - SRP: Completed phase UI only
 */

'use client';

import { motion } from 'framer-motion';
import {
  LottieAnimation,
  NumberReveal,
  PulseGlow,
  MagicCard,
  MagicButton,
} from '@/components/effects';
import type { PracticeResult } from '@/types/game';

interface Props {
  result: PracticeResult;
  selectedTable: number | null;
  onBack: () => void;
  onReplay: () => void;
}

export function PracticeCompleted({
  result,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectedTable: _selectedTable,
  onBack,
  onReplay,
}: Props) {
  return (
    <motion.div key="completed" className="text-center animate-fade-scale">
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
          <NumberReveal value={result.score} duration={1.5} /> / {result.total}
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
