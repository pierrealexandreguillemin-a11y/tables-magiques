# Verdict — particle parity, round 1 (2026-10-17)

Blind forced choice on `index.html` (sides shuffled per load), given by the user's daughter — the
app's target audience — and pasted verbatim by the user:

```text
VERDICT P22 parité particules
1. Fond féerique : B plus beau — j'ai plus le B parce que on voit plus la  couleur rose .
2. Étincelles du défi : A plus beau — on voit plus les couleurs sur le A que sur le B .
3. Confettis : A plus beau — le A est le plus beau parce que on voit plus les couleurs .
4. Accueil réel : B plus beau — J'aime plus le B parce que ont voit plus de couleurs . Les étoiles jaune dorée et le petit visage jaune qui sourit il est trop mignon .
code : fn.so.cn.an
```

Decoding (`<row initial><side A>`, `o` = tsParticles/master, `n` = canvas/P22):

| Row            | A is | Preferred | Winner          | Stated reason                                                  |
| -------------- | ---- | --------- | --------------- | -------------------------------------------------------------- |
| Fairy stars    | new  | B         | **tsParticles** | "on voit plus la couleur rose"                                 |
| Sparkles       | old  | A         | **tsParticles** | "on voit plus les couleurs"                                    |
| Confetti       | new  | A         | **canvas**      | "on voit plus les couleurs"                                    |
| Real home page | new  | B         | **master**      | more colours, golden stars, "le petit visage jaune qui sourit" |

**Result: P22 loses 3 of 4. Not mergeable as is.** One reason repeats: colours are less visible
on the new star field. Next: find the measurable cause (colour distribution, opacity over time,
drawn size, glow) against the tsParticles source, fix, and run round 2 with the same form.

The yellow smiling face the child mentions on the home page is the kawaii mascot: present on
both builds at the same place (screenshots of ports 3201 and 3202, 2026-10-17). Not a regression.

## Analysis (2026-10-17)

1. **Real parity gap, fixed.** `@tsparticles/updater-opacity` gives every particle its own speed:
   `velocity = speed / 100 x reduceFactor x getRandom()` when `sync` is false. Many stars barely
   change and stay bright for long. The first P22 version swept every star at the maximum speed.
   Now each star draws `opacitySpeed x random()` (unit test pins it).
2. **Small samples decide the colour mix.** tsParticles draws colours uniformly at random
   (`probes/tsparticles-colour-draws.mjs`: 43 gold / 44 pink / 39 white over 6 loads), but a fairy
   panel holds only ~5 stars: one load can come out almost all yellow, the next pinker. The new
   field now goes round the palette from a random start, so every colour is always present in
   even shares (unit test pins it).
3. **A measurement error of mine, retracted.** A first hue-threshold classifier reported "old
   sparkles 50 % yellow vs new 31 %" as systematic. Classifying pixels by nearest palette colour
   instead (`probes/palette-pixels.mjs`, 3 runs) shows no systematic difference: old gold pixels
   229 / 69 / 190, new 145 / 109 / 264. The classifier script was deleted.

Round 2: same blind form, with fixes 1 and 2.
