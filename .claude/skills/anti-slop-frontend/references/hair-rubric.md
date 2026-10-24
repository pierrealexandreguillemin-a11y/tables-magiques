# Hair rubric — mascot mane and tail (projection Tables Magiques, version H-v2, 2026-10-24)

Why this file: the web rubric (`judge-rubric.md`) judges pages. The mane is a 3D asset, judged
against the user's chosen bars (2026-10-24, « structure C, mais avec la finesse de crinière de
A ») : **structure** = « Just a Unicorn! » (C), **finish** = « Woona » (A), captures in
`docs/spikes/style-2026-10/harness/chibi-refs/views/`. Every defect below was shipped once and
refused by the user (`docs/spikes/style-2026-10/MANE_AUDIT.md`); the list is a record, not a
charter.

H-v1 → H-v2 (reason, user 2026-10-24: « je ne veux pas une copie-conforme de cette chevelure
! »): H-v1 judged against a realistic strand groom (Meshy « Midnight Ponytail ») and its anchors
(« hundreds of strands », « ragged outline ») pushed towards realism. Chibi hair is made of
**sculpted locks**: H-v2 anchors describe that.

## Style neutrality (said to the judge, every time)

Both images are stylised cartoon characters. Colour, palette, body shape and rendering style are
**not judged**. Only the craft of the hair (mane, forelock, tail) is: how a skilled stylised
character artist would rate its locks, masses, edges and tips.

## Lens H-A — pairwise craft (blind, both orders)

Two images, same view, labelled Image 1 / Image 2. For each axis: which image shows better
hair craft (`1`, `2` or `tie`), a 1-5 score for each, and the visible evidence (zone).

| Axis         | Question                                           | 1-2 (refused before)                         | 4-5 (the bar)                                                              |
| ------------ | -------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------- |
| `finish`     | Are the locks finely crafted?                      | flat ribbons, drawn lines, soft blurry edges | fine grooves running along each lock, crisp thin edges                     |
| `silhouette` | Is the outline designed?                           | smooth hull, a shell (« casque »), or noise  | a few big swoops whose outline is broken by lock tips                      |
| `tips`       | Do tips end well?                                  | blunt, rolled knobs, parallel needles        | sharp tapered points, some splitting into 2-3 sub-locks, varied directions |
| `volume`     | Layers and depth between masses?                   | flat sheet, dark slits, skull showing        | overlapping layers (forelock over side over back), lift at the crest       |
| `flow`       | Do locks grow from the crest and follow the skull? | off the skull, arbitrary lanes, bald patches | grows from a crest behind the horn, hugs the head, falls with gravity      |
| `hierarchy`  | Big masses → locks → sub-locks?                    | one scale only (all noodles or all lumps)    | three scales, quiet areas                                                  |

Each bar judges its own axes (`harness/verdict.py`): structure (C) → `silhouette`, `volume`,
`flow`, `hierarchy`; finish (A) → `finish`, `tips`.

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
| `lumps`     | smooth blobs or rolled knobs instead of locks                     | VERDICT 2026-10-17 #4, A7 finding 5                      |
| `clones`    | the same lock or roll repeated                                    | A7 finding 5, 12                                         |
| `crease`    | dark slit between layers, hole in the mass                        | A7 finding 6                                             |
| `intersect` | hair through horn, ear, eye or face; stray strand across the face | A7 findings 2, 8                                         |

Score H-B = max(0, 10 − 3·R − 1·M − 0.25·m), capped at 4 when there is any R. The caller
computes it from the list (never the judge): `harness/verdict.py`. Gate: no R and a score at
least the bar's own (measured per version, `harness/README.md` § Calibration) — not procedure
Q's fixed 7, which the bar itself can fail. Any change to this file = new version, with its
reason, and a new calibration run.

## Output (JSON only)

```json
{
  "lens": "H-A",
  "view": "3q",
  "axes": [
    {
      "id": "finish",
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
