# Hair rubric — mascot mane and tail (projection Tables Magiques, 2026-10-24)

Why this file: the web rubric (`judge-rubric.md`) judges pages. The mane is a 3D asset, judged
against the user's chosen bar: Meshy « Midnight Ponytail » (captures in
`docs/spikes/style-2026-10/harness/reference/`). Every defect below was shipped once and refused
by the user (`docs/spikes/style-2026-10/MANE_AUDIT.md`); the list is a record, not a charter.

## Style neutrality (said to the judge, every time)

The reference is realistic dark hair with no head; the candidate is a pastel chibi unicorn
mane. Colour, realism, shading style and what the hair hangs on are **not judged**. Only the
craft of the hair geometry is: how a skilled groomer would rate the strands, masses and outline.

## Lens H-A — pairwise craft (blind, both orders)

Two images, same view, labelled Image 1 / Image 2. For each axis: which image shows better
hair craft (`1`, `2` or `tie`), a 1-5 score for each, and the visible evidence (zone).

| Axis         | Question                                                   | 1-2 (refused before)                      | 4-5 (the bar)                                                  |
| ------------ | ---------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------- |
| `density`    | Enough strands for a full mass?                            | few thick ribbons, gaps, skull showing    | hundreds of strands, full mass                                 |
| `silhouette` | Is the outline broken and alive?                           | smooth hull, a shell (« casque »)         | ragged outline, fine flyaways                                  |
| `tips`       | Do tips taper and vary?                                    | blunt, rolled knobs, parallel needles     | thin tapers, each with its own direction                       |
| `volume`     | Layers and depth between masses?                           | flat shell, dark slits                    | layers lifting, puffed crown, self-shadow                      |
| `flow`       | Do locks grow from a coherent origin and follow the skull? | off the skull, arbitrary lanes            | grows from a parting/crest, hugs the skull, falls with gravity |
| `hierarchy`  | Big masses → clumps → strands?                             | one scale only (all noodles or all lumps) | three scales, quiet areas                                      |

Decision: an axis is **lost** when the other image wins it in both orders; an axis that flips
with the order is noise (position bias) and counts as tie. The candidate **passes the filter**
when it loses no axis — which proves nothing: it then goes to the user's forced choice.

## Lens H-B — defects (candidate images only)

List **every** occurrence: image, zone (« upper left, behind the horn »), what is seen,
severity **R** (would be refused on sight) / **M** (major) / **m** (minor), kind:

| Kind        | Seen as                                                           | First refused                                            |
| ----------- | ----------------------------------------------------------------- | -------------------------------------------------------- |
| `helmet`    | hair reads as one shell or cap glued over the cranium             | « on dirait un casque de cheveux ! » (map 2)             |
| `off-skull` | locks float off the head, do not follow its shape                 | « pourquoi tu ne suis pas la forme du crâne ? » (map 3)  |
| `bald`      | skull visible between too few locks                               | « on dirait qu'elle est atteinte de calvitie ! » (map 4) |
| `needles`   | thin straight spikes, thorn or icicle tips                        | A7 finding 4,7                                           |
| `spaghetti` | equal parallel tubes, one clump size everywhere                   | A7 finding 10                                            |
| `lumps`     | smooth blobs or rolled knobs instead of strands                   | VERDICT 2026-10-17 #4, A7 finding 5                      |
| `clones`    | the same lock or roll repeated                                    | A7 finding 5, 12                                         |
| `crease`    | dark slit between layers, hole in the mass                        | A7 finding 6                                             |
| `intersect` | hair through horn, ear, eye or face; stray strand across the face | A7 findings 2, 8                                         |

Score H-B = max(0, 10 − 3·R − 1·M − 0.25·m), capped at 4 when there is any R. The caller
computes it from the list (never the judge): `harness/verdict.py`. Gate: no R and a score at
least the reference's own (4.5 with this version, measured) — not procedure Q's fixed 7, which
the reference itself fails (`harness/README.md` § Calibration). Any change to this file = new
version (H-v2…), with its reason, and a new calibration run.

## Output (JSON only)

```json
{
  "lens": "H-A",
  "view": "3q",
  "axes": [
    {
      "id": "density",
      "better": "1|2|tie",
      "score_1": 0,
      "score_2": 0,
      "evidence": "..."
    }
  ],
  "verdict_one_line": "..."
}
```

```json
{
  "lens": "H-B",
  "defects": [
    {
      "image": "cand_3q.png",
      "zone": "...",
      "seen": "...",
      "severity": "R|M|m",
      "kind": "helmet"
    }
  ],
  "verdict_one_line": "..."
}
```
