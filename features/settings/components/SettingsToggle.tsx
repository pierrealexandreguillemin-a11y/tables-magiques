'use client';

import { AnimatedCheckbox } from '@/components/effects/AnimatedCheckbox';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface SettingsToggleProps {
  /** Toggle label */
  label: string;
  /** Optional description */
  description?: string;
  /** Current value */
  checked: boolean;
  /** Change handler */
  onChange: (checked: boolean) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Additional class names */
  className?: string;
  /** Test ID */
  testId?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function SettingsToggle({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  loading = false,
  className,
  testId,
}: SettingsToggleProps) {
  return (
    <div
      data-testid={testId}
      className={cn(
        'flex items-center justify-between gap-4 py-3',
        'border-b border-pink-100/50 dark:border-slate-700/50 last:border-0',
        disabled && 'opacity-50',
        className
      )}
    >
      <div className="flex-1 min-w-0">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </label>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {description}
          </p>
        )}
      </div>
      <AnimatedCheckbox
        variant="switch"
        size="md"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        loading={loading}
        aria-label={label}
      />
    </div>
  );
}
