/**
 * PracticeSelection
 * ISO/IEC 25010 - SRP: Table selection UI only
 */

'use client';

import { motion } from 'framer-motion';
import {
  GradientText,
  TextReveal,
  StaggerList,
  MagicCard,
  MagicButton,
} from '@/components/effects';

interface Props {
  onSelectTable: (table: number | null) => void;
}

export function PracticeSelection({ onSelectTable }: Props) {
  return (
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
            onClick={() => onSelectTable(table)}
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
        onClick={() => onSelectTable(null)}
        variant="rainbow"
        className="px-12 py-6 text-xl"
        aria-label="Toutes les tables"
      >
        🌈 Toutes les tables
      </MagicButton>
    </motion.div>
  );
}
