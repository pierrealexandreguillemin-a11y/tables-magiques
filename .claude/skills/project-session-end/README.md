# project-session-end — projection notes (2026-10-21)

Projected from `C:/Dev/skills-templates/project-session-end/` (SKILL.md + README.md, revision
2026-10-10). Model for the reduced form: `C:/Dev/kaggle/nfl-big-data-bowl-2027/.claude/skills/project-session-end/`.

## Step 0 — project audit (profile: mature, partial discipline)

| Existing in the project                                                                                                                                                         | Decision                                              | Why                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Hand-written memo `memory/session_<YYYY-MM-DD>_fin.md` (Controls / Read in full / Pending / Open items / Next action / Pitfalls / Fatigue)                                      | **coexist** — the skill codifies this format and name | it already follows the template invariants and carried this morning's « reprise » without a gap                             |
| `memory/feedback_compaction_is_session_end.md`                                                                                                                                  | **coexist** — becomes trigger T4                      | same intent as the template's fatigue STOP                                                                                  |
| `memory/feedback_self_audit.md`                                                                                                                                                 | ignore                                                | per-task quality checklist, not memo discipline                                                                             |
| Template feedback files (`feedback_session_end_template`, `feedback_post_task_procedure_and_fatigue`, `feedback_per_task_memory_updates`, `feedback_diagnostic_first_doctrine`) | not created                                           | memo format and fatigue table live once, in `SKILL.md`; per-task memory = harness auto memory; no anti-pattern codified yet |
| `CLAUDE.md` STANDING PROCEDURE                                                                                                                                                  | **not added** (proposal below)                        | rule for existing projects: propose, never impose                                                                           |

## Step 0 — harness × project matrix (dated 2026-10-21, re-audit when the harness changes)

Sources read on 2026-10-21: `https://code.claude.com/docs/en/memory.md`, `.../hooks.md`,
`.../env-vars.md`, `.../model-config.md`, `.../sessions.md` (memory and sessions pages through the
`claude-code-guide` agent — secondary; hooks and env-vars lines read directly with `curl`).

| Template section                                                                              | Verdict                      | Reason                                                                                                                                |
| --------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Persona, hard signals, read order copied from CLAUDE.md                                       | harness → removed            | CLAUDE.md of the cwd and its ancestors load at launch and are re-read after compaction                                                |
| Git log / commit list                                                                         | harness → removed            | readable by the next session; the memo keeps HEAD + unpushed list only                                                                |
| MEMORY.md entry 0                                                                             | harness mechanism → **used** | first 200 lines / 25 KB of `MEMORY.md` load at startup; other memory files only on demand — hence one index line pointing at the memo |
| History archive                                                                               | removed                      | chronology already in `project_visual_refonte_2026.md` / `project_tables_magiques.md`                                                 |
| Runtime state outside git (prod sha on Vercel, local servers, MCP browser tabs, render files) | **gap → Controls**           | pushing `master` deploys production (Vercel git integration, checked 2026-10-21: prod = `2c79fa9`, `githubCommitRef: master`)         |
| Pending items with the user's words verbatim, leads tried / not tried                         | **gap → Pending**            | lives nowhere else                                                                                                                    |
| Decisions awaiting the user (LCP options, votes…)                                             | **gap → Open items**         | idem                                                                                                                                  |
| Drift + this session's own errors                                                             | **gap → Pitfalls**           | corrections made mid-session are lost at the next start                                                                               |
| Fatigue                                                                                       | **gap → table in SKILL.md**  | compaction exists (auto-compaction at the auto-compact window) and costs context here (`feedback_compaction_is_session_end.md`)       |

## Compaction facts (for the T4 trigger and the hook proposal)

- `PreCompact` (matchers `manual` / `auto`): can only **block** compaction (exit 2 or
  `decision: "block"`); it cannot make the model write anything first. Blocking a compaction
  triggered by a context-limit error makes the request fail (hooks.md § PreCompact).
- `PostCompact` receives `compact_summary`; its `systemMessage` is discarded.
- `SessionStart` matcher `compact` fires after auto or manual compaction; stdout (exit 0) or
  `hookSpecificOutput.additionalContext` is added to Claude's context (hooks.md).
- `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` (1-100) can only **lower** the trigger percentage;
  `CLAUDE_CODE_AUTO_COMPACT_WINDOW` sets the window in tokens (env-vars.md lines for both).

## Proposals awaiting the user's decision (not wired)

1. **SessionStart `compact` hook** in `.claude/settings.json`, printing: "A compaction just
   happened: per feedback_compaction_is_session_end, refresh the memo with skill
   project-session-end (mode MEMO, T4) and stop." Cost: one small script; effect only after a
   compaction. The memo stays current at T1/T2 so the refresh is short.
2. **Lower the threshold** with `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` (e.g. `70`) so the compaction,
   and therefore the stop, comes before the context is saturated. Trade-off: shorter sessions.
3. **One line in `CLAUDE.md`**: "« reprise » → skill project-session-end mode RESUME; session end
   (T1-T5) → mode MEMO." Today the skill is found through its description only.

Thresholds proposed by me (not validated by the user): T1 = 3 commits (nfl-big-data-bowl-2027
recalibration, 2026-10-19: lower fired after 2 tasks); fatigue rows and limits in `SKILL.md`.

## Not done

Cold-start simulation (template README § "Simulation de démarrage à froid"): not run yet.
Forme forte: a real new session in this folder with the single word « reprise ».
