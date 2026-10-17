# Verdict — mascot style (2026-10-17)

- **Shown:** `board.html`, served on `http://127.0.0.1:8765/board.html` in the user's Chrome.
  Candidates side by side (same light, background, camera), reference screenshots below.
- **User verdict (verbatim):** « candidar 1 est la bonne piste ».
- **Candidate 1** = procedural chibi unicorn, `scripts/blender/chibi_unicorn.py` (our own model).
- **Candidate 2** = restyled Quaternius platformer character (`scripts/blender/platformer_unicorn.py`),
  dropped: humanoid silhouette, faceted hands and ears.

"Right track" is not "approved as is". Defects to fix before production, each iteration shown again:

1. Far eye's lashes stick out past the head outline.
2. Mouth slightly off-centre.
3. Body reads as a plain pillar under the head.
4. Mane and tail are smooth lumps, not curls.
5. Horn spiral barely readable.
6. Low contrast: pearl white on a pastel background.

Next: P23 plan in `docs/VISUAL_REFONTE_2026_SPEC.md` §5.

## A2 -> A3 (2026-10-17)

- **User verdict on A2:** better than v1; the curls "peuvent évoquer des frites de piscine" →
  wants a more pronounced, hair-like mane. No muzzle in profile accepted ("ça passe, effet cute").
- **A3** changes only the mane and tail (`scripts/blender/unicorn_mane.py`, style `locks`):
  flattened lens-section locks (swell then taper to a soft point, slight twist, central crease),
  S-curves, layered on both sides of the head, tips flicking out and back, two bangs beside the
  horn, a hidden underlayer, a 4-lock tail. Head, face, body, materials, light: unchanged.
- **Reproduce** (Blender 5.2 headless, CPU; `B="/c/Program Files/Blender Foundation/Blender 5.2/blender.exe"`).
  `--mane` defaults to `locks` (A3); `--mane curls` re-renders A2 (checked: front preview
  differs from the committed `A2_front_preview.png` by at most 1/255 per channel).

  ```bash
  # A3: 1024 px 3/4 + GLB (~3.5 min), then 512 px front / side previews (~20 s each)
  "$B" -b --python scripts/blender/chibi_unicorn.py -- docs/spikes/style-2026-10/renders --tag A3_unicorn
  "$B" -b --python scripts/blender/chibi_unicorn.py -- docs/spikes/style-2026-10/renders/iterations --preview --tag A3_front --view front
  "$B" -b --python scripts/blender/chibi_unicorn.py -- docs/spikes/style-2026-10/renders/iterations --preview --tag A3_side --view side
  # A2: same commands with --mane curls and A2_* tags
  "$B" -b --python scripts/blender/chibi_unicorn.py -- docs/spikes/style-2026-10/renders --tag A2_unicorn --mane curls
  ```

  `A3_front_preview.png` / `A3_side_preview.png` = copies of the `*_gradient.png` previews.
