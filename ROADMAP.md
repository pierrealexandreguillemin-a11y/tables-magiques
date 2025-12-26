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
- [x] Phase 6 : PWA Complete (2025-12-26)
- [x] Phase 7 : Page Profil + Historique (2025-12-26)
- [ ] Phase 8 : Effets et Animations P1 ← PROCHAINE
- [ ] Phase 9 : Sons + Enrichissement P2
- [x] Phase 10 : Tests E2E (infrastructure)

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

## Phase 6 : PWA Complete (COMPLETE)

### Objectif

App installable avec support offline.

### Tasks

```
[x] 6.1 - manifest.json
    - Icons toutes tailles (72 a 512)
    - Theme colors (pink/purple)
    - Display standalone

[x] 6.2 - Service Worker
    - Cache static assets
    - Offline fallback (/offline)
    - Network First pour pages, Cache First pour assets
    - Versioning (v2)

[x] 6.3 - Install prompt
    - useInstallPrompt hook
    - InstallButton component
    - Detection beforeinstallprompt

[x] 6.4 - Icons PWA
    - SVG licorne custom
    - PNG toutes tailles (17 icons)
    - iOS icons (60, 76, 120, 152, 167, 180, 1024)
```

### Fichiers crees

```
hooks/useInstallPrompt.ts              - Hook install prompt
components/pwa/InstallButton.tsx       - Bouton installer
components/pwa/index.ts                - Barrel export
app/offline/page.tsx                   - Page offline fallback
scripts/generate-icons.mjs             - Script generation icons
public/icons/icon-*.png                - 17 icons PWA/iOS
```

### Tests TDD

```
tests/unit/hooks/useInstallPrompt.test.ts - 13 tests
tests/unit/components/pwa/InstallButton.test.tsx - 8 tests
```

---

## Phase 7 : Page Profil + Historique (COMPLETE)

### Objectif

Page utilisateur avec statistiques et historique.

### Tasks

```
[x] 7.1 - Types Profile (types/profile.ts)
    - UserStats, ModeStats interfaces
    - SessionSummary, TableProgress types
    - ProfileData aggregate type

[x] 7.2 - Storage stats (lib/stats/storage.ts)
    - getUserStats()
    - getModeStats()
    - getSessionHistory()
    - getTableProgress()
    - getProfileData()

[x] 7.3 - API /api/profile
    - GET: donnees profil completes
    - Aggregation Redis

[x] 7.4 - Feature profile React Query
    - features/profile/api/profile.ts
    - features/profile/hooks/useProfile.ts
    - profileKeys pour cache invalidation

[x] 7.5 - Composants Profile UI
    - StatsCard: statistiques globales
    - SessionHistory: sessions recentes
    - ProgressChart: progression par table
    - ProfilePage: page complete

[x] 7.6 - Page /profile
    - Stats utilisateur avec React Query
    - Collection badges avec progression
    - Historique sessions

[x] 7.7 - Integration GSAP
    - types/effects.ts enrichi (types GSAP)
    - hooks/useGsapEffects.ts (12 effets)
    - GsapCelebration component
    - lib/animations/gsap-effects.ts integre
```

### Fichiers crees

```
types/profile.ts                           - Types profil
lib/stats/storage.ts                       - Storage agregation
app/api/profile/route.ts                   - API profil
features/profile/api/profile.ts            - Fonctions API
features/profile/hooks/useProfile.ts       - React Query hooks
features/profile/components/StatsCard.tsx
features/profile/components/SessionHistory.tsx
features/profile/components/ProgressChart.tsx
features/profile/components/ProfilePage.tsx
features/profile/index.ts                  - Barrel export
app/profile/page.tsx                       - Page profil
hooks/useGsapEffects.ts                    - Hook GSAP
components/effects/GsapCelebration.tsx     - Composant celebration
```

### Tests TDD

```
tests/integration/api.test.ts - 30 tests (profile inclus)
tests/e2e/profile.spec.ts - 15 tests
tests/unit/lib/animations/gsap-effects.test.ts - 16 tests
```

---

## Phase 8 : Effets et Animations P1 - Motivation

### Objectif

Composants P1 pour renforcement positif et feedback utilisateur.
Ref: docs/EFFECTS_COMPONENTS_ANALYSIS.md, docs/EFFECTS_CHECKLIST.md

### Tasks

```
[ ] 8.1 - Toast Notifications
    - ToastContainer.tsx + useToast hook
    - Types: success (🌟), star (✨), crown (👑)
    - Stack max 3, auto-dismiss 3s
    - Progress bar animation

[ ] 8.2 - GentleShake (erreur douce)
    - Wrapper composant avec shake subtil
    - Amplitude reduite (3px max, 300ms)
    - Message rose pastel "💭 Presque !"
    - JAMAIS de rouge vif

[ ] 8.3 - GradientText (titres)
    - Gradient fairy (rose → violet → bleu)
    - Gradient unicorn (rainbow)
    - Animation slide 3s infinite

[ ] 8.4 - AnimatedToggle
    - Knob avec spring physics
    - Glow quand active
    - Toggle son 🔇/🔊
    - Toggle difficulte 🐣/👑

[ ] 8.5 - Elevation System
    - Shadows colores (rose/violet)
    - Dynamic shadows on hover
    - Hierarchie visuelle cartes

[ ] 8.6 - Screen Reader Annonces
    - Hook useAnnouncer
    - Annonces score/progression
    - aria-live regions

[ ] 8.7 - High Contrast Mode
    - Detection prefers-contrast
    - Variables CSS alternees
    - Contraste AAA (7:1)
```

### Fichiers a creer

```
components/effects/Toast/ToastContainer.tsx
components/effects/Toast/useToast.ts
components/effects/GentleShake.tsx
components/effects/GradientText.tsx
components/effects/AnimatedToggle.tsx
hooks/useAnnouncer.ts
styles/high-contrast.css
```

### Tests TDD

```
tests/unit/components/effects/Toast.test.tsx
tests/unit/components/effects/GentleShake.test.tsx
tests/unit/hooks/useAnnouncer.test.ts
```

---

## Phase 9 : Sons + Enrichissement P2

### Objectif

Feedback audio et composants P2 polish.
Ref: docs/EFFECTS_CHECKLIST.md Phase 3

### Tasks

```
[ ] 9.1 - Systeme audio
    - Howler.js ou Web Audio API
    - Son correct (magic-ding.mp3)
    - Son incorrect (soft-oops.mp3)
    - Son level-up (level-up.mp3)
    - Toggle mute (persistance)
    - Volume 50% defaut
    - Respect prefers-reduced-motion

[ ] 9.2 - Hook useSound
    - playSound(type)
    - Chargement lazy
    - Volume control
    - Son OFF par defaut

[ ] 9.3 - Badge Icons (remplacer emojis)
    - Lucide / Heroicons / custom SVG
    - Integration composant BadgeCard

[ ] 9.4 - Skeleton Loaders
    - Skeletons en forme etoiles/nuages
    - Card skeleton

[ ] 9.5 - TextReveal
    - Lettres apparaissent avec etoiles
    - Introduction niveau

[ ] 9.6 - ScrollReveal
    - Trophees apparaissent progressivement
    - Page resultats

[ ] 9.7 - AnimatedCheckbox
    - Cases deviennent coeurs/etoiles
    - Mode QCM

[ ] 9.8 - RippleEffect
    - Boutons secondaires
    - Ripple paillettes
```

### Fichiers a creer

```
hooks/useSound.ts
public/sounds/magic-ding.mp3
public/sounds/soft-oops.mp3
public/sounds/level-up.mp3
components/effects/Skeleton.tsx
components/effects/TextReveal.tsx
components/effects/ScrollReveal.tsx
components/effects/AnimatedCheckbox.tsx
components/effects/RippleButton.tsx
```

### Tests TDD

```
tests/unit/hooks/useSound.test.ts
tests/unit/components/effects/Skeleton.test.tsx
tests/unit/components/effects/TextReveal.test.tsx
```

---

## Phase 10 : Tests E2E Complets (INFRASTRUCTURE COMPLETE)

### Objectif

Couverture E2E des parcours critiques.

### Tasks

```
[x] 10.1 - Setup Playwright
    - Config multi-browser
    - Mobile viewport
    - axe-core accessibility

[~] 10.2 - Tests parcours (à compléter avec features)
    - [ ] Login complet
    - [ ] Practice session complete
    - [ ] Challenge session complete
    - [ ] Badge unlock flow
    - [ ] Dark mode toggle

[x] 10.3 - Tests accessibilite
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

### 2025-12-26 (Nuit)

- Phase 7 complete: Profil + Historique
  - types/profile.ts avec UserStats, SessionSummary, etc.
  - lib/stats/storage.ts avec aggregation Redis
  - features/profile/ avec React Query hooks
  - Composants: StatsCard, SessionHistory, ProgressChart
  - Page /profile complete
  - tests/e2e/profile.spec.ts (15 tests)
- Integration GSAP complete (code mort resolu)
  - types/effects.ts enrichi (+141 lignes types GSAP)
  - hooks/useGsapEffects.ts (12 effets avec reduced motion)
  - components/effects/GsapCelebration.tsx (declaratif)
  - Barrel exports mis a jour
- Architecture SRP ISO/IEC conforme
  - types/index.ts corrige (auth + profile exports)
  - Divergences justifiees documentees
- Roadmap mise a jour
  - Phase 8: Effets P1 (motivation)
  - Phase 9: Sons + P2 (enrichissement)
  - Phase 10: Tests E2E
- 773 tests passent (100%)
- 4 commits granulaires GSAP pousse

### 2025-12-26 (Soir)

- Audit ISO/IEC 25010/29119 complete
  - Couverture tests: 70% → **91%** (766 tests)
  - lib/auth: 3.94% → 98.68%
  - lib/db: 0% → 100%
  - lib/animations: 0% → 86.95%
- Architecture SRP refactoring
  - Types centralises dans types/ (auth, badge, game)
  - Pages thin wrapper pattern (336 → 12 lignes)
  - Features auth components moves
- Scores API implemented (TDD)
  - lib/scores/storage.ts
  - app/api/scores/route.ts
  - 18 tests API + storage
- 15 commits granulaires normalises

### 2025-12-26 (Matin)

- Phase 6 complete (PWA)
  - 17 icons PWA/iOS generes avec sharp
  - Service Worker v2 avec offline fallback
  - useInstallPrompt hook + InstallButton
  - Page /offline pour mode hors ligne
  - 656 tests (21 nouveaux tests PWA)
- Phase 5 complete (Dark Mode)
  - useTheme hook avec localStorage + system preference
  - ThemeToggle composant avec animations Framer Motion
  - Anti-FOUC script dans layout.tsx
  - Dark gradients sur toutes les pages
- Phase 4.5 complete (React Query + ISO)
- 614 tests unitaires/integration
- Ajout phases 7, 8 et sections Qualite/Architecture
