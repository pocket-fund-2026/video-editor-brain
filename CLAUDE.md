# video-editor-brain: how the AI edits video here

This repo is the memory and toolbox for editing videos with Claude. It gets better every time because every round of feedback becomes a lesson, and every lesson that a script can test becomes a check that blocks the next film.

## The loop runs automatically (hooks)
Three Claude Code hooks (installed with `python3 tools/loop/install_hooks.py`) run this loop for you in video folders: SessionStart loads the core rules, recent lessons and fresh design moves; UserPromptSubmit saves feedback word for word to `memory/inbox.jsonl` and surfaces the lessons that apply; Stop will not let you finish while feedback is unrecorded or a film changed since `run_evals.py` last passed. They stay silent outside video work.

## Always innovate
Never repeat the previous film's look. Run the `designer` agent first: it proposes 3 concepts, each changing at least 3 unlocked design dimensions against the last 3 films (`memory/design_log.jsonl`) and trying ONE move you have never used (`tools/loop/suggest_moves.py`, library in `playbook/DESIGN_MOVES.md`). Write the choice to `projects/<name>/design_brief.json`; `run_evals.py` fails without it. Palette and fonts stay locked when the user supplied a reference or brand. After the film ships: `tools/loop/novelty_check.py PROJECT --record`, and when the user reacts: `tools/loop/record_experiment.py` (kept / dropped / neutral).

## Before you touch a video
1. Read the **Core rules** at the top of `memory/LEARNINGS.md` and `playbook/EDITING_PLAYBOOK.md`.
2. Run `python3 tools/qa/retrieve.py "<what you are about to build>" -k 6` and obey the lessons it returns.
3. Ask the brief questions once: reference video and palette, length, platform, narration yes/no, who sees it (outside the company?).

## While building
- Build one scene at a time. Show a preview early (an Artifact with the Motion type, or rendered frames).
- Reuse, do not rebuild: the real-geography map engine is `projects/bombay-fort-reel/shared.js` (`FortMap`), data from `tools/maps/fetch_region.py`. Maps will be used a lot.
- Never put a price, opening hour or distance on screen unless it is verified (`verified.json`).

## Before you say a film is ready
- `python3 tools/qa/render_frames.py PROJECT --every 1.5 --sheet --out frames/` and LOOK at the sheets.
- `python3 tools/qa/run_evals.py PROJECT` must print READY TO SHOW.
- Hand the frames and the check output (not your own summary) to the `critic` agent and fix what it finds.

## After the user gives feedback (always)
- Run the `librarian` agent, or `tools/qa/record_lesson.py`, with the user's words verbatim. Ask one question if the meaning is unclear instead of guessing.
- If a script can test it, add the check and a case to `evals/cases.jsonl`.
- If the same lesson appears twice, or the user confirms it, promote the rule into `playbook/EDITING_PLAYBOOK.md`.
- Never delete or rewrite old lessons; add new ones. Say which lesson you applied in your final message.

## Git identity
Commits in this repo are authored as Tina <tina@jadecouture.com>. Check `git config user.name` and `gh auth status` before committing (this machine has several accounts).
