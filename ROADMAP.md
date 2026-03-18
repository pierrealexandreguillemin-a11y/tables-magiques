# ROADMAP - Tables Magiques

<!-- LLM CONTEXT: Ce fichier est la source de verite pour l'etat du projet.
Mis a jour le 2026-03-18. Lire en priorite avant toute intervention.
Le code est dans tables-magiques/ (Next.js 16, React 19, TypeScript, Tailwind v4).
Conventions dans CLAUDE.md. Spec animation dans docs/superpowers/specs/. -->

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
- [x] Phase 8 : Effets et Animations P1 (2025-12-26)
- [x] Phase 8.5 : Corrections E2E + Production (2025-12-26)
- [x] Phase 9 : Sons + Enrichissement P2 (2026-01)
- [x] Phase 10 : Tests E2E (infrastructure) (2026-01)
- [x] Phase 11 : Migration perf CSS (2026-03-18)
- [ ] Phase 12 : Qualite ← PROCHAINE
- [ ] Phase 13 : Performance avancee
- [ ] Phase 14 : Integration + Polish

---

## Phase 11 : Migration perf CSS (COMPLETE — 2026-03-18)

Migration des animations home page de Framer Motion/GSAP vers CSS @keyframes.
Spec: `docs/superpowers/specs/2026-03-18-home-css-animation-migration-design.md`
Plan: `docs/superpowers/plans/2026-03-18-home-css-animation-migration.md`

### Resultats mesures

- Lighthouse perf: 66 → 75 (+9 points)
- Total Blocking Time: 840ms → 290ms (-65%)
- JS execution: 1.9s → 1.3s (-32%)
- Main thread work: 6.6s → 4.7s (-29%)

### Travail realise

- [x] 11.1 - next.config: React Compiler + no source maps
- [x] 11.2 - memo() sur composants chauds (FairyBackground, FloatingParticles, NumberPad, CrownProgress)
- [x] 11.3 - Fix bug useReducedMotion dans SettingsPage/SettingsSection
- [x] 11.4 - Centralisation couleurs (colors.ts source unique)
- [x] 11.5 - 10 CSS keyframes parametrises (cloud-float, particle-float, star-twinkle, bg-drift, unicorn-bob, etc.)
- [x] 11.6 - Migration FairyBackground clouds (4 motion.div → CSS)
- [x] 11.7 - Migration FloatingParticles (45 motion.div → CSS)
- [x] 11.8 - Migration HomeContent (entrees + interactions → CSS)
- [x] 11.9 - Suppression useHomeAnimations.ts (zero GSAP sur home)
- [x] 11.10 - Migration PulseGlow (Framer Motion → CSS pulse-glow)
- [x] 11.11 - Migration GradientBorder (Framer Motion → CSS animate-gradient-x)
- [x] 11.12 - Extraction UnicornHero + useRestartableAnimation (SRP)
- [x] 11.13 - Extraction useParticlesEngine (DRY tsParticles init)
- [x] 11.14 - Suppression 6 CSS dead keyframes
- [x] 11.15 - MorphingVariant → ThemeVariant (DRY types)
- [x] 11.16 - Inline styles → CSS classes (shadows, rainbow decorations)
- [x] 11.17 - Fix Fisher-Yates shuffle (bug logique)
- [x] 11.18 - Fix hydratation SSR (useSyncExternalStore)
- [x] 11.19 - Fix LazyMotion strict mode
- [x] 11.20 - 14 tests nouveaux (UnicornHero, useRestartableAnimation, useParticlesEngine)

### Stats finales

- 955 tests (58 fichiers), 0 erreur type/lint
- 19 commits conventionnels pushes + deploye Vercel
- 0 motion.div sur le fond home en idle (etait 49)
- 0 GSAP tween infini sur home (etait 2)

---

## Phase 12 : Qualite (EN COURS)

### Objectif

Fondations qualite manquantes: CI/CD, couverture, accessibilite, bundle.

### Tasks

```
[x] 12.1 - Bundle analysis (2026-03-18)
    - @next/bundle-analyzer installe mais incompatible Turbopack
    - Mesure manuelle via du + gzip sur .next/static/
    - Total JS: 2068KB raw / 558KB gzipped
    - Top chunks: next/app 308KB(78KB gz), lottie-json 300KB(37KB gz),
      react-dom 220KB(68KB gz), tsparticles 140KB(39KB gz), gsap 76KB(29KB gz)
    - Framer Motion tree-shake dans chunks next/app (LazyMotion OK)
    - Cible < 300KB: non atteinte (558KB gz) — GSAP removable (29KB),
      Lottie JSON compresse bien (37KB), le reste est framework

[~] 12.3 - Audit WCAG 2.1 AA (2026-03-18, EN COURS)
    - Lighthouse post-deploy: / 96, /practice 100, /challenge 100,
      /profile 96, /settings 96
    - Cible: 100 sur toutes les pages
    - Fix: aria-label forwarding AnimatedCheckbox toggles
    - Fix: heading order h3→h2 sur profile
    - Fix: touch targets 36px→44px sur header buttons
    - Fix: contrast yellow/pink status text

[ ] 12.2 - Coverage 90%+
    - Analyser zones non couvertes (vitest --coverage)
    - Tests manquants Phase 9 composants (~48 tests selon doc)
    - Report HTML genere

[ ] 12.3 - Audit WCAG 2.1 AA formel
    - Lighthouse accessibility sur toutes les pages
    - axe-core integration dans les tests E2E
    - Verification screen reader (VoiceOver/NVDA)
    - Documenter les resultats

[ ] 12.4 - E2E parcours complets
    - Login complet
    - Practice session complete (selection → jeu → resultats)
    - Challenge session complete (ready → jeu → game over)
    - Badge unlock flow
    - Dark mode toggle

[ ] 12.5 - CI/CD
    - GitHub Actions workflow (lint + type + test + build)
    - Playwright E2E sur Vercel preview deployments
    - Fail on regression
```

---

## Phase 13 : Performance avancee

### Objectif

Proposition C: supprimer GSAP completement. Propager les patterns CSS a toute l'app.

### Tasks

```
[ ] 13.1 - Proposition C: virer GSAP
    - Celebrations confetti/fireworks → tsParticles (config existante)
    - shakeError → CSS @keyframes (pattern deja utilise)
    - animateScore → Framer Motion useMotionValue ou CSS counter
    - badgeUnlock → CSS @keyframes
    - Supprimer gsap + @gsap/react du package.json (-6.4MB)

[ ] 13.2 - Migrer MagneticButton vers CSS
    - mousemove rAF → CSS :hover transform (simplifie)
    - Ou supprimer l'effet magnetique (valeur UX discutable)

[ ] 13.3 - Migrer ShareDialog animations
    - 3 motion.span/div avec repeat: Infinity
    - → CSS keyframes (meme pattern que home)

[ ] 13.4 - Migrer pages Practice/Challenge
    - GSAP bg tween (identique a home) → CSS .bg-drift
    - motion.div dans ChallengePlaying/PracticePlaying → CSS

[ ] 13.5 - Speed Index
    - Particules client-only (useSyncExternalStore) causent apparition tardive
    - Evaluer: SSR avec arrondi agressif vs client-only avec skeleton

[ ] 13.6 - LCP 4s → < 2.5s
    - Identifier l'element LCP (probablement la licorne ou le titre)
    - Preload critical fonts
    - Optimiser le critical rendering path
```

---

## Phase 14 : Integration + Polish

### Objectif

Connecter les composants Phase 9 aux pages reelles. Polish final.

### Tasks

```
[ ] 14.1 - Brancher Skeleton loaders
    - BadgeCollection → BadgeGridSkeleton
    - ProfilePage → ProfileSkeleton
    - Toute page avec data fetching

[ ] 14.2 - Brancher TextReveal
    - Titres de niveau dans Practice/Challenge
    - "Bravo!" / "Game Over!" avec reveal anime

[ ] 14.3 - Brancher ScrollReveal
    - Page resultats (trophees progressifs)
    - Page profil (stats apparaissent au scroll)

[ ] 14.4 - Integrer RippleEffect dans MagicButton
    - Unifier le feedback tactile

[ ] 14.5 - Nettoyer docs obsoletes
    - EFFECTS_CHECKLIST.md → cocher ou supprimer
    - EFFECTS_ACTION_PLAN.md → archiver (remplace par ROADMAP)
    - Mettre a jour ARCHITECTURE.md avec l'etat reel

[ ] 14.6 - User testing
    - 3-5 enfants de 9 ans
    - Mesurer completion rate, temps par question, engagement
    - Iterer sur les feedbacks
```

---

## Architecture (P3) - Refactoring

```
[ ] A.1 - Migrate hooks/ vers features/
    - useAuth → features/auth/hooks/ (deja fait partiellement)
    - Nettoyer hooks/index.ts

[ ] A.2 - API game
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

---

## Definition of Done

Chaque feature est complete quand :

- [x] Tests unitaires passent (60%)
- [x] Tests integration passent (30%)
- [x] Tests E2E passent (10%)
- [x] TypeScript 0 erreur
- [x] ESLint 0 erreur
- [x] Deploye en production
- [x] Documente dans ROADMAP

---

## Changelog

### 2026-03-18 (Phase 11 Complete)

- Migration CSS animations home page (Proposition B)
  - 49 motion.div + 2 GSAP tweens → CSS @keyframes
  - Lighthouse perf 66 → 75, TBT -65%, JS exec -32%
  - PulseGlow + GradientBorder migres vers CSS
  - UnicornHero + useRestartableAnimation + useParticlesEngine extraits
  - 6 dead CSS keyframes supprimes, couleurs centralisees
  - Fisher-Yates shuffle fix, hydratation SSR fix
  - 955 tests (14 nouveaux), 19 commits, deploye Vercel

### 2026-01 (Phases 9-10)

- Phase 9 complete: sons (useSound, Kenney CC0), settings page, onboarding tour
- Phase 10 infra: Playwright config, E2E home/navigation/accessibility
- Console banner ASCII art P-A.G avec oklch gradient

### 2025-12-26 (Phases 0-8.5)

- Projet cree et deploye en une journee
- 8.5 phases completees, 860 tests, PWA installable
- Architecture ISO/IEC 25010 avec SRP thin orchestrators
