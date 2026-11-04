# video-editor-brain: how the AI edits video here

This repo is the memory and toolbox for editing videos with Claude. It gets better every time because every round of feedback becomes a lesson, and every lesson that a script can test becomes a check that blocks the next film.

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
