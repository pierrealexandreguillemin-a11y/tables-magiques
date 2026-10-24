# Anti-slop harnesses and wiki tools for the mane redo (2026-10-24)

User (verbatim): « va voir dans /maquette-commune et /vocalise si les skills et harnais
anti-slop peuvent t'être utiles en prochaine session et creuse le /wiki pour des skills game-dev
ou frontend utiles pour notre projet ».

Gathered by two read-only research agents; the key paths and the quoted rules below were then
re-checked on disk (`ls` / `grep`, 2026-10-24). Nothing was installed or modified.

## Why it matters

This session's mane failure (4 refused targets: helmet, skull shape, bald) matches, point by
point, failures these harnesses were built against in vocalise and maquette-commune: designing
from secondary rules instead of a user-chosen reference, judging my own renders, inventing a
third (fourth) time instead of going back to the reference.

## To use next session, in order

1. **`C:/Dev/skills-templates/anti-slop-frontend/SKILL.md`** (generic; born in vocalise). Order:
   real renders → real material → proven bricks → calibrated gates → external judge → human
   verdict. Step 0: a **negative fixture** (a refused deliverable) must exist — here the four
   refused maps + A7. Step 1: « **Aucun lien sans capture** », 3 candidate bars, stop until the
   user picks — here the bar is already picked: Meshy « Midnight Ponytail ». Anti-loop: a level
   that fails twice goes back to the reference with the user, « **Jamais une troisième
   invention** ».
2. **`C:/Dev/maquette-commune/.superpower/plan/procedure-Q-revue-anti-slop.md`**: review pack =
   before / after / target at the **same framings**; fresh reviewers per lens; look judged **in
   pairs, both orders** (the file cites Chen et al.: Pearson 0.49 absolute vs 0.773 pairwise);
   a defect checklist of already-shipped faults with severity (for us: helmet, off-skull, bald,
   needles, spaghetti); findings re-checked; at most 3 loops, leftovers published.
3. **`C:/Dev/maquette-commune/pipeline/scripts/lookdev_common.py`** (+ `tale_house_lookdev.py`,
   `kit_parts_sheet.py`): headless Blender camera/light helpers and contact sheets with the
   **reference model next to the generated one at the same scale** — render our mane beside the
   Meshy reference from several angles in one image.
4. **`C:/Dev/vocalise/.claude/agents/design-judge.md`** (+ `references/judge-rubric.md`): blind
   judge, fresh context, Image 1 / Image 2 at identical framing, two passes with positions
   swapped; a filter (~70 % expert agreement), the human forced choice decides. Its axes are web
   axes: rewrite them for hair (silhouette, follows the skull, strand density, volume).
5. **Measured comparison:** maquette-commune `web/scripts/art-measures.mjs` (value masses,
   saliency, entropy on page vs target capture) and `skills-templates/anti-slop-frontend`
   `scripts/calibrate.mjs` (« un gate qu'on n'a jamais vu rouge n'est pas un gate »).
6. **Frontend (not the mane):** `C:/Dev/vocalise/scripts/slop-static-gate.mjs` (zero-dependency
   regex gate) and `references/jamais-il-faut-plutot.md`; Impeccable `critique` / `audit`
   (wiki `entities/impeccable.md`: installed without hooks, never measured on a project).

## From the wiki (`C:/Dev/wiki`)

- **No article on hair curves, geometry-nodes hair, grooming, chibi or toon shading.** The
  Blender hair-curves route proposed in `MANE_AUDIT.md` must be researched at the source
  (Blender manual / Blender Studio), not from the wiki.
- `topics/llm-tooling/cookbook-frontend-anti-slop-quatre-couches.md` (importance 4): the
  synthesis behind item 1.
- `entities/meshy.md`: Blender DCC Bridge tested on 5.2 but needs Blender **with UI** (not `-b`)
  and listens unauthenticated on port 5324 (run it only while sending); remesh 5 credits;
  outputs carry an AI marking.
- `topics/ia/hf-jobs-entrainement-sans-gpu-local.md`: free image-to-3D Spaces (TRELLIS.2,
  Hunyuan3D 2.1) — 5 GPU-minutes/day; a free reference-mesh option.
- `topics/game-dev/dyson-city-webgpu-maison-blender-cuite.md`: a whole asset built from Python
  modules, `.blend` never edited by hand, headless render + human judges by eye — a structure
  template for the mascot build.
- `entities/blender.md`: headless `--background --python` recommended; blender-mcp removed
  (needs UI) — consistent with our pipeline.
- Game feel: `topics/game-dev/flow-theory-game-design.md` (difficulty chosen through play),
  `emotion-first-design.md`. The wiki's own `entities/tables-magiques.md` is stale.

## Not found anywhere

Hair / strand / grooming tooling; a direct render-vs-reference similarity score (no silhouette
IoU, CLIP or DINO); a tool that shows the user two images blind and records the vote (our own
`vote.html` already does that).

## Correction (2026-10-24) — the wiki section above was incomplete

User: « Le wiki : tu te trompes de manière coupable; tu aurais trouver les compiles sur des
skills game-dev et frontend. erreur de ta part ou de conception du wiki ? »

Re-checked by hand: `C:/Dev/wiki/topics/llm-tooling/hub-llm-tooling.md` has a dedicated section
**« Skills d'agent — design frontend et graphisme »** (9 entries) and a section « Skills d'agent —
standard, ingénierie, évaluation »; the report above kept only 3 of them. Missed, with relevance:

- `topics/llm-tooling/modern-web-guidance-chrome-skills-evaluees.md` (importance per file):
  Chrome team's web-platform skills — 130 features, 153 use cases (a11y, CSS, forms,
  performance, PWA…), offline search, Baseline compatibility. **Directly relevant** to our
  Next.js / CSS-native refonte; not installed here.
- `topics/llm-tooling/bibliotheques-prompts-frontend-ouvertes.md` (importance 4): where to find
  UI references — awesome-design-md (74 brand DESIGN.md, local copy), the ui-ux-pro-max search
  recipe (« nommer le style avant de chercher »), impeccable. Fits the reference-first rule.
- `topics/llm-tooling/anthropic-official-skills-catalog.md` (importance 4): 19 official skills,
  Creative & Design: frontend-design, canvas-design, theme-factory, algorithmic-art; Development:
  webapp-testing (Playwright).
- `topics/llm-tooling/hermes-creative-skills-catalog.md`: 20 creative skills (pixel-art…), and a
  style-consistency loop (anchor image → vision extracts traits → STYLE_LOCK reinjected).
- `topics/llm-tooling/skills-agents-threejs-paysage-audit.md` and
  `entities/threejs-awesome-graphics-agent-skills.md`: three.js skill packs (audited clean,
  licence caveat GPL on one example) — low relevance: no three.js runtime in this app.
- `entities/img2threejs.md` (game-dev hub, « Assets, données et outils 3D »): photo → three.js
  factory skill with deterministic gates — pattern for gating a build against a reference photo.
- `entities/mono-color-skill.md`, `figures-isometriques-interactives-skills.md`: low relevance.

Cause: my error, not the wiki's. The brief I gave the research agent put hair first and capped
the report at ~700 words; I relayed its partial list as « what the wiki has » without opening
the hub's design-skills section myself (one read). Secondary wiki gap, observed: the game-dev and
architecture hubs have **no bridge** to that section (their « Ponts » tables do not list it), so a
reader entering by game-dev does not see it — a proposal for the wiki, not done here.
