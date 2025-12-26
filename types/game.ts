/**
 * Types du jeu - ISO/IEC 25010 (Contrats)
 * SOURCE UNIQUE DE VÉRITÉ pour tous les types métier
 */

// =============================================================================
// TYPES DE BASE
// =============================================================================

export type GameMode = 'practice' | 'challenge';

export interface Question {
  a: number;
  b: number;
  answer: number;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

export interface ChallengeConfig {
  globalTime: number; // Temps total en secondes (defaut: 180)
  questionTime: number; // Temps par question en secondes (defaut: 5)
}

export interface PracticeConfig {
  questionsPerTable: number;
}

export interface GameConfig {
  practice: PracticeConfig;
  challenge: ChallengeConfig;
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  practice: {
    questionsPerTable: 10,
  },
  challenge: {
    globalTime: 180, // 3 minutes
    questionTime: 5, // 5 secondes
  },
};

// =============================================================================
// CHALLENGE MODE - ÉTATS
// =============================================================================

export type ChallengePhase = 'ready' | 'playing' | 'game_over';

export interface ChallengeState {
  phase: ChallengePhase;
  globalTimeRemaining: number;
  questionTimeRemaining: number;
  score: number;
  questionsAnswered: number;
  streak: number;
  currentQuestion: Question | null;
  config: ChallengeConfig;
}

export interface ChallengeResult {
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
  timeBonus: number;
  streakBonus: number;
  totalScore: number;
}

// =============================================================================
// PRACTICE MODE - ÉTATS
// =============================================================================

export interface PracticeState {
  phase: 'selection' | 'playing' | 'completed';
  selectedTable: number | null;
  questions: Question[];
  currentIndex: number;
  userAnswer: string;
  score: number;
  streak: number;
  isCorrect: boolean | null;
  showFeedback: boolean;
}

// =============================================================================
// SCORE & PERSISTENCE
// =============================================================================

export interface Score {
  userId: string;
  mode: GameMode;
  table?: number; // Pour le mode practice
  correct: number;
  total: number;
  timeRemaining?: number; // Pour le mode challenge
  timestamp: string; // ISO 8601
}

// =============================================================================
// LEGACY - GameState (deprecated, use PracticeState/ChallengeState)
// =============================================================================

/** @deprecated Use PracticeState or ChallengeState instead */
export interface GameState {
  mode: GameMode;
  currentTable?: number;
  question: Question | null;
  userAnswer: string;
  score: number;
  total: number;
  streak: number;
  isCorrect: boolean | null;
  showFeedback: boolean;
  timeRemaining?: number;
  questionTimeRemaining?: number;
  isActive: boolean;
}
