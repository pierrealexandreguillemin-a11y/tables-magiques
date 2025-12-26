/**
 * Schemas Zod - Validation runtime
 * ISO/IEC 25010 - DRY: Schema unique, types derives
 *
 * PATTERN: Zod schema -> z.infer<> pour types
 * Utilise dans les API routes pour validation runtime
 */

import { z } from 'zod';

// =============================================================================
// PRACTICE MODE
// =============================================================================

/**
 * Stats de session practice pour verification badges
 * Compatible avec PracticeSessionStats dans types/badge.ts
 */
export const PracticeStatsSchema = z.object({
  correctAnswers: z.number().min(0),
  totalQuestions: z.number().min(0),
  currentStreak: z.number().min(0),
  maxStreak: z.number().min(0),
});

export type PracticeStatsInput = z.infer<typeof PracticeStatsSchema>;

// =============================================================================
// CHALLENGE MODE
// =============================================================================

/**
 * Resultat challenge pour verification badges
 * Compatible avec ChallengeResult dans types/game.ts
 */
export const ChallengeResultSchema = z.object({
  correctAnswers: z.number().min(0),
  totalQuestions: z.number().min(0),
  accuracy: z.number().min(0).max(1),
  timeBonus: z.number().min(0),
  streakBonus: z.number().min(0),
  totalScore: z.number().min(0),
});

export type ChallengeResultInput = z.infer<typeof ChallengeResultSchema>;

// =============================================================================
// API BADGES - CHECK BADGES REQUEST
// =============================================================================

/**
 * Discriminated union pour POST /api/badges
 */
const PracticeCheckSchema = z.object({
  mode: z.literal('practice'),
  practiceStats: PracticeStatsSchema,
});

const ChallengeCheckSchema = z.object({
  mode: z.literal('challenge'),
  challengeResult: ChallengeResultSchema,
});

export const CheckBadgesSchema = z.discriminatedUnion('mode', [
  PracticeCheckSchema,
  ChallengeCheckSchema,
]);

export type CheckBadgesInput = z.infer<typeof CheckBadgesSchema>;

// =============================================================================
// API SCORES - SAVE SCORE REQUEST
// =============================================================================

/**
 * Schema pour POST /api/scores
 * Sauvegarde un score de session (practice ou challenge)
 */
export const SaveScoreSchema = z.object({
  mode: z.enum(['practice', 'challenge']),
  table: z.number().min(1).max(10).optional(),
  correct: z.number().min(0),
  total: z.number().min(1),
  timeRemaining: z.number().min(0).optional(),
});

export type SaveScoreSchemaInput = z.infer<typeof SaveScoreSchema>;

/**
 * Schema pour GET /api/scores query params
 */
export const GetScoresQuerySchema = z.object({
  mode: z.enum(['practice', 'challenge']).optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});
