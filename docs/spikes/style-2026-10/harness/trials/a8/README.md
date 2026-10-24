# Trial A8 — « structure C, finesse A » (2026-10-24)

User: « structure C, mais avec la finesse de crinière de A: un essai puis si refus, retour vers
ma piste ». Code: `scripts/blender/mane_crest.py` (`--mane crest`), back view added to
`studio.VIEWS`. Renders: `it0_<view>.png`, `it1_<view>.png`; board `board.png` (bar C | it0 | it1).

Reproduce (from `scripts/blender`, Blender 5.2, ~2-2.5 min per view):
`"$B" -b --python chibi_unicorn.py -- <out> --tag cand_<view> --view <view> --mane crest`

## Filter (13 fresh hair-judge agents per iteration, rubric H-v2)

| Iteration | Axes lost in both orders (verdict.py)                                                                             | H-B (list, not a gate)            |
| --------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| it0       | vs C: silhouette (3q, front, side), volume (3q, side), flow (side); vs A: finish (3q, front), tips (3q)           | R 2 `helmet` (side, 3q), M 7, m 6 |
| it1       | vs C: silhouette, volume, flow (3q, front, side), hierarchy (front, side); vs A: finish (3q, front), tips (front) | R 1 `helmet` (side), M 7, m 5     |

Both **FILTER FAILED**. What the judges agree on, checked by eye on the renders:

- **Won**: lock finish against C in most passes (fine grooves along the locks, crisp edges);
  back view against C (3 scales, split tips).
- **Lost, it0**: the side locks draped the skull down to the jaw → one wig-like hull (`helmet`,
  confirmed on `it0_side.png`); sub-locks crumpled into shards (confirmed, back view); grooves
  too deep (read as piped icing).
- **Lost, it1** (side locks moved behind the ear): from the front the mane almost disappears
  (« sparse tufts, skull bare »), the back mass is still a smooth shell from the side, the
  forelock reads as a seashell ornament. Over-correction of it0, the same pattern as « casque »
  → « calvitie » on the maps.
- **Against A (finish)**: lost in both iterations — A's grooves run along big swooping masses
  that overlap; ours run over one mass.

Anti-loop (skill anti-slop-frontend, Step 3): two failures → stop, back to the user. No third
invention.
