# Proposal — mane in Blender hair curves, Meshy as inspiration (2026-10-25)

Answer to the user's verdict of 2026-10-24 (« la barre chibi est refusée … tu as des exemples du
rendu meshy pour t'inspirer (et PAS copier) »). **Proposal only: nothing is built until the user
says go.** Board: `board.png` (rebuild: `python build_board.py`).

## The proposal (one paragraph)

Stop hand-sculpting locks (A1-A8 oscillated helmet ↔ bald because each lock was a solid placed by
angle). Instead, grow real strands with Blender's procedural hair: a few dozen guide curves on the
crest, thousands of interpolated strands between them, grouped into 15-25 readable locks (chibi
scale), tips tapered and loosened on the last third only, two layers (short under-layer against the
neck, long top layer lifting at the crown), and 5-10 stray strands breaking the outline. From Meshy
we take the five qualities numbered on the board — full mass, layers, grouped locks, tapered tips,
ragged outline — not its shape: no ponytail, no realistic length or colour; the mane stays pastel
lilac/blue and chibi-length.

## Feasibility, measured (the open question in `MANE_AUDIT.md`)

Blender 5.2.0 LTS, headless, `--factory-startup`:

| Check                                                                                                       | Result                                                                          |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Hair node groups bundled                                                                                    | yes, `5.2/datafiles/assets/nodes/procedural_hair_node_assets.blend` (25 groups) |
| Attach → Interpolate → Clump → Frizz → Set Profile driven by script, 24 guides on a UV sphere, density 4000 | 18 987 strands, no node warning, Cycles render written                          |
| Same with a `mane_mask` point attribute as Density Mask (`probe_mask.py` → `probe_mask.png`)                | 5 568-5 589 strands over 5 runs, roots confined to the crest band               |

Replay: `"/c/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b --factory-startup --python probe_mask.py`
→ expected stdout `RESULT curves: ~5 580` (measured 5 568-5 589 over 5 runs: the count is
not bit-exact run to run, cause not investigated) and `RENDERED`.

Pitfalls found (Blender 5.2 API):

- Modifier inputs are no longer set with `mod["Socket_N"] = v` (TypeError); use
  `getattr(mod.properties.inputs, identifier).value = v`. Attribute-driven field inputs:
  `.type = 'ATTRIBUTE'` and `.attribute_name = "…"`.
- « Attach Hair Curves to Surface » needs its **Surface Object** input set explicitly; the curves
  datablock's `surface` alone leaves Interpolate with « Missing hair surface geometry ».
- Without a density mask, Interpolate covers the whole surface (a fur coat = the « casque » defect).
- The surface needs `add_rest_position_attribute = True`, otherwise a rest-geometry warning.

What the probe does **not** show: the look. On the sphere the children hug the surface; the mane's
shape, layers and lock count are the build work, judged afterwards.

## Decisions waiting for the user

1. Go / no-go on this method.
2. Which bar the judges use: back to the Meshy captures (harness `--ref meshy`, rubric H-v1), as
   the user's verdict implies, or another one.
