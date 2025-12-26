/**
 * QuestionDisplay - Affichage question multiplication
 * ISO/IEC 25010 - Composant reutilisable et testable
 */

import { cn } from '@/lib/utils';
import type { Question } from '@/types/game';

export interface QuestionDisplayProps {
  question: Question;
  userAnswer?: string;
  isCorrect?: boolean | null;
  showFeedback?: boolean;
  className?: string;
}

export function QuestionDisplay({
  question,
  userAnswer = '',
  isCorrect = null,
  showFeedback = false,
  className,
}: QuestionDisplayProps) {
  const containerClasses = cn(
    'rounded-3xl p-8 transition-colors duration-300',
    {
      'bg-green-500/30': showFeedback && isCorrect === true,
      'bg-red-500/30': showFeedback && isCorrect === false,
      'bg-white/20 backdrop-blur-md': !showFeedback || isCorrect === null,
    },
    className
  );

  return (
    <div
      role="region"
      aria-label="Question de multiplication"
      className={containerClasses}
    >
      {/* Question */}
      <div className="text-6xl sm:text-8xl font-bold text-white mb-6 text-center">
        {question.a} × {question.b} = ?
      </div>

      {/* Reponse utilisateur */}
      <div className="min-h-[80px] flex items-center justify-center">
        <span className="text-5xl font-bold text-white">
          {userAnswer || '...'}
        </span>
      </div>

      {/* Feedback */}
      {showFeedback && isCorrect !== null && (
        <div className="mt-4 text-center">
          {isCorrect ? (
            <div data-testid="feedback-correct" className="text-4xl">
              ✨ Bravo ! ✨
            </div>
          ) : (
            <div
              data-testid="feedback-incorrect"
              className="text-2xl text-white"
            >
              La réponse était {question.answer}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
