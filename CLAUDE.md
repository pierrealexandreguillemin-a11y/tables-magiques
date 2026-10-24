# CLAUDE.md — Tables Magiques

## Projet

App web PWA d'apprentissage des multiplications pour enfants (9+). Stack: Next.js 16, React 19, TypeScript, Tailwind v4.

## Commandes

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run typecheck    # tsc --noEmit
npm run test:run     # Vitest (1373 tests, 82 files — measured 2026-10-21)
npm run test:e2e     # Playwright
npm run test:e2e:visual       # Visual regression (Playwright screenshots)
npm run test:e2e:visual:update # Update visual baselines
npm run lint         # ESLint
npm run format:check # Prettier
npm run quality:circular     # Madge zero circular deps
npm run quality:bundle-size  # Sum of all chunks (informative, not a gate)
npm run quality:first-load   # GATE: gzip JS per route before load / at idle vs perf-budget.json (after build)
npm run test:e2e:local       # Visual regression vs a LOCAL build (see playwright.local.config.ts)
```

## Architecture

- `app/` — Pages Next.js (thin wrappers vers features/)
- `features/` — Modules metier (game, home, settings, auth, onboarding)
- `components/effects/` — Composants d'animation reutilisables
- `components/ui/` — Composants UI de base (shadcn)
- `lib/animations/` — Stack d'animation (motion, canvas maison, Lottie, CSS)
- `lib/animations/canvas/` — Rendus canvas : etoiles (`starField.ts` + presets), confettis (`confettiScatter.ts`)
- `lib/animations/colors.ts` — Palettes de couleurs partagees (source unique)
- `lib/animations/lazy.tsx` — Dynamic imports des composants lourds (~270KB economises)
- `styles/animations.css` — Keyframes CSS + classes utilitaires GPU-safe
- `styles/tokens.css` — Design tokens (couleurs, easings, timings, shadows)
- `hooks/` — Hooks partages (useReducedMotion, useRestartableAnimation, etc.)
- `types/` — Types TypeScript centralises

## Conventions animation

- **Fonds de page**: CSS `@keyframes` + `.bg-drift` (zero JS par frame)
- **Entrees one-shot**: CSS `.animate-fade-up`, `.animate-fade-scale`, `.animate-fade-down`, `.animate-title-enter`, `.animate-answer-pop`, `.animate-celebration-entry`
- **Stagger delays**: CSS `animation-delay` via `style={{ '--delay': 'Xs' }}`
- **Interactions hover/tap**: CSS `.interactive-scale`, `.magic-card-interactive`, `.hover-lift`
- **Icon transitions**: CSS `.icon-rotate` (theme toggle, state changes)
- **Progress bars**: CSS `.progress-fill` (transition: width)
- **Animation triggers**: `useRestartableAnimation` hook (CSS class toggle via rAF)
- **Particules etoiles**: `StarField` (canvas maison, 30 fps, pause onglet cache / hors ecran, image fixe en mouvement reduit)
- **Celebrations**: `ConfettiBurst` (canvas-confetti 1.9.4). tsParticles supprime le 2026-10-17 (P22)
- **Easings**: `var(--ease-spring)` ou `var(--ease-smooth)` de tokens.css — jamais hardcoder cubic-bezier
- **GSAP**: supprime completement (Phase 12)

### motion (ex-Framer Motion) — usages restants (legitimes)

Paquet `motion` 14. Rendre `m.*` (`import * as m from 'motion/react-m'`), hooks depuis
`motion/react`. `app/providers.tsx` : `LazyMotion strict`, features `domMax` chargees en async
(`lib/animations/framer/loadFeatures.ts`; domMax car Toast utilise `layout`). Importer `motion`
ou `framer-motion` est refuse par ESLint (gate `tests/unit/lint/motion-imports.test.ts`).
Mock de test partage : `tests/utils/motionMock.tsx`.

motion est reserve aux cas ou CSS ne suffit pas :

- **AnimatePresence mount/unmount**: modals, toasts, phase transitions (practice/challenge)
- **useSpring/useTransform**: NumberReveal (compteur anime avec physique spring)
- **useInView + variants**: ScrollReveal (intersection observer + animation)
- **Character stagger**: TextReveal (animation lettre par lettre)
- **SVG spring animations**: CrownProgress (progression couronne animee)
- **Gesture variants**: KawaiiMascot (whileHover/whileTap conditionnels)
- **Sparkle particles**: MagicButton (AnimatePresence pour particules)

Tout le reste utilise CSS — voir `styles/animations.css`.

## Regles

- Tout livrable visuel (page, ou rendu de la mascotte : criniere, queue) passe par le skill
  `anti-slop-frontend` avant la premiere ligne ou le premier rendu ; juges aveugles
  `design-judge` (pages) / `hair-judge` (cheveux, harnais `docs/spikes/style-2026-10/harness/`) ;
  verdict = choix force binaire de l'user
- Ne jamais degrader le rendu visuel pour la perf — optimiser le HOW, pas le WHAT
- Tout nouveau composant avec animation doit supporter `prefers-reduced-motion`
- Les composants couteux (45+ elements, SVG complexes) doivent etre wrapes dans `memo()`
- Les barrel exports utilisent des exports nommes explicites, pas `export *`
- Pas de barrel pour `components/effects` ni `lib/animations` : importer un nom d'un barrel tirait
  tout (Lottie, tsParticles, kawaii) avant `load`. Importer le fichier direct. Mesure :
  `docs/perf/first-load-history.md` (accueil 432 → 288 KB gz)
- Les couleurs d'animation passent par `lib/animations/colors.ts`
- `next.config.ts` a le React Compiler active (memoization automatique)
- 1373 tests (82 fichiers, mesure 2026-10-21 : `npm run test:run`), coverage ~90%
- Zero dependances circulaires (madge verifie)
- Budget JS par route (gate CI) : `perf-budget.json`, mesure + 5 %, a n'abaisser qu'avec une
  mesure. Historique : `docs/perf/first-load-history.md`
