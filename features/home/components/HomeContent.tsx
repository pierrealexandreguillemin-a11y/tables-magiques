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
  PulseGlow,
  StaggerList,
  MagneticButton,
} from '@/components/effects';

const DEPLOY_STATS = [
  { id: 0, emoji: '⚡', label: 'Deploy', value: 'Vercel' },
  { id: 1, emoji: '🗄️', label: 'Database', value: 'Upstash' },
  { id: 2, emoji: '✨', label: 'Animations', value: 'GSAP' },
  { id: 3, emoji: '🎨', label: 'UI', value: 'shadcn' },
] as const;

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
        className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.6, type: 'spring' }}
      >
        <Link href="/practice" data-tour="practice-button">
          <PulseGlow color="#a855f7" intensity="subtle">
            <MagneticButton className="text-xl px-8 py-6 bg-white text-purple-600 hover:bg-white/90 rounded-full font-bold shadow-2xl">
              🎮 Mode Entraînement
            </MagneticButton>
          </PulseGlow>
        </Link>
        <Link href="/challenge" data-tour="challenge-button">
          <PulseGlow color="#f97316" intensity="subtle">
            <MagneticButton className="text-xl px-8 py-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-bold shadow-2xl">
              🔥 Mode Challenge
            </MagneticButton>
          </PulseGlow>
        </Link>
      </motion.div>

      <StaggerList
        items={[...DEPLOY_STATS]}
        keyExtractor={(item) => `stat-${item.id}`}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
        staggerDelay={0.15}
        direction="up"
        renderItem={(stat) => (
          <motion.div
            className="bg-white/15 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/25 cursor-pointer"
            whileHover={{
              scale: 1.08,
              backgroundColor: 'rgba(255,255,255,0.25)',
              y: -5,
            }}
          >
            <div className="text-3xl sm:text-4xl mb-2">{stat.emoji}</div>
            <div className="text-xs sm:text-sm text-white/70">{stat.label}</div>
            <div className="text-sm sm:text-lg font-bold text-white">
              {stat.value}
            </div>
          </motion.div>
        )}
      />

      <motion.div
        className="mt-8 flex justify-center"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, type: 'spring', stiffness: 200 }}
      >
        <KawaiiMascot character="planet" mood="blissful" size={100} />
      </motion.div>

      <motion.p
        className="mt-4 text-white/80 text-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
      >
        PWA Moderne - Prête pour tablette !
      </motion.p>
    </div>
  );
}
