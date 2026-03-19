# CLAUDE.md — Tables Magiques

## Projet

App web PWA d'apprentissage des multiplications pour enfants (9+). Stack: Next.js 16, React 19, TypeScript, Tailwind v4.

## Commandes

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run typecheck    # tsc --noEmit
npm run test:run     # Vitest (1360 tests)
npm run test:e2e     # Playwright
npm run test:e2e:visual       # Visual regression (Playwright screenshots)
npm run test:e2e:visual:update # Update visual baselines
npm run lint         # ESLint
npm run format:check # Prettier
npm run quality:circular     # Madge zero circular deps
npm run quality:bundle-size  # Bundle size guard (560KB threshold)
```

## Architecture

- `app/` — Pages Next.js (thin wrappers vers features/)
- `features/` — Modules metier (game, home, settings, auth, onboarding)
- `components/effects/` — Composants d'animation reutilisables
- `components/ui/` — Composants UI de base (shadcn)
- `lib/animations/` — Stack d'animation (Framer Motion, tsParticles, Lottie, CSS)
- `lib/animations/colors.ts` — Palettes de couleurs partagees (source unique)
- `lib/animations/lazy.tsx` — Dynamic imports des composants lourds (~270KB economises)
- `styles/animations.css` — Keyframes CSS + classes utilitaires GPU-safe
- `styles/tokens.css` — Design tokens (couleurs, easings, timings, shadows)
- `hooks/` — Hooks partages (useReducedMotion, useParticlesEngine, useRestartableAnimation, etc.)
- `types/` — Types TypeScript centralises

## Conventions animation

- **Fonds de page**: CSS `@keyframes` + `.bg-drift` (zero JS par frame)
- **Entrees one-shot**: CSS `.animate-fade-up`, `.animate-fade-scale`, `.animate-fade-down`, `.animate-title-enter`, `.animate-answer-pop`, `.animate-celebration-entry`
- **Stagger delays**: CSS `animation-delay` via `style={{ '--delay': 'Xs' }}`
- **Interactions hover/tap**: CSS `.interactive-scale`, `.magic-card-interactive`, `.hover-lift`
- **Icon transitions**: CSS `.icon-rotate` (theme toggle, state changes)
- **Progress bars**: CSS `.progress-fill` (transition: width)
- **Animation triggers**: `useRestartableAnimation` hook (CSS class toggle via rAF)
- **Particules etoiles**: tsParticles (canvas GPU, fpsLimit 30, pauseOnBlur: true)
- **Celebrations**: tsParticles `confettiConfig` (remplace GSAP)
- **Easings**: `var(--ease-spring)` ou `var(--ease-smooth)` de tokens.css — jamais hardcoder cubic-bezier
- **GSAP**: supprime completement (Phase 13)

### Framer Motion — usages restants (legitimes)

FM est reserve aux cas ou CSS ne suffit pas :

- **AnimatePresence mount/unmount**: modals, toasts, phase transitions (practice/challenge)
- **useSpring/useTransform**: NumberReveal (compteur anime avec physique spring)
- **useInView + variants**: ScrollReveal (intersection observer + animation)
- **Character stagger**: TextReveal (animation lettre par lettre)
- **SVG spring animations**: CrownProgress (progression couronne animee)
- **Gesture variants**: KawaiiMascot (whileHover/whileTap conditionnels)
- **Sparkle particles**: MagicButton (AnimatePresence pour particules)

Tout le reste utilise CSS — voir `styles/animations.css`.

## Regles

- Ne jamais degrader le rendu visuel pour la perf — optimiser le HOW, pas le WHAT
- Tout nouveau composant avec animation doit supporter `prefers-reduced-motion`
- Les composants couteux (45+ elements, SVG complexes) doivent etre wrapes dans `memo()`
- Les barrel exports utilisent des exports nommes explicites, pas `export *`
- Les couleurs d'animation passent par `lib/animations/colors.ts`
- `next.config.ts` a le React Compiler active (memoization automatique)
- 1398 tests (76 fichiers), coverage ~90%
- Zero dependances circulaires (madge verifie)
- Bundle size guard: 525 KB gzipped, threshold 560 KB
