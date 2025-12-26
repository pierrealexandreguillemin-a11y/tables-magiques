/**
 * GlobalTimer - Affichage timer global challenge
 * ISO/IEC 25010 - Composant reutilisable et testable
 */

import { cn } from '@/lib/utils';
import { formatTime } from '../hooks/challenge';

export interface GlobalTimerProps {
  timeRemaining: number;
  className?: string;
}

export function GlobalTimer({ timeRemaining, className }: GlobalTimerProps) {
  const isUrgent = timeRemaining <= 30;
  const isCritical = timeRemaining <= 10;

  const timerClasses = cn(
    'text-4xl font-bold transition-colors duration-300',
    {
      'text-white': !isUrgent,
      'text-red-400 animate-pulse': isUrgent && !isCritical,
      'text-red-500 animate-pulse': isCritical,
    },
    className
  );

  return (
    <div
      role="timer"
      aria-label="Temps restant"
      aria-live="polite"
      className={timerClasses}
    >
      {formatTime(timeRemaining)}
    </div>
  );
}
