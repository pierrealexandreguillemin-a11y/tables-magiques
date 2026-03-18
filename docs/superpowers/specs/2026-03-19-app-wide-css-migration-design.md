# App-Wide CSS Animation Migration + GSAP Removal — Spec

## Contexte

La home page a ete migree vers CSS @keyframes (Phase 11). Les autres pages (Practice, Challenge, Settings) et les composants effects utilisent encore Framer Motion pour des animations simples et GSAP pour des celebrations. L'app a 4 runtimes d'animation — l'objectif est de reduire a 2 (CSS + Framer Motion pour AnimatePresence uniquement).

## Objectif

Propager les patterns CSS de la home a toute l'app. Supprimer GSAP completement. Simplifier les couches de composants pour eliminer le lag.

### Metriques cibles

- 0 import GSAP dans toute l'app
- `gsap` et `@gsap/react` supprimes du package.json
- Framer Motion reduit a AnimatePresence + exit animations uniquement
- PulseGlow blur filter retire des boutons
- GradientBorder simplifie (1 div au lieu de 3)
- Lighthouse perf mesure avant/apres

## Perimetre

### Tier 1 — GSAP background loops → CSS (2 fichiers)

| Fichier             | Avant                                                    | Apres                         |
| ------------------- | -------------------------------------------------------- | ----------------------------- |
| `PracticePage.tsx`  | `gsap.to(container, { backgroundPosition, repeat: -1 })` | CSS `.bg-drift` (existe deja) |
| `ChallengePage.tsx` | `gsap.to(container, { backgroundPosition, repeat: -1 })` | CSS `.bg-drift` (existe deja) |

Identique a ce qui a ete fait sur `HomePage.tsx`. Supprimer `gsap`, `useGSAP`, `gsap.registerPlugin`, `containerRef`.

### Tier 2 — GSAP celebrations → tsParticles + CSS

| Effet                | Avant (GSAP)                               | Apres                                        |
| -------------------- | ------------------------------------------ | -------------------------------------------- |
| `confettiExplosion`  | DOM manipulation + `gsap.to` par particule | tsParticles `confettiConfig` (existe deja)   |
| `fireworksDisplay`   | DOM + `gsap.to` + timeouts                 | tsParticles emitter burst                    |
| `celebrationCascade` | DOM + `gsap.to` en cascade                 | tsParticles emitter sequence                 |
| `shakeError`         | `gsap.to(element, { x: [...] })`           | CSS `@keyframes shake` + toggle classe       |
| `animateScore`       | `gsap.to(element, { textContent })`        | CSS counter-increment ou simple setState     |
| `timerPulse`         | `gsap.to(element, { scale, repeat })`      | CSS `@keyframes pulse`                       |
| `glowPulse`          | `gsap.to(element, { boxShadow })`          | CSS `@keyframes` (pulse-glow existe deja)    |
| `magneticHover`      | `gsap.to` mouse tracking                   | Supprimer (MagneticButton a son propre code) |
| `staggerReveal`      | `gsap.to` stagger                          | CSS `animation-delay` stagger                |
| `numberWave`         | `gsap.to` wave                             | CSS `animation-delay` wave                   |
| `pageTransition`     | `gsap.from/to`                             | Deja gere par MorphingOverlay (Framer)       |
| `badgeUnlock`        | `gsap.to` scale+rotate                     | CSS `@keyframes`                             |

Apres migration: supprimer `lib/animations/gsap/effects.ts`, `lib/animations/gsap/register.ts`, `hooks/useGsapEffects.ts`, `components/effects/GsapCelebration.tsx`.

### Tier 3 — Framer Motion entrees/interactions → CSS

| Fichier                 | Animation                     | Migration                                     |
| ----------------------- | ----------------------------- | --------------------------------------------- |
| `PracticeSelection.tsx` | `initial/animate` fade+slide  | CSS `.animate-fade-up`                        |
| `PracticeCompleted.tsx` | `initial/animate` fade+scale  | CSS `.animate-fade-scale`                     |
| `ChallengeReady.tsx`    | `initial/animate` + hover/tap | CSS `.animate-fade-up` + `:hover/:active`     |
| `ChallengeGameOver.tsx` | `initial/animate` + hover/tap | CSS `.animate-fade-scale` + `:hover/:active`  |
| `AnswerIcon.tsx`        | Spring scale+rotate entry     | CSS `@keyframes answer-pop`                   |
| `MagicCard.tsx`         | `whileHover/whileTap`         | CSS `:hover/:active` transition               |
| `AnimatedCheckbox.tsx`  | Spring thumb + SVG path       | CSS `transition` + `stroke-dasharray`         |
| `GentleShake.tsx`       | `useAnimationControls` shake  | CSS toggle classe (pattern unicorn-pop)       |
| `ShareDialog.tsx`       | 3 infinite loops + entry      | CSS `@keyframes`                              |
| `MagicButton.tsx`       | hover/tap scale               | CSS `:hover/:active` (sparkles restent en FM) |

### Tier 4 — Simplification couches

| Composant      | Avant                                     | Apres                                                        | Gain                    |
| -------------- | ----------------------------------------- | ------------------------------------------------------------ | ----------------------- |
| PulseGlow      | div avec `filter: blur(12px)` anime       | Supprimer le glow layer, garder seulement le content wrapper | -2 paint-per-frame blur |
| GradientBorder | 2 divs (border + content) avec motion.div | 1 div avec CSS `border-image` ou `background` clip           | -1 div, zero JS         |

### Hors perimetre

- **AnimatePresence transitions de phase** — reste en Framer Motion:
  - Practice: selection → playing → completed
  - Challenge: ready → playing → game_over
  - Feedback Lottie mount/unmount
  - Toast entry/exit
  - MagicButton sparkles
  - PageTransition/MorphingOverlay
- **Progress bars** — `animate={{ width: progress% }}` reste en FM (state-driven)
  - Alternative: migrer vers CSS `transition: width` avec `style={{ width: progress% }}` — plus simple mais perd le spring
- **MagneticButton mouse tracking** — retire de HomeContent (deja fait), garde le composant pour usage standalone si besoin mais ne l'utiliser nulle part dans des liens
- **tsParticles** — reste pour etoiles + celebrations (remplace GSAP)

## Principes

### DRY

- Les CSS keyframes de la home (`animate-fade-up`, `animate-fade-scale`, `cloud-float`, etc.) sont reutilises sur toutes les pages
- Nouveaux keyframes: `answer-pop`, `shake-error` — partages dans `animations.css`

### SRP

- Chaque composant migre perd ses imports Framer Motion (sauf AnimatePresence)
- `useGsapEffects` disparait — les celebrations utilisent directement tsParticles ou CSS

### Thin Layer

- Les composants passent des classes CSS, pas des refs ni des hooks d'animation
- Exception: `GentleShake` garde un `useState` pour le toggle de classe (meme pattern que UnicornHero)

## Plan de migration

### Etape 1 — Practice/Challenge bg-drift (Tier 1)

Remplacer GSAP par CSS `.bg-drift` dans PracticePage et ChallengePage. Supprimer imports gsap. Memes fichiers que home migration.

### Etape 2 — ShareDialog CSS (Tier 3 partiel)

3 infinite loops + 1 entry → CSS keyframes.

### Etape 3 — Entrees/interactions simples (Tier 3)

PracticeSelection, PracticeCompleted, ChallengeReady, ChallengeGameOver, AnswerIcon, MagicCard, PracticePlaying (streak entry motion.div) → CSS classes existantes.

### Etape 4 — AnimatedCheckbox + GentleShake (Tier 3 complexe)

AnimatedCheckbox: spring → CSS transition. GentleShake: useAnimationControls → useRestartableAnimation. GentleShake motion.p (encouraging message) → CSS fade with AnimatePresence kept for exit.

### Etape 5 — Celebrations GSAP → tsParticles/CSS (Tier 2)

Remplacer confettiExplosion/fireworksDisplay par composant tsParticles avec emitter. Remplacer shakeError par CSS. Migrer MagicCounter GSAP counter tween → requestAnimationFrame counter. Migrer BadgeUnlockModal (confettiExplosion + badgeUnlock + glowPulse → tsParticles + CSS). Migrer SuccessExplosion FM particle burst → tsParticles. Supprimer tous les fichiers GSAP.

### Etape 6 — Simplification PulseGlow + GradientBorder (Tier 4)

Retirer le blur layer de PulseGlow. Simplifier GradientBorder.

### Etape 7 — Cleanup

Supprimer `gsap` et `@gsap/react` du package.json. Verifier zero import GSAP. Mettre a jour barrel exports. `npm install` pour nettoyer node_modules.

## Fichiers supprimes

- `lib/animations/gsap/effects.ts`
- `lib/animations/gsap/register.ts`
- `hooks/useGsapEffects.ts`
- `components/effects/GsapCelebration.tsx`

## Fichiers modifies

| Fichier                                                    | Action                                                        |
| ---------------------------------------------------------- | ------------------------------------------------------------- |
| `styles/animations.css`                                    | Ajouter keyframes: answer-pop, shake-error                    |
| `features/game/components/PracticePage.tsx`                | GSAP → CSS .bg-drift                                          |
| `features/game/components/ChallengePage.tsx`               | GSAP → CSS .bg-drift                                          |
| `features/game/components/practice/PracticeSelection.tsx`  | motion.div → CSS                                              |
| `features/game/components/practice/PracticeCompleted.tsx`  | motion.div → CSS                                              |
| `features/game/components/challenge/ChallengeReady.tsx`    | motion.div → CSS                                              |
| `features/game/components/challenge/ChallengeGameOver.tsx` | motion.div → CSS                                              |
| `features/home/components/ShareDialog.tsx`                 | motion.span → CSS                                             |
| `components/effects/AnswerIcon.tsx`                        | motion.div → CSS                                              |
| `components/effects/MagicCard.tsx`                         | motion.div → CSS                                              |
| `components/effects/MagicButton.tsx`                       | hover/tap → CSS                                               |
| `components/effects/AnimatedCheckbox.tsx`                  | motion.span → CSS transition                                  |
| `components/effects/GentleShake.tsx`                       | useAnimationControls → CSS toggle                             |
| `components/effects/PulseGlow.tsx`                         | Supprimer blur layer                                          |
| `components/effects/GradientBorder.tsx`                    | Simplifier a 1 div                                            |
| `components/effects/SuccessExplosion.tsx`                  | useGsapEffects → tsParticles, FM particle burst → tsParticles |
| `components/effects/MagicCounter.tsx`                      | GSAP counter tween → rAF counter                              |
| `components/effects/BadgeUnlockModal.tsx`                  | useGsapEffects → tsParticles + CSS                            |
| `features/game/components/practice/PracticePlaying.tsx`    | Streak motion.div entry → CSS                                 |
| `lib/animations/index.ts`                                  | Supprimer exports GSAP + LazyGsapCelebration                  |
| `lib/animations/lazy.tsx`                                  | Supprimer LazyGsapCelebration export                          |
| `components/effects/index.ts`                              | Supprimer GsapCelebration + types exports                     |
| `hooks/index.ts`                                           | Supprimer useGsapEffects export                               |
| `package.json`                                             | Supprimer gsap + @gsap/react                                  |

## Quality Gates

### Gate 1 — Build & Types

- `tsc --noEmit` zero erreur
- `next build` reussit

### Gate 2 — Tests

- `vitest run` — 1284 tests passent
- Tests qui mockent GSAP mis a jour ou supprimes

### Gate 3 — Lint & Format

- `eslint --max-warnings 0` + `prettier --check`

### Gate 4 — Dead code

- `grep -r "gsap\|useGSAP\|@gsap" --include="*.ts" --include="*.tsx" features/ components/ hooks/ lib/ app/` = 0 matches
- `madge --circular` zero

### Gate 5 — Rendu visuel

- Comparaison Playwright avant/apres sur toutes les pages
- Reduced motion desactive toutes les animations

### Gate 6 — Performance

- Lighthouse perf avant/apres
- Bundle size: mesurer reduction (GSAP 76KB gz supprime)

## Definition of Done

- Gates 1-4 passent
- Gate 5 validee visuellement
- Gate 6 mesuree et documentee
- `gsap` et `@gsap/react` absents du package.json
- Zero import GSAP dans le code source
- ROADMAP mis a jour

## Risques

| Risque                                                   | Mitigation                                                                                                                           |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Celebrations tsParticles moins impressionnantes que GSAP | Les configs confetti/fireworks existent deja et sont testees. Si insuffisant, ajouter un preset "burst" specifique.                  |
| AnimatedCheckbox SVG stroke-dasharray complexe           | Tester sur tous les navigateurs cibles. Fallback: garder motion.path pour ce seul cas.                                               |
| GentleShake timing different avec CSS                    | Le pattern useRestartableAnimation est deja valide sur UnicornHero. Meme approach.                                                   |
| PulseGlow supprime change le rendu des boutons           | Choix delibere. Le blur filter est la cause principale du lag sur les boutons. Le glow static (box-shadow) reste via GradientBorder. |
