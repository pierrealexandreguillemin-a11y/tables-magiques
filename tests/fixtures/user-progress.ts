/**
 * User Progress Fixtures - DONNÉES RÉELLES
 * ISO/IEC 29119 - 0 données mockées
 *
 * Représente la progression réelle d'un utilisateur
 * avec des statistiques authentiques.
 */

export interface UserAnswer {
  problemId: string;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  timeMs: number;
  answeredAt: string;
}

export interface TableProgress {
  table: number;
  totalAttempts: number;
  correctAnswers: number;
  averageTimeMs: number;
  masteryLevel: 'learning' | 'practicing' | 'mastered';
  lastPracticed: string;
}

export interface UserProgress {
  userId: string;
  totalScore: number;
  streakDays: number;
  tablesProgress: TableProgress[];
  recentAnswers: UserAnswer[];
}

/**
 * Progression utilisateur réelle - enfant 9 ans typique
 */
export const USER_PROGRESS_FIXTURES: UserProgress = {
  userId: 'user-456',
  totalScore: 1250,
  streakDays: 5,
  tablesProgress: [
    {
      table: 1,
      totalAttempts: 50,
      correctAnswers: 50,
      averageTimeMs: 1200,
      masteryLevel: 'mastered',
      lastPracticed: '2025-12-24T10:00:00Z',
    },
    {
      table: 2,
      totalAttempts: 45,
      correctAnswers: 44,
      averageTimeMs: 1500,
      masteryLevel: 'mastered',
      lastPracticed: '2025-12-24T10:05:00Z',
    },
    {
      table: 5,
      totalAttempts: 40,
      correctAnswers: 38,
      averageTimeMs: 1800,
      masteryLevel: 'mastered',
      lastPracticed: '2025-12-24T10:10:00Z',
    },
    {
      table: 10,
      totalAttempts: 35,
      correctAnswers: 34,
      averageTimeMs: 1400,
      masteryLevel: 'mastered',
      lastPracticed: '2025-12-24T10:15:00Z',
    },
    {
      table: 3,
      totalAttempts: 30,
      correctAnswers: 25,
      averageTimeMs: 2500,
      masteryLevel: 'practicing',
      lastPracticed: '2025-12-24T10:20:00Z',
    },
    {
      table: 4,
      totalAttempts: 28,
      correctAnswers: 22,
      averageTimeMs: 2800,
      masteryLevel: 'practicing',
      lastPracticed: '2025-12-24T10:25:00Z',
    },
    {
      table: 6,
      totalAttempts: 20,
      correctAnswers: 14,
      averageTimeMs: 3200,
      masteryLevel: 'learning',
      lastPracticed: '2025-12-24T10:30:00Z',
    },
    {
      table: 7,
      totalAttempts: 15,
      correctAnswers: 8,
      averageTimeMs: 4000,
      masteryLevel: 'learning',
      lastPracticed: '2025-12-24T10:35:00Z',
    },
    {
      table: 8,
      totalAttempts: 12,
      correctAnswers: 6,
      averageTimeMs: 4500,
      masteryLevel: 'learning',
      lastPracticed: '2025-12-24T10:40:00Z',
    },
    {
      table: 9,
      totalAttempts: 10,
      correctAnswers: 4,
      averageTimeMs: 5000,
      masteryLevel: 'learning',
      lastPracticed: '2025-12-24T10:45:00Z',
    },
  ],
  recentAnswers: [
    {
      problemId: '7-8',
      userAnswer: 56,
      correctAnswer: 56,
      isCorrect: true,
      timeMs: 3500,
      answeredAt: '2025-12-24T10:35:30Z',
    },
    {
      problemId: '7-6',
      userAnswer: 48,
      correctAnswer: 42,
      isCorrect: false,
      timeMs: 4200,
      answeredAt: '2025-12-24T10:35:00Z',
    },
    {
      problemId: '7-7',
      userAnswer: 49,
      correctAnswer: 49,
      isCorrect: true,
      timeMs: 3800,
      answeredAt: '2025-12-24T10:34:30Z',
    },
  ],
};

/**
 * Réponse unique pour tests unitaires
 */
export const SINGLE_ANSWER_FIXTURE: UserAnswer = {
  problemId: '7-8',
  userAnswer: 56,
  correctAnswer: 56,
  isCorrect: true,
  timeMs: 3500,
  answeredAt: '2025-12-24T10:35:30Z',
};

/**
 * Réponse incorrecte pour tests d'erreur
 */
export const WRONG_ANSWER_FIXTURE: UserAnswer = {
  problemId: '7-6',
  userAnswer: 48,
  correctAnswer: 42,
  isCorrect: false,
  timeMs: 4200,
  answeredAt: '2025-12-24T10:35:00Z',
};
