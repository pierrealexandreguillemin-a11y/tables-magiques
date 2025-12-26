/**
 * ScoreBoard - Affichage score et progression
 * ISO/IEC 25010 - Composant reutilisable et testable
 */

import { cn } from '@/lib/utils';

export interface ScoreBoardProps {
  score: number;
  total: number;
  currentQuestion?: number;
  totalQuestions?: number;
  streak?: number;
  className?: string;
}

export function ScoreBoard({
  score,
  total,
  currentQuestion,
  totalQuestions,
  streak = 0,
  className,
}: ScoreBoardProps) {
  const progressPercent =
    currentQuestion && totalQuestions
      ? Math.round((currentQuestion / totalQuestions) * 100)
      : 0;

  const showStreak = streak >= 3;

  return (
    <div
      role="region"
      aria-label="Score et progression"
      aria-live="polite"
      className={cn('text-white', className)}
    >
      {/* Score */}
      <div className="text-lg font-medium text-center mb-2">
        Score: {score} / {total}
      </div>

      {/* Progression */}
      {currentQuestion !== undefined && totalQuestions !== undefined && (
        <div className="mb-4">
          <div className="text-sm text-white/60 text-center mb-2">
            Question {currentQuestion} / {totalQuestions}
          </div>
          <div
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            className="w-full h-2 bg-white/20 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Streak */}
      {showStreak && (
        <div className="text-center text-yellow-300 font-bold">
          🔥 Série de {streak} !
        </div>
      )}
    </div>
  );
}
