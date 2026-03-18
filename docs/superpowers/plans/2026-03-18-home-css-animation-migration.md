# Home Page CSS Animation Migration — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate 49 Framer Motion `motion.div` + 2 GSAP infinite-repeat tweens from the home page to CSS `@keyframes`, achieving zero JS overhead per frame for background animations.

**Architecture:** CSS `@keyframes` parametrised via CSS custom properties replace all Framer Motion and GSAP infinite-loop animations on the home page. tsParticles (canvas GPU) stays. Framer Motion stays for `AnimatePresence` and internal effect components only.

**Tech Stack:** CSS @keyframes, CSS custom properties, React (useState for click bounce), Tailwind v4

**Spec:** `docs/superpowers/specs/2026-03-18-home-css-animation-migration-design.md`

---

## File Map

| File                                                     | Action     | Responsibility                                                    |
| -------------------------------------------------------- | ---------- | ----------------------------------------------------------------- |
| `styles/animations.css`                                  | Modify     | Add 10 keyframes + 8 utility classes + reduced motion             |
| `components/effects/FairyBackground.tsx`                 | Modify     | Remove `motion` import, clouds become plain `<div>` + CSS classes |
| `tests/unit/components/effects/FairyBackground.test.tsx` | Modify     | Remove `framer-motion` mock (no longer imported)                  |
| `features/home/components/FloatingParticles.tsx`         | Modify     | Remove `motion` import, particles become `<div>` + CSS classes    |
| `features/home/components/HomePage.tsx`                  | Modify     | Remove `useHomeAnimations`, add `.bg-drift` class, simplify props |
| `features/home/components/HomeContent.tsx`               | Modify     | Remove `motion` import, CSS classes + `useState` for click bounce |
| `features/home/hooks/useHomeAnimations.ts`               | **Delete** | All animations moved to CSS                                       |
| `features/home/hooks/useParticles.ts`                    | Modified   | Client-only via `useSyncExternalStore` (SSR hydration fix)        |

---

## Task 1: CSS Keyframes & Classes

**Files:**

- Modify: `styles/animations.css` (append after line 291, before reduced motion block at line 293)

- [ ] **Step 1: Add background loop keyframes**

Append before the `/* === REDUCED MOTION (A11Y) === */` block:

```css
/* === CLOUD FLOAT (fond feerie — parametrise) === */
/* Framer Motion 4-value arrays [0,a,b,0] map to 0%/33%/66%/100% evenly spaced */
@keyframes cloud-float {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(var(--x1), var(--y1)) scale(var(--s1));
  }
  66% {
    transform: translate(var(--x2), var(--y2)) scale(var(--s2));
  }
}

.cloud {
  --x1: 0px;
  --y1: 0px;
  --s1: 1;
  --x2: 0px;
  --y2: 0px;
  --s2: 1;
  --duration: 20s;
  --delay: 0s;
  animation: cloud-float var(--duration) ease-in-out var(--delay) infinite;
  will-change: transform;
}

/* === PARTICLE FLOAT (particules flottantes — parametrise) === */
@keyframes particle-float {
  0%,
  100% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translateY(calc(-1 * var(--amplitude-y)))
      translateX(var(--x-offset)) scale(var(--scale-max));
    opacity: 0.9;
  }
}

.floating-particle {
  --duration: 5s;
  --delay: 0s;
  --amplitude-y: 40px;
  --x-offset: 0px;
  --scale-max: 1.3;
  animation: particle-float var(--duration) ease-in-out var(--delay) infinite;
  will-change: transform, opacity;
}

/* === STAR TWINKLE (etoiles scintillantes — parametrise) === */
@keyframes star-twinkle {
  0%,
  100% {
    opacity: 0.2;
    transform: scale(0.8) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.2) rotate(180deg);
  }
}

.floating-star {
  --duration: 2s;
  --delay: 0s;
  animation: star-twinkle var(--duration) ease-in-out var(--delay) infinite;
  will-change: transform, opacity;
}

/* === BG DRIFT (gradient background — paint, pas compositor) === */
@keyframes bg-drift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.bg-drift {
  background-size: 400% 400%;
  animation: bg-drift 15s ease-in-out infinite;
}

/* === UNICORN BOB (flottement licorne) === */
@keyframes unicorn-bob {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-25px) rotate(8deg);
  }
}

.unicorn-bob {
  animation: unicorn-bob 5s ease-in-out infinite;
  will-change: transform;
}

/* === UNICORN WIGGLE (hover interaction) === */
@keyframes unicorn-wiggle {
  0%,
  100% {
    transform: scale(1.3) rotate(0deg);
  }
  25% {
    transform: scale(1.3) rotate(-10deg);
  }
  50% {
    transform: scale(1.3) rotate(10deg);
  }
  75% {
    transform: scale(1.3) rotate(-10deg);
  }
}

/* === UNICORN POP (click bounce) === */
@keyframes unicorn-pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}

.unicorn-pop {
  animation: unicorn-pop 0.3s var(--ease-spring);
}

/* === FADE UP (entree depuis le bas) === */
@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-up {
  animation: fade-up 0.8s var(--ease-smooth) both;
  animation-delay: var(--delay, 0s);
}

/* === FADE SCALE (entree avec zoom) === */
@keyframes fade-scale {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-scale {
  animation: fade-scale 0.6s var(--ease-spring) both;
  animation-delay: var(--delay, 0s);
}

/* === TITLE ENTER (entree titre elastic) === */
@keyframes title-enter {
  from {
    opacity: 0;
    transform: translateY(-100px) scale(0.5);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-title-enter {
  animation: title-enter 1.5s var(--ease-spring) both;
  animation-delay: var(--delay, 0.3s);
}
```

- [ ] **Step 2: Add new classes to reduced motion block**

Replace the existing `@media (prefers-reduced-motion: reduce)` block (lines 293-316) with:

```css
/* === REDUCED MOTION (A11Y) === */
@media (prefers-reduced-motion: reduce) {
  .animate-shimmer,
  .animate-glow,
  .animate-float,
  .animate-sparkle,
  .animate-bounce-soft,
  .animate-spin,
  .animate-pop,
  .animate-gradient,
  .animate-gradient-x,
  .animate-star-burst,
  .animate-cloud,
  .cloud,
  .floating-particle,
  .floating-star,
  .bg-drift,
  .unicorn-bob,
  .unicorn-pop,
  .animate-fade-up,
  .animate-fade-scale,
  .animate-title-enter {
    animation: none;
  }

  /* Désactiver GPU hints en reduced motion */
  .gpu-accelerated,
  .particle-layer,
  .animation-container {
    will-change: auto;
    contain: none;
  }
}
```

- [ ] **Step 3: Verify build**

Run: `cd tables-magiques && npx tsc --noEmit && npx vitest run`
Expected: Zero errors, 941 tests pass (no components use the new classes yet)

- [ ] **Step 4: Commit**

```bash
git add styles/animations.css
git commit -m "feat(css): add 10 keyframes for home page animation migration

Parametrised via CSS custom properties. All classes have safe defaults.
Reduced motion support included."
```

---

## Task 2: FairyBackground Clouds Migration

**Files:**

- Modify: `components/effects/FairyBackground.tsx`
- Modify: `tests/unit/components/effects/FairyBackground.test.tsx`

- [ ] **Step 1: Update FairyBackground — remove motion, use CSS classes**

Replace the `motion` import and the cloud rendering section. The full updated file:

In `FairyBackground.tsx`:

- Remove `import { motion } from 'framer-motion';` (line 12)
- Change `CloudConfig.animation` type from `{ x: number[]; y: number[]; scale: number[] }` to `{ x: number[]; y: number[]; scale: number[] }` (stays same — data source)
- Replace the cloud `motion.div` map (lines 268-293) with plain `<div>` using CSS classes:

```tsx
{
  /* Nuages colores (CSS keyframes — GPU compositor) */
}
{
  CLOUDS.map((cloud) => (
    <div
      key={cloud.id}
      data-testid={`cloud-${cloud.id}`}
      className={cn(
        'absolute rounded-full pointer-events-none gpu-accelerated',
        animate && 'cloud'
      )}
      style={
        {
          width: cloud.size,
          height: cloud.size,
          background: cloud.color,
          opacity: cloud.opacity,
          filter: `blur(${cloud.blur}px)`,
          ...cloud.position,
          ...(animate
            ? {
                '--duration': `${cloud.duration}s`,
                '--delay': `${cloud.delay ?? 0}s`,
                '--x1': `${cloud.animation.x[1]}px`,
                '--y1': `${cloud.animation.y[1]}px`,
                '--s1': cloud.animation.scale[1],
                '--x2': `${cloud.animation.x[2]}px`,
                '--y2': `${cloud.animation.y[2]}px`,
                '--s2': cloud.animation.scale[2],
              }
            : {}),
        } as React.CSSProperties
      }
    />
  ));
}
```

- Remove `import { motion } from 'framer-motion';` — the only remaining animation import is tsParticles (`Particles`, `initParticlesEngine`)

- [ ] **Step 2: Update FairyBackground test — remove framer-motion mock**

In `tests/unit/components/effects/FairyBackground.test.tsx`:

- Remove the entire `vi.mock('framer-motion', ...)` block (lines 13-26) since `FairyBackground` no longer imports `motion`

- [ ] **Step 3: Verify**

Run: `cd tables-magiques && npx tsc --noEmit && npx vitest run tests/unit/components/effects/FairyBackground.test.tsx`
Expected: Zero type errors, all FairyBackground tests pass (cloud data-testid attributes preserved)

- [ ] **Step 4: Run full test suite**

Run: `npx vitest run`
Expected: 941 tests pass

- [ ] **Step 5: Commit**

```bash
git add components/effects/FairyBackground.tsx tests/unit/components/effects/FairyBackground.test.tsx
git commit -m "refactor(FairyBackground): migrate clouds from Framer Motion to CSS keyframes

4 motion.div replaced by plain div with .cloud CSS class.
tsParticles stars unchanged. Zero visual change."
```

---

## Task 3: FloatingParticles Migration

**Files:**

- Modify: `features/home/components/FloatingParticles.tsx`

- [ ] **Step 1: Replace motion.div with CSS-animated div**

Full replacement for `FloatingParticles.tsx`:

```tsx
/**
 * FloatingParticles
 * ISO/IEC 25010 - SRP: Particle rendering only
 * CSS keyframes — zero JS per frame
 */

'use client';

import { memo } from 'react';
import type { Particle, Star } from '../hooks/useParticles';

interface Props {
  particles: Particle[];
  stars: Star[];
}

export const FloatingParticles = memo(function FloatingParticles({
  particles,
  stars,
}: Props) {
  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none floating-particle"
          style={
            {
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              background:
                'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 70%)',
              boxShadow: '0 0 10px rgba(255,255,255,0.5)',
              '--duration': `${p.duration}s`,
              '--delay': `${p.delay}s`,
              '--x-offset': `${p.xOffset}px`,
            } as React.CSSProperties
          }
        />
      ))}

      {stars.map((s) => (
        <div
          key={`star-${s.id}`}
          className="absolute text-2xl pointer-events-none floating-star"
          style={
            {
              left: s.left,
              top: s.top,
              '--duration': `${s.duration}s`,
              '--delay': `${s.delay}s`,
            } as React.CSSProperties
          }
        >
          ✨
        </div>
      ))}
    </>
  );
});
```

- [ ] **Step 2: Verify**

Run: `cd tables-magiques && npx tsc --noEmit && npx vitest run`
Expected: Zero errors, 941 tests pass

- [ ] **Step 3: Commit**

```bash
git add features/home/components/FloatingParticles.tsx
git commit -m "refactor(FloatingParticles): migrate 45 motion.div to CSS keyframes

30 particles + 15 stars now use .floating-particle and .floating-star CSS classes.
Per-particle xOffset preserved via --x-offset custom property.
Zero Framer Motion import remaining."
```

---

## Task 4: Background Gradient + Unicorn Float + Delete useHomeAnimations

**Files:**

- Modify: `features/home/components/HomePage.tsx`
- Modify: `features/home/components/HomeContent.tsx` (add unicorn-bob class)
- Delete: `features/home/hooks/useHomeAnimations.ts`

- [ ] **Step 1: Verify useHomeAnimations is only imported by HomePage.tsx**

Run: `grep -r "useHomeAnimations" tables-magiques/features/ tables-magiques/components/ tables-magiques/app/`
Expected: Only `features/home/components/HomePage.tsx` and `features/home/hooks/useHomeAnimations.ts`

- [ ] **Step 2: Update HomePage.tsx — remove GSAP, add CSS class**

Full replacement for `HomePage.tsx`:

```tsx
/**
 * HomePage - Thin Orchestrator
 * ISO/IEC 25010 - SRP: Orchestration only
 */

'use client';

import { FairyBackground } from '@/components/effects';
import { OnboardingTour } from '@/features/onboarding';
import { useParticles } from '../hooks/useParticles';
import { HomeHeader } from './HomeHeader';
import { FloatingParticles } from './FloatingParticles';
import { RainbowDecorations } from './RainbowDecorations';
import { HomeContent } from './HomeContent';

export function HomePage() {
  const { particles, stars } = useParticles();

  return (
    <main
      className="min-h-screen flex items-center justify-center overflow-hidden relative bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-500 dark:from-indigo-900 dark:via-purple-900 dark:to-slate-900 bg-drift"
      style={{ backgroundSize: '400% 400%' }}
    >
      <FairyBackground />
      <HomeHeader />
      <FloatingParticles particles={particles} stars={stars} />
      <RainbowDecorations />
      <HomeContent />
      <OnboardingTour autoStart />
    </main>
  );
}
```

- [ ] **Step 3: Update HomeContent.tsx — remove refs from props, add unicorn-bob**

Update the Props interface and unicorn div to remove refs (they'll be fully migrated in Task 5, but we need to remove the dependency on `useHomeAnimations` now):

```tsx
interface Props {}

export function HomeContent() {
```

For the unicorn div, add the `unicorn-bob` class (we keep the `motion.div` for now — whileHover/whileTap/onClick will be migrated in Task 5):

```tsx
<motion.div
  data-tour="logo"
  className="text-8xl sm:text-9xl mb-6 cursor-pointer select-none unicorn-bob"
  onClick={onUnicornClick}
  ...
```

We can't keep `onUnicornClick` since it comes from `useHomeAnimations` which we're deleting. In this task we add a temporary no-op click handler. Task 5 will replace it with the full CSS pop animation.

Temporary `HomeContent.tsx` changes for this task only:

- Remove props: `titleRef`, `unicornRef`, `onUnicornClick`
- Nest the unicorn in two elements: outer `<div>` for bob animation, inner `<motion.div>` for hover/tap (kept temporarily, Task 5 migrates to CSS)
- Add `animate-title-enter` CSS class to `<h1>`
- Keep remaining `motion.div` wrappers for now (Task 5 migrates those)

```tsx
interface Props {}

export function HomeContent() {
  return (
    <div className="text-center z-10 relative px-4">
      {/* Outer: CSS bob animation. Inner: Framer hover/tap (migrated in Task 5) */}
      <div className="unicorn-bob inline-block">
        <motion.div
          data-tour="logo"
          className="text-8xl sm:text-9xl mb-6 cursor-pointer select-none"
          whileHover={{
            scale: 1.3,
            rotate: [0, -10, 10, -10, 0],
            transition: { duration: 0.5 },
          }}
          whileTap={{ scale: 0.9 }}
          style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.5))' }}
        >
          🦄
        </motion.div>
      </div>

      <h1
        className="text-4xl sm:text-6xl md:text-7xl font-bold mb-4 animate-title-enter"
        style={{
          textShadow:
            '0 0 40px rgba(255,255,255,0.6), 0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
```

Note: `titleRef` removed from `<h1>`, replaced by `animate-title-enter` CSS class. No `onClick` handler needed temporarily — the GSAP bounce was a nice-to-have, Task 5 adds the CSS version.

- [ ] **Step 4: Delete useHomeAnimations.ts**

```bash
rm features/home/hooks/useHomeAnimations.ts
```

- [ ] **Step 5: Verify**

Run: `cd tables-magiques && npx tsc --noEmit && npx vitest run`
Expected: Zero errors, 941 tests pass

- [ ] **Step 6: Commit**

```bash
git add features/home/components/HomePage.tsx features/home/components/HomeContent.tsx
git rm features/home/hooks/useHomeAnimations.ts
git commit -m "refactor(home): remove GSAP from home page, delete useHomeAnimations

Background gradient → CSS .bg-drift class.
Unicorn float → CSS .unicorn-bob class.
Title entry → CSS .animate-title-enter class.
useHomeAnimations.ts deleted — zero GSAP on home page."
```

---

## Task 5: HomeContent Interactions + Entries

**Files:**

- Modify: `features/home/components/HomeContent.tsx`

- [ ] **Step 1: Full CSS migration of HomeContent**

Replace `HomeContent.tsx` entirely:

```tsx
/**
 * HomeContent
 * ISO/IEC 25010 - SRP: Main content only
 * CSS animations — zero Framer Motion
 */

'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  GradientText,
  GradientBorder,
  PulseGlow,
  MagneticButton,
} from '@/components/effects';
import { LazyKawaiiMascot } from '@/lib/animations';

export function HomeContent() {
  const [popping, setPopping] = useState(false);

  const handleUnicornClick = useCallback(() => {
    setPopping(false);
    requestAnimationFrame(() => setPopping(true));
  }, []);

  return (
    <div className="text-center z-10 relative px-4">
      {/* Licorne — outer: CSS bob (infinite), inner: interactions (hover/tap/click) */}
      <div className="unicorn-bob inline-block">
        <div
          data-tour="logo"
          className={`text-8xl sm:text-9xl mb-6 cursor-pointer select-none unicorn-interactive ${popping ? 'unicorn-pop' : ''}`}
          onClick={handleUnicornClick}
          onAnimationEnd={(e) => {
            if (e.animationName === 'unicorn-pop') setPopping(false);
          }}
          style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.5))' }}
        >
          🦄
        </div>
      </div>

      <h1
        className="text-4xl sm:text-6xl md:text-7xl font-bold mb-4 animate-title-enter"
        style={{
          textShadow:
            '0 0 40px rgba(255,255,255,0.6), 0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        <GradientText variant="rainbow" animate as="span">
          Tables Magiques
        </GradientText>
      </h1>

      <p
        className="text-xl sm:text-2xl text-white/90 mb-8 font-medium animate-fade-up"
        style={{ '--delay': '0.8s' } as React.CSSProperties}
      >
        Apprends tes multiplications en t&apos;amusant !
      </p>

      <div
        className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-scale"
        style={{ '--delay': '1.2s' } as React.CSSProperties}
      >
        {/* Mode Entrainement - Glassmorphism premium */}
        <Link href="/practice" data-tour="practice-button">
          <PulseGlow color="#a855f7" intensity="medium">
            <GradientBorder variant="unicorn" animate glow borderWidth={3}>
              <MagneticButton
                className="text-xl px-8 py-5 font-bold rounded-xl shadow-2xl
                  bg-white/20 backdrop-blur-xl backdrop-saturate-150
                  border border-white/30
                  text-white
                  hover:bg-white/30 hover:border-white/50
                  transition-all duration-300"
                style={{
                  boxShadow:
                    '0 8px 32px rgba(168, 85, 247, 0.3), inset 0 1px 0 rgba(255,255,255,0.4)',
                }}
              >
                🎮 Mode Entraînement
              </MagneticButton>
            </GradientBorder>
          </PulseGlow>
        </Link>

        {/* Mode Challenge - Glassmorphism premium */}
        <Link href="/challenge" data-tour="challenge-button">
          <PulseGlow color="#f97316" intensity="medium">
            <GradientBorder variant="star" animate glow borderWidth={3}>
              <MagneticButton
                className="text-xl px-8 py-5 font-bold rounded-xl shadow-2xl
                  bg-gradient-to-r from-orange-500/40 to-red-500/40
                  backdrop-blur-xl backdrop-saturate-150
                  border border-white/30
                  text-white
                  hover:from-orange-500/60 hover:to-red-500/60 hover:border-white/50
                  transition-all duration-300"
                style={{
                  boxShadow:
                    '0 8px 32px rgba(249, 115, 22, 0.3), inset 0 1px 0 rgba(255,255,255,0.4)',
                }}
              >
                🔥 Mode Challenge
              </MagneticButton>
            </GradientBorder>
          </PulseGlow>
        </Link>
      </div>

      <div
        className="mt-12 flex justify-center animate-fade-scale"
        style={{ '--delay': '1.8s' } as React.CSSProperties}
      >
        <LazyKawaiiMascot character="planet" mood="blissful" size={100} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add unicorn-interactive CSS to animations.css**

Add before the reduced motion block:

```css
/* === UNICORN INTERACTIVE (hover/tap via CSS) === */
.unicorn-interactive {
  transition: transform 0.1s ease;
}

.unicorn-interactive:hover {
  animation: unicorn-wiggle 0.5s var(--ease-spring);
}

.unicorn-interactive:active {
  transform: scale(0.9);
}
```

And add `.unicorn-interactive` to the reduced motion block (after `.animate-title-enter`):

```css
.unicorn-interactive:hover {
  animation: none;
}
```

- [ ] **Step 3: Verify**

Run: `cd tables-magiques && npx tsc --noEmit && npx vitest run`
Expected: Zero errors, 941 tests pass

- [ ] **Step 4: Commit**

```bash
git add features/home/components/HomeContent.tsx styles/animations.css
git commit -m "refactor(HomeContent): migrate all interactions + entries to CSS

Unicorn hover/tap/click → CSS :hover/:active + unicorn-pop class toggle.
Paragraph/buttons/mascot entries → CSS .animate-fade-up/.animate-fade-scale.
Zero Framer Motion import remaining in HomeContent."
```

---

## Task 6: Cleanup & Verification

**Files:**

- Verify all modified files

- [ ] **Step 1: Verify no motion import in migrated files**

Run: `grep -n "from 'framer-motion'" features/home/components/HomeContent.tsx features/home/components/HomePage.tsx features/home/components/FloatingParticles.tsx components/effects/FairyBackground.tsx`
Expected: Zero matches

- [ ] **Step 2: Verify useHomeAnimations is gone**

Run: `grep -rn "useHomeAnimations" tables-magiques/features/ tables-magiques/components/ tables-magiques/app/`
Expected: Zero matches

- [ ] **Step 3: Verify no GSAP in home page files**

Run: `grep -n "gsap\|useGSAP\|@gsap" features/home/components/HomePage.tsx features/home/components/HomeContent.tsx`
Expected: Zero matches

- [ ] **Step 4: Check circular dependencies**

Run: `npx madge --circular --extensions ts,tsx features/home components/effects/FairyBackground.tsx`
Expected: No circular dependencies found

- [ ] **Step 5: Full quality gate**

Run all in sequence:

```bash
npx tsc --noEmit && npx vitest run && npx eslint . --max-warnings 0 && npx prettier --check . && npx next build
```

Expected: Zero type errors, 941 tests pass, zero lint errors, formatting clean, build succeeds

- [ ] **Step 6: Commit cleanup**

```bash
git commit --allow-empty -m "chore: verify home page CSS migration — all quality gates pass

0 motion.div on home background (was 49)
0 GSAP infinite tweens on home (was 2)
useHomeAnimations.ts deleted
All animations compositor-safe (except bg-drift — known paint, same as before)"
```

---

## Quality Gates Checklist (run after all tasks)

- [ ] `tsc --noEmit` — zero errors
- [ ] `npx next build` — succeeds
- [ ] `npx vitest run` — 941 tests pass
- [ ] `npx eslint . --max-warnings 0` — zero lint errors
- [ ] `npx prettier --check .` — formatting clean
- [ ] `grep "from 'framer-motion'" HomeContent.tsx FloatingParticles.tsx HomePage.tsx` — zero matches
- [ ] `grep "useHomeAnimations"` across codebase — zero matches
- [ ] `npx madge --circular` — zero circular deps
- [ ] Visual check: home page light mode — animations match original
- [ ] Visual check: home page dark mode — animations match original
- [ ] Visual check: `prefers-reduced-motion: reduce` — all new animations disabled
- [ ] DevTools Performance: 5s idle recording — fewer Animation Frame Fired events than before
