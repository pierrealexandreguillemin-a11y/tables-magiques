'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface SettingsSliderProps {
  /** Slider label */
  label: string;
  /** Optional description */
  description?: string;
  /** Current value */
  value: number;
  /** Change handler */
  onChange: (value: number) => void;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Format value for display */
  formatValue?: (value: number) => string;
  /** Unit label (e.g., "%", "s") */
  unit?: string;
  /** Additional class names */
  className?: string;
  /** Test ID */
  testId?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function SettingsSlider({
  label,
  description,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  formatValue,
  unit = '',
  className,
  testId,
}: SettingsSliderProps) {
  const id = useId();

  const displayValue = formatValue ? formatValue(value) : `${value}${unit}`;

  // Calculate percentage for gradient
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div
      data-testid={testId}
      className={cn(
        'py-3',
        'border-b border-pink-100/50 dark:border-slate-700/50 last:border-0',
        disabled && 'opacity-50',
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 min-w-0">
          <label
            htmlFor={id}
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            {label}
          </label>
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {description}
            </p>
          )}
        </div>
        <span
          className={cn(
            'text-sm font-medium px-2 py-0.5 rounded-full',
            'bg-pink-100 dark:bg-pink-900/30',
            'text-pink-700 dark:text-pink-300'
          )}
        >
          {displayValue}
        </span>
      </div>

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className={cn(
          'w-full h-2 rounded-full appearance-none cursor-pointer',
          'bg-slate-200 dark:bg-slate-700',
          'focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2',
          'disabled:cursor-not-allowed'
        )}
        style={{
          background: `linear-gradient(to right,
            rgb(236, 72, 153) 0%,
            rgb(168, 85, 247) ${percentage}%,
            rgb(226, 232, 240) ${percentage}%,
            rgb(226, 232, 240) 100%)`,
        }}
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
      />
    </div>
  );
}
