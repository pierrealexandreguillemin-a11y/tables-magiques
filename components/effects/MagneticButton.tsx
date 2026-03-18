'use client';

/**
 * MagneticButton - Bouton avec effet magnétique au hover
 * ISO/IEC 25010 - Micro-interaction avancée
 */

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

interface MagneticButtonProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function MagneticButton({
  children,
  strength = 0.3,
  className,
  style,
  onClick,
  disabled,
  type = 'button',
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { shouldAnimate } = useReducedMotion();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!shouldAnimate || !buttonRef.current) return;

    const button = buttonRef.current;
    let rafId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafId !== null) return; // Skip if a frame is pending
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const rect = button.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        setPosition({
          x: (e.clientX - centerX) * strength,
          y: (e.clientY - centerY) * strength,
        });
      });
    };

    const handleMouseLeave = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      setPosition({ x: 0, y: 0 });
    };

    button.addEventListener('mousemove', handleMouseMove);
    button.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      button.removeEventListener('mousemove', handleMouseMove);
      button.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [shouldAnimate, strength]);

  if (!shouldAnimate) {
    return (
      <button
        ref={buttonRef}
        className={className}
        style={style}
        onClick={onClick}
        disabled={disabled}
        type={type}
      >
        {children}
      </button>
    );
  }

  return (
    <motion.button
      ref={buttonRef}
      className={cn(
        'relative overflow-hidden transition-shadow hover:shadow-lg',
        className
      )}
      style={style}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </motion.button>
  );
}

export default MagneticButton;
