# The editing agents

Four agents live in `.claude/agents/`. Claude Code can run each as a subagent. They are deliberately narrow: the one that proposes the look never builds it, the one that builds never judges it, and the one that judges never fixes. That separation is what makes the review honest.

| Agent | Role in one line | Tools | May write? |
|---|---|---|---|
| `designer` | Creative director: three concepts, one experiment, writes the brief | Read, Write, Edit, Bash, Glob, Grep | `design_brief.json`, nothing else |
| `editor` | Builds or revises the film one scene at a time | Read, Write, Edit, Bash, Glob, Grep | The project's scenes, data, scripts |
| `critic` | Independent reviewer of frames and check output | Read, Bash, Glob, Grep | Nothing: reports only |
| `librarian` | Memory keeper: retrieve before, record after | Read, Write, Edit, Bash, Glob, Grep | `memory/`, `playbook/`, `evals/` |

## designer

**When:** at the start of every new film, before anything is built.

**Does:**
1. Reads `memory/design_log.jsonl` (the last three films), `playbook/DESIGN_MOVES.md` (the Proven and Avoid lists) and the user's brief. Notes what is **locked**: a reference video's palette, a brand, fonts the user supplied.
2. Runs `python3 tools/loop/suggest_moves.py -n 6` for moves not used recently.
3. Proposes **three** concepts (safe, fresh, wild). Each must change at least three unlocked dimensions (opening, transition, camera, layout, motion devices, texture, sound, ending) against the last three films, and must include one move the project has never tried.
4. Recommends one and names the single **experiment** move with a hypothesis.
5. After the user chooses, writes `projects/<name>/design_brief.json` (concept, locked, dimensions, moves, experiment) and checks it with `novelty_check.py`.
6. When the film ships and the user reacts, records the outcome with `record_experiment.py` and logs the film with `novelty_check.py ... --record`.

**Output the user should see before any build starts** (rules L039, L041, L048): the animation count and which are new versus the last three films, the full scene-by-scene script (voice, on-screen text, sound), the palette with swatches, and a stage-by-stage map-zoom spec. The user approves, then the build begins.

**Must not:** build scenes, change a locked dimension, or reuse the previous film's look.

## editor

**When:** for any new film or edit round, after the brief is approved.

**Does:**
1. Reads the Core rules in `memory/LEARNINGS.md` and runs `python3 tools/qa/retrieve.py "<task>" -k 6`, then obeys what it returns.
2. Builds **one scene per step**. Reuses the existing map engine instead of rebuilding it (`projects/bombay-fort-reel/shared.js`, `FortMap`; region data from `tools/maps/fetch_region.py`).
3. Puts no unverified price, hour or distance on screen, and, since 2026-11-13, no price at all.
4. After each scene, renders frames (`tools/qa/render_frames.py`, or `raea render` for raea projects) and **looks at them**.
5. Is not finished until `run_evals.py` prints READY TO SHOW **and** the critic has reviewed the frames.
6. Ends its final message by listing the lesson ids it applied.

**Must not:** call a film ready on the strength of "the code parses" (L006), skip the voice-timing source of truth (L046), or polish scene by scene before a complete rough cut exists (L052).

## critic

**When:** before the user is shown anything.

**Receives:** rendered frames (contact sheets) and the output of `run_evals.py`. It never receives the editor's explanation, so it cannot be talked into agreeing.

**Looks for:** text overlap or repeated text, anything under the Reels buttons, a palette that resembles Claude branding (orange/terracotta, warm cream) or looks generic AI-made, unreadable small text, jumpy or crowded composition, unverified claims, missing credits.

**Output:** findings ranked by how much a viewer would notice, each naming the frame (scene and second). If it finds nothing, it says what it checked and why it believes the film is clean.

**Must not:** fix anything. It reports only.

**Known limitation:** Claude Code subagents started from a fork cannot spawn further agents. When a build runs inside a fork, the critic step has to be run from the main session, or the report must say plainly that the real critic did not run (this happened on the Kyani & Co. v1 build).

## librarian

**When:** at the start of every project (retrieve) and after every round of feedback (record).

**Does:**
- **Before a task:** runs `retrieve.py "<task>" -k 6` and returns the rules that apply plus any playbook lines.
- **After feedback:** runs `record_lesson.py` with the user's exact words, picks a category from `memory/error_taxonomy.md`, and states the symptom, the cause and a one-line rule. If the meaning is unclear it asks the user **one** question rather than guessing.
- **Guards:** if a script can test the rule, proposes a check and adds a case to `evals/cases.jsonl`.
- **Promotes:** if a lesson repeats (`times_seen` 2) or the user confirmed it, copies its rule into `playbook/EDITING_PLAYBOOK.md` and the Core rules in `LEARNINGS.md`.

**Must not:** delete or rewrite earlier lessons. It adds new ones or raises `times_seen`.

## How they hand off

```
user request
   │
   ▼  librarian: retrieve ───────────────► rules that apply
   │
   ▼  designer: 3 concepts + 1 experiment ► design_brief.json ──► user approves script
   │
   ▼  editor: scene 1 … scene N ─────────► frames, run_evals.py ► READY TO SHOW
   │
   ▼  critic: frames + check output ─────► ranked findings ──► editor fixes
   │
   ▼  user reacts
   │
   ▼  librarian: record_lesson ─────────► lessons.jsonl, evals/cases.jsonl, playbook
```

## Skills the agents lean on (`.claude/skills/`)

| Skill | Used for |
|---|---|
| `edit-video` | The cut-and-captions workflow for existing footage |
| `motion-design` | Code-only motion pipeline: brief, beat map, stills, seek(t) HTML engine, render, music and SFX, QA |
| `raea` | Writing and rendering React/TypeScript compositions with the Render Anything Engine; 3D, games, footage cut by words, local foley |
| `threejs-*` (13) | The 3D map, buildings, materials, lighting, postprocessing, loaders and performance work |

The raea skill is raea's own material (FSL-1.1-ALv2) installed by `curl -fsSL https://raea.io/install | sh`; keep this repo private or check that licence before making it public.
