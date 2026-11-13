# video-editor-brain docs

This repo is a memory and a toolbox for making short vertical videos (Instagram Reels, 1080x1920) with Claude Code. Every round of feedback becomes a lesson, every lesson a script can test becomes a check, and every check blocks the next film until it passes. These docs explain how the pieces fit.

| Read this | When |
|---|---|
| [SELF_LEARNING_LOOP.md](SELF_LEARNING_LOOP.md) | You want to know what the three hooks do, where lessons live, how a lesson becomes a rule and a check, and how to install it on a new machine |
| [AGENTS.md](AGENTS.md) | You want to know what the designer, editor, critic and librarian each do, what they may and may not touch, and how they hand work to each other |
| [WORKFLOW.md](WORKFLOW.md) | You want the exact steps for a new film, from request to shipped reel, including the raea render path and a worked example (Kyani & Co.) |
| [CHECKS.md](CHECKS.md) | You want the list of automated checks, what each one fails on, the 13 regression cases, and the known gaps |

## The idea in one picture

```
 user request ──► capture_feedback hook ──► requests.jsonl / inbox.jsonl
                         │
                         ├─► retrieve.py: top lessons for this task
                         ▼
 designer (3 concepts, 1 experiment) ──► projects/<name>/design_brief.json
                         ▼
 editor builds one scene at a time ──► render frames ──► LOOK at them
                         ▼
 run_evals.py (palette, facts, novelty, slop, overlap) ──► READY TO SHOW
                         ▼
 critic reviews frames + check output only ──► fixes
                         ▼
 user sees the film ──► feedback ──► librarian: record_lesson.py ──► lessons.jsonl
                                                     │
                                                     ├─► regression case in evals/cases.jsonl
                                                     └─► playbook / core rules when repeated
 stop_gate hook refuses to end a session while any of this is unfinished
```

## Where things live

| Path | What it is |
|---|---|
| `CLAUDE.md` | The short instruction file Claude reads first in this repo |
| `.claude/agents/` | Agent definitions: `designer`, `editor`, `critic`, `librarian` |
| `.claude/skills/` | Skills used while editing: `edit-video`, `motion-design`, `raea`, and the 13 `threejs-*` skills |
| `tools/loop/` | The learning-loop hooks and the design variety tools |
| `tools/qa/` | Retrieval, lesson recording, frame rendering, and every check |
| `tools/maps/`, `tools/voice/`, `tools/audio/`, `tools/three/` | Map data fetch, narration and timing, foley, 3D stills |
| `memory/` | `LEARNINGS.md` (readable), `lessons.jsonl` (searchable), `design_log.jsonl` (film history), `requests.jsonl`, `error_taxonomy.md`, `brand_blocklist.json` |
| `playbook/` | `EDITING_PLAYBOOK.md` (one-line rules) and `DESIGN_MOVES.md` (the innovation library) |
| `evals/cases.jsonl` | Regression cases: each is a past mistake pointing at the check that guards it |
| `projects/<name>/` | One folder per film: brief, facts, script, scenes or composition, data, voice, output |

Not versioned on purpose: `memory/inbox.jsonl` (your raw feedback), `memory/.evals_stamp.json`, rendered frames, audio and most generated video.
