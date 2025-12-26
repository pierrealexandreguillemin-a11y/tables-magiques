/**
 * Badges Logic - Tables Magiques
 * ISO/IEC 25010 - Logique verification badges
 *
 * 8 badges Practice + 5 badges Challenge
 *
 * NOTE: Ce module CONSOMME les types definis dans @/types/badge
 * Il ne definit PAS de types (principe SRP)
 */

import { getBadgeById } from '@/types/badge';
import type { PracticeSessionStats, BadgeUnlockResult } from '@/types/badge';
import type { ChallengeResult } from '@/types/game';

/**
 * Verifie quels badges Practice sont debloques
 * @param stats Statistiques de la session Practice
 * @returns Liste des IDs de badges debloques
 */
export function checkPracticeBadges(stats: PracticeSessionStats): string[] {
  const unlockedBadges: string[] = [];

  // Badge "first" - Premiere Etoile (1 bonne reponse)
  if (stats.correctAnswers >= 1) {
    unlockedBadges.push('first');
  }

  // Badge "streak5" - Licorne Magique (5 bonnes reponses d'affilee)
  if (stats.maxStreak >= 5) {
    unlockedBadges.push('streak5');
  }

  // Badge "streak10" - Princesse des Maths (10 bonnes reponses d'affilee)
  if (stats.maxStreak >= 10) {
    unlockedBadges.push('streak10');
  }

  // Badge "perfect5" - Arc-en-ciel Parfait (5/5 parfait)
  if (
    stats.totalQuestions >= 5 &&
    stats.correctAnswers === stats.totalQuestions
  ) {
    unlockedBadges.push('perfect5');
  }

  // Badge "streak20" - Etoile Brillante (20 bonnes reponses d'affilee)
  if (stats.maxStreak >= 20) {
    unlockedBadges.push('streak20');
  }

  // Badge "perfect10" - Fee des Calculs (10/10 parfait)
  if (
    stats.totalQuestions >= 10 &&
    stats.correctAnswers === stats.totalQuestions
  ) {
    unlockedBadges.push('perfect10');
  }

  // Badge "streak30" - Reine Magique (30 bonnes reponses d'affilee)
  if (stats.maxStreak >= 30) {
    unlockedBadges.push('streak30');
  }

  // Badge "streak50" - Super Championne (50 bonnes reponses d'affilee)
  if (stats.maxStreak >= 50) {
    unlockedBadges.push('streak50');
  }

  return unlockedBadges;
}

/**
 * Verifie quels badges Challenge sont debloques
 * @param result Resultat du challenge
 * @returns Liste des IDs de badges debloques
 */
export function checkChallengeBadges(result: ChallengeResult): string[] {
  const unlockedBadges: string[] = [];

  // Badge "speed5" - Eclair Rapide (5 reponses)
  if (result.totalQuestions >= 5) {
    unlockedBadges.push('speed5');
  }

  // Badge "speed10" - Ninja des Maths (10 reponses)
  if (result.totalQuestions >= 10) {
    unlockedBadges.push('speed10');
  }

  // Badge "speed15" - Fusee Magique (15 reponses)
  if (result.totalQuestions >= 15) {
    unlockedBadges.push('speed15');
  }

  // Badge "speed20" - Reine de la Vitesse (20 reponses)
  if (result.totalQuestions >= 20) {
    unlockedBadges.push('speed20');
  }

  // Badge "perfectChallenge" - Perfection Chrono (0 erreur, min 1 question)
  if (
    result.totalQuestions > 0 &&
    result.correctAnswers === result.totalQuestions
  ) {
    unlockedBadges.push('perfectChallenge');
  }

  return unlockedBadges;
}

/**
 * Filtre les badges pour ne garder que les nouveaux
 * @param unlockedIds IDs des badges debloques
 * @param alreadyEarnedIds IDs des badges deja gagnes
 * @returns Nouveaux badges avec leurs infos
 */
export function getNewBadges(
  unlockedIds: string[],
  alreadyEarnedIds: string[]
): BadgeUnlockResult[] {
  const alreadyEarnedSet = new Set(alreadyEarnedIds);

  return unlockedIds
    .filter((id) => !alreadyEarnedSet.has(id))
    .map((id) => {
      const badge = getBadgeById(id);
      if (!badge) {
        throw new Error(`Badge non trouve: ${id}`);
      }
      return {
        badgeId: id,
        badge,
        isNew: true,
      };
    });
}
