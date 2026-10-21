---
name: project-session-end
description: Two modes for Tables Magiques. RESUME — the user's message is « reprise » (usually the first of a session) → resume where the CURRENT memo stopped, never write a memo. MEMO — a trigger of the table below, e.g. the user says "session-end" / "fin de session" / "memo update" / "pause" / "STOP", or a compaction has just happened → write the session-end memo.
---

# Tables Magiques — session-end memo and « reprise »

One self-contained memo per session, so a fresh session resumes from the single word
**« reprise »**. It holds only what the harness does not carry by itself; the dated harness ×
project matrix in this folder's `README.md` decides which sections exist.

**Pick the mode first.** « reprise » → **Mode RESUME**. Anything else that triggered this skill →
**Mode MEMO**. « reprise » never produces a memo: at the start of a session there is nothing to
summarise.

MEMORY_DIR = `C:/Users/pierr/.claude/projects/C--Dev-Multiplications-magiques/memory`
PROJECT = `C:/Dev/Multiplications magiques/tables-magiques`

## Mode RESUME — « reprise »

1. **Re-read from disk, never from the injected copy** (it can be older than the files):
   `MEMORY_DIR/MEMORY.md`, the memo it marks CURRENT, `PROJECT/CLAUDE.md` and every
   `MEMORY_DIR/feedback_*.md` — Read tool, **whole file** (no offset/limit, no grep, no head/tail).
2. Run the memo's **Controls** block literally, every command, and compare each output with the
   expected value written next to it. A mismatch (HEAD, dirty tree, unpushed count, worktree)
   stops the resume: report it and fix it first. If the fix is a write outside the next action
   (commit or ignore an unexpected file…), **propose it and wait**, do not guess.
3. Read **every file of the memo's "Read in full" list, whole**. A file over the tool limit is
   read in consecutive chunks to its last line. Grep/head may locate, they never replace reading.
4. Answer the user (in French) with: the controls and their outputs; a **reading proof table**
   (`lines read / total`, total from `wc -l`); where the work stopped (from the memo, not from
   memory); the next action and what the files just read change in how to do it; any
   contradiction memo ↔ files (the files win, say so), including between the injected and the
   on-disk `MEMORY.md` / `CLAUDE.md`; the fatigue line, **counter reset to 0**.
5. Start the local part of the next action. External actions (below) wait for the explicit go.

**External actions** (never on a resume, never without the user's explicit go): `git push`
(pushing master redeploys production on Vercel), Vercel deploy/promote, sending or drafting
mail, publishing an artifact, deleting files outside the repo (e.g. `~/Downloads`).

## Mode MEMO — triggers

| Trigger       | Condition (countable)                                                                                                      |
| ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| T1 commits    | ≥ 3 commits since the HEAD written in the CURRENT memo: `git rev-list --count <hash>..HEAD`                                |
| T2 milestone  | a deploy/push to production, a user verdict on a visual vote, a merged branch                                              |
| T3 fatigue    | the fatigue table below reads ALERT or STOP                                                                                |
| T4 compaction | a compaction happened in this session (`feedback_compaction_is_session_end.md`): refresh the memo **and stop**             |
| T5 user words | "session-end", "fin de session", "memo update", "doc de reprise", "pause", "STOP" — **never « reprise » alone** (→ RESUME) |

Keep the memo current at every T1/T2 milestone, so that a compaction never finds it stale.

## Mode MEMO — steps

### 1 — Collect state (literal)

```bash
cd "/c/Dev/Multiplications magiques/tables-magiques"
git branch --show-current                    # expected: master
git rev-parse --short HEAD
git status --short | wc -l                   # expected: 0
git rev-list --count origin/master..master   # commits not pushed
git worktree list | wc -l                    # expected: 1
npm run typecheck 2>&1 | grep -c "error TS"  # expected: 0
npm run test:run 2>&1 | grep -E "Tests +[0-9]"   # expected: "N passed", 0 failed
```

Production identity (state outside git): the deployed sha of `tables-magiques.vercel.app` (Vercel
MCP `list_deployments`, or the last push's `git log origin/master -1 --format=%h`). Running
servers / browser sessions this session (ports, MCP tabs): free them before ending, and say so.

### 2 — Drift check (before writing)

Re-read the status lines of every plan/spec/verdict touched this session
(`docs/superpowers/plans/*`, `docs/VISUAL_*`, `docs/spikes/*/VERDICT.md`, `docs/perf/*`,
`docs/a11y/*`); what the session's results contradict is fixed in its file and committed now, or
listed in the memo's Pitfalls with why it stays. Statements made to the user that a later
measurement corrected are listed too.

### 3 — Commit everything, then write the memo LAST

The memo lives outside git; no commit follows it. Its HEAD is `git rev-parse --short HEAD` read
_after_ the last commit. Any later commit → re-read HEAD and fix the memo.

Write `MEMORY_DIR/session_<YYYY-MM-DD>_fin.md` (frontmatter `type: project`), in this order:

1. **Header** — its own path (a cold paste cannot resolve "this memo"), the HEAD it was written
   after, which memo it supersedes (delete that one), and how the session ended.
2. **Controls** — the step 1 commands, each with its expected value in a comment; the unpushed
   commits listed with "changes the app: yes/no"; the production sha.
3. **Read in full before acting** — absolute paths of every doc, script, skill the next action
   depends on.
4. **Pending, in order** — each item with the user's words verbatim when they set it, the leads
   tried / not tried, the exact commands to iterate, and what needs the user's decision.
5. **Other open items (do not guess)** — decisions awaiting the user, with where their options
   are written.
6. **Next action** — local part / external part (waits for the go).
7. **Pitfalls** — tool or environment traps met this session, and this session's own errors.
8. **Fatigue** — the table below, counted.

Verify before writing (fix first if one fails): every number was measured in step 1 (never
"TBD"/"expected"; empty → "none — <why>"); every path exists —

```bash
cd "/c/Dev/Multiplications magiques/tables-magiques"; MEMORY_DIR="C:/Users/pierr/.claude/projects/C--Dev-Multiplications-magiques/memory"
grep -o '`[^` ]*\(/\|\.md\|\.ts\|\.tsx\|\.py\|\.json\)[^` ]*`' <memo> | tr -d '`' | sort -u |
  while read p; do [ -e "$p" ] || [ -e "$MEMORY_DIR/$p" ] || echo "MISSING $p"; done
# expected: no output
```

### 4 — Index

In `MEMORY_DIR/MEMORY.md`, the first line points to the new memo ("CURRENT resume memo: …",
one line, ending with "on « reprise »: skill project-session-end, mode RESUME"); the previous memo
file is deleted (its content is superseded; the project chronology lives in
`project_visual_refonte_2026.md` / `project_tables_magiques.md`, update the relevant one).

## Fatigue — count, never estimate

| Indicator (this session)                                                     | OK  | ALERT | STOP     |
| ---------------------------------------------------------------------------- | --- | ----- | -------- |
| Compactions                                                                  | 0   | —     | ≥ 1 (T4) |
| Self-caused errors (wrong claim, bad command, broken file), corrected or not | 0-2 | 3-4   | ≥ 5      |
| Corrections by the user of my work or claims                                 | 0-1 | 2     | ≥ 3      |
| Previously green gate or test broken by a committed change                   | 0   | 1     | ≥ 2      |

A pre-commit catch fixed before the commit is the gate working, not an error. Level = worst row.
Line format: `Fatigue: <OK/ALERT/STOP> — <rows that are not OK, with counts>.`

## Anti-patterns

- Writing a memo on « reprise ».
- Resuming from the injected `MEMORY.md` / `CLAUDE.md` instead of the files on disk.
- "Read" by grep, head, offset or a summary — and claiming the file was read.
- Copying `CLAUDE.md`, git log or the persona into the memo (the harness loads them; a copy drifts).
- Memo written before the last commit (its HEAD is then wrong).
- An external action launched on a resume without the user's go.
- Continuing to work after a compaction instead of refreshing the memo and stopping.
