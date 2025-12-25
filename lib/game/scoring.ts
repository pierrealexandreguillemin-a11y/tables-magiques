/**
 * Scoring Logic - Tables Magiques
 * ISO/IEC 25010 - Logique calcul scores
 *
 * Gestion du scoring, streaks et bonus
 */

/** Constantes de scoring */
const STREAK_THRESHOLD = 3;
const STREAK_MULTIPLIER = 10;
const PERFECT_BONUS = 50;

/**
 * Verifie si la reponse utilisateur est correcte
 * @param userAnswer - Reponse donnee par l'utilisateur
 * @param correctAnswer - Reponse correcte
 * @returns true si la reponse est correcte
 */
export function checkAnswer(
  userAnswer: number,
  correctAnswer: number
): boolean {
  return userAnswer === correctAnswer;
}

/**
 * Calcule le score (nombre de bonnes reponses)
 * @param correct - Nombre de reponses correctes
 * @param total - Nombre total de questions
 * @returns Le score (= correct)
 * @throws Error si correct > total ou valeurs negatives
 */
export function calculateScore(correct: number, total: number): number {
  if (correct < 0 || total < 0) {
    throw new Error('Les valeurs ne peuvent pas etre negatives');
  }

  if (correct > total) {
    throw new Error('Le nombre correct ne peut pas depasser le total');
  }

  return correct;
}

/**
 * Calcule la precision (ratio correct/total)
 * @param correct - Nombre de reponses correctes
 * @param total - Nombre total de questions
 * @returns Precision entre 0 et 1, arrondi a 2 decimales
 */
export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) {
    return 0;
  }

  const accuracy = correct / total;
  return Math.round(accuracy * 100) / 100;
}

/**
 * Met a jour la serie (streak) apres une reponse
 * @param currentStreak - Serie actuelle
 * @param isCorrect - Si la reponse etait correcte
 * @returns Nouvelle valeur de streak
 * @throws Error si streak negatif
 */
export function updateStreak(
  currentStreak: number,
  isCorrect: boolean
): number {
  if (currentStreak < 0) {
    throw new Error('Le streak ne peut pas etre negatif');
  }

  if (isCorrect) {
    return currentStreak + 1;
  }

  return 0;
}

/**
 * Verifie si le score est parfait (100%)
 * @param correct - Nombre de reponses correctes
 * @param total - Nombre total de questions
 * @returns true si score parfait
 */
export function checkPerfect(correct: number, total: number): boolean {
  if (total === 0) {
    return false;
  }

  return correct === total;
}

/**
 * Calcule le bonus base sur streak et perfect
 * Formule:
 * - Streak bonus: (streak - 2) * 10 si streak >= 3, sinon 0
 * - Perfect bonus: 50 points
 * @param streak - Serie actuelle
 * @param isPerfect - Si le score est parfait
 * @returns Total des bonus
 */
export function calculateBonus(streak: number, isPerfect: boolean): number {
  let bonus = 0;

  // Bonus streak (commence a 3)
  if (streak >= STREAK_THRESHOLD) {
    bonus += (streak - (STREAK_THRESHOLD - 1)) * STREAK_MULTIPLIER;
  }

  // Bonus perfect
  if (isPerfect) {
    bonus += PERFECT_BONUS;
  }

  return bonus;
}
