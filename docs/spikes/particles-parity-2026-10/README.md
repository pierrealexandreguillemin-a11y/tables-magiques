# Particle parity harness (P22, 2026-10-17)

Side-by-side, blind comparison of the former tsParticles effects (`master` before P22) and the
P22 canvas replacements, with the **real** libraries on both sides.

- `old-entry.ts`: tsParticles slim + the exact configs of `master` (fairy stars copied verbatim from
  `components/effects/FairyBackground.tsx`, `sparklesConfig` and `confettiConfig` imported).
- `new-entry.ts`: the same calls the P22 components make (`startStarField`, `scatterConfetti`).
- `index.html`: three rows (fairy background, challenge sparkles, confetti) plus the real home page
  of both builds in iframes. Sides are shuffled on every load; "Révéler" shows which is which.
- `perf-parity.mjs`: main-thread cost of each side, headless Chromium.

## Run

```bash
# 1. a checkout of master with its own node_modules and build
git worktree add ../wt-before master && cd ../wt-before && npm ci --ignore-scripts && npx next build
# 2. bundle both sides (esbuild pinned), from this folder
NODE_PATH=../../../../wt-before/node_modules npx -y esbuild@0.28.2 old-entry.ts --bundle --format=iife \
  --tsconfig=../../../../wt-before/tsconfig.json --outfile=old.js
NODE_PATH=../../../node_modules npx -y esbuild@0.28.2 new-entry.ts --bundle --format=iife \
  --tsconfig=../../../tsconfig.json --outfile=new.js
# 3. serve: harness, master build on 3201, this build on 3202
python -m http.server 8766 --bind 127.0.0.1
(cd ../wt-before && node node_modules/next/dist/bin/next start -p 3201)
(npm run build && node node_modules/next/dist/bin/next start -p 3202)
# open http://127.0.0.1:8766/index.html (add ?only=old|new and &noapp to isolate a side)
```

## Findings

1. `@tsparticles/slim` ships **no** twinkle updater, emitters plugin or tilt updater (checked in
   `node_modules/@tsparticles`, 2026-10-17). The configured twinkle, top emitter and confetti tilt
   never rendered. Parity target = what rendered: no twinkle; confetti spawned at random positions,
   flat, falling, 3 s life.
2. tsParticles star geometry (`@tsparticles/shape-star/esm/Utils.js`): tips at `size x inset`
   (inset 2), valleys at `size`. A first P22 draft had it inverted (stars half as big); fixed and
   pinned by a unit test.
3. canvas-confetti cycles colours by particle index within one call, so one-particle calls each get
   a random colour; size variety comes from a random `scalar` per call.

Remaining visible differences, for the user's verdict: old confetti squares rotate in plane and start
at random opacity 0.5-1; new ones stay axis-aligned (`flat`) and fade at end of life.

## Main-thread cost (headless Chromium 1440x900, `node perf-parity.mjs` with the harness served)

| Round | Side        | CPU ms/s | Script ms/s | Frames p50 / p95 (ms) | Frames > 33 ms |
| ----- | ----------- | -------- | ----------- | --------------------- | -------------- |
| 1     | tsParticles | 62       | 19          | 16.7 / 16.7           | 0              |
| 1     | canvas      | 46       | 10          | 16.7 / 16.7           | 0              |
| 2     | tsParticles | 59       | 17          | 16.7 / 16.8           | 0              |
| 2     | canvas      | 40       | 7           | 16.7 / 16.7           | 0              |

Measured while a Blender render loaded the CPU; both sides under the same contention. In a
non-focused Chrome tab `requestAnimationFrame` is throttled to about 1 Hz on both sides: frame
timing must be measured headless or in the foreground tab.
