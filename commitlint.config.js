module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Types autorisés
    'type-enum': [
      2,
      'always',
      [
        'feat', // Nouvelle fonctionnalité
        'fix', // Correction de bug
        'docs', // Documentation
        'style', // Formatage (pas de changement de code)
        'refactor', // Refactoring
        'perf', // Amélioration performance
        'test', // Ajout/modification de tests
        'build', // Build system
        'ci', // CI/CD
        'chore', // Maintenance
        'revert', // Revert commit
      ],
    ],
    // Longueur du sujet
    'subject-max-length': [2, 'always', 100],
    // Pas de point à la fin
    'subject-full-stop': [2, 'never', '.'],
    // Type en minuscules
    'type-case': [2, 'always', 'lower-case'],
  },
};
