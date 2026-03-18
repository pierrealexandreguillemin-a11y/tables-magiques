# App-Wide CSS Migration + GSAP Removal — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove GSAP completely (-76KB gz), propagate CSS animations to all pages, simplify PulseGlow/GradientBorder. Reduce from 4 animation runtimes to 2 (CSS + Framer Motion AnimatePresence only).

**Architecture:** Same patterns as Phase 11 home migration: CSS `@keyframes` with custom properties replace Framer Motion `motion.div` and GSAP tweens. AnimatePresence stays for phase transitions only. Celebrations move from GSAP DOM manipulation to tsParticles (configs exist). `useRestartableAnimation` hook (from Phase 11) is the standard pattern for CSS animation triggers.

**Tech Stack:** CSS @keyframes, CSS transitions, tsParticles (`confettiConfig`), `useRestartableAnimation`, `useParticlesEngine`

**Spec:** `docs/superpowers/specs/2026-03-19-app-wide-css-migration-design.md`

**ISO/IEC refs:** 25010 (quality), 29119 (testing)

---

## Pre-Flight: Baseline Measurements

Before ANY code change, capture baselines for Gate 6 comparison:

- [ ] **Step 0a: Lighthouse perf baseline on all 5 pages**

```bash
for page in "/" "/practice" "/challenge" "/profile" "/settings"; do
  npx lighthouse "https://tables-magiques.vercel.app${page}" \
    --output=json --output-path="./baseline-perf${page//\//-}.json" \
    --only-categories=performance --chrome-flags="--headless --no-sandbox" --quiet
done
```

- [ ] **Step 0b: Bundle size baseline**

```bash
npx next build && find .next/static -name "*.js" -type f -exec du -k {} + | awk '{s+=$1}END{print s"KB raw"}' && find .next/static -name "*.js" -type f -exec gzip -c {} + | wc -c | awk '{printf "%.0fKB gzipped\n", $1/1024}'
```

- [ ] **Step 0c: Document baseline in commit message at end**

---

## GSAP Consumers Inventory (verified by grep)

| File                   | GSAP Usage                                                      | Migration Target                |
| ---------------------- | --------------------------------------------------------------- | ------------------------------- |
| `PracticePage.tsx`     | `gsap.to(bg, repeat:-1)`                                        | CSS `.bg-drift`                 |
| `ChallengePage.tsx`    | `gsap.to(bg, repeat:-1)`                                        | CSS `.bg-drift`                 |
| `BadgeUnlockModal.tsx` | `confettiExplosion` + `badgeUnlock` + `glowPulse`               | tsParticles + CSS               |
| `SuccessExplosion.tsx` | `confettiExplosion` + `fireworksDisplay` + `celebrationCascade` | tsParticles                     |
| `MagicCounter.tsx`     | `gsap.to(counter, value)`                                       | `requestAnimationFrame` counter |
| `GsapCelebration.tsx`  | Wrapper for GSAP effects                                        | **DELETE** (zero consumers)     |

**Dead code in `useGsapEffects`** (defined but never called): `timerPulse`, `staggerReveal`, `numberWave`, `animateScore`, `shakeError`, `magneticHover`, `pageTransition`. All deleted with the file.

---

## Quality Gate Template (applied after EVERY task)

```bash
npx tsc --noEmit \
  && npx vitest run \
  && npx eslint . --max-warnings 0 \
  && npx prettier --check .
```

A task is NOT done until all 4 pass. `next build` runs at final cleanup only (slow).

---

## Task 1: CSS Keyframes for New Animations

**Files:**

- Modify: `styles/animations.css`

- [ ] **Step 1: Add keyframes before reduced motion block**

```css
/* === ANSWER POP (icon feedback) === */
@keyframes answer-pop {
  from {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  to {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}
.animate-answer-pop {
  animation: answer-pop 0.4s var(--ease-spring) both;
}

/* === SHAKE ERROR (gentle shake feedback) === */
@keyframes shake-error {
  0%,
  100% {
    transform: translateX(0);
  }
  20%,
  60% {
    transform: translateX(var(--shake-amplitude, -5px));
  }
  40%,
  80% {
    transform: translateX(calc(-1 * var(--shake-amplitude, -5px)));
  }
}
.shake-error {
  animation: shake-error 0.4s ease-in-out;
}

/* === SHARE DIALOG === */
@keyframes share-bounce {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-8px) rotate(10deg);
  }
}
.share-bounce {
  animation: share-bounce 1.5s ease-in-out infinite;
}

@keyframes share-sparkle {
  0% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(1.3) rotate(180deg);
  }
  100% {
    transform: scale(1) rotate(360deg);
  }
}
.share-sparkle {
  animation: share-sparkle 2s ease-in-out infinite;
}

@keyframes share-glow-pulse {
  0%,
  100% {
    opacity: 0.1;
  }
  50% {
    opacity: 0.25;
  }
}
.share-glow-pulse {
  animation: share-glow-pulse 2s ease-in-out infinite;
}

/* === REUSABLE INTERACTIVE SCALE === */
.interactive-scale {
  transition: transform 0.2s var(--ease-spring);
}
.interactive-scale:hover {
  transform: scale(1.05);
}
.interactive-scale:active {
  transform: scale(0.95);
}

.magic-card-interactive {
  transition: transform 0.2s ease;
}
.magic-card-interactive:hover {
  transform: scale(1.02);
}
.magic-card-interactive:active {
  transform: scale(0.98);
}

/* === SWITCH THUMB (checkbox toggle) === */
.switch-thumb {
  transition: transform 0.2s var(--ease-spring);
}
```

- [ ] **Step 2: Add to reduced motion block**

Add to selector list: `.share-bounce, .share-sparkle, .share-glow-pulse, .animate-answer-pop, .shake-error`

Add rules:

```css
.interactive-scale:hover,
.magic-card-interactive:hover {
  transform: none;
}
.switch-thumb {
  transition: none;
}
```

- [ ] **Step 3: Quality gate**

```bash
npx tsc --noEmit && npx vitest run && npx eslint . --max-warnings 0 && npx prettier --check .
```

- [ ] **Step 4: Commit**

```bash
git add styles/animations.css
git commit -m "feat(css): add keyframes for app-wide animation migration

answer-pop, shake-error, share-bounce, share-sparkle, share-glow-pulse,
interactive-scale, magic-card-interactive, switch-thumb.
All in reduced motion block."
```

---

## Task 2: Practice/Challenge GSAP bg-drift → CSS

**Files:**

- Modify: `features/game/components/PracticePage.tsx`
- Modify: `features/game/components/ChallengePage.tsx`

Identical pattern to Phase 11 HomePage migration.

- [ ] **Step 1: PracticePage**

Remove: `import { gsap } from 'gsap'`, `import { useGSAP } from '@gsap/react'`, `gsap.registerPlugin(useGSAP)`, `import { useRef } from 'react'` (if only used for containerRef), `const containerRef`, entire `useGSAP()` block, `ref={containerRef}`.

Add `bg-drift` class to container div. Keep `useEffect` for preload. Keep `AnimatePresence`.

- [ ] **Step 2: ChallengePage**

Same removals. Also remove `style={{ backgroundSize: '400% 400%' }}` (owned by `.bg-drift`). Remove `import { useRef } from 'react'`. Keep `AnimatePresence`.

- [ ] **Step 3: Quality gate**
- [ ] **Step 4: Commit**

```bash
git add features/game/components/PracticePage.tsx features/game/components/ChallengePage.tsx
git commit -m "refactor(game): Practice/Challenge GSAP bg-drift → CSS .bg-drift"
```

---

## Task 3: ShareDialog CSS Migration

**Files:**

- Modify: `features/home/components/ShareDialog.tsx`

- [ ] **Step 1: Replace 5 motion elements**

Remove `import { motion } from 'framer-motion'`.

| Before                                                              | After                                                                                             |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `motion.span` unicorn `animate={{ y, rotate }} repeat:Infinity`     | `<span className="inline-block mr-2 share-bounce">`                                               |
| `motion.span` sparkle `animate={{ scale, rotate }} repeat:Infinity` | `<span className="inline-block ml-2 share-sparkle">`                                              |
| `motion.div` QR `initial/animate spring + whileHover`               | `<div className="... animate-fade-scale interactive-scale">` with `style={{ '--delay': '0.2s' }}` |
| `motion.div` glow `animate={{ opacity }} repeat:Infinity`           | `<div className="... share-glow-pulse">`                                                          |
| `motion.p` text `initial/animate fade`                              | `<p className="... animate-fade-up" style={{ '--delay': '0.5s' }}>`                               |

- [ ] **Step 2: Quality gate**
- [ ] **Step 3: Commit**

---

## Task 4: Entry/Interaction Animations (8 components)

**Files:** PracticeSelection, PracticeCompleted, PracticePlaying (streak only), ChallengeReady, ChallengeGameOver, AnswerIcon, MagicCard, MagicButton

**Pattern for AnimatePresence children:**
Components inside `<AnimatePresence mode="wait">` (PracticeSelection, PracticeCompleted, ChallengeReady, ChallengeGameOver) KEEP `motion.div` with `key` and `exit` props. ADD CSS class for entry animation. REMOVE `initial` and `animate` props (CSS handles entry).

Example: `<motion.div key="selection" exit={{ opacity: 0, y: -20 }} className="animate-fade-up">`

**Pattern for standalone entries (not in AnimatePresence):**
Replace `motion.div` with `<div className="animate-fade-up">`. (PracticePlaying streak, AnswerIcon)

**Pattern for hover/tap:**
Replace `whileHover={{ scale }}` + `whileTap={{ scale }}` with CSS class `.interactive-scale` or `.magic-card-interactive`.

- [ ] **Step 1: PracticeSelection** — keep motion.div for exit, add `.animate-fade-up`
- [ ] **Step 2: PracticeCompleted** — keep motion.div for exit, add `.animate-fade-scale`
- [ ] **Step 3: PracticePlaying** — streak `motion.div` → `<div className="animate-fade-up">`
- [ ] **Step 4: ChallengeReady** — keep motion.div for exit, add CSS. Button hover → `.interactive-scale`
- [ ] **Step 5: ChallengeGameOver** — keep motion.div for exit, add CSS. Two button hovers → `.interactive-scale`
- [ ] **Step 6: AnswerIcon** — `motion.div` → `<div className="animate-answer-pop">`. `motion.svg` → `<svg>`
- [ ] **Step 7: MagicCard** — `motion.div` → `<div>` with `.magic-card-interactive` when `isClickable && animate`. Remove `import { motion }`.
- [ ] **Step 8: MagicButton** — `whileHover/whileTap` → CSS `.interactive-scale` on the button. Keep `AnimatePresence` + `motion.span` for sparkle particles ONLY.
- [ ] **Step 9: Quality gate**
- [ ] **Step 10: Commit**

---

## Task 5: AnimatedCheckbox + GentleShake

**Files:**

- Modify: `components/effects/AnimatedCheckbox.tsx`
- Modify: `components/effects/GentleShake.tsx`

- [ ] **Step 1: AnimatedCheckbox SwitchVariant**

Replace `motion.span` thumb with `<span className="switch-thumb" style={{ transform: \`translateX(${thumbOffset}px)\` }}>`. CSS `transition` handles the spring.

- [ ] **Step 2: AnimatedCheckbox CheckboxVariant**

Replace `motion.path` with `<path>`. Use CSS:

```css
path {
  stroke-dasharray: 30;
  stroke-dashoffset: 30;
  transition: stroke-dashoffset 0.2s ease-out;
}
path[data-checked='true'] {
  stroke-dashoffset: 0;
}
```

Or simpler: set `style={{ strokeDasharray: 30, strokeDashoffset: checked ? 0 : 30, transition: 'stroke-dashoffset 0.2s ease-out' }}`.

Remove `import { motion } from 'framer-motion'`.

- [ ] **Step 3: GentleShake — useAnimationControls → useRestartableAnimation**

Import `useRestartableAnimation` from `@/features/home/hooks/useRestartableAnimation`.

Replace `useAnimationControls` + imperative `controls.start({x: [...]})` with:

```tsx
const shake = useRestartableAnimation('shake-error');

useEffect(() => {
  if (trigger) {
    shake.trigger();
  }
}, [trigger, shake]);

// In JSX:
<div
  className={cn('relative', className, shake.className)}
  onAnimationEnd={(e) => {
    if (e.animationName === 'shake-error') {
      shake.reset();
      onShakeComplete?.();
    }
  }}
>
  {children}
</div>;
```

Keep `AnimatePresence` and `motion.p` for the encouraging message exit animation — explicit spec exception.

Remove: `import { useAnimationControls } from 'framer-motion'`.

- [ ] **Step 4: Quality gate**
- [ ] **Step 5: Commit**

---

## Task 6a: MagicCounter — GSAP counter → rAF

**Files:**

- Modify: `components/effects/MagicCounter.tsx`

- [ ] **Step 1: Replace GSAP tween with requestAnimationFrame**

Remove `import { gsap } from 'gsap'`, `import { useGSAP } from '@gsap/react'`, `gsap.registerPlugin(useGSAP)`.

Replace the `useGSAP` counter tween with:

```tsx
const [displayValue, setDisplayValue] = useState(value);
const prevValueRef = useRef(value);

useEffect(() => {
  if (!shouldAnimate || prevValueRef.current === value) {
    setDisplayValue(value);
    prevValueRef.current = value;
    return;
  }
  const from = prevValueRef.current;
  prevValueRef.current = value;
  let start: number | null = null;
  const duration = 500;
  let rafId: number;
  function step(timestamp: number) {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    setDisplayValue(Math.round(from + (value - from) * progress));
    if (progress < 1) rafId = requestAnimationFrame(step);
  }
  rafId = requestAnimationFrame(step);
  return () => cancelAnimationFrame(rafId);
}, [value, shouldAnimate]);
```

- [ ] **Step 2: Quality gate**
- [ ] **Step 3: Commit**

---

## Task 6b: SuccessExplosion — GSAP → tsParticles

**Files:**

- Modify: `components/effects/SuccessExplosion.tsx`

- [ ] **Step 1: Replace useGsapEffects with tsParticles**

Remove `import { useGsapEffects } from '@/hooks/useGsapEffects'`.

Add: `import { useParticlesEngine } from '@/hooks/useParticlesEngine'`, `import Particles from '@tsparticles/react'`, `import { confettiConfig } from '@/lib/animations'`.

Replace the `useEffect` that calls `confettiExplosion/fireworksDisplay/celebrationCascade` with a tsParticles `<Particles>` render when `show` is true:

```tsx
const engineReady = useParticlesEngine();
// ... in JSX when show && engineReady:
<Particles id="celebration-particles" options={confettiConfig} />;
```

Also remove the 12 FM particle burst `motion.div` elements (tsParticles handles particles).

- [ ] **Step 2: Quality gate**
- [ ] **Step 3: Commit**

---

## Task 6c: BadgeUnlockModal — GSAP → tsParticles + CSS

**Files:**

- Modify: `components/effects/BadgeUnlockModal.tsx`

- [ ] **Step 1: Replace useGsapEffects**

Remove `import { useGsapEffects }`. Replace:

- `confettiExplosion` → tsParticles confetti (same pattern as SuccessExplosion)
- `badgeUnlock` scale+rotate → CSS class `.animate-answer-pop` on badge element
- `glowPulse` → CSS class `.pulse-glow-layer` (already exists)

- [ ] **Step 2: Quality gate**
- [ ] **Step 3: Commit**

---

## Task 6d: Delete GSAP + Clean Barrel Exports

**Files:**

- Modify: `lib/animations/index.ts`, `lib/animations/lazy.tsx`, `components/effects/index.ts`, `hooks/index.ts`
- Delete: `lib/animations/gsap/effects.ts`, `lib/animations/gsap/register.ts`, `hooks/useGsapEffects.ts`, `components/effects/GsapCelebration.tsx`

- [ ] **Step 1: Verify zero remaining GSAP callers**

```bash
grep -rn "useGsapEffects\|from 'gsap'\|from '@gsap" --include="*.ts" --include="*.tsx" features/ components/ hooks/ lib/ app/ | grep -v "node_modules\|\.test\.\|gsap/effects\|gsap/register\|useGsapEffects\.ts\|index\.ts\|lazy\.tsx"
```

Expected: 0 matches. If any remain, migrate them FIRST.

- [ ] **Step 2: Clean barrel exports BEFORE deleting files**

`lib/animations/index.ts`: Remove ALL GSAP section exports + `LazyGsapCelebration`.
`lib/animations/lazy.tsx`: Remove `LazyGsapCelebration` export + dynamic import.
`components/effects/index.ts`: Remove `GsapCelebration`, `GsapCelebrationProps`, `CelebrationType`.
`hooks/index.ts`: Remove `useGsapEffects` export.

- [ ] **Step 3: Delete GSAP files**

```bash
git rm lib/animations/gsap/effects.ts lib/animations/gsap/register.ts hooks/useGsapEffects.ts components/effects/GsapCelebration.tsx
```

- [ ] **Step 4: Update tests that mock GSAP**

```bash
grep -rln "useGsapEffects\|vi.mock.*gsap" tests/
```

Files to update: `tests/setup.ts`, `tests/unit/components/effects/batch-c.test.tsx`, `tests/unit/components/effects/batch-d.test.tsx`, `tests/unit/components/effects/MagicCounter.test.tsx`, `tests/unit/lib/animations/gsap-effects.test.ts`.

- Delete `gsap-effects.test.ts` entirely (tests deleted code)
- Delete `MagicCounter.test.tsx` GSAP mocks, replace with rAF mock
- Update batch-c/batch-d mocks to not reference GSAP

- [ ] **Step 5: Quality gate (all 4 commands)**
- [ ] **Step 6: Commit**

---

## Task 7: Simplify PulseGlow + GradientBorder

**Files:**

- Modify: `components/effects/PulseGlow.tsx`
- Modify: `components/effects/GradientBorder.tsx`

- [ ] **Step 1: PulseGlow — remove blur layer**

Current: renders `div.pulse-glow-layer` (blur filter) + `div.relative.z-10` (content). Remove the blur layer entirely:

```tsx
export function PulseGlow({
  children,
  className,
  active = true,
}: PulseGlowProps) {
  if (!active) return <div className={className}>{children}</div>;
  return (
    <div className={cn('relative inline-block', className)}>{children}</div>
  );
}
```

This eliminates 2 paint-per-frame blur filters on home buttons.

- [ ] **Step 2: GradientBorder — simplify**

Current: outer div (padding) + inner div (gradient bg) + inner div (content bg). The gradient div is a separate element. Merge: apply gradient background directly to the outer div, keep only content inner div.

- [ ] **Step 3: Quality gate**
- [ ] **Step 4: Commit**

---

## Task 8: Remove GSAP from package.json + Final Gates

**Files:**

- Modify: `package.json`, `package-lock.json`
- Modify: `CLAUDE.md`
- Modify: `ROADMAP.md`

- [ ] **Step 1: Uninstall GSAP**

```bash
npm uninstall gsap @gsap/react
npm install
```

- [ ] **Step 2: Verify zero GSAP references**

```bash
grep -rn "gsap\|useGSAP\|@gsap\|useGsapEffects\|GsapCelebration" --include="*.ts" --include="*.tsx" features/ components/ hooks/ lib/ app/
```

Expected: 0 matches.

- [ ] **Step 3: Full quality gate**

```bash
npx tsc --noEmit && npx vitest run && npx eslint . --max-warnings 0 && npx prettier --check . && npx next build
```

- [ ] **Step 4: Update CLAUDE.md**

Update the "Conventions animation" section:

- Remove "Celebrations: GSAP" → "Celebrations: tsParticles (confettiConfig)"
- Remove `useGsapEffects` from hooks list
- Update test count
- Add: "Interactions hover/tap: CSS `.interactive-scale` ou `.magic-card-interactive`"
- Add: "Animation triggers: `useRestartableAnimation` hook (CSS class toggle via rAF)"

- [ ] **Step 5: Update ROADMAP.md**

Mark Phase 13.1 (GSAP removal) as complete. Document bundle savings.

- [ ] **Step 6: Measure post-migration**

```bash
# Bundle size
npx next build && find .next/static -name "*.js" -type f -exec gzip -c {} + | wc -c | awk '{printf "%.0fKB gzipped\n", $1/1024}'

# Lighthouse perf on all 5 pages
for page in "/" "/practice" "/challenge" "/profile" "/settings"; do
  npx lighthouse "https://tables-magiques.vercel.app${page}" \
    --output=json --only-categories=performance,accessibility \
    --chrome-flags="--headless --no-sandbox" --quiet
done

# Lighthouse a11y must remain 100 on all 5 pages
```

Compare with Step 0 baselines. Document delta in commit.

- [ ] **Step 7: Commit + Push**

```bash
git add -A
git commit -m "chore: remove gsap from package.json, update CLAUDE.md + ROADMAP

Bundle: XXX KB → YYY KB gzipped (-ZZ KB, -W%)
Lighthouse perf: before → after
Animation stack: CSS + Framer Motion (AnimatePresence) + tsParticles
GSAP completely removed."
git push origin master
```

---

## Definition of Done (quantified)

- [ ] `tsc --noEmit` zero errors
- [ ] `next build` succeeds
- [ ] `vitest run` — 1284+ tests pass (some GSAP tests deleted, count may differ)
- [ ] `eslint --max-warnings 0` zero errors
- [ ] `prettier --check .` clean
- [ ] `grep gsap` in source = 0 matches
- [ ] `madge --circular` zero
- [ ] `gsap` and `@gsap/react` absent from package.json
- [ ] Lighthouse accessibility 100 on 5 pages (verified post-deploy)
- [ ] Lighthouse perf measured and compared to baseline
- [ ] Bundle size measured and compared to baseline
- [ ] CLAUDE.md updated
- [ ] ROADMAP.md updated
