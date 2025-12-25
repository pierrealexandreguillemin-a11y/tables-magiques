/**
 * Types du jeu - ISO/IEC 25010 (Contrats)
 */

export type GameMode = 'practice' | 'challenge';

export interface Question {
  a: number;
  b: number;
  answer: number;
}

export interface Score {
  userId: string;
  mode: GameMode;
  table?: number; // Pour le mode practice
  correct: number;
  total: number;
  timeRemaining?: number; // Pour le mode challenge
  timestamp: string; // ISO 8601
}

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
  // Challenge mode specifics
  timeRemaining?: number;
  questionTimeRemaining?: number;
  isActive: boolean;
}

export interface GameConfig {
  practice: {
    questionsPerTable: number;
  };
  challenge: {
    totalTime: number; // 180 seconds (3 minutes)
    questionTime: number; // 5 seconds per question
  };
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  practice: {
    questionsPerTable: 10,
  },
  challenge: {
    totalTime: 180,
    questionTime: 5,
  },
};
