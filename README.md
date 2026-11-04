# YT talking: transcripts, scripts and reel plan

- `REEL_SCRIPT.md` the reel script (53 s, 9:16), look and motion spec, plus the long vlog script
- `transcripts/` word-level Gemini transcripts of six raw DJI clips (0617 to 0622)
- `scripts/`, `SCRIPT_ALL.md` timestamped readable scripts, built by `make_script.py`
- `style-references/` transcripts and frame sheets of the three reference reels
- `tools/transcribe_gemini.py` the video-use `transcribe.py` with a Gemini fallback and retries (reads `GEMINI_API_KEY` from `.env`, no key is stored here)

Timestamps come from an LLM, not forced alignment: spot-check before cutting on them. The videos themselves (about 3 GB each) are not in this repo.

## Learning loop (added 2026-11-04; this repo was renamed from `reel-studio`)
The AI reads `CLAUDE.md`, applies the rules in `memory/LEARNINGS.md`, builds, runs `tools/qa/run_evals.py`, and records every piece of feedback with `tools/qa/record_lesson.py`. Agents live in `.claude/agents/` (editor, critic, librarian). The real-geography map engine for reuse is in `projects/bombay-fort-reel/`. Design notes: `HARNESS_NOTES.md`. The older timing-based learner is `studio/learn/learn.py`.
