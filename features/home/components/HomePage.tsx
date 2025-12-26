'use client';

/**
 * HomePage Component - Tables Magiques
 * ISO/IEC 25010 - Landing page avec animations GSAP/Framer
 */

import { useRef, useMemo, useCallback } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { InstallButton } from '@/components/pwa/InstallButton';
import {
  GradientText,
  KawaiiMascot,
  FairyBackground,
  PulseGlow,
  StaggerList,
  MagneticButton,
} from '@/components/effects';

gsap.registerPlugin(useGSAP);

/** Generateur pseudo-aleatoire stable (SSR-safe) */
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

/** Stats affichees sur la page */
const DEPLOY_STATS = [
  { emoji: '⚡', label: 'Deploy', value: 'Vercel' },
  { emoji: '🗄️', label: 'Database', value: 'Upstash' },
  { emoji: '✨', label: 'Animations', value: 'GSAP' },
  { emoji: '🎨', label: 'UI', value: 'shadcn' },
] as const;

export function HomePage() {
  const containerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const unicornRef = useRef<HTMLDivElement>(null);

  // GSAP Animations
  const { contextSafe } = useGSAP(
    () => {
      if (!containerRef.current) return;

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out', duration: 1 },
      });

      if (titleRef.current) {
        tl.from(
          titleRef.current,
          {
            opacity: 0,
            y: -100,
            scale: 0.5,
            duration: 1.5,
            ease: 'elastic.out(1, 0.5)',
          },
          0.3
        );
      }

      if (unicornRef.current) {
        gsap.to(unicornRef.current, {
          y: -25,
          rotation: 8,
          duration: 2.5,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: -1,
        });
      }

      gsap.to(containerRef.current, {
        backgroundPosition: '200% 50%',
        duration: 20,
        ease: 'none',
        repeat: -1,
      });
    },
    { scope: containerRef, revertOnUpdate: false }
  );

  const handleUnicornClick = useCallback(() => {
    const safeAnimation = contextSafe(() => {
      if (!unicornRef.current) return;
      gsap.to(unicornRef.current, {
        scale: 1.5,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out',
      });
    });
    safeAnimation();
  }, [contextSafe]);

  // Particules flottantes (SSR-safe)
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: `${seededRandom(i * 3 + 1) * 100}%`,
        top: `${seededRandom(i * 3 + 2) * 100}%`,
        size: seededRandom(i * 3 + 3) * 8 + 4,
        duration: 3 + seededRandom(i * 3 + 4) * 4,
        delay: seededRandom(i * 3 + 5) * 3,
        xOffset: seededRandom(i * 3 + 6) * 30 - 15,
      })),
    []
  );

  // Etoiles scintillantes
  const stars = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: `${seededRandom(i * 4 + 100) * 100}%`,
        top: `${seededRandom(i * 4 + 101) * 100}%`,
        duration: 1 + seededRandom(i * 4 + 102) * 2,
        delay: seededRandom(i * 4 + 103) * 2,
      })),
    []
  );

  return (
    <main
      ref={containerRef}
      className="min-h-screen flex items-center justify-center overflow-hidden relative bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-500 dark:from-indigo-900 dark:via-purple-900 dark:to-slate-900"
      style={{ backgroundSize: '400% 400%' }}
    >
      {/* Fond avec particules féériques */}
      <FairyBackground />

      {/* Header fixe */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <InstallButton />
        <ThemeToggle />
      </div>

      {/* Particules flottantes */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              background:
                'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 70%)',
              boxShadow: '0 0 10px rgba(255,255,255,0.5)',
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, p.xOffset, 0],
              opacity: [0.3, 0.9, 0.3],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </AnimatePresence>

      {/* Etoiles scintillantes */}
      {stars.map((s) => (
        <motion.div
          key={`star-${s.id}`}
          className="absolute text-2xl pointer-events-none"
          style={{ left: s.left, top: s.top }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.8, 1.2, 0.8],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            delay: s.delay,
          }}
        >
          ✨
        </motion.div>
      ))}

      {/* Arc-en-ciel decoratif */}
      <div
        className="absolute top-0 left-0 w-64 h-64 opacity-30 pointer-events-none"
        style={{
          background:
            'conic-gradient(from 180deg, #ff0000, #ff8000, #ffff00, #00ff00, #00ffff, #0080ff, #8000ff, #ff0080, #ff0000)',
          borderRadius: '0 0 100% 0',
          filter: 'blur(30px)',
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-64 h-64 opacity-30 pointer-events-none"
        style={{
          background:
            'conic-gradient(from 0deg, #ff0000, #ff8000, #ffff00, #00ff00, #00ffff, #0080ff, #8000ff, #ff0080, #ff0000)',
          borderRadius: '100% 0 0 0',
          filter: 'blur(30px)',
        }}
      />

      {/* Contenu principal */}
      <div className="text-center z-10 relative px-4">
        {/* Licorne animee */}
        <motion.div
          ref={unicornRef}
          className="text-8xl sm:text-9xl mb-6 cursor-pointer select-none"
          onClick={handleUnicornClick}
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

        {/* Titre principal avec GradientText */}
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

        {/* Sous-titre */}
        <motion.p
          className="text-xl sm:text-2xl text-white/90 mb-8 font-medium"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          Apprends tes multiplications en t&apos;amusant !
        </motion.p>

        {/* Boutons d'action */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.6, type: 'spring' }}
        >
          <Link href="/practice">
            <PulseGlow color="#a855f7" intensity="subtle">
              <MagneticButton className="text-xl px-8 py-6 bg-white text-purple-600 hover:bg-white/90 rounded-full font-bold shadow-2xl">
                🎮 Mode Pratique
              </MagneticButton>
            </PulseGlow>
          </Link>
          <Link href="/challenge">
            <PulseGlow color="#f97316" intensity="subtle">
              <MagneticButton className="text-xl px-8 py-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-bold shadow-2xl">
                🔥 Mode Challenge
              </MagneticButton>
            </PulseGlow>
          </Link>
        </motion.div>

        {/* Stats de deploiement avec StaggerList */}
        <StaggerList
          items={DEPLOY_STATS.map((stat, i) => ({ ...stat, id: i }))}
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
              <div className="text-xs sm:text-sm text-white/70">
                {stat.label}
              </div>
              <div className="text-sm sm:text-lg font-bold text-white">
                {stat.value}
              </div>
            </motion.div>
          )}
        />

        {/* Mascotte Kawaii */}
        <motion.div
          className="mt-8 flex justify-center"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2, type: 'spring', stiffness: 200 }}
        >
          <KawaiiMascot character="planet" mood="blissful" size={100} />
        </motion.div>

        {/* Message PWA */}
        <motion.p
          className="mt-4 text-white/80 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
        >
          PWA Moderne - Prete pour tablette !
        </motion.p>
      </div>

      {/* Effet de vague en bas */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-900/40 to-transparent pointer-events-none" />
    </main>
  );
}
