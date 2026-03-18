# App-Wide CSS Migration + GSAP Removal — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove GSAP completely (-76KB gz), propagate CSS animations to all pages, simplify PulseGlow/GradientBorder. Reduce from 4 animation runtimes to 2 (CSS + Framer Motion AnimatePresence only).

**Architecture:** Same patterns as Phase 11 home migration: CSS `@keyframes` with custom properties replace Framer Motion `motion.div` and GSAP tweens. AnimatePresence stays for phase transitions (selection→playing→completed). Celebrations move from GSAP DOM manipulation to tsParticles (configs already exist).

**Tech Stack:** CSS @keyframes, CSS transitions, tsParticles (confettiConfig), React useState for animation toggles

**Spec:** `docs/superpowers/specs/2026-03-19-app-wide-css-migration-design.md`

---

## File Map

| File                                                       | Action                                                                                          | Task |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---- |
| `styles/animations.css`                                    | Add keyframes: answer-pop, shake-error, share-bounce, share-sparkle, share-glow-pulse, qr-entry | 1    |
| `features/game/components/PracticePage.tsx`                | GSAP → CSS .bg-drift                                                                            | 2    |
| `features/game/components/ChallengePage.tsx`               | GSAP → CSS .bg-drift                                                                            | 2    |
| `features/home/components/ShareDialog.tsx`                 | motion.span → CSS keyframes                                                                     | 3    |
| `features/game/components/practice/PracticeSelection.tsx`  | motion.div → CSS                                                                                | 4    |
| `features/game/components/practice/PracticeCompleted.tsx`  | motion.div → CSS                                                                                | 4    |
| `features/game/components/practice/PracticePlaying.tsx`    | Streak motion.div → CSS                                                                         | 4    |
| `features/game/components/challenge/ChallengeReady.tsx`    | motion.div + hover → CSS                                                                        | 4    |
| `features/game/components/challenge/ChallengeGameOver.tsx` | motion.div + hover → CSS                                                                        | 4    |
| `components/effects/AnswerIcon.tsx`                        | motion.div entry → CSS                                                                          | 4    |
| `components/effects/MagicCard.tsx`                         | whileHover/Tap → CSS                                                                            | 4    |
| `components/effects/MagicButton.tsx`                       | whileHover/Tap → CSS (sparkles FM stay)                                                         | 4    |
| `components/effects/AnimatedCheckbox.tsx`                  | motion.span spring → CSS transition                                                             | 5    |
| `components/effects/GentleShake.tsx`                       | useAnimationControls → CSS toggle                                                               | 5    |
| `components/effects/MagicCounter.tsx`                      | GSAP counter → rAF counter                                                                      | 6    |
| `components/effects/SuccessExplosion.tsx`                  | useGsapEffects → tsParticles                                                                    | 6    |
| `components/effects/BadgeUnlockModal.tsx`                  | useGsapEffects → tsParticles + CSS                                                              | 6    |
| `lib/animations/gsap/effects.ts`                           | **DELETE**                                                                                      | 6    |
| `lib/animations/gsap/register.ts`                          | **DELETE**                                                                                      | 6    |
| `hooks/useGsapEffects.ts`                                  | **DELETE**                                                                                      | 6    |
| `components/effects/GsapCelebration.tsx`                   | **DELETE**                                                                                      | 6    |
| `components/effects/PulseGlow.tsx`                         | Remove blur layer                                                                               | 7    |
| `components/effects/GradientBorder.tsx`                    | Simplify to 1 div                                                                               | 7    |
| `lib/animations/index.ts`                                  | Remove GSAP exports                                                                             | 8    |
| `lib/animations/lazy.tsx`                                  | Remove LazyGsapCelebration                                                                      | 8    |
| `components/effects/index.ts`                              | Remove GsapCelebration exports                                                                  | 8    |
| `hooks/index.ts`                                           | Remove useGsapEffects export                                                                    | 8    |
| `package.json`                                             | Remove gsap + @gsap/react                                                                       | 8    |

---

## Task 1: CSS Keyframes for New Animations

**Files:**

- Modify: `styles/animations.css`

- [ ] **Step 1: Add new keyframes before the reduced motion block**

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

/* === SHARE DIALOG ANIMATIONS === */
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

/* === QR CODE ENTRY === */
.animate-qr-entry {
  animation: fade-scale 0.5s var(--ease-spring) both;
  animation-delay: 0.2s;
}

/* === HOVER/TAP INTERACTIVE (reusable for buttons outside links) === */
.interactive-scale {
  transition: transform 0.2s var(--ease-spring);
}

.interactive-scale:hover {
  transform: scale(1.05);
}

.interactive-scale:active {
  transform: scale(0.95);
}

/* === MAGIC CARD HOVER === */
.magic-card-interactive {
  transition: transform 0.2s ease;
}

.magic-card-interactive:hover {
  transform: scale(1.02);
}

.magic-card-interactive:active {
  transform: scale(0.98);
}
```

- [ ] **Step 2: Add new classes to reduced motion block**

Add to the existing `@media (prefers-reduced-motion: reduce)` selector list:
`.share-bounce, .share-sparkle, .share-glow-pulse, .animate-answer-pop, .shake-error, .animate-qr-entry`

And add:

```css
.interactive-scale:hover,
.magic-card-interactive:hover {
  transform: none;
}
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npx vitest run`

- [ ] **Step 4: Commit**

```bash
git add styles/animations.css
git commit -m "feat(css): add keyframes for app-wide animation migration"
```

---

## Task 2: Practice/Challenge bg-drift (GSAP → CSS)

**Files:**

- Modify: `features/game/components/PracticePage.tsx`
- Modify: `features/game/components/ChallengePage.tsx`

Pattern identical to HomePage migration (Phase 11 Task 4).

- [ ] **Step 1: PracticePage — remove GSAP, add .bg-drift**

Remove: `import { gsap } from 'gsap'`, `import { useGSAP } from '@gsap/react'`, `gsap.registerPlugin(useGSAP)`, `useRef`, the entire `useGSAP()` block, `ref={containerRef}`.

Add `bg-drift` class to the container div. Remove `containerRef` declaration.

Keep: `AnimatePresence` import (used for phase transitions).

- [ ] **Step 2: ChallengePage — same changes**

Same GSAP removal. Also remove `style={{ backgroundSize: '400% 400%' }}` (already in `.bg-drift` class).

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npx vitest run`

- [ ] **Step 4: Commit**

```bash
git add features/game/components/PracticePage.tsx features/game/components/ChallengePage.tsx
git commit -m "refactor(game): remove GSAP from Practice/Challenge, use CSS .bg-drift"
```

---

## Task 3: ShareDialog CSS Migration

**Files:**

- Modify: `features/home/components/ShareDialog.tsx`

- [ ] **Step 1: Replace all motion elements with CSS classes**

Remove `import { motion } from 'framer-motion'`.

Replace:

- `motion.span` unicorn bounce → `<span className="inline-block mr-2 share-bounce">`
- `motion.span` sparkle spin → `<span className="inline-block ml-2 share-sparkle">`
- `motion.div` QR container → `<div className="... animate-qr-entry">` (remove `initial`, `animate`, `transition`, `whileHover`). Add `:hover` via CSS class if needed.
- `motion.div` glow pulse → `<div className="... share-glow-pulse">`
- `motion.p` text entry → `<p className="... animate-fade-up" style={{ '--delay': '0.5s' }}>`

For QR hover effect (`whileHover={{ scale: 1.05, boxShadow }}`), add inline CSS: `transition: transform 0.3s var(--ease-spring); &:hover { transform: scale(1.05) }` or use the `.interactive-scale` class.

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npx vitest run`

- [ ] **Step 3: Commit**

```bash
git add features/home/components/ShareDialog.tsx
git commit -m "refactor(ShareDialog): migrate 5 motion elements to CSS keyframes"
```

---

## Task 4: Entry/Interaction Animations (7 components)

**Files:**

- Modify: `features/game/components/practice/PracticeSelection.tsx`
- Modify: `features/game/components/practice/PracticeCompleted.tsx`
- Modify: `features/game/components/practice/PracticePlaying.tsx` (streak only)
- Modify: `features/game/components/challenge/ChallengeReady.tsx`
- Modify: `features/game/components/challenge/ChallengeGameOver.tsx`
- Modify: `components/effects/AnswerIcon.tsx`
- Modify: `components/effects/MagicCard.tsx`
- Modify: `components/effects/MagicButton.tsx`

- [ ] **Step 1: PracticeSelection — entry animation**

`motion.div` with `initial={{ opacity: 0, y: 20 }}` `animate={{ opacity: 1, y: 0 }}` → `<div className="animate-fade-up">`. Keep the `exit` prop ONLY if wrapped in AnimatePresence (it is — keep `motion.div` with only `key` and `exit` props, remove `initial`/`animate`).

Actually: this component IS inside AnimatePresence in PracticePage. So keep `motion.div` for the `exit` animation but remove `initial`/`animate` (handled by CSS entry). The entry CSS class handles the appear, Framer handles the disappear.

Pattern: `<motion.div key="selection" exit={{ opacity: 0, y: -20 }} className="text-center animate-fade-up">`

- [ ] **Step 2: PracticeCompleted — same pattern**

`<motion.div key="completed" exit={{ opacity: 0, scale: 0.9 }} className="text-center animate-fade-scale">`

- [ ] **Step 3: PracticePlaying — streak entry**

The streak `motion.div` (lines ~127-135) is NOT inside AnimatePresence. Replace with `<div className="animate-fade-up">`.

Keep: the AnimatePresence-wrapped `motion.div` elements (main container, feedback lottie) — they need exit animations.

- [ ] **Step 4: ChallengeReady — entry + hover**

Entry: same pattern as PracticeSelection. Keep `exit` for AnimatePresence, add CSS class for entry.
Button hover: `whileHover/whileTap` → wrap button in `<div className="interactive-scale">` or add class directly.

- [ ] **Step 5: ChallengeGameOver — entry + hover**

Entry: same pattern. Two button hovers: `whileHover/whileTap` → `.interactive-scale` class.

- [ ] **Step 6: AnswerIcon — spring entry**

Replace `motion.div` with `<div className="animate-answer-pop">`. Remove `initial`, `animate`, `transition` props. Keep the `motion.svg` for the SVG path (it does nothing special — can also be plain `<svg>`).

- [ ] **Step 7: MagicCard — hover/tap**

Replace `motion.div` with `<div>`. Add `.magic-card-interactive` class when `isClickable && animate`.

- [ ] **Step 8: MagicButton — hover/tap**

Replace `whileHover={{ scale: 1.05 }}` and `whileTap={{ scale: 0.95 }}` with CSS. Keep `motion.button` if AnimatePresence sparkles need it, otherwise use `<button className="interactive-scale">`.

Note: MagicButton has AnimatePresence for sparkle particles — keep `AnimatePresence` import but remove `motion` for the button itself. The sparkle `motion.span` elements inside AnimatePresence stay.

- [ ] **Step 9: Verify**

Run: `npx tsc --noEmit && npx vitest run`

- [ ] **Step 10: Commit**

```bash
git add features/game/components/ components/effects/AnswerIcon.tsx components/effects/MagicCard.tsx components/effects/MagicButton.tsx
git commit -m "refactor(components): migrate 8 components from Framer Motion to CSS"
```

---

## Task 5: AnimatedCheckbox + GentleShake (Complex)

**Files:**

- Modify: `components/effects/AnimatedCheckbox.tsx`
- Modify: `components/effects/GentleShake.tsx`

- [ ] **Step 1: AnimatedCheckbox — switch thumb spring → CSS transition**

In `SwitchVariant`: replace `motion.span` with `<span>`. Add `style={{ transform: \`translateX(${thumbOffset}px)\` }}`and`transition: transform 0.2s var(--ease-spring)` via CSS class.

In `CheckboxVariant`: replace `motion.path` with `<path>`. Use CSS `stroke-dasharray` + `stroke-dashoffset` + `transition` for the check mark draw animation.

Remove `import { motion } from 'framer-motion'`.

- [ ] **Step 2: GentleShake — useAnimationControls → CSS toggle**

Replace `useAnimationControls` with `useRestartableAnimation('shake-error')` (from `features/home/hooks/useRestartableAnimation`).

When `trigger` fires, call `pop.trigger()`. The `shake-error` CSS class plays the shake animation.

For the `motion.p` encouraging message: keep it as `motion.p` inside an `AnimatePresence` for the exit animation (it conditionally renders based on `trigger && message`).

Remove: `import { useAnimationControls } from 'framer-motion'`. Keep `AnimatePresence` and the `motion.p` for the message exit animation — this is an explicit in-scope exception per spec.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npx vitest run`

- [ ] **Step 4: Commit**

```bash
git add components/effects/AnimatedCheckbox.tsx components/effects/GentleShake.tsx
git commit -m "refactor(effects): AnimatedCheckbox + GentleShake to CSS transitions"
```

---

## Task 6: GSAP Celebrations → tsParticles/CSS + Delete GSAP

**Files:**

- Modify: `components/effects/SuccessExplosion.tsx`
- Modify: `components/effects/BadgeUnlockModal.tsx`
- Modify: `components/effects/MagicCounter.tsx`
- Delete: `lib/animations/gsap/effects.ts`
- Delete: `lib/animations/gsap/register.ts`
- Delete: `hooks/useGsapEffects.ts`
- Delete: `components/effects/GsapCelebration.tsx`

This is the most complex task. The GSAP celebrations create DOM elements manually and animate them. Replace with tsParticles component rendering.

- [ ] **Step 1: SuccessExplosion — replace useGsapEffects with tsParticles**

Remove `import { useGsapEffects } from '@/hooks/useGsapEffects'`. Remove the `useEffect` that calls `confettiExplosion/fireworksDisplay/celebrationCascade`.

Instead: render a `<Particles>` component (from `@tsparticles/react`) with the existing `confettiConfig` when `show` is true. Use `useParticlesEngine()` for engine readiness.

Also remove the 12 FM particle burst `motion.div` elements (lines 122-150) — tsParticles handles particles now.

- [ ] **Step 2: BadgeUnlockModal — replace GSAP effects**

Remove `useGsapEffects` import. Replace:

- `confettiExplosion` → tsParticles confetti (same as SuccessExplosion)
- `badgeUnlock` (scale+rotate) → CSS `animate-answer-pop` class
- `glowPulse` → CSS `pulse-glow-layer` class (already exists)

- [ ] **Step 3: MagicCounter — GSAP counter → rAF counter**

Remove `gsap` and `useGSAP` imports. Replace the GSAP counter tween with:

```typescript
useEffect(() => {
  if (!shouldAnimate) {
    setDisplayValue(value);
    return;
  }
  let start: number | null = null;
  const from = displayValue;
  const duration = 500;
  function step(timestamp: number) {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    setDisplayValue(Math.round(from + (value - from) * progress));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}, [value]);
```

- [ ] **Step 4: Verify zero remaining GSAP callers**

```bash
grep -rn "timerPulse\|staggerReveal\|numberWave\|pageTransition\.\|confettiExplosion\|fireworksDisplay\|celebrationCascade\|shakeError\|animateScore\|glowPulse\|magneticHover\|badgeUnlock\|useGsapEffects\|GsapCelebration" --include="*.ts" --include="*.tsx" features/ components/ hooks/ lib/ app/
```

Expected: 0 matches in source files (only the GSAP files themselves and barrel exports). If any caller remains, migrate it before proceeding.

- [ ] **Step 5: Clean barrel exports BEFORE deleting files**

`lib/animations/index.ts`: Remove all GSAP exports (`gsap`, `useGSAP`, `confettiExplosion`, `fireworksDisplay`, etc.) and `LazyGsapCelebration`.
`lib/animations/lazy.tsx`: Remove `LazyGsapCelebration` export and its dynamic import.
`components/effects/index.ts`: Remove `GsapCelebration`, `GsapCelebrationProps`, `CelebrationType` exports.
`hooks/index.ts`: Remove `useGsapEffects` export.

- [ ] **Step 6: Delete GSAP files**

```bash
rm lib/animations/gsap/effects.ts lib/animations/gsap/register.ts hooks/useGsapEffects.ts components/effects/GsapCelebration.tsx
rmdir lib/animations/gsap
```

- [ ] **Step 7: Update tests that mock GSAP**

Find all test files that mock `useGsapEffects` or `gsap`:

```bash
grep -rn "useGsapEffects\|vi.mock.*gsap" tests/
```

Update or remove those mocks. The tests should now mock tsParticles or CSS classes instead.

- [ ] **Step 8: Verify**

Run: `npx tsc --noEmit && npx vitest run`

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "refactor(gsap): remove GSAP completely, celebrations → tsParticles/CSS

SuccessExplosion: useGsapEffects → tsParticles confetti
BadgeUnlockModal: GSAP effects → tsParticles + CSS
MagicCounter: GSAP counter → rAF counter
Barrel exports cleaned before deletion.
Delete: gsap/effects.ts, gsap/register.ts, useGsapEffects.ts, GsapCelebration.tsx"
```

---

## Task 7: Simplify PulseGlow + GradientBorder

**Files:**

- Modify: `components/effects/PulseGlow.tsx`
- Modify: `components/effects/GradientBorder.tsx`

- [ ] **Step 1: PulseGlow — remove blur layer**

The current PulseGlow renders a blur layer div + content div. Remove the blur layer entirely. PulseGlow becomes a simple passthrough wrapper:

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

This eliminates the `filter: blur(12px)` paint-per-frame that causes lag on buttons.

- [ ] **Step 2: GradientBorder — simplify to CSS background-clip**

Current: 2 divs (gradient border layer + content layer). Replace with single div using CSS `background` + `padding` approach (already works, just remove the extra div):

The outer div already has the gradient background and padding. The inner content div is the only child needed. Remove the separate gradient `<div>` layer and apply the gradient directly to the wrapper.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npx vitest run`

- [ ] **Step 4: Commit**

```bash
git add components/effects/PulseGlow.tsx components/effects/GradientBorder.tsx
git commit -m "refactor(effects): simplify PulseGlow (remove blur) + GradientBorder (1 div)"
```

---

## Task 8: Cleanup — Remove GSAP from package.json + barrel exports

**Files:**

- Modify: `lib/animations/index.ts`
- Modify: `lib/animations/lazy.tsx`
- Modify: `components/effects/index.ts`
- Modify: `hooks/index.ts`
- Modify: `package.json`

- [ ] **Step 1: Remove GSAP from package.json**

```bash
npm uninstall gsap @gsap/react
npm install
```

- [ ] **Step 2: Verify zero GSAP references**

```bash
grep -rn "gsap\|useGSAP\|@gsap\|useGsapEffects\|GsapCelebration" --include="*.ts" --include="*.tsx" features/ components/ hooks/ lib/ app/
```

Expected: 0 matches (only docs/ may reference it).

- [ ] **Step 3: Full quality gate**

```bash
npx tsc --noEmit && npx vitest run && npx eslint . --max-warnings 0 && npx prettier --check . && npx next build
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove gsap + @gsap/react from package.json

Zero GSAP imports remaining. Animation stack: CSS + Framer Motion (AnimatePresence) + tsParticles.
Bundle savings: ~76KB gzipped."
```

---

## Quality Gates Checklist (run after all tasks)

- [ ] `tsc --noEmit` — zero errors
- [ ] `npx next build` — succeeds
- [ ] `npx vitest run` — 1284+ tests pass
- [ ] `npx eslint . --max-warnings 0` — zero lint errors
- [ ] `grep -rn "gsap\|@gsap" --include="*.ts" --include="*.tsx" features/ components/ hooks/ lib/ app/` — zero matches
- [ ] `npx prettier --check .` — formatting clean
- [ ] `npx madge --circular --extensions ts,tsx features/ components/` — zero circular deps
- [ ] Lighthouse perf measured before/after on all 5 pages
- [ ] Lighthouse accessibility 100 on all 5 pages
- [ ] Playwright visual comparison before/after + reduced motion verified
- [ ] Bundle size measured (expect ~76KB gz reduction)
- [ ] ROADMAP.md updated with Phase 13 results
