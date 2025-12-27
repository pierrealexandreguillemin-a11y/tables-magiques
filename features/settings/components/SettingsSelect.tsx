'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
}

interface SettingsSelectProps<T extends string = string> {
  /** Select label */
  label: string;
  /** Optional description */
  description?: string;
  /** Current value */
  value: T;
  /** Change handler - receives validated option value */
  onChange: (value: T) => void;
  /** Available options */
  options: SelectOption<T>[];
  /** Disabled state */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
  /** Test ID */
  testId?: string;
}

/**
 * Type guard to check if value is in options
 */
function isValidOption<T extends string>(
  value: string,
  options: SelectOption<T>[]
): value is T {
  return options.some((opt) => opt.value === value);
}

// =============================================================================
// COMPONENT
// =============================================================================

export function SettingsSelect<T extends string = string>({
  label,
  description,
  value,
  onChange,
  options,
  disabled = false,
  className,
  testId,
}: SettingsSelectProps<T>) {
  const id = useId();

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
      <div className="flex items-center justify-between gap-4">
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

        <select
          id={id}
          value={value}
          onChange={(e) => {
            const newValue = e.target.value;
            if (isValidOption(newValue, options)) {
              onChange(newValue);
            }
          }}
          disabled={disabled}
          className={cn(
            'px-3 py-2 rounded-xl text-sm font-medium',
            'bg-white dark:bg-slate-700',
            'border border-pink-200 dark:border-slate-600',
            'text-slate-700 dark:text-slate-200',
            'focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'cursor-pointer'
          )}
          aria-label={label}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
