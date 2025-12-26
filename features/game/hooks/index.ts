/**
 * Game Hooks - Barrel Export
 * ISO/IEC 25010 - Logique métier pure
 */

// React Hooks
export { useChallenge } from './useChallenge';
export type { UseChallengeReturn } from './useChallenge';
export { usePractice } from './usePractice';
export type {
  UsePracticeReturn,
  PracticeState,
  PracticePhase,
  PracticeResult,
} from './usePractice';

// Question generation
export {
  generateQuestion,
  generateRandomQuestion,
  generateAllQuestionsForTable,
  shuffleArray,
  validateTable,
} from './questions';

// Scoring logic
export {
  checkAnswer,
  calculateScore,
  calculateAccuracy,
  updateStreak,
  checkPerfect,
  calculateBonus,
} from './scoring';

// Challenge mode
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
} from './challenge';

// Types re-exported from source of truth (@/types/game)
export type {
  ChallengeConfig,
  ChallengePhase,
  ChallengeState,
  ChallengeResult,
} from '@/types/game';
