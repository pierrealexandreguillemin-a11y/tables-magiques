'use client';

/**
 * StaggerList - Liste avec animation stagger
 * ISO/IEC 25010 - Révélation progressive des éléments
 */

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface StaggerListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  className?: string;
  itemClassName?: string;
  staggerDelay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

const directionVariants = {
  up: { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } },
  down: { initial: { opacity: 0, y: -30 }, animate: { opacity: 1, y: 0 } },
  left: { initial: { opacity: 0, x: 30 }, animate: { opacity: 1, x: 0 } },
  right: { initial: { opacity: 0, x: -30 }, animate: { opacity: 1, x: 0 } },
};

export function StaggerList<T>({
  items,
  renderItem,
  keyExtractor,
  className,
  itemClassName,
  staggerDelay = 0.1,
  direction = 'up',
}: StaggerListProps<T>) {
  const { shouldAnimate } = useReducedMotion();
  const variants = directionVariants[direction];

  if (!shouldAnimate) {
    return (
      <div className={className}>
        {items.map((item, index) => (
          <div key={keyExtractor(item, index)} className={itemClassName}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      {items.map((item, index) => (
        <motion.div
          key={keyExtractor(item, index)}
          className={itemClassName}
          initial={variants.initial}
          animate={variants.animate}
          transition={{
            type: 'spring' as const,
            stiffness: 300,
            damping: 25,
            delay: index * staggerDelay,
          }}
        >
          {renderItem(item, index)}
        </motion.div>
      ))}
    </div>
  );
}

export default StaggerList;
