/**
 * ChallengeGameOver
 * ISO/IEC 25010 - SRP: Game over phase UI only
 */

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LottieAnimation, NumberReveal } from '@/components/effects';
import type { ChallengeResult } from '@/types/game';

interface Props {
  result: ChallengeResult;
  onReplay: () => void;
}

export function ChallengeGameOver({ result, onReplay }: Props) {
  return (
    <motion.div
      key="game_over"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <div className="mb-6">
        <LottieAnimation
          type={
            result.accuracy >= 0.9
              ? 'crown'
              : result.accuracy >= 0.7
                ? 'celebration'
                : 'sparkles'
          }
          size={150}
          autoplay
        />
      </div>

      <h2 className="text-4xl font-bold text-white mb-4">
        Challenge termine !
      </h2>

      <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 mb-8 max-w-md mx-auto">
        <div className="text-6xl font-bold text-white mb-4">
          <NumberReveal value={result.totalScore} duration={2} delay={0.3} />
        </div>
        <div className="text-xl text-white/80 mb-4">points</div>

        <div className="grid grid-cols-2 gap-4 text-white/80">
          <div>
            <div className="text-3xl font-bold text-white">
              {result.correctAnswers}
            </div>
            <div>Bonnes réponses</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">
              {Math.round(result.accuracy * 100)}%
            </div>
            <div>Précision</div>
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
                +{result.streakBonus} bonus série
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-4 justify-center">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link href="/">
            <Button className="px-8 py-4 text-lg font-bold bg-white/20 hover:bg-white/30 text-white rounded-full">
              Accueil
            </Button>
          </Link>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onReplay}
            className="px-8 py-4 text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white rounded-full"
            aria-label="Rejouer"
          >
            Rejouer
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
