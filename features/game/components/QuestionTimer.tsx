/**
 * QuestionTimer - Barre de progression timer question
 * ISO/IEC 25010 - Composant reutilisable et testable
 */

import { cn } from '@/lib/utils';

export interface QuestionTimerProps {
  timeRemaining: number;
  maxTime: number;
  className?: string;
}

export function QuestionTimer({
  timeRemaining,
  maxTime,
  className,
}: QuestionTimerProps) {
  const percentage = Math.round((timeRemaining / maxTime) * 100);
  const isWarning = timeRemaining <= 2;
  const isDanger = timeRemaining <= 1;

  const fillClasses = cn('h-full transition-all duration-300', {
    'bg-blue-500': !isWarning,
    'bg-yellow-500': isWarning && !isDanger,
    'bg-red-500 animate-pulse': isDanger,
  });

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        role="progressbar"
        aria-label="Temps restant pour la question"
        aria-valuenow={timeRemaining}
        aria-valuemin={0}
        aria-valuemax={maxTime}
        className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden"
      >
        <div
          data-testid="progress-fill"
          className={fillClasses}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-lg font-bold text-white min-w-[2ch] text-center">
        {timeRemaining}
      </span>
    </div>
  );
}
