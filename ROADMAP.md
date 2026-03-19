# ROADMAP - Tables Magiques

<!-- LLM CONTEXT: Ce fichier est la source de verite pour l'etat du projet.
Mis a jour le 2026-03-19. Lire en priorite avant toute intervention.
Le code est dans tables-magiques/ (Next.js 16, React 19, TypeScript, Tailwind v4).
Conventions dans CLAUDE.md. Spec animation dans docs/superpowers/specs/. -->

Plan de developpement structure selon ISO/IEC 25010.
Ordre logique: bugs → donnees → integration composants → tests → perf → cleanup → users.

## Statut actuel

- [x] Phase 0-10 : Fondations (2025-12-26 → 2026-01)
- [x] Phase 11 : Migration CSS home (2026-03-18)
- [x] Phase 12 : GSAP removal + quality gates (2026-03-19)
- [ ] **Phase 13 : Bugs & intégrité données** ← PROCHAINE
- [ ] Phase 14 : Intégration composants (valide DRY/SRP phases 9-12)
- [ ] Phase 15 : Tests d'intégration (MSW + hook/API)
- [ ] Phase 16 : Couverture & E2E
- [ ] Phase 17 : Performance avancée
- [ ] Phase 18 : Cleanup docs & deps
- [ ] Phase 19 : User testing

---

## Phases completees (resume)

<details>
<summary>Phase 0-10 (2025-12-26 → 2026-01)</summary>

- Auth, Practice, Challenge, Badges, React Query, Dark Mode, PWA, Profil
- Effets/animations P1, sons, onboarding, E2E infrastructure
- 860 → 955 tests, architecture ISO/IEC 25010

</details>

<details>
<summary>Phase 11 — Migration CSS home (2026-03-18)</summary>

Spec: `docs/superpowers/specs/2026-03-18-home-css-animation-migration-design.md`
Plan: `docs/superpowers/plans/2026-03-18-home-css-animation-migration.md`

- 49 motion.div + 2 GSAP tweens → CSS @keyframes
- Lighthouse perf 66 → 75, TBT -65%, JS exec -32%
- UnicornHero + useRestartableAnimation + useParticlesEngine extraits
- Fisher-Yates shuffle fix, hydratation SSR fix
- 955 tests (14 nouveaux), 19 commits

</details>

<details>
<summary>Phase 12 — GSAP removal + quality gates (2026-03-19)</summary>

Spec: `docs/superpowers/specs/2026-03-19-app-wide-css-migration-design.md`
Plan: `docs/superpowers/plans/2026-03-19-app-wide-css-migration.md`

- [x] 12.1 - Bundle analysis (558KB gz, top chunks identifies)
- [x] 12.2 - WCAG 2.1 AA (Lighthouse 100 sur 5 pages, fixes aria/contraste/touch)
- [x] 12.3 - GSAP vire: 20+ composants migres, gsap supprime du package.json
- [x] 12.4 - FM scope creep: 12 composants migres FM → CSS, 7 usages FM documentes
- [x] 12.5 - Dep circulaire zero (usePractice fix, madge elargi)
- [x] 12.6 - Bundle size guard (scripts/check-bundle-size.sh, 525/560KB)
- [x] 12.7 - Visual regression (Playwright toHaveScreenshot, 5 pages + mobile + reduced-motion)
- [x] 12.8 - 119 tests ajoutes (colors, particles, framer, useHaptic) → 1360 total
- [x] 12.9 - CI/CD GitHub Actions (tsc + eslint + prettier + madge + vitest + build + bundle)
- [x] 12.10 - Coverage thresholds (lines 85%, functions 80%, branches 75%)
- [x] 12.11 - Firefox E2E (playwright.config.ts)
- [x] 12.12 - CLAUDE.md + ROADMAP restructures

Resultats: bundle 558→525KB gz, 1360 tests, 0 dep circulaire, CI/CD en place.

</details>

---

## Phase 13 : Bugs & intégrité données

### Objectif

Corriger les bugs de data flow decouverts pendant l'audit.
Sans ca, les tests d'integration n'ont rien a tester.

### Tasks

```
[ ] 13.1 - BUG: /api/profile/history route manquante
    - useProfile appelle fetchSessionHistory() vers une route qui n'existe pas
    - Creer app/api/profile/history/route.ts
    - GET avec filtres: mode, startDate, endDate, limit, offset
    - Validation Zod, auth requise, pagination
    - Tests unitaires pour la route

[ ] 13.2 - BUG: scores non persistes
    - usePractice et useChallenge ne sauvegardent pas vers /api/scores
    - Ajouter saveScore() en mutation React Query au game over
    - PracticeCompleted → POST /api/scores { mode: 'practice', ... }
    - ChallengeGameOver → POST /api/scores { mode: 'challenge', ... }
    - Gerer le cas guest (pas de save, pas d'erreur)
    - Tests unitaires pour les mutations

[ ] 13.3 - BUG: bestStreak hardcode a 0
    - lib/scores/storage.ts:134 et lib/stats/storage.ts:115
    - Calculer depuis les donnees de sessions
    - Tests unitaires

[ ] 13.4 - Cleanup: tw-animate-css potentiellement inutilise
    - Verifier si importe quelque part
    - Si dead: npm uninstall tw-animate-css
```

---

## Phase 14 : Intégration composants

### Objectif

Brancher les composants extraits en Phases 9-12 (Skeleton, TextReveal, ScrollReveal,
RippleEffect) aux pages reelles. Sans ca, tout le travail DRY/SRP/extraction
est du code mort — et les E2E (Phase 16) testeraient des parcours incomplets.

### Pourquoi avant les tests

- Les Skeletons affectent les loading states testes en E2E
- TextReveal/ScrollReveal changent le DOM rendu (selecteurs Playwright)
- RippleEffect dans MagicButton modifie le feedback interactif
- Tester APRES branchement evite de retoucher les tests 2 fois

### Tasks

```
[ ] 14.1 - Brancher Skeleton loaders
    - BadgeCollection → BadgeGridSkeleton
    - ProfilePage → ProfileSkeleton
    - Toute page avec data fetching (practice loading, challenge loading)
    - Verifier que loading states sont testes dans les unit tests existants

[ ] 14.2 - Brancher TextReveal
    - Titres de niveau dans Practice/Challenge
    - "Bravo!" / "Game Over!" avec reveal anime
    - Respecter prefers-reduced-motion (TextReveal le gere deja)

[ ] 14.3 - Brancher ScrollReveal
    - Page profil: stats apparaissent au scroll (ProgressChart, SessionHistory)
    - Page resultats: trophees progressifs
    - Respecter prefers-reduced-motion (ScrollReveal le gere deja)

[ ] 14.4 - Integrer RippleEffect dans MagicButton
    - Unifier le feedback tactile (useRipple deja importe mais pas rendu)
    - Verifier que les tests MagicButton couvrent le ripple
```

---

## Phase 15 : Tests d'intégration

### Objectif

MSW + tests hook/API. Minimum syndical pour valider le data flow
corrige en Phase 13 et les composants branches en Phase 14.

### Tasks

```
[ ] 15.1 - Setup MSW
    - Creer tests/integration/setup.ts (server + handlers)
    - Creer tests/integration/handlers/ (auth, profile, badges, scores)
    - Configurer vitest pour inclure tests/integration/

[ ] 15.2 - Tests auth (useAuth + /api/auth/*)
    - POST /api/auth/register → session + cache update
    - POST /api/auth/login → session + cache update
    - GET /api/auth/me → user ou 401
    - POST /api/auth/logout → clear cookie + invalidate badges cache
    - Rate limiting (429)
    - ~12 tests

[ ] 15.3 - Tests profile (useProfile + /api/profile)
    - GET /api/profile → donnees completes
    - GET /api/profile/history → filtres + pagination
    - 401 si non authentifie
    - ~6 tests

[ ] 15.4 - Tests badges (useBadges + /api/badges)
    - GET /api/badges → liste avec earned/not-earned
    - POST /api/badges practice mode → newBadges[]
    - POST /api/badges challenge mode → newBadges[]
    - Filtre already-earned
    - ~8 tests

[ ] 15.5 - Tests scores (mutations + /api/scores)
    - POST /api/scores (save practice result)
    - POST /api/scores (save challenge result)
    - GET /api/scores?mode=practice&limit=20
    - Validation Zod sur body
    - ~6 tests

    Total: ~32 tests d'integration
```

---

## Phase 16 : Couverture & E2E

### Objectif

Atteindre 90% coverage. E2E parcours complets sur l'app finale
(composants branches + data flow corrige). Audit WCAG formel.

### Tasks

```
[ ] 16.1 - Coverage 90%+
    - vitest --coverage → identifier zones < 90%
    - Ajouter tests manquants Phase 9 composants (~48 tests selon doc)
    - Report HTML genere et archive

[ ] 16.2 - E2E parcours complets
    - Login complet (register → login → session persistee)
    - Practice session (selection → jeu → resultats → score sauve)
    - Challenge session (ready → jeu → game over → score sauve)
    - Badge unlock flow (jouer → debloquer → notification)
    - Dark mode toggle (persiste apres refresh)
    - Skeleton loading states visibles pendant fetch

[ ] 16.3 - Audit WCAG 2.1 AA formel
    - axe-core integration dans tous les tests E2E
    - Verification screen reader (VoiceOver ou NVDA)
    - Documenter resultats dans docs/

[ ] 16.4 - E2E preview deployments
    - Playwright sur Vercel preview URLs (pas seulement prod)
    - Ajouter step dans CI/CD GitHub Actions
```

---

## Phase 17 : Performance avancée

### Objectif

Speed Index et LCP sous les seuils CWV.

### Tasks

```
[ ] 17.1 - Speed Index
    - Particules client-only causent apparition tardive
    - Evaluer: SSR avec arrondi agressif vs client-only avec skeleton
    - Mesurer avant/apres

[ ] 17.2 - LCP → < 2.5s
    - Identifier l'element LCP sur chaque page
    - Preload critical fonts (Lexend)
    - Optimiser critical rendering path
    - Evaluer preconnect pour Vercel Edge

[ ] 17.3 - Lighthouse CI
    - Budget perf automatise dans GitHub Actions
    - Fail si regression > 5 points
```

---

## Phase 18 : Cleanup docs & deps

### Objectif

Nettoyer la dette documentaire et les deps mortes.

### Tasks

```
[ ] 18.1 - Nettoyer docs obsoletes
    - Supprimer EFFECTS_CHECKLIST.md
    - Supprimer EFFECTS_ACTION_PLAN.md
    - Mettre a jour ARCHITECTURE.md avec etat reel (zero GSAP, FM reduit)
    - Archiver ou supprimer plan files completes dans docs/superpowers/

[ ] 18.2 - Cleanup dependencies
    - Verifier tw-animate-css (si pas fait en 13.4)
    - npm audit fix
    - Verifier toutes les deps inutilisees
```

---

## Phase 19 : User testing

### Objectif

Validation terrain avec le public cible.

### Tasks

```
[ ] 19.1 - User testing
    - 3-5 enfants de 9 ans
    - Mesurer completion rate, temps par question, engagement
    - Iterer sur les feedbacks

[ ] 19.2 - Iterer sur feedbacks
    - Fixes UX bases sur les observations
    - A/B test si necessaire
```

---

## Architecture (P3) - Refactoring long terme

```
[ ] A.1 - Migrate hooks/ vers features/
    - useAuth → features/auth/hooks/ (deja fait partiellement)
    - Nettoyer hooks/index.ts

[ ] A.2 - API game endpoints
    - app/api/game/ endpoints
    - Handlers MSW correspondants

[ ] A.3 - Storybook (optionnel)
    - Setup Storybook 8
    - Documentation composants effects/
```

---

## YAGNI (Non planifie)

- ~~Leaderboard~~ — Users cloisonnes, pas de valeur ajoutee
- ~~Storybook~~ — Reclasse en optionnel Phase A.3
- ~~Seasonal themes~~ — Post-launch si adoption
- ~~Mutation testing (Stryker)~~ — Overkill pour app educative

---

## Definition of Done

Chaque feature est complete quand :

- [x] Tests unitaires passent
- [x] Tests integration passent (si API impliquee)
- [x] Tests E2E passent (si parcours utilisateur)
- [x] TypeScript 0 erreur
- [x] ESLint 0 erreur
- [x] Prettier clean
- [x] madge --circular zero
- [x] Bundle < 560KB gz
- [x] Deploye en production
- [x] Documente dans ROADMAP

---

## Changelog

### 2026-03-19 (Phase 12 complete)

- GSAP supprime (558→525KB gz), 20+ composants migres CSS
- 12 composants FM → CSS (Profile, Settings, Auth, UI, Badges)
- CI/CD GitHub Actions, coverage thresholds, Firefox E2E
- Dep circulaire zero, bundle guard, visual regression
- 1360 tests (69 fichiers), CLAUDE.md FM convention documentee
- ROADMAP restructure: phases renumerotees, bugs documentes, ordre logique

### 2026-03-18 (Phase 11 complete)

- Migration CSS animations home page
- 49 motion.div + 2 GSAP tweens → CSS @keyframes
- Lighthouse perf 66 → 75, TBT -65%, JS exec -32%
- 955 tests, 19 commits

### 2026-01 (Phases 9-10)

- Sons (useSound, Kenney CC0), settings page, onboarding tour
- Playwright config, E2E home/navigation/accessibility

### 2025-12-26 (Phases 0-8.5)

- Projet cree et deploye en une journee
- 8.5 phases completees, 860 tests, PWA installable
- Architecture ISO/IEC 25010 avec SRP thin orchestrators
