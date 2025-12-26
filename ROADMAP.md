# ROADMAP - Tables Magiques

Plan de developpement structure selon ISO/IEC 25010.

## Statut actuel

- [x] Phase 0 : Deploiement initial
- [x] Phase 1 : Authentification
- [x] Phase 2 : Mode Practice
- [x] Phase 3 : Mode Challenge
- [x] Phase 4 : Badges
- [x] Phase 4.5 : React Query + Architecture ISO (2025-12-26)
- [x] Phase 5 : Dark Mode (2025-12-26)
- [ ] Phase 6 : PWA Complete ← PROCHAINE
- [ ] Phase 7 : Page Profil + Historique
- [ ] Phase 8 : Sons + Badge Icons
- [x] Phase 9 : Tests E2E (infrastructure)

---

## Phase 0 : Deploiement (COMPLETE)

- [x] Setup Next.js 16 + TypeScript
- [x] Config shadcn/ui
- [x] Install GSAP + Framer Motion
- [x] Setup Upstash Redis
- [x] Deploy Vercel
- [x] GitHub integration
- [x] Hooks Husky ISO
- [x] Landing page animee

---

## Phase 1 : Authentification (COMPLETE)

### Objectif

Modal de login simple (4 caracteres minimum).

### Tasks

```
[x] 1.1 - API /api/auth/login
    - POST: username + password
    - Hash bcrypt
    - Session Redis (24h TTL)

[x] 1.2 - API /api/auth/logout
    - DELETE session Redis

[x] 1.3 - API /api/auth/register
    - Validation 4 chars min
    - Username unique

[x] 1.4 - Middleware auth
    - Verification session
    - Redirect si non auth

[x] 1.5 - Modal Login (shadcn Dialog)
    - Form username/password
    - Validation client
    - Messages erreur

[x] 1.6 - Hook useAuth
    - State user
    - Login/logout functions
    - isAuthenticated

[x] 1.7 - API /api/auth/me (bonus)
    - GET: utilisateur courant
    - Nettoyage cookie invalide
```

### Fichiers crees

```
types/auth.ts                    - Types et schemas Zod
lib/auth/password.ts             - Hachage bcrypt
lib/auth/session.ts              - Sessions Redis
lib/auth/user.ts                 - CRUD utilisateurs
app/api/auth/login/route.ts      - Endpoint login
app/api/auth/logout/route.ts     - Endpoint logout
app/api/auth/register/route.ts   - Endpoint register
app/api/auth/me/route.ts         - Endpoint session
middleware.ts                    - Protection routes
hooks/useAuth.ts                 - Hook authentification
components/auth/AuthModal.tsx    - Modal login/register
components/auth/UserButton.tsx   - Bouton utilisateur
components/ui/input.tsx          - Input formulaire
components/ui/label.tsx          - Label formulaire
```

### Tests TDD

```
tests/unit/auth/password.test.ts - 9 tests
tests/fixtures/auth.ts           - Fixtures auth
```

---

## Phase 2 : Mode Practice (COMPLETE)

### Objectif

Jeu de pratique des tables sans limite de temps.

### Tasks

```
[x] 2.1 - Logique questions (lib/game/questions.ts)
    - generateQuestion(table) ✓
    - generateRandomQuestion() ✓
    - shuffleArray() ✓
    - validateTable() ✓

[x] 2.2 - Logique scoring (lib/game/scoring.ts)
    - calculateScore(correct, total) ✓
    - updateStreak() ✓
    - checkPerfect() ✓
    - calculateBonus() ✓
    - checkAnswer() ✓
    - calculateAccuracy() ✓

[x] 2.3 - Page /practice
    - Selection table (1-10 + Toutes) ✓
    - Boutons animees Framer Motion ✓

[x] 2.4 - Composant QuestionDisplay (integre dans page)
    - Affichage question ✓
    - Animation entree/sortie ✓

[x] 2.5 - Composant NumberPad (integre dans page)
    - Clavier 0-9 ✓
    - Bouton Effacer ✓
    - Bouton Valider ✓

[x] 2.6 - Composant ScoreBoard (integre dans page)
    - Score courant ✓
    - Serie en cours ✓
    - Progression visuelle ✓

[ ] 2.7 - API /api/scores (Phase 4)
    - POST: sauvegarder score
    - GET: recuperer historique

[x] 2.8 - Feedback reponses
    - Correct: animation + message ✓
    - Incorrect: affichage reponse correcte ✓
    - Messages encourageants ✓
```

### Tests TDD

```
tests/unit/game/questions.test.ts - 38 tests ✓
tests/unit/game/scoring.test.ts - 47 tests ✓
tests/e2e/practice.spec.ts - E2E tests (skipped pending auth) ✓
```

---

## Phase 3 : Mode Challenge (COMPLETE)

### Objectif

Mode chronometre : 3 minutes, 5 secondes par question.

### Tasks

```
[x] 3.1 - Timer global (3 min)
    - Countdown display ✓
    - Animation pulse quand < 30s ✓
    - Game over quand temps ecoule ✓

[x] 3.2 - Timer par question (5 sec)
    - Auto-skip si temps ecoule ✓
    - Barre de progression visuelle ✓
    - Animation urgence ✓

[x] 3.3 - Page /challenge
    - Ecran demarrage ✓
    - Ecran jeu avec timers ✓
    - Ecran resultats ✓

[x] 3.4 - Logique challenge (features/game/hooks/challenge.ts)
    - createChallengeState() ✓
    - startChallenge() ✓
    - tickGlobalTimer() / tickQuestionTimer() ✓
    - answerQuestion() ✓
    - endChallenge() ✓
    - calculateChallengeScore() ✓

[x] 3.5 - Hook useChallenge
    - Encapsulation logique React ✓
    - Timer effects ✓
    - Actions (start, answer, replay) ✓

[ ] 3.6 - API /api/scores/challenge (Phase 4)
    - POST: sauvegarder score challenge
    - Donnees: score, temps restant
```

### Architecture refactoring

```
features/game/
├── components/
│   ├── GlobalTimer.tsx      - Timer global 3 min
│   ├── QuestionTimer.tsx    - Timer question 5 sec
│   ├── QuestionDisplay.tsx
│   ├── NumberPad.tsx
│   └── ScoreBoard.tsx
├── hooks/
│   ├── challenge.ts         - Logique pure
│   ├── useChallenge.ts      - Hook React
│   ├── questions.ts
│   └── scoring.ts
└── index.ts
```

### Tests TDD

```
tests/unit/game/challenge.test.ts - 39 tests ✓
tests/unit/hooks/useChallenge.test.ts - 23 tests ✓
tests/unit/components/game/GlobalTimer.test.tsx - 12 tests ✓
tests/unit/components/game/QuestionTimer.test.tsx - 16 tests ✓
tests/integration/challenge-page.test.tsx - 23 tests ✓
tests/e2e/challenge.spec.ts - 15 tests ✓
```

---

## Phase 4 : Systeme de Badges (COMPLETE)

### Objectif

8 badges Practice + 5 badges Challenge avec persistance.

### Tasks

```
[x] 4.1 - Types badges (types/badge.ts)
    - BadgeDefinition, EarnedBadge interfaces
    - PRACTICE_BADGES (8 badges)
    - CHALLENGE_BADGES (5 badges)
    - PracticeSessionStats, UserBadgeStats types

[x] 4.2 - Logique badges (features/badges/hooks/badges.ts)
    - checkPracticeBadges()
    - checkChallengeBadges()
    - getNewBadges()

[x] 4.3 - API /api/badges
    - GET: badges utilisateur avec definitions
    - POST: verification et attribution badges

[x] 4.4 - Storage badges (lib/badges/storage.ts)
    - getUserBadges()
    - addUserBadges()
    - getUserBadgeIds()

[x] 4.5 - Composants badges UI
    - BadgeCard: badge individuel
    - BadgeCollection: grille badges
    - BadgeUnlockNotification: celebration
```

### Fichiers crees

```
types/badge.ts                                - Types et definitions badges
features/badges/hooks/badges.ts               - Logique verification
features/badges/components/BadgeCard.tsx      - Composant badge
features/badges/components/BadgeCollection.tsx - Grille badges
features/badges/components/BadgeUnlockNotification.tsx - Modal celebration
features/badges/index.ts                      - Barrel export
lib/badges/storage.ts                         - Persistence Redis
app/api/badges/route.ts                       - API badges
```

### Tests TDD

```
tests/unit/badges/badges.test.ts - 33 tests
tests/unit/components/badges/BadgeCard.test.tsx - 15 tests
tests/unit/components/badges/BadgeCollection.test.tsx - 11 tests
tests/unit/components/badges/BadgeUnlockNotification.test.tsx - 10 tests
```

---

## Phase 4.5 : React Query + Architecture ISO (COMPLETE)

### Objectif

Integration React Query et conformite ISO/IEC 25010.

### Tasks

```
[x] 4.5.1 - React Query setup
    - @tanstack/react-query installe
    - QueryClientProvider dans app/providers.tsx
    - Utilities de test (renderQueryHook)

[x] 4.5.2 - Feature Auth avec React Query
    - features/auth/api/auth.ts (fetchCurrentUser, loginUser, etc.)
    - features/auth/hooks/useAuth.ts (useQuery + useMutation)

[x] 4.5.3 - Feature Badges avec React Query
    - features/badges/api/badges.ts (fetchBadges, checkBadges)
    - features/badges/hooks/useBadges.ts (useQuery + useMutation)

[x] 4.5.4 - Separation SRP types/config
    - Types dans types/badge.ts
    - Config dans config/badges.ts

[x] 4.5.5 - Centralisation Zod schemas (DRY)
    - lib/validation/schemas.ts
    - z.infer<> pour types derives

[x] 4.5.6 - Tests storage Redis
    - tests/unit/lib/badges/storage.test.ts (15 tests)
```

### Tests TDD

```
tests/unit/features/auth/api/auth.test.ts - 8 tests
tests/unit/features/auth/hooks/useAuth.test.tsx - 12 tests
tests/unit/features/badges/api/badges.test.ts - 8 tests
tests/unit/features/badges/hooks/useBadges.test.tsx - 14 tests
tests/unit/app/providers.test.tsx - 4 tests
tests/unit/lib/badges/storage.test.ts - 15 tests
```

---

## Phase 5 : Dark Mode (COMPLETE)

### Objectif

Theme sombre avec toggle.

### Tasks

```
[x] 5.1 - Config Tailwind dark mode
    - class strategy (deja configure)
    - Variables CSS dans globals.css

[x] 5.2 - Hook useTheme
    - Toggle light/dark
    - Persistance localStorage
    - System preference detection
    - Apply class to document.documentElement

[x] 5.3 - Composant ThemeToggle
    - Bouton soleil/lune avec Framer Motion
    - Animation rotation
    - Glassmorphism styling

[x] 5.4 - Integration pages
    - Anti-FOUC script dans layout.tsx
    - ThemeToggle sur home, practice, challenge
    - Gradients dark: variants
```

### Fichiers crees

```
hooks/useTheme.ts                     - Hook gestion theme
components/ui/ThemeToggle.tsx         - Bouton toggle soleil/lune
```

### Fichiers modifies

```
app/layout.tsx                        - Script anti-FOUC
app/page.tsx                          - ThemeToggle + dark gradients
app/practice/page.tsx                 - ThemeToggle + dark gradients
app/challenge/page.tsx                - ThemeToggle + dark gradients
hooks/index.ts                        - Export useTheme
```

### Tests TDD

```
tests/unit/hooks/useTheme.test.ts - 14 tests
tests/unit/components/ui/ThemeToggle.test.tsx - 7 tests
tests/integration/challenge-page.test.tsx - Mock fixes
```

---

## Phase 6 : PWA Complete

### Objectif

App installable avec support offline.

### Tasks

```
[ ] 6.1 - manifest.json
    - Icons toutes tailles
    - Theme colors
    - Display standalone

[ ] 6.2 - Service Worker
    - Cache static assets
    - Offline fallback
    - Background sync

[ ] 6.3 - Install prompt
    - Detection installable
    - Bouton "Installer l'app"

[ ] 6.4 - Icons PWA
    - SVG licorne custom
    - PNG toutes tailles
    - Splash screens
```

### Tests

```
Lighthouse PWA audit > 90
```

---

## Phase 7 : Page Profil + Historique

### Objectif

Page utilisateur avec statistiques et historique.

### Tasks

```
[ ] 7.1 - Page /profile
    - Stats utilisateur (total questions, accuracy)
    - Collection badges avec progression
    - Graphique historique

[ ] 7.2 - Historique sessions
    - Liste sessions passees
    - Details par session
    - Filtres (mode, date)

[ ] 7.3 - API /api/stats
    - GET: statistiques utilisateur
    - Aggregation Redis
```

### Tests TDD

```
tests/unit/features/profile/
tests/e2e/profile.spec.ts
```

---

## Phase 8 : Sons + Badge Icons

### Objectif

Feedback audio et icones badges professionnelles.

### Tasks

```
[ ] 8.1 - Systeme audio
    - Howler.js ou Web Audio API
    - Son correct/incorrect
    - Toggle mute (persistance)
    - Respect prefers-reduced-motion

[ ] 8.2 - Badge Icons (remplacer emojis)
    - Recherche bibliotheques open-source
    - Lucide / Heroicons / custom SVG
    - Integration composant BadgeCard

[ ] 8.3 - Hook useSound
    - playSound(type)
    - Chargement lazy
    - Volume control
```

### Tests TDD

```
tests/unit/hooks/useSound.test.ts
tests/unit/components/badges/BadgeIcon.test.tsx
```

---

## Phase 9 : Tests E2E Complets (INFRASTRUCTURE COMPLETE)

### Objectif

Couverture E2E des parcours critiques.

### Tasks

```
[x] 7.1 - Setup Playwright
    - Config multi-browser
    - Mobile viewport
    - axe-core accessibility

[~] 7.2 - Tests parcours (à compléter avec features)
    - [ ] Login complet
    - [ ] Practice session complete
    - [ ] Challenge session complete
    - [ ] Badge unlock flow
    - [ ] Dark mode toggle

[x] 7.3 - Tests accessibilite
    - Navigation clavier ✓
    - Screen reader (aria-labels) ✓
    - Contraste couleurs (axe-core) ✓
```

### Tests créés

- `tests/e2e/home.spec.ts` - Page d'accueil, animations, responsive
- `tests/e2e/accessibility.spec.ts` - WCAG 2.1 AA avec axe-core
- `tests/e2e/navigation.spec.ts` - Clavier, souris, touch

---

## Pyramide de Tests (ISO/IEC 29119)

```
        /\
       /  \
      / E2E \           10%
     /______\
    /        \
   / INTEGR.  \         30%
  /____________\
 /              \
/   UNIT TESTS   \      60%
\________________/
```

---

## Qualite (P2) - Continu

### Tasks

```
[ ] Q.1 - E2E CI/CD
    - Activer Playwright sur Vercel
    - Tests contre Upstash Redis prod
    - GitHub Actions workflow

[ ] Q.2 - Coverage 90%+
    - Analyse zones non couvertes
    - Completion tests manquants
    - Report HTML

[ ] Q.3 - Audit a11y WCAG 2.1 AA
    - axe-core integration
    - Lighthouse accessibility
    - Tests screen reader

[ ] Q.4 - Bundle analysis
    - next/bundle-analyzer
    - Lazy loading components
    - Tree shaking verification
```

---

## Architecture (P3) - Refactoring

### Tasks

```
[ ] A.1 - Migrate hooks/
    - Deplacer useAuth.ts → features/auth/hooks/
    - Nettoyer hooks/index.ts

[ ] A.2 - API game
    - app/api/game/ endpoints
    - Handlers MSW correspondants
    - Tests integration

[ ] A.3 - Storybook
    - Setup Storybook 8
    - Documentation composants effects/
    - Documentation composants badges/
    - Chromatic integration (optionnel)
```

---

## YAGNI (Non planifie)

- ~~Leaderboard~~ - Users cloisonnes, pas de valeur ajoutee

---

## Definition of Done

Chaque feature est complete quand :

- [ ] Tests unitaires passent (60%)
- [ ] Tests integration passent (30%)
- [ ] Tests E2E passent (10%)
- [ ] TypeScript 0 erreur
- [ ] ESLint 0 erreur
- [ ] Review code
- [ ] Deploye en production
- [ ] Documente

---

## Changelog

### 2025-12-26

- Phase 5 complete (Dark Mode)
  - useTheme hook avec localStorage + system preference
  - ThemeToggle composant avec animations Framer Motion
  - Anti-FOUC script dans layout.tsx
  - Dark gradients sur toutes les pages
  - 635 tests (21 nouveaux tests theme)
- Phase 4.5 complete (React Query + ISO)
- 614 tests unitaires/integration
- Ajout phases 7, 8 et sections Qualite/Architecture
