# The self-learning loop

The loop has one purpose: a mistake the user points out once should never come back. It does this with three Claude Code hooks, a searchable memory, a set of automated checks, and a gate that stops a session from ending while any of it is unfinished.

## 1. The three hooks

Installed into `~/.claude/settings.json` by `python3 tools/loop/install_hooks.py` (safe to re-run: it merges, never replaces; `--remove` uninstalls). All three stay silent outside video work: they only act when the working directory is this repo (or `~/video-animations`) or the prompt contains video words (video, reel, animation, voiceover, narration, storyboard, footage, mp4, captions, elevenlabs, transcribe, b-roll). Every hook swallows its own errors, so a bug in the loop can never break a session.

### SessionStart: `session_start.py` (timeout 15 s)
When a session opens in a video folder it puts four things in front of Claude:
1. The **core rules** from the top of `memory/LEARNINGS.md`.
2. The **three most recent lessons**.
3. **Fresh design moves** from `suggest_moves.py` that none of the last three films used.
4. A warning if `memory/`, `playbook/` or `evals/` have uncommitted changes (unsaved learning), plus a one-line reminder of the workflow.

### UserPromptSubmit: `capture_feedback.py` (timeout 15 s)
Runs on every prompt:
- **Ignores machine messages.** Prompts starting with `<task-notification`, `<system-reminder` or `[SYSTEM NOTIFICATION` are never captured. (Before 2026-11-13 these made up 14 of 48 inbox rows and polluted the lessons.)
- **Logs new-film requests.** A prompt like "make a new reel", "generate a video", "come up with another film" is appended to `memory/requests.jsonl`. This feeds the plan gate below.
- **Captures feedback word for word.** A prompt of five or more words that matches feedback language (wrong, fix, should, don't, overlap, better, boring, generic, needs to, too dark/slow/long, and similar) is saved verbatim to `memory/inbox.jsonl` with `handled: false`.
- **Retrieves lessons.** It runs BM25 search (`tools/qa/retrieve.py`) over all lessons and playbook lines and prints the top four that match the prompt, so the relevant rules appear next to the request.

### Stop: `stop_gate.py` (timeout 20 s)
Refuses to let Claude finish (it blocks once, then lets go; it never loops) while any of these is true:
1. **Unrecorded feedback.** Some row in `inbox.jsonl` is still `handled: false`. Record it with `record_lesson.py`, then run `mark_handled.py`.
2. **Missing plan (plan gate).** The newest request in `requests.jsonl` is under 24 hours old and no `projects/*/design_brief.json` has been written after it. The designer step cannot be skipped. If the designer truly was not run, Claude must say so plainly instead of finishing silently.
3. **Unchecked film.** A film project under `projects/` changed since `run_evals.py` last printed READY TO SHOW for that exact version (it stores a content hash in `memory/.evals_stamp.json`).

## 2. The memory

| File | Format | Purpose |
|---|---|---|
| `memory/lessons.jsonl` | one JSON per lesson | The searchable record. Fields: id, date, project, category, feedback (verbatim), symptom, cause, rule, check, tags, times_seen, user_confirmed |
| `memory/LEARNINGS.md` | markdown | The readable log, plus the **Core rules** at the top that every session loads |
| `memory/error_taxonomy.md` | markdown | The allowed lesson categories |
| `memory/design_log.jsonl` | one JSON per shipped film | Concept, the ten design dimensions, moves used, locked dimensions. The variety gate compares against the last three |
| `memory/experiments.jsonl` | one JSON per experiment outcome | kept / dropped / neutral for each tried move (created on first use) |
| `memory/requests.jsonl` | one JSON per new-film request | Feeds the plan gate |
| `memory/inbox.jsonl` | one JSON per captured feedback | Local only, gitignored; the librarian turns each row into a lesson |
| `memory/brand_blocklist.json` | colours | Lookalike colours for Claude branding (terracotta/orange, warm cream), used by `palette_check` |
| `playbook/EDITING_PLAYBOOK.md` | one-line rules | Rules promoted from lessons, grouped: Look, Layout, Motion, Maps, Facts, Audio, Process, Anti-slop |
| `playbook/DESIGN_MOVES.md` | moves library | About 40 moves across opening, transition, camera, typography, layout, motion device, texture; plus **Proven** and **Avoid** lists that the experiments fill in |

Lessons are append-only: never rewrite or delete one; add a new one or raise `times_seen`. At the time of writing there are 52 lessons (L001 to L052), mostly `brand-fit` (29), then `process-skipped-verification` (7), `layout-overlap` (4), `timing-sync` (4), `factual-claim` (2), `tooling-limit` (2), and one each of `safe-zone`, `attribution-license`, `layout-css`, `map-reuse`.

## 3. How a piece of feedback becomes a permanent rule

1. **Capture.** The user says something. The hook saves it verbatim to `inbox.jsonl`.
2. **Record.** The librarian (or you) runs
   ```
   python3 tools/qa/record_lesson.py --project P --category brand-fit \
     --feedback "the user's exact words" --symptom "what was wrong" \
     --cause "why it happened" --rule "what to do every time" \
     [--check facts_check] [--tags a,b]
   ```
   This appends to `lessons.jsonl` and `LEARNINGS.md`. If the meaning is unclear, ask one question; do not guess.
3. **Close.** `python3 tools/loop/mark_handled.py` marks the inbox rows handled so the stop gate lets go.
4. **Guard.** If a script can test the rule, add or extend a check in `tools/qa/` and add a case to `evals/cases.jsonl` (`id`, `lesson`, `title`, `check`). A rule with no check is only "guarded by process", which is the weakest kind and the cause of several repeat mistakes (see below).
5. **Promote.** When a lesson repeats (`times_seen` 2) or the user confirms it, copy its rule into `playbook/EDITING_PLAYBOOK.md` and, if it is universal, into the Core rules in `LEARNINGS.md`.
6. **Retrieve.** From then on `retrieve.py` surfaces it whenever a future prompt resembles its symptom or tags.

## 4. The innovation engine (always innovate)

Every new film must not look like the last one.
1. The **designer** reads the last three entries of `design_log.jsonl`, the moves library and the Avoid list, runs `suggest_moves.py`, and proposes three concepts.
2. The chosen concept is written to `projects/<name>/design_brief.json`: concept, `locked` dimensions, ten `dimensions` (palette, fonts, opening, transition, camera, layout, motion_device, texture, sound, ending), `moves`, and one `experiment` (a move never tried, with a hypothesis).
3. `novelty_check.py` fails when fewer than three **unlocked** dimensions differ from every one of the last three films, or when there is no experiment, or when the experiment move was already tried. Dimensions the user fixed (a reference palette, a client logo, brand fonts) are `locked` and may repeat.
4. When the film ships: `novelty_check.py PROJECT --record` appends it to the design log.
5. When the user reacts: `record_experiment.py --project P --move "..." --outcome kept|dropped|neutral --feedback "..."`. A move kept twice goes on the **Proven** list; a dropped move goes on the **Avoid** list.

## 5. Install on a new machine

```
git clone https://github.com/pocket-fund-2026/video-editor-brain ~/video-editor-brain
cd ~/video-editor-brain
python3 tools/loop/install_hooks.py          # installs the three hooks
python3 tools/qa/retrieve.py "test" -k 3     # sanity check: prints lessons
```
The hooks reference this repo by absolute path, so keep it at `~/video-editor-brain` (or re-run the installer after moving it). The hooks themselves live in `~/.claude/settings.json`, not in the repo; without the installer the loop does not run.

Commit identity: commits in this repo are authored as Tina. This machine has several GitHub accounts, so run `git config user.name` and `gh auth status` before committing or pushing.

## 6. Failure modes the loop has already had (and the fix)

These are real, from 2026-11-12 and 2026-11-13, and each became a lesson.
| What went wrong | Why | Fix (lesson) |
|---|---|---|
| A "new reel" request ended with no designer step and no brief | The gate only inspected projects that already existed; the designer step was a written rule | Plan gate: a logged request needs a newer `design_brief.json` (L050) |
| "No prices" came back after being a rule | `facts_check` allowed any price listed in `verified.json` | Prices are banned outright, verified or not (L049) |
| The inbox filled with background-task notices | Capture treated every long message as feedback | Machine messages are ignored (L050) |
| The reel was estimated at 30 to 60 more minutes | Each scene was polished before anything complete existed | Time budget up front and a rough full cut in about 20 minutes, then v2 (L052) |
| Opening on the account logo against the user's wish | A standing rule was applied without asking | Opening rule superseded by the user's explicit yes (L051); never replace a standing rule without it |

## 7. Honest limits

- Hooks can remind and block, but they cannot judge taste. `slop_check` is a floor, not a judge.
- A rule guarded only by "process" is easy to skip. Prefer a check.
- Retrieval is keyword (BM25), not semantic. It is fine for a few hundred lessons; `retrieve.py` marks the swap-in point for a vector backend.
- The plan gate only knows about requests the regex recognises ("new/another/next/generate/make/create ... reel/video/film").
