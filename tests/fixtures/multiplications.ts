/**
 * Multiplication Fixtures - DONNÉES RÉELLES
 * ISO/IEC 29119 - 0 données mockées
 *
 * Ces données représentent les vraies tables de multiplication
 * utilisées dans l'application.
 */

export interface MultiplicationProblem {
  id: string;
  a: number;
  b: number;
  answer: number;
}

export interface MultiplicationTable {
  table: number;
  problems: MultiplicationProblem[];
}

/**
 * Tables de multiplication 1 à 10 - DONNÉES RÉELLES
 */
export const MULTIPLICATION_FIXTURES: MultiplicationTable[] = Array.from(
  { length: 10 },
  (_, tableIndex) => ({
    table: tableIndex + 1,
    problems: Array.from({ length: 10 }, (_, problemIndex) => ({
      id: `${tableIndex + 1}-${problemIndex + 1}`,
      a: tableIndex + 1,
      b: problemIndex + 1,
      answer: (tableIndex + 1) * (problemIndex + 1),
    })),
  })
);

/**
 * Single table fixture (table de 7 - la plus difficile)
 */
export const TABLE_7_FIXTURE: MultiplicationTable = {
  table: 7,
  problems: [
    { id: '7-1', a: 7, b: 1, answer: 7 },
    { id: '7-2', a: 7, b: 2, answer: 14 },
    { id: '7-3', a: 7, b: 3, answer: 21 },
    { id: '7-4', a: 7, b: 4, answer: 28 },
    { id: '7-5', a: 7, b: 5, answer: 35 },
    { id: '7-6', a: 7, b: 6, answer: 42 },
    { id: '7-7', a: 7, b: 7, answer: 49 },
    { id: '7-8', a: 7, b: 8, answer: 56 },
    { id: '7-9', a: 7, b: 9, answer: 63 },
    { id: '7-10', a: 7, b: 10, answer: 70 },
  ],
};

/**
 * Problème unique pour tests unitaires
 */
export const SINGLE_PROBLEM_FIXTURE: MultiplicationProblem = {
  id: '7-8',
  a: 7,
  b: 8,
  answer: 56,
};
