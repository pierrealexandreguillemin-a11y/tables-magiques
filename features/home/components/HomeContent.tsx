/**
 * HomeContent
 * ISO/IEC 25010 - SRP: Main content only
 */

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { GradientText, KawaiiMascot } from '@/components/effects';

interface Props {
  titleRef: React.RefObject<HTMLHeadingElement | null>;
  unicornRef: React.RefObject<HTMLDivElement | null>;
  onUnicornClick: () => void;
}

export function HomeContent({ titleRef, unicornRef, onUnicornClick }: Props) {
  return (
    <div className="text-center z-10 relative px-4">
      <motion.div
        ref={unicornRef}
        data-tour="logo"
        className="text-8xl sm:text-9xl mb-6 cursor-pointer select-none"
        onClick={onUnicornClick}
        whileHover={{
          scale: 1.3,
          rotate: [0, -10, 10, -10, 0],
          transition: { duration: 0.5 },
        }}
        whileTap={{ scale: 0.9 }}
        style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.5))' }}
      >
        🦄
      </motion.div>

      <h1
        ref={titleRef}
        className="text-4xl sm:text-6xl md:text-7xl font-bold mb-4"
        style={{
          textShadow:
            '0 0 40px rgba(255,255,255,0.6), 0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        <GradientText variant="rainbow" animate as="span">
          Tables Magiques
        </GradientText>
      </h1>

      <motion.p
        className="text-xl sm:text-2xl text-white/90 mb-8 font-medium"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        Apprends tes multiplications en t&apos;amusant !
      </motion.p>

      <motion.div
        className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.6, type: 'spring' }}
      >
        <Link href="/practice" data-tour="practice-button">
          <motion.button
            className="text-xl px-10 py-5 bg-white text-purple-600 rounded-2xl font-bold shadow-lg border-4 border-purple-300"
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            🎮 Mode Entraînement
          </motion.button>
        </Link>
        <Link href="/challenge" data-tour="challenge-button">
          <motion.button
            className="text-xl px-10 py-5 bg-orange-500 text-white rounded-2xl font-bold shadow-lg border-4 border-orange-300"
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            🔥 Mode Challenge
          </motion.button>
        </Link>
      </motion.div>

      <motion.div
        className="mt-12 flex justify-center"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.8, type: 'spring', stiffness: 200 }}
      >
        <KawaiiMascot character="planet" mood="blissful" size={100} />
      </motion.div>
    </div>
  );
}
