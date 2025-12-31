/**
 * HomeContent
 * ISO/IEC 25010 - SRP: Main content only
 */

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  GradientText,
  KawaiiMascot,
  GradientBorder,
  PulseGlow,
  MagneticButton,
} from '@/components/effects';

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
        {/* Mode Entrainement - Glassmorphism + Gradient Border + Pulse */}
        <Link href="/practice" data-tour="practice-button">
          <PulseGlow color="#a855f7" intensity="medium">
            <GradientBorder variant="unicorn" animate glow borderWidth={3}>
              <MagneticButton className="text-xl px-8 py-5 bg-white/90 backdrop-blur-md text-purple-600 font-bold rounded-xl shadow-2xl">
                🎮 Mode Entraînement
              </MagneticButton>
            </GradientBorder>
          </PulseGlow>
        </Link>

        {/* Mode Challenge - Glassmorphism + Gradient Border + Pulse */}
        <Link href="/challenge" data-tour="challenge-button">
          <PulseGlow color="#f97316" intensity="medium">
            <GradientBorder variant="star" animate glow borderWidth={3}>
              <MagneticButton className="text-xl px-8 py-5 bg-gradient-to-r from-orange-400 to-red-500 backdrop-blur-md text-white font-bold rounded-xl shadow-2xl">
                🔥 Mode Challenge
              </MagneticButton>
            </GradientBorder>
          </PulseGlow>
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
