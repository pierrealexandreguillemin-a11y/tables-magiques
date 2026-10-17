'use client';

/**
 * TextReveal - Animation revelation de texte
 * ISO/IEC 25010 - Enrichissement visuel titres
 *
 * Features:
 * - Variants: fade, slide, typewriter, blur
 * - Support as prop (h1, h2, span, etc.)
 * - Respect reduced-motion
 */

import { useMemo } from 'react';
import * as m from 'motion/react-m';
import { type Variants } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import type { TextRevealProps } from '@/types/effects';

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.03,
    },
  },
};

const getCharVariants = (variant: string): Variants => {
  switch (variant) {
    case 'slide':
      return {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      };
    case 'typewriter':
      return {
        hidden: { opacity: 0, display: 'none' },
        visible: { opacity: 1, display: 'inline' },
      };
    case 'blur':
      return {
        hidden: { opacity: 0, filter: 'blur(10px)' },
        visible: { opacity: 1, filter: 'blur(0px)' },
      };
    case 'fade':
    default:
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      };
  }
};

// =============================================================================
// COMPONENT
// =============================================================================

export function TextReveal({
  children,
  variant = 'fade',
  delay = 0,
  duration = 0.5,
  as: Tag = 'span',
  className,
  onComplete,
}: TextRevealProps) {
  const { shouldAnimate } = useReducedMotion();

  // Separer le texte en caracteres (preserve espaces)
  const characters = useMemo(() => {
    return children.split('').map((char, index) => ({
      char,
      key: `${char}-${index}`,
    }));
  }, [children]);

  const charVariants = getCharVariants(variant);

  // Sans animation: rendu direct
  if (!shouldAnimate) {
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <m.span
      className={cn('inline-block', className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onAnimationComplete={onComplete}
      style={{ display: 'inline-block' }}
    >
      {characters.map(({ char, key }) => (
        <m.span
          key={key}
          className="inline-block"
          variants={charVariants}
          transition={{
            duration: duration / characters.length,
            delay,
            ease: 'easeOut',
          }}
          style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </m.span>
      ))}
    </m.span>
  );
}

/**
 * TextReveal par mots (plus fluide pour longues phrases)
 */
export function WordReveal({
  children,
  variant = 'fade',
  delay = 0,
  duration = 0.5,
  as: Tag = 'span',
  className,
  onComplete,
}: TextRevealProps) {
  const { shouldAnimate } = useReducedMotion();

  const words = useMemo(() => {
    return children.split(' ').map((word, index) => ({
      word,
      key: `${word}-${index}`,
    }));
  }, [children]);

  const charVariants = getCharVariants(variant);

  if (!shouldAnimate) {
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <m.span
      className={cn('inline-block', className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onAnimationComplete={onComplete}
    >
      {words.map(({ word, key }, index) => (
        <m.span
          key={key}
          className="inline-block mr-[0.25em]"
          variants={charVariants}
          transition={{
            duration: duration / words.length,
            delay: delay + index * 0.1,
            ease: 'easeOut',
          }}
        >
          {word}
        </m.span>
      ))}
    </m.span>
  );
}

export default TextReveal;
