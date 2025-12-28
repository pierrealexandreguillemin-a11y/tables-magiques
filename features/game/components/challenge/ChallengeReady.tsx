/**
 * ChallengeReady
 * ISO/IEC 25010 - SRP: Ready phase UI only
 */

'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { GradientText, TextReveal } from '@/components/effects';

interface Props {
  onStart: () => void;
}

export function ChallengeReady({ onStart }: Props) {
  return (
    <motion.div
      key="ready"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center"
    >
      <h1 className="text-4xl sm:text-5xl font-bold mb-8">
        <GradientText variant="gold" animate as="span">
          <TextReveal variant="slide" delay={0.2}>
            Mode Challenge
          </TextReveal>
        </GradientText>
      </h1>

      <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 mb-8 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-white mb-4">Règles</h2>
        <ul className="text-white/90 text-left space-y-2">
          <li>3 minutes pour répondre à un maximum de questions</li>
          <li>5 secondes par question</li>
          <li>+10 points par bonne réponse</li>
          <li>Bonus streak si 3+ réponses consécutives</li>
          <li>Bonus temps pour les secondes restantes</li>
        </ul>
      </div>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={onStart}
          className="px-12 py-6 text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white rounded-full shadow-xl"
          aria-label="Commencer le challenge"
        >
          Commencer
        </Button>
      </motion.div>
    </motion.div>
  );
}
