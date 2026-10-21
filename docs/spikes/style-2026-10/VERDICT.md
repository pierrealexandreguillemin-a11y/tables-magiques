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
6. Low contrast: pearl white on a pastel background. **Closed by the user (2026-10-17): "le
   corps de la licorne validée est ok"** — body colour and contrast stay as in A2/A3.

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

## A3 vs A2 — rejection criteria (written 2026-10-20, BEFORE the vote)

Protocol: `docs/VISUAL_VALIDATION_PROTOCOL.md` (R2 display sizes, R3 criteria first). Vote page:
`vote.html` (default pair A3,A2) (blind: left/right drawn at random per row, the copied code reveals the sides).

Display sizes come from the slots the mascot will replace, measured on production
(`capture-app-context.mjs` → `context/slots.json`, phone 412×823): home hero emoji 🦄
(≈141×109 px box) and the kawaii mascot (100 px); Lottie 60/80/120 px; MagicLoader 48/64/96/128 px.
The ladder shows 48, 64, 80, 100 and 128 px, on the real home background, light and dark.

A candidate is **rejected regardless of preference** if any of these fails, in either theme:

- **C1 — silhouette at 48 px:** horn and mane are recognisable; it does not read as a blob.
- **C2 — face at 64 px:** both eyes are visible.
- **C3 — edge on the app background:** the mane does not dissolve into the purple background.

Only candidates passing C1–C3 are compared by preference. If both fail a criterion, neither is
chosen and the failing criterion becomes the next iteration's target. A2 and A3 differ only in
the mane and tail, so C1 and C3 are the discriminating ones.

## A3 vs A2 — verdict (2026-10-20)

Pasted from `vote.html` (default pair A3,A2) (the user's daughter voted):

```
1. Dans l'appli, thème clair : Gauche
2. Dans l'appli, thème sombre : Gauche
3. Petites tailles : Gauche
4. En grand : Gauche
Gauche (rangée 3) éliminée par : rien
Droite (rangée 3) éliminée par : rien
code : c3.s3.t3.g3
```

Code = row initial + candidate shown on the left, so the left side was A3 in all four rows.

- **A3 chosen over A2**, 4 rows out of 4. Neither candidate failed C1, C2 or C3.
- **User remark after the vote:** the mane must be finer, the strands more visible and more
  detailed — "on dirait une licorne avec des dreadlocks". Cause in the model: each A3 lock is a
  single thick sweep (half-width 0.17–0.20, rounded tip floor), so 13 chunky tubes read as
  dreadlocks. Next iteration (A4): same layout, each lock split into thinner strands with sharp
  tips.

## A4 — split strands (2026-10-21)

- **Change:** mane and tail only, `--mane strands` (`unicorn_mane.split_lock`): the A3 layout,
  each lock's spine split into 5 strands (half-width 0.5 x the lock's, fanning from 0.55 to 1.0
  lock half-widths, lengths 0.78-1.0, lifts 0-0.05, tips tapering to 0.02 instead of 0.08,
  pressed 0.045 onto the skull so no hollow opens under the thinner strands). `locks` (A3) is
  untouched and stays the default.
- **Iterations (512 px previews, not committed):** it01 = 4 strands at 0.38 width: too thin,
  "wet hair", the volume of the mane is lost. it02 = 5 strands at 0.5: volume back, but a dark
  hollow under the mane seen from the front. it03 = it02 + SINK: hollow reduced (a lilac
  shadow behind the ear remains, as on A3).
- **Reproduce:** same commands as A3 with `--mane strands` and `A4_*` tags; the full render took
  152 s here.

## A4 vs A3 — rejection criteria (written 2026-10-21, BEFORE the vote)

Same page and protocol: `vote.html?pair=A4,A3`. Same C1-C3 as above, plus one for this iteration:

- **C4 — no gaps at 100 px:** the mane does not look stringy or thin (head showing through
  between the strands).

The user's request ("crins plus fins, plus visibles, plus détaillés, pas des dreadlocks") is
judged by preference on the "En grand" row.

## A4 vs A3 — verdict (2026-10-21)

- **User verdict (verbatim):** « la nouvelle est mieux, mais il restera une épaisseur non corrigée
  visible de face entre le crâne et les mèches fines, à faire en session prochaine ».
- **A4 chosen over A3.** No vote code pasted (verdict given in chat, not through the page).
- **Next iteration (A5) target:** from the front, the layer between the skull and the thin strands
  still shows (the lilac underlayer `hair_underlayer` / scalp cap seen as a thick band under the
  strands). Leads, not tried: shrink or drop `UNDERLAYER` for `strands`, raise `SINK`, add inner
  strands that cover the band, or root the strands lower on the skull.
