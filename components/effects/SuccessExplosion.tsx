'use client';

/**
 * SuccessExplosion - Explosion de célébration
 * ISO/IEC 25010 - Feedback positif maximal
 */

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGsapEffects } from '@/hooks/useGsapEffects';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { LottieAnimation } from './LottieAnimation';
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
  const { confettiExplosion, fireworksDisplay, celebrationCascade } =
    useGsapEffects();
  const { shouldAnimate } = useReducedMotion();
  const dimensions = sizeMap[size];

  useEffect(() => {
    if (!show || !containerRef.current || !shouldAnimate) {
      return;
    }

    let effectCleanup: (() => void) | undefined;

    switch (type) {
      case 'fireworks':
        effectCleanup = fireworksDisplay(containerRef.current);
        break;
      case 'celebration':
        effectCleanup = celebrationCascade(containerRef.current);
        break;
      default:
        confettiExplosion(containerRef.current, {
          count: size === 'lg' ? 100 : 50,
        });
    }

    // Cleanup des effets avec timeouts internes
    return () => {
      if (effectCleanup) effectCleanup();
    };
  }, [
    show,
    type,
    size,
    shouldAnimate,
    confettiExplosion,
    fireworksDisplay,
    celebrationCascade,
  ]);

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

            {/* Particules supplémentaires */}
            {shouldAnimate &&
              [...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    background: [
                      '#ff69b4',
                      '#ffd700',
                      '#00ff00',
                      '#00ffff',
                      '#ff6b6b',
                    ][i % 5],
                    top: '50%',
                    left: '50%',
                  }}
                  initial={{ x: 0, y: 0, scale: 0 }}
                  animate={{
                    x: Math.cos((i * 30 * Math.PI) / 180) * 100,
                    y: Math.sin((i * 30 * Math.PI) / 180) * 100,
                    scale: [0, 1.5, 0],
                    opacity: [1, 1, 0],
                  }}
                  transition={{
                    duration: 1,
                    delay: 0.2 + i * 0.05,
                    ease: 'easeOut',
                  }}
                />
              ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SuccessExplosion;
