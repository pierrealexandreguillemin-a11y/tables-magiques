'use client';

/**
 * SuccessExplosion - Explosion de célébration
 * ISO/IEC 25010 - Feedback positif maximal
 */

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Particles from '@tsparticles/react';
import { useParticlesEngine } from '@/hooks/useParticlesEngine';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { LottieAnimation } from './LottieAnimation';
import { confettiConfig } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface SuccessExplosionProps {
  show: boolean;
  onComplete?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'confetti' | 'fireworks' | 'celebration';
}

const sizeMap = {
  sm: { container: 120, lottie: 80 },
  md: { container: 200, lottie: 150 },
  lg: { container: 300, lottie: 220 },
};

export function SuccessExplosion({
  show,
  onComplete,
  size = 'md',
  className,
  type = 'confetti',
}: SuccessExplosionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineReady = useParticlesEngine();
  const { shouldAnimate } = useReducedMotion();
  const dimensions = sizeMap[size];

  useEffect(() => {
    if (show && onComplete) {
      const timeout = setTimeout(onComplete, 2500);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          ref={containerRef}
          className={cn(
            'fixed inset-0 z-50 pointer-events-none flex items-center justify-center',
            className
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {show && engineReady && shouldAnimate && (
            <Particles
              id={`celebration-${type}`}
              options={confettiConfig}
              className="absolute inset-0"
            />
          )}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{
              scale: [0, 1.2, 1],
              rotate: [0, 10, 0],
            }}
            transition={{
              duration: 0.5,
              times: [0, 0.6, 1],
              ease: 'easeOut',
            }}
            style={{
              width: dimensions.container,
              height: dimensions.container,
            }}
            className="relative"
          >
            <LottieAnimation
              type="celebration"
              size={dimensions.lottie}
              autoplay
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SuccessExplosion;
