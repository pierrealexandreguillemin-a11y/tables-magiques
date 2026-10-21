# Visual validation protocol

> Status (2026-10-21): R2 mascot sizes and R3 applied to the A3/A2 and A4/A3 votes
> (`docs/spikes/style-2026-10/vote.html`, `VERDICT.md`); R1, R2 reduced motion and R4 not done.
> Each rule lists the change it needs; tick it in this file when it is wired and measured.

## Origin

Adapted from the `threejs-visual-validation` and `threejs-procedural-geometry` skills of
[Threejs-Awesome-Graphics-Agent-Skills](https://github.com/scottstts/Threejs-Awesome-Graphics-Agent-Skills)
(scottstts, v0.9.2, commit `0485628`; wiki entry `C:\Dev\wiki\entities\threejs-awesome-graphics-agent-skills.md`,
local text snapshot `C:\Dev\wiki-source-archive\code-snapshots-2026-09\Threejs-Awesome-Graphics-Agent-Skills-0485628\`).

The pack itself is **not installed here and should not be**: this project has no three.js
(`grep -nE '"three|@react-three' package.json` returns nothing). Its renders come from 2D canvas
(`lib/animations/canvas/starField.ts`), canvas-confetti, Lottie and Blender. 23 of the 24 skills are
three.js/WebGPU implementations; only the validation method carries over.

## Rules

### R1 — Frozen seeds for any measurement (not for human votes)

A measurement compared across sides or runs must use the same random draws. Round 1 of the P22
parity check produced a wrong measurement (hue classifier, retracted in
`docs/spikes/particles-parity-2026-10/VERDICT.md`) taken on unseeded captures.

- [ ] Parity harness: replace `Math.random` with a seeded PRNG (e.g. mulberry32) **before** either
      bundle runs, for measurement captures only. This covers both sides: tsParticles calls
      `Math.random`, and `starField.ts:176` already accepts an injectable `random`.
- [ ] Measure over at least 3 seeds × several frames; report the spread, never a single value.
- The blind vote (user's daughter) stays on live, unseeded animation: what is judged is what ships.

### R2 — Never approve on a single frame or a single size

- Animated effects (StarField, confetti): judged in motion, never from stills. Stills are for
  measurement only.
- [x] Mascot board (done in `vote.html`, 48-128 px on home light/dark): besides the 1024 px render, show the mascot at **every size the app will display
      it at** (to be listed when it is integrated), on the real app backgrounds (light and dark).
      Blender is already deterministic (`scripts/blender/studio.py:122`, Cycles seed 0) and has extra
      angles; the missing axis is display size.
- [ ] Also check with `prefers-reduced-motion` on (the reduced variant must still read).

### R3 — Rejection criteria written before the vote

Each verdict file (`docs/spikes/*/VERDICT.md`) states, **before** the vote, the conditions that
reject a candidate regardless of preference. Examples to adapt:

- P22: rejected if star colours no longer read with reduced motion; rejected if the effect is only
  visible thanks to glow/blur (the pack's "bloom creates the only visible form of an effect").
- Mascot: rejected if the silhouette does not read at the smallest display size; rejected if the
  face reads only under the studio light and not on the app background.

### R4 — Mesh defect audit for the procedural mascot (low priority)

Transposable from `threejs-procedural-geometry` (topology audit): loose/duplicate vertices,
degenerate faces, non-manifold edges, detached components, flipped normals.

- [ ] Optional bmesh check at the end of `scripts/blender/chibi_unicorn.py`, reporting counts.
      Caveat: metaballs and tubes intersect by design, so intersections are **not** a defect here;
      only per-part topology is checked.

## Constraints

Applying R1–R4 needs a browser, servers or Blender renders. Do it only when the machine is free
(another heavy project may be running; see the resume memo).
