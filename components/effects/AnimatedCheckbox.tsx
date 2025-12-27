'use client';

/**
 * AnimatedCheckbox - Toggle anime pour Settings
 * ISO/IEC 25010 - Feedback visuel interactif
 *
 * Features:
 * - Variants: checkbox, switch
 * - Animation check mark SVG
 * - Support disabled, loading
 * - Accessibilite complete
 */

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import type { AnimatedCheckboxProps } from '@/types/effects';

// =============================================================================
// SIZE CONFIG
// =============================================================================

const sizeConfig = {
  sm: {
    switch: { width: 36, height: 20, thumb: 16 },
    checkbox: { size: 16, stroke: 2 },
    text: 'text-sm',
  },
  md: {
    switch: { width: 44, height: 24, thumb: 20 },
    checkbox: { size: 20, stroke: 2.5 },
    text: 'text-base',
  },
  lg: {
    switch: { width: 56, height: 32, thumb: 28 },
    checkbox: { size: 24, stroke: 3 },
    text: 'text-lg',
  },
};

// =============================================================================
// CHECK MARK SVG
// =============================================================================

function CheckMark({
  size,
  strokeWidth,
  checked,
  animate,
}: {
  size: number;
  strokeWidth: number;
  checked: boolean;
  animate: boolean;
}) {
  const pathVariants = {
    unchecked: { pathLength: 0, opacity: 0 },
    checked: { pathLength: 1, opacity: 1 },
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="absolute inset-0 m-auto"
    >
      <motion.path
        d="M5 12l5 5L19 7"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial="unchecked"
        animate={checked ? 'checked' : 'unchecked'}
        variants={animate ? pathVariants : undefined}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
      />
    </svg>
  );
}

// =============================================================================
// SWITCH VARIANT
// =============================================================================

function SwitchVariant({
  checked,
  disabled,
  loading,
  size,
  animate,
  onClick,
}: {
  checked: boolean;
  disabled: boolean;
  loading: boolean;
  size: 'sm' | 'md' | 'lg';
  animate: boolean;
  onClick: () => void;
}) {
  const config = sizeConfig[size].switch;
  const thumbOffset = checked ? config.width - config.thumb - 2 : 2;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        'relative rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        checked ? 'bg-primary' : 'bg-input',
        (disabled || loading) && 'opacity-50 cursor-not-allowed'
      )}
      style={{ width: config.width, height: config.height }}
    >
      <motion.span
        className={cn(
          'absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow-sm flex items-center justify-center',
          loading && 'bg-transparent'
        )}
        style={{ width: config.thumb, height: config.thumb }}
        initial={false}
        animate={{ x: thumbOffset }}
        transition={
          animate
            ? { type: 'spring', stiffness: 500, damping: 30 }
            : { duration: 0 }
        }
      >
        {loading && (
          <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
        )}
      </motion.span>
    </button>
  );
}

// =============================================================================
// CHECKBOX VARIANT
// =============================================================================

function CheckboxVariant({
  checked,
  disabled,
  loading,
  size,
  animate,
  onClick,
}: {
  checked: boolean;
  disabled: boolean;
  loading: boolean;
  size: 'sm' | 'md' | 'lg';
  animate: boolean;
  onClick: () => void;
}) {
  const config = sizeConfig[size].checkbox;

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        'relative rounded-md border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        checked
          ? 'bg-primary border-primary text-primary-foreground'
          : 'border-input bg-background',
        (disabled || loading) && 'opacity-50 cursor-not-allowed'
      )}
      style={{ width: config.size, height: config.size }}
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin absolute inset-0 m-auto" />
      ) : (
        <CheckMark
          size={config.size - 4}
          strokeWidth={config.stroke}
          checked={checked}
          animate={animate}
        />
      )}
    </button>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AnimatedCheckbox({
  checked,
  onChange,
  variant = 'switch',
  size = 'md',
  disabled = false,
  loading = false,
  label,
  description,
  className,
}: AnimatedCheckboxProps) {
  const { shouldAnimate } = useReducedMotion();

  const handleClick = () => {
    if (!disabled && !loading) {
      onChange(!checked);
    }
  };

  const VariantComponent =
    variant === 'switch' ? SwitchVariant : CheckboxVariant;

  return (
    <label
      className={cn(
        'flex items-center gap-3 cursor-pointer',
        (disabled || loading) && 'cursor-not-allowed',
        className
      )}
    >
      <VariantComponent
        checked={checked}
        disabled={disabled}
        loading={loading}
        size={size}
        animate={shouldAnimate}
        onClick={handleClick}
      />

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span
              className={cn(
                sizeConfig[size].text,
                'font-medium',
                disabled && 'text-muted-foreground'
              )}
            >
              {label}
            </span>
          )}
          {description && (
            <span className="text-sm text-muted-foreground">{description}</span>
          )}
        </div>
      )}
    </label>
  );
}

export default AnimatedCheckbox;
