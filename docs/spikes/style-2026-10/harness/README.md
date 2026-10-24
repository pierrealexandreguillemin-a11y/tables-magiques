# Hair review harness (mane, tail) — 2026-10-24

Built before any new mane render, on the user's order (« c'est ça la priorité, sinon tu vas
encore générer sous-qualitatif ! »). Skill: `.claude/skills/anti-slop-frontend/` (mascot
variant). Judge: `.claude/agents/hair-judge.md`, rubric `references/hair-rubric.md` (H-v1).

## Files

| Path                                     | What                                                                                                                                                                                                                        |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `reference/ref_{front,3q,side,back}.png` | The bar: Meshy « Midnight Ponytail » (CC0, chenzheguo7, 1 708 086 faces), captured in its web viewer on 2026-10-24. The model itself is served as a proprietary `.meshy` file and downloads need an account: not downloaded |
| `negative/map{1-4}_<view>.png`           | The four refused target maps, extracted from their commits (5a206bf wide clumps, 8cdae8c « casque », 37fc910 « forme du crâne », bb63352 « calvitie »)                                                                      |
| `negative/A7_{front,side}.png`           | A7 previews (the mane audited in `MANE_AUDIT.md`). Their camera differs from the bald renders: hair framing falls back to the whole character                                                                               |
| `build_pack.py`                          | Review pack in a scratchpad folder: same framing on both sides, anonymous pairs in both orders, `key.json`, `sheet.png` for the user, `brief.md` with one prompt per judge pass                                             |
| `verdict.py`                             | Verdict from the judges' JSON saved in `<pack>/judge/`; exit 0 only when the filter passes                                                                                                                                  |

## Run on a candidate

Current bars (H-v2, user 2026-10-24: « structure C, mais avec la finesse de crinière de A : un
essai puis si refus, retour vers ma piste »): one pack per bar.

```bash
cd docs/spikes/style-2026-10/harness
python build_pack.py "<renders>/cand_{view}.png" "<scratchpad>/review/<name>_C" --ref structure
python build_pack.py "<renders>/cand_{view}.png" "<scratchpad>/review/<name>_A" --ref finesse
# one FRESH hair-judge agent per line of <pack>/brief.md (never a fork), all in parallel;
# save each JSON answer verbatim in <pack>/judge/ (H-A_<view>_<A|B>.json, H-B.json)
python verdict.py "<scratchpad>/review/<name>_C"; python verdict.py "<scratchpad>/review/<name>_A"
```

Chibi bars are whole characters: the candidate is framed whole. With the Meshy bar (H-v1,
`--ref meshy` plus the bald pattern), candidate renders must use the bald renders' cameras
(`target/bald_views.py`), otherwise the hair framing is wrong (see A7). Then every R/M defect is checked by eye on the
zone it names (procedure Q.4) before anything is shown to the user, with `sheet.png`, and the
user's forced choice: « Laquelle tiendrait dans l'appli livrée ? ».

## Calibration (2026-10-24, rubric H-v1, 9 fresh agents)

| Run                                           | Expected       | Measured                                                                                                    |
| --------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------- |
| H-A map4 vs reference, 3q + side, both orders | reference wins | reference wins 6/6 axes in all 4 passes → 12 axes lost: **red**                                             |
| H-B map2 (« casque »)                         | R helmet       | R 2 (both `helmet`), M 11, m 12 → 0: **red, right kind**                                                    |
| H-B map3 (« forme du crâne »)                 | off-skull      | R 1 (`bald`), M 13 (4 `off-skull`), m 6 → 0: **red**, kind found as M                                       |
| H-B map4 (« calvitie »)                       | R bald         | R 3 (2 `bald`, 1 `off-skull`), M 9, m 9 → 0: **red, right kind**                                            |
| H-B A7 (refused)                              | red            | R 0, M 8, m 7 → 0.25: red **by score only**, no R                                                           |
| H-B reference as candidate (green control)    | green          | R 0, M 4 (3 `helmet`: glossy smooth crown with a clean rim, side and 3q — true on the image), m 6 → **4.5** |

Consequence, measured: procedure Q's fixed threshold « ≥ 7 » would reject the bar itself (4.5),
so it is not the gate here. Gate = **no R** and **score ≥ 4.5** (the reference's own score, same
rubric version), plus **no H-A axis lost in both orders** — red on all five fixtures, green on
the reference. Weak points, said plainly: one run each (judge noise unmeasured); H-A has no green
control yet (no good candidate exists); A7 is caught by the score, not by an R. `verdict.py`
replays the map4 row: `python verdict.py <scratchpad>/review/map4` → `FILTER FAILED`, exit 1
(judge files there are transcriptions: `better` and severities only).

## Calibration H-v2 (2026-10-24, chibi bars C structure / A finish, 7 fresh agents)

| Run                             | Expected | Measured                                                                                     |
| ------------------------------- | -------- | -------------------------------------------------------------------------------------------- |
| H-A map4 vs C, 3q, both orders  | C wins   | C wins 6/6 in both → structure axes lost: silhouette, volume, flow, hierarchy: **red**       |
| H-A map4 vs A, 3q, both orders  | A wins   | A wins 6/6 in both → finish axes lost: finish, tips: **red**                                 |
| H-A A7 vs C, side, both orders  | C wins   | C wins 6/6 in both → 4 structure axes lost: **red**                                          |
| H-B on C itself (green control) | green    | R 1 (`helmet`, back view: one smooth slab down the back of the head), M 7, m 11 → 0: **red** |

Consequence, measured: with a chibi bar, H-B rates the bar itself at 0 with an R, so H-B is
**not a gate** under H-v2 (`verdict.py` prints it as a list to check by eye). The gate is
H-A alone: no axis of the bar lost in both orders. Weak points: one run per row; no H-A green
control (no good candidate yet); the map fixtures carry lock labels (F1, M1…), so those pairs
were not fully blind — a judge noticed it. Replay: `python verdict.py <scratchpad>/review/map4_C`
(and `map4_A`, `A7_C`) → `FILTER FAILED`.

## Wiki tools — decision per tool (wiki files read 2026-10-24)

| Tool (wiki file)                                                          | For                                                | Decision                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| img2threejs (`entities/img2threejs.md`)                                   | mane                                               | **Pattern adopted, not installed**: scripts check, the model judges one reference/render sheet per pass, fail-closed (« this fidelity is impossible from this image » is a valid answer), locked passes. It builds three.js factories; our mascot is a Blender pre-render |
| Hermes style lock / follow-the-mean (`hermes-creative-skills-catalog.md`) | —                                                  | **Not used for the mane**: it steers 2D image generation; a generated 2D concept would be designing from a picture we made, the A1-A7 failure mode                                                                                                                        |
| Modern Web Guidance (`modern-web-guidance-chrome-skills-evaluees.md`)     | pages: LCP (pending 3), title contrast (pending 4) | **Install proposed, needs go**: Chrome team, preview, uplift measured by its authors only, telemetry on by default (`DISABLE_TELEMETRY=1`)                                                                                                                                |
| ui-ux-pro-max, impeccable (`bibliotheques-prompts-frontend-ouvertes.md`)  | pages                                              | Already installed; « à mesurer sur un vrai frontend » per the wiki — first use = `impeccable critique` on the home title before/after (pending 4)                                                                                                                         |
| awesome-design-md                                                         | pages                                              | Only if the user names a brand to match                                                                                                                                                                                                                                   |
| frontend-design (`anthropic-official-skills-catalog.md`)                  | pages                                              | Already projected in `.claude/skills/frontend-design/`                                                                                                                                                                                                                    |
| canvas-design, theme-factory, webapp-testing                              | —                                                  | Not used: static posters, preset themes; webapp-testing is covered by the Playwright MCP and `npm run test:e2e`                                                                                                                                                           |
| Wiki bridge game-dev / architecture hubs → « Skills d'agent — design »    | wiki                                               | Proposed, needs go (wiki change)                                                                                                                                                                                                                                          |
