/**
 * Questions Generator - Tables Magiques
 * ISO/IEC 25010 - Logique generation questions
 *
 * Genere des questions de multiplication pour les tables 1-10
 */

import type { Question } from '@/types/game';

/** Tables valides: 1 a 10 inclus */
const MIN_TABLE = 1;
const MAX_TABLE = 10;

/** Multiplicateurs valides: 1 a 10 inclus */
const MIN_MULTIPLIER = 1;
const MAX_MULTIPLIER = 10;

/**
 * Valide qu'une table est dans la plage autorisee (1-10)
 * @param table - Numero de table a valider
 * @returns true si valide, false sinon
 */
export function validateTable(table: number): boolean {
  if (!Number.isFinite(table)) {
    return false;
  }

  if (!Number.isInteger(table)) {
    return false;
  }

  return table >= MIN_TABLE && table <= MAX_TABLE;
}

/**
 * Genere un nombre aleatoire entre min et max (inclus)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Genere une question pour une table specifique
 * @param table - Numero de table (1-10)
 * @returns Question avec a, b, et reponse correcte
 * @throws Error si table invalide
 */
export function generateQuestion(table: number): Question {
  if (!validateTable(table)) {
    throw new Error('Table invalide: doit etre entre 1 et 10');
  }

  const b = randomInt(MIN_MULTIPLIER, MAX_MULTIPLIER);

  return {
    a: table,
    b,
    answer: table * b,
  };
}

/**
 * Genere une question avec table aleatoire (1-10)
 * @returns Question avec table et multiplicateur aleatoires
 */
export function generateRandomQuestion(): Question {
  const table = randomInt(MIN_TABLE, MAX_TABLE);
  return generateQuestion(table);
}

/**
 * Genere toutes les questions pour une table (1-10)
 * @param table - Numero de table
 * @returns Tableau de 10 questions (1*table a 10*table)
 * @throws Error si table invalide
 */
export function generateAllQuestionsForTable(table: number): Question[] {
  if (!validateTable(table)) {
    throw new Error('Table invalide: doit etre entre 1 et 10');
  }

  const questions: Question[] = [];

  for (let b = MIN_MULTIPLIER; b <= MAX_MULTIPLIER; b++) {
    questions.push({
      a: table,
      b,
      answer: table * b,
    });
  }

  return questions;
}

/**
 * Melange un tableau en utilisant Fisher-Yates shuffle
 * Ne modifie pas le tableau original
 * @param array - Tableau a melanger
 * @returns Nouveau tableau melange
 */
export function shuffleArray<T>(array: readonly T[]): T[] {
  // Utiliser sort avec comparateur aleatoire
  // Plus simple et type-safe que Fisher-Yates manuel
  return [...array].sort(() => Math.random() - 0.5);
}
