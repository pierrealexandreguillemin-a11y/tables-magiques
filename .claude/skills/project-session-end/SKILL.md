---
name: project-session-end
description: Tables Magiques session memo, light version. RESUME — the user's message is « reprise » (or a pasted end-of-session summary) → resume from the CURRENT memo, never write one. MEMO — the user says "session-end" / "fin de session" / "memo update" / "pause" / "STOP", 3+ commits since the memo's HEAD, a prod push, a vote verdict, or a compaction just happened → write the memo.
---

# Tables Magiques — session memo (light)

Light by request of the user (2026-10-22: « skill à adapter light/rapide »). Goal: a resume in
under a minute, a memo in under two. Source template (full form, 18 sections):
`C:/Dev/skills-templates/project-session-end/`; what this projection keeps and why: `README.md`.

MEMORY_DIR = `C:/Users/pierr/.claude/projects/C--Dev-Multiplications-magiques/memory`
PROJECT = `C:/Dev/Multiplications magiques/tables-magiques`

## Mode RESUME — « reprise »

1. Read from disk, whole file: `MEMORY_DIR/MEMORY.md` and the memo it marks CURRENT.
   (`CLAUDE.md` and the auto memory index are loaded by the harness: do not re-read them.)
2. Run the memo's **Controls** (git only, a few seconds) and compare with the expected values. A
   mismatch → say it; a fix that writes outside the next action → propose and wait.
3. Read whole only the "Read in full" files the **next action** needs, when it starts — not the
   whole list up front.
4. Answer in French, short: controls (obtained vs expected), where the work stopped, the next
   action, the decisions waiting for the user, `Fatigue: OK — counter reset to 0.`
5. Start the local part of the next action. External actions wait for an explicit go.

**External actions** (never without the user's go): `git push` (master redeploys production on
Vercel), Vercel deploy/promote, mail, publishing an artifact, deleting files outside the repo.

## Mode MEMO

Triggers: 3+ commits since the memo's HEAD (`git rev-list --count <hash>..HEAD`); a prod push; a
user verdict on a vote; a compaction this session (then refresh the memo **and stop**,
`feedback_compaction_is_session_end.md`); the user's words above — never « reprise » alone.

1. **Commit everything first.** Then collect:

   ```bash
   cd "/c/Dev/Multiplications magiques/tables-magiques"
   git rev-parse --short HEAD; git status --short | wc -l            # expected dirty: 0
   git rev-list --count origin/master..master                       # unpushed
   ```

   Prod sha: Vercel MCP `list_deployments` (project in `.vercel/project.json`), limit 1. Free the
   servers and browser tabs opened this session.

2. **Write** `MEMORY_DIR/session_<YYYY-MM-DD>_fin.md` (frontmatter `type: project`), short:
   - **Header**: its own path, HEAD written after, the memo it replaces (delete that file).
   - **Controls**: the git lines above with expected values; unpushed commits with "changes the
     app: yes/no"; prod sha.
   - **Pending, in order**: the user's words verbatim, what was tried, what needs the user.
   - **Read in full**: absolute paths the next action depends on.
   - **Pitfalls**: traps met and this session's own errors (one line each).
   - **Fatigue**: one line from the table below.
3. **Index**: first line of `MEMORY_DIR/MEMORY.md` → "CURRENT resume memo: … on « reprise »:
   skill project-session-end, mode RESUME". Update `project_visual_refonte_2026.md` /
   `project_tables_magiques.md` if a milestone moved.

## Fatigue — count, never estimate

| Indicator (this session)                      | OK  | ALERT | STOP |
| --------------------------------------------- | --- | ----- | ---- |
| Compactions                                   | 0   | —     | ≥ 1  |
| Self-caused errors (wrong claim, bad command) | 0-2 | 3-4   | ≥ 5  |
| Corrections by the user                       | 0-1 | 2     | ≥ 3  |
| Green gate broken by a committed change       | 0   | 1     | ≥ 2  |

Line: `Fatigue: <OK/ALERT/STOP> — <rows not OK, with counts>.`

## Never

- A memo on « reprise »; an external action on a resume.
- A memo written before the last commit (its HEAD is wrong).
- Copying `CLAUDE.md` or git log into the memo.
- Working on after a compaction instead of refreshing the memo and stopping.
