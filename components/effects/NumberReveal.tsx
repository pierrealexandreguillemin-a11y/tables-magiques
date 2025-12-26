'use client';

/**
 * NumberReveal - Animation de révélation de nombre
 * ISO/IEC 25010 - Feedback visuel pour scores
 */

import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

interface NumberRevealProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  delay?: number;
}

export function NumberReveal({
  value,
  duration = 1.5,
  className,
  prefix = '',
  suffix = '',
  delay = 0,
}: NumberRevealProps) {
  const { shouldAnimate } = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  // Spring animation pour le comptage
  const spring = useSpring(0, {
    stiffness: 50,
    damping: 20,
    duration: duration * 1000,
  });

  const display = useTransform(spring, (current) => Math.round(current));
  const [animatedValue, setAnimatedValue] = useState(0);

  // Souscription au spring (effet externe légitime)
  useEffect(() => {
    const unsubscribe = display.on('change', (v) => setAnimatedValue(v));
    return unsubscribe;
  }, [display]);

  // Démarrer l'animation après délai
  useEffect(() => {
    if (!shouldAnimate) return;

    const timeout = setTimeout(() => {
      setIsVisible(true);
      spring.set(value);
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, [value, shouldAnimate, spring, delay]);

  // Valeur affichée: directe si pas d'animation, sinon valeur animée
  const displayValue = useMemo(
    () => (shouldAnimate ? animatedValue : value),
    [shouldAnimate, animatedValue, value]
  );

  if (!shouldAnimate) {
    return (
      <span className={className}>
        {prefix}
        {value}
        {suffix}
      </span>
    );
  }

  return (
    <motion.span
      ref={ref}
      className={cn('inline-block tabular-nums', className)}
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={isVisible ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    >
      {prefix}
      <motion.span
        key={displayValue}
        initial={{ rotateX: -90 }}
        animate={{ rotateX: 0 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {displayValue}
      </motion.span>
      {suffix}
    </motion.span>
  );
}

export default NumberReveal;
