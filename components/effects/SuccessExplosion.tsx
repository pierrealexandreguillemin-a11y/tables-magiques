'use client';

/**
 * SuccessExplosion - Explosion de célébration
 * ISO/IEC 25010 - Feedback positif maximal
 */

import { useEffect, useRef } from 'react';
import * as m from 'motion/react-m';
import { AnimatePresence } from 'motion/react';
import { LottieAnimation } from './LottieAnimation';
import { ConfettiBurst } from './ConfettiBurst';
import { cn } from '@/lib/utils';

interface SuccessExplosionProps {
  show: boolean;
  onComplete?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
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
}: SuccessExplosionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
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
        <m.div
          ref={containerRef}
          className={cn(
            'fixed inset-0 z-50 pointer-events-none flex items-center justify-center',
            className
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {show && <ConfettiBurst />}
          <m.div
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
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

export default SuccessExplosion;
