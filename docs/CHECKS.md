# Automated checks and regression cases

`python3 tools/qa/run_evals.py projects/<name>` runs every check, then reports each regression case. A film is **not ready to show** until it exits 0 and prints READY TO SHOW. When it passes, it records a content hash of the project in `memory/.evals_stamp.json`, which the Stop hook reads.

## The five checks

| Check | Script | Fails when | Lessons |
|---|---|---|---|
| `palette_check` | `tools/qa/palette_check.py` | A colour in the film's CSS, `shared.js` or scenes sits close to a Claude-branding lookalike in `memory/brand_blocklist.json` (terracotta/orange, warm cream). `--max-delta 22` sets how close counts. Client logo colours are allowed via the project's `palette_allow.json` | L001 |
| `facts_check` | `tools/qa/facts_check.py` | **Any price** (₹, Rs, INR, "rupees") appears in scenes or narration lines, **even if listed in `verified.json`**; a clock time (11am, 4 pm, 11:30) appears that `verified.json` does not list; the project uses OSM data but no "OpenStreetMap contributors" credit is on screen; for film-style projects, a spoken sentence is not in `verified.json`'s `strings`. Scans `*.tsx` and `voice_lines.json` for raea projects | L004, L005, L030, L049 |
| `novelty_check` | `tools/loop/novelty_check.py` | There is no `design_brief.json`; fewer than three unlocked dimensions are new against the last three logged films; there is no experiment; or the experiment move was already tried | L012 |
| `slop_check` | `tools/qa/slop_check.py` | Only when the brief has `"anti_slop": true`: more than one gradient, any glow (shadow blur over 12 px, filter blur or drop-shadow), any emoji, `backdrop-filter`, or more than six uniform pill/card radii. It is a floor, not a judge of taste | L013 |
| `overlap_check` | `tools/qa/overlap_check.py` | Two text blocks overlap or text leaves the frame, sampled every 0.5 s. WARN for text in the platform UI zones (top 250, bottom 420, right 120 px of 1080x1920). For raea projects it delegates to `raea check` | L002, L003, L031 |

## Regression cases (`evals/cases.jsonl`)

Each is a past mistake that must not come back. `run_evals.py` marks a case BAD when the check it points to fails.

| Case | Lesson | What it protects | Check |
|---|---|---|---|
| C001 | L001 | Palette must not look like Claude branding | palette_check |
| C002 | L002 | No overlapping or duplicated text on the end card | overlap_check |
| C003 | L003 | Text stays out of the platform UI zones | overlap_check |
| C004 | L004 | No unverified prices or hours on screen | facts_check |
| C005 | L005 | OpenStreetMap credit on screen | facts_check |
| C006 | L008 | Nothing runs outside the frame | overlap_check |
| C007 | L012 | A new film changes at least 3 unlocked dimensions and tries one new move | novelty_check |
| C008 | L013 | New films avoid AI-slop defaults (gradients, glow, blur, emoji, uniform cards) | slop_check |
| C009 | L029 | No repeated device and no overlapping elements in any frame of a storyboard or film | overlap_check |
| C010 | L031 | End-card logo never masked mid-transition; no text collides, checked every 0.25 s | overlap_check |
| C011 | L030 | Every spoken line is a sourced fact listed in verified.json | facts_check |
| C012 | L049 | No price (rupee sign, Rs, INR) on screen or in narration, even if listed in `verified.json` | facts_check |
| C013 | L050 | A new-film request needs a newer `design_brief.json` before the session can finish; machine notices are never captured as feedback | novelty_check (see gaps) |

## Beyond `run_evals`

| Tool | Purpose |
|---|---|
| `tools/qa/retrieve.py "<task>" -k 6` | BM25 search over lessons and playbook lines |
| `tools/qa/render_frames.py PROJECT --every 1.5 --sheet --out frames/` | Contact sheets of a whole HTML film (also `--times scene:t,...`) |
| `tools/qa/render_video.py PROJECT out.mp4 --voice v.wav` | Render an HTML film to mp4 with narration |
| `tools/qa/record_lesson.py` | Write a lesson (the librarian's write path) |
| `tools/loop/suggest_moves.py -n 6` | Design moves not used in the last three films |
| `tools/loop/record_experiment.py` | Record an experiment outcome; feeds the Proven and Avoid lists |
| `raea check X.tsx --quick` | Three stills checked for clipped or cramped text and safe areas, about a second |
| `raea media loudness FILE` | LUFS and true peak |
| `raea media probe / sheet / freezes / cuts` | Container facts, contact sheet, frozen-frame and cut detection |

## Known gaps (as of 2026-11-13)

1. **`palette_check` is hollow for raea projects.** It reads CSS and JS colours only, so on a `.tsx` composition it reports "0 colors checked" and passes. A TSX colour reader is still to be written.
2. **C013 is only partly tested.** It points at `novelty_check`, but the plan gate lives in `stop_gate.py`, which `run_evals` does not exercise. It was verified by hand.
3. **No project-level sync check for raea projects.** `verify_sync.py` exists for the Bombay Island project and has to be copied per project (L047). Captions and animations read the same word times, so sync holds by construction, but words the aligner merges (digits, "keema pav") share a time.
4. **Pronunciation is never checked.** No script can tell that a name is spoken wrongly; a human has to listen.
5. **The critic cannot run from inside a fork.** The main session must run it, or the report must say it did not run.
6. **Price rule is a regex.** It catches ₹, Rs, INR and "rupees". A price spelled in words ("three hundred") or an image of a menu would pass; the critic and a human look are the backstop.
