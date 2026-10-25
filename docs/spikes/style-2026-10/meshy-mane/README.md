# Meshy mane fitted on the A6 unicorn (2026-10-25)

User: « pourquoi tu ne fais pas ça inline avec blender ou meshy ». Generated in the user's Meshy
workspace (Pro, 20 credits, kept there: task `01a173f7-a64c-712e-80e6-b4985f3ebca6`, Meshy 6,
text-to-3D, licence « Privé »). Downloaded as GLB (15 256 760 bytes) to
`C:/Users/pierr/Downloads/Meshy_AI_Hair_only_no_head_n_1025170709_generate.glb` — not committed
(size); the Meshy workspace keeps the original.

Prompt: « Hair only, no head, no body: a stylized cute unicorn pony mane hairpiece sized for a big
round chibi head. A thick crest of hair rising behind the horn position, puffed crown with layers
lifting off, a soft forelock falling to one side, then many flowing locks sweeping back and down
the neck to shoulder length. Hundreds of real hair strands grouped into 20 clear locks, tapered
wispy tips each with its own direction, a few flyaway strands, full mass with no gaps. Pastel
gradient: pink at the roots, lilac in the middle, light sky blue at the tips. Soft glossy cartoon
hair. »

Result: Meshy ignored « hair only » and made a whole horse-like unicorn head with sculpted locks
(one shell, 423 773 vertices, 847 558 faces, no material). `fit_mane.py` keeps the mane (method in
its docstring). Not judged yet.

| Fit  | Change                                   | Seen (by me, not a judge)                                         |
| ---- | ---------------------------------------- | ----------------------------------------------------------------- |
| fit1 | scale 1.35, face cone + sphere cuts      | real layered mane; too long (past the chest); pink spikes at horn |
| fit2 | scale 1.45, hanging locks squashed ×0.72 | chibi length; sphere cuts tore locks around the horn (« petals ») |
| fit3 | capsule cuts                             | capsules misplaced: Meshy horn and cat-like ears left             |
| fit4 | capsules re-measured on grid views       | horn gone; ears cut leave dark hollows and pink stubs by our ears |

Replay: `"$B" -b --python fit_mane.py -- <glb> <out> --res 512 --spp 32` (~80 s).

## Filter on fit5 (2026-10-25, rubric H-v1, Meshy bar, 9 fresh judges)

`python ../harness/verdict.py <scratchpad>/review/fit5` → **FILTER FAILED** (exit 1). Judge files
there are transcriptions (`better` and severities only), like the map4 calibration row.

- H-A: the reference wins every axis in both orders on front, 3q and side. Back: density,
  silhouette, tips and hierarchy lost; **volume won by the candidate in both orders**; flow
  tie/lost.
- H-B: R 1, M 9, m 5 → 0. R = `helmet` on the front: crown and bangs read as a rolled cap with a
  straight hem across the forehead — checked by eye, true, and caused by the face-cone cut in
  `fit_mane.py`, not by Meshy. M: `off-skull` (locks shoot back nearly horizontal, side and 3q),
  `lumps` (rolled knobs around the horn, ruffled hem), `clones` + `needles` (back: one claw-shaped
  lock repeated, hooked tips on the crown), `spaghetti` (equal hanging ribbons, side).
- Bias, said plainly: H-v1 anchors (« hundreds of strands », three scales down to single strands)
  can never be won by sculpted chibi locks; density and hierarchy are lost by construction. The
  R and most M are real defects regardless.
- Framing deviation: the hair crop failed (the mane's shadow on body and ground widens the
  difference box), so candidates were framed as the whole character, unlike the calibration.

## Strand fringe on the Meshy mane (fr1, fr2 — 2026-10-25)

User: « la barre meshy des juges implique ce que je veux: des mèches fines comme dans l'exemple
meshy. la frange: c'est vrai, elle est moche, il faut des mèches. le reste chibi est passable si
la frange est corrigée. » Meshy's fringe and horn rolls are cut (`FRINGE_CUT_*`); a fringe of
hair-curve strands grows in their place (`mane_hair.FRINGE`, baked to `fringe.npz`).

- fr1: 0.4-0.5 long, close to the skin → a fuzzy band like an eyebrow (seen by me).
- fr2: longer, lifted, clumped. Filter (9 fresh judges, H-v1, Meshy bar): **FILTER FAILED**,
  H-A lost on every view, H-B R 3, M 7, m 6 → 0. The 3 R are one defect seen on front, 3q and
  side: `helmet`, « short bristles all the same length, cut off flat like a broom … two unrelated
  hair systems glued together » — checked by eye on the 3q crop, true. Judges also call the fringe
  « a believable fibre fringe » and fault the sculpted Meshy rest (ribbons, cloned hook tips,
  locks off the skull), which the user rated passable.
- Anti-loop (anti-slop-frontend, Step 3): second failure on this level → stop, back to the user.

## Option 2: the whole mane in strands along Meshy's lock axes (st1-st5, 2026-10-25)

User's pick: « Toute la crinière en brins fins, avec la forme de Meshy ». `fit_mane.py
--export-mesh` → `lock_axes.py` (Reeb-graph skeleton: geodesic bands from the head, ring centres
→ 26 lock axes + ring widths) → `mane_hair.lock_strands` (600 strands per lock, deterministic) over
an interpolated under-layer (`mane_hair.STRANDS`).

- st1-st4 seen by me: converging axes inside the skull (fixed: stop where a lock joins the mass),
  roots at right angles (fixed: prolong the axis to the head), bare back (mask widened), a smooth
  dome (under-layer at full length).
- st5 filter (9 fresh judges, H-v1): **FILTER FAILED**, R 1, M 13, m 6. First measurable gains:
  the candidate wins density in 6 of 8 passes, and on the side view wins density, silhouette,
  volume and hierarchy in both orders. Lost: flow everywhere (locks stream horizontally, « wind »),
  tips (hooks). R = `clones` on the back: a ring of identical hooked locks like tentacles —
  checked by eye, true. M: fuzz cap (the trimmed under-layer), crease between layers, hooks.
