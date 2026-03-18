/**
 * Game Feature - Barrel Export
 * ISO/IEC 25010 - Architecture modulaire
 */

// Page Components
export { PracticePage } from './components/PracticePage';
export { ChallengePage } from './components/ChallengePage';

// UI Components
export { QuestionDisplay } from './components/QuestionDisplay';
export { NumberPad } from './components/NumberPad';
export { ScoreBoard } from './components/ScoreBoard';
export { GlobalTimer } from './components/GlobalTimer';
export { QuestionTimer } from './components/QuestionTimer';

// Hooks
export { useChallenge } from './hooks/useChallenge';
export { usePractice } from './hooks/usePractice';

// Game logic
export {
  generateQuestion,
  generateRandomQuestion,
  generateAllQuestionsForTable,
  shuffleArray,
  validateTable,
} from './hooks/questions';

export {
  checkAnswer,
  calculateScore,
  calculateAccuracy,
  updateStreak,
  checkPerfect,
  calculateBonus,
} from './hooks/scoring';

export {
  createChallengeState,
  startChallenge,
  tickGlobalTimer,
  tickQuestionTimer,
  answerQuestion,
  skipQuestion,
  endChallenge,
  calculateChallengeScore,
  isGameOver,
  isQuestionTimeout,
  formatTime,
} from './hooks/challenge';

// Types
export type { QuestionDisplayProps } from './components/QuestionDisplay';
export type { NumberPadProps } from './components/NumberPad';
export type { ScoreBoardProps } from './components/ScoreBoard';
export type { GlobalTimerProps } from './components/GlobalTimer';
export type { QuestionTimerProps } from './components/QuestionTimer';
export type { UseChallengeReturn } from './hooks/useChallenge';
export type {
  UsePracticeReturn,
  PracticeState,
  PracticePhase,
  PracticeResult,
} from './hooks/usePractice';
export type {
  ChallengeConfig,
  ChallengePhase,
  ChallengeState,
  ChallengeResult,
} from '@/types/game';
