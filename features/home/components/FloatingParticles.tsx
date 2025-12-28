/**
 * FloatingParticles
 * ISO/IEC 25010 - SRP: Particle rendering only
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Particle, Star } from '../hooks/useParticles';

interface Props {
  particles: Particle[];
  stars: Star[];
}

export function FloatingParticles({ particles, stars }: Props) {
  return (
    <>
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
    </>
  );
}
