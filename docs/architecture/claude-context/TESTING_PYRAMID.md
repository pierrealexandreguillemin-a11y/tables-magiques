# Pyramide Tests ISO 29119 - Tables Magiques

> **Usage**: Lire AVANT d'ecrire des tests

```
+=============================================================================+
| PYRAMIDE DE TESTS ISO 29119 - CONFORMITE TOTALE                             |
+=============================================================================+
|                                                                             |
|  NIVEAU 1: UNIT TESTS (50-60%)                                  ✅ 162      |
|  +-- Composants isolés avec fixtures production                             |
|  +-- Hooks isolés (useReducedMotion, etc.)                                  |
|  +-- MSW = mock TRANSPORT (pas mock DONNEES)                                |
|  +-- Données = REELLES (tables multiplication, progression enfant)          |
|                                                                             |
|  NIVEAU 2: INTEGRATION TESTS (25-35%)                           ✅ 48       |
|  +-- API avec MSW + fixtures réelles                                        |
|  +-- Cross-component (MagicCard + MagicButton + MagicCounter)               |
|  +-- Game flow complet (tables -> questions -> score -> badges)             |
|                                                                             |
|  NIVEAU 3: E2E TESTS (10-20%)                                   ✅ 50+      |
|  +-- Playwright contre localhost:3000                                       |
|  +-- Accessibilité WCAG 2.1 AA (axe-core)                                   |
|  +-- Navigation clavier/souris/touch                                        |
|  +-- 0 mock - 100% production                                               |
|                                                                             |
+=============================================================================+
```

## Principe fondamental

**"0 donnees mockees"** = DONNEES reelles a tous les niveaux
**MSW** = Simulation reseau, PAS fabrication de donnees

## Structure des tests

```
tests/
├── fixtures/                    # DONNÉES RÉELLES
│   ├── index.ts                # Export centralisé
│   ├── multiplications.ts      # Tables 1-10 (vraies maths!)
│   ├── user-progress.ts        # Progression enfant 9 ans réaliste
│   ├── sessions.ts             # Sessions utilisateur
│   ├── badges.ts               # Badges gagnés
│   └── game-state.ts           # États de jeu
│
├── mocks/
│   ├── handlers.ts             # MSW handlers (transport only)
│   └── server.ts               # MSW server pour Vitest
│
├── unit/                        # Tests unitaires (162 tests)
│   ├── components/effects/     # Composants visuels
│   │   ├── AnswerIcon.test.tsx
│   │   ├── CrownProgress.test.tsx
│   │   ├── FairyBackground.test.tsx
│   │   ├── MagicButton.test.tsx
│   │   ├── MagicCard.test.tsx
│   │   ├── MagicCounter.test.tsx
│   │   └── MagicLoader.test.tsx
│   └── hooks/
│       └── useReducedMotion.test.ts
│
├── integration/                 # Tests intégration (48 tests)
│   ├── api.test.ts             # API endpoints avec MSW
│   └── game-flow.test.tsx      # Flux de jeu complet
│
├── e2e/                         # Tests E2E Playwright
│   ├── home.spec.ts            # Page d'accueil
│   ├── accessibility.spec.ts   # WCAG 2.1 AA
│   └── navigation.spec.ts      # Navigation utilisateur
│
└── setup.ts                     # Configuration Vitest + MSW
```

## Commandes

```bash
# Unit + Integration (Vitest)
npm run test              # Watch mode
npm run test:run          # Single run
npm run test:coverage     # Avec couverture

# E2E (Playwright)
npm run test:e2e          # Headless
npm run test:e2e:ui       # Mode interactif
```

## Fixtures - DONNÉES RÉELLES

| Fixture                   | Description                            |
| ------------------------- | -------------------------------------- |
| `MULTIPLICATION_FIXTURES` | Tables 1-10 (100 problèmes réels)      |
| `TABLE_7_FIXTURE`         | Table de 7 (la plus difficile)         |
| `USER_PROGRESS_FIXTURES`  | Progression enfant 9 ans réaliste      |
| `EARNED_BADGES_FIXTURE`   | Badges gagnés après 2 semaines         |
| `*_GAME_STATE_FIXTURE`    | États de jeu (initial, actif, etc.)    |
| `*_SESSION_FIXTURE`       | Sessions utilisateur (active, expired) |

## Pattern TDD obligatoire

```
1. RED:   Écrire test qui ÉCHOUE
2. GREEN: Code MINIMUM pour passer
3. REFACTOR: Améliorer sans casser
```

## Exemple test ISO 29119

```typescript
// ✅ BON - fixture production
import { TABLE_7_FIXTURE } from '@/tests/fixtures';
expect(TABLE_7_FIXTURE.problems[7].answer).toBe(56); // 7 × 8 = 56

// ❌ INTERDIT - données inventées
const fakeTable = { table: 7, problems: [{ a: 7, b: 8, answer: 56 }] };
```

## Couverture actuelle

- **Unit Tests**: 162 tests (8 fichiers)
- **Integration Tests**: 48 tests (2 fichiers)
- **E2E Tests**: 50+ tests (3 fichiers)
- **Total**: 210+ tests
- **Objectif**: >= 80% coverage
