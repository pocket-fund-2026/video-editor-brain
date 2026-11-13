# Workflow: from request to shipped reel

This is the exact sequence. Each step names the tool and what "done" means. The worked example at the end is the Kyani & Co. reel (2026-11-13).

## 0. Setup (once per machine)
- Clone to `~/video-editor-brain` and run `python3 tools/loop/install_hooks.py` (see SELF_LEARNING_LOOP.md).
- For the raea render path install raea **0.1.1 (stable)**. The default installer picks the newest release, which on 2026-11-13 was a release candidate, and its 265 MB download failed at 34% with a connection reset. Reliable recipe:
  ```
  mkdir -p /tmp/raea-dl/v0.1.1 && cd /tmp/raea-dl/v0.1.1
  curl -fsSL https://github.com/shinyobjectz/raea/releases/download/v0.1.1/raea-0.1.1-macos-arm64.tar.gz.sha256 -o raea-0.1.1-macos-arm64.tar.gz.sha256
  curl -fL -C - --retry 5 -o raea-0.1.1-macos-arm64.tar.gz https://github.com/shinyobjectz/raea/releases/download/v0.1.1/raea-0.1.1-macos-arm64.tar.gz
  shasum -a 256 -c raea-0.1.1-macos-arm64.tar.gz.sha256
  curl -fsSL https://raea.io/install -o /tmp/raea-install.sh
  RAEA_VERSION=0.1.1 RAEA_DOWNLOAD="file:///tmp/raea-dl" sh /tmp/raea-install.sh
  raea --version     # 0.1.1
  ```
  Read the installer before running it: it only downloads the GitHub release, verifies the checksum, installs under `~/.raea`, links `~/.local/bin/raea`, and copies raea's skills into `~/.claude/skills`.

## 1. Brief (ask once)
Ask: reference video and palette, **length** (default about 20 s for cafe reels, L034), platform, **narration yes/no**, who sees it. Do not ask for a storefront photo (L033).

## 2. Retrieve
`python3 tools/qa/retrieve.py "<what you are about to build>" -k 6` and obey the lessons. The UserPromptSubmit hook already prints the top four for every prompt.

## 3. Pick the subject and verify the facts
For a cafe reel with no cafe named (L048): choose one **not yet featured** (check `memory/design_log.jsonl`), and verify its facts on its bombaycafemap.com page. Write `projects/<name>/FACTS.md` and `verified.json`. Rules:
- **No prices, ever** (L049). Name the food items instead, and take dish names from sources you can cite. If the cafe's own page names none, search outside sources and list them with their origin in `FACTS.md`; mark what you could not confirm as do-not-use.
- No hours or distances on screen unless verified. Measure map distances before saying them.
- Say "one of the oldest", never "the oldest", without a source.
- Do not show a page's headline score if it conflicts with another page (Araku showed 2.1/5 on its page and 3.6 on the homepage).

## 4. Design (designer agent)
Three concepts, one experiment, new-versus-last-three list, then write `design_brief.json` and run `python3 tools/loop/novelty_check.py projects/<name>`. Palette and fonts stay locked when the user supplied a reference or brand. Never orange or terracotta with cream (L001).

## 5. Script (approval required before building)
Show the user: full scene-by-scene script (voice, on-screen text, sound), the map-zoom spec stage by stage, the animation count with the new-versus-last-three list, and palette swatches. Rules that always apply to Bombay Cafe Map reels:
- Hook in the first 2 seconds; about 20 s; end card held about 3 s.
- Opening as of 2026-11-13: the **cafe's name first**, no Bombay Cafe Map logo in scene 1; a small top-bar Bombay Cafe Map mark from scene 2; end on the **large Bombay Cafe Map lockup with @bombaycafemap and bombaycafemap.com** (L051, supersedes L037).
- The cafe is named three ways (L038): spoken, a persistent name tag in every food scene, big on the end card.
- Narration at most about 2.2 words per second (L036). No tea or chai pour as the hero shot; vary the hero food per reel (L041).
- Text only in y 250-1500 and left of x 960 (L003); no text twice in one frame (L002).
- Show "Map data: OpenStreetMap contributors" whenever OSM is used (L005).

## 6. Voice and timing
Generate narration separately (Ripping's free Kokoro voice; ElevenLabs library voices need a paid plan, L011), mix with ffmpeg, then get **word times** (whisper). `data/timing.json` (or `data_timing.json`) is the **single clock** (L044, L046, L047): every caption word and every key animation fires from it, and a project-level `verify_sync.py` must show each caption/animation pair within 0.15 s. Caption text must name what is on screen at that moment. Note that forced alignment can fail on short or merged words (digits, "keema pav"); check them.

## 7. Build
**One scene at a time.** Reuse, do not rebuild: the map engine is `projects/bombay-fort-reel/shared.js` (`FortMap`) with data from `tools/maps/fetch_region.py`; use the real logo files fetched from the site and the project's own 3D food models, never CSS stand-ins (L043); give map buildings a detail pass (heights from OSM levels, roofs, edges, lighting) and hand-model the cafe's own building (L042). Build foley with the scenes (`tools/audio/build_foley.py`, `sfx.json`) and mux it into every preview (L014).

**Time budget (L052):** render a complete rough first cut of the whole reel (voice, foley, end card) within about 20 minutes, then polish in v2. Never polish scene by scene before the whole film exists.

### Two render paths
| | HTML + Playwright (the original) | raea (new) |
|---|---|---|
| Source | `scenes/`, `shared.js`, `base.css`, `scenes.json` | `*.tsx` composition, e.g. `kyani.tsx` |
| Frames | `tools/qa/render_frames.py PROJECT --every 1.5 --sheet --out frames/` | `raea render X.tsx -o f.png --frame N`, `raea media sheet out.mp4 -o sheet.png` |
| Video | `tools/qa/render_video.py PROJECT out.mp4 --voice v.wav` | `raea render X.tsx -o out.mp4` (GPU, about 28 ms per frame on the test composition) |
| Text and safe-area check | `overlap_check.py` | `raea check X.tsx --quick`, and on the finished mp4 |
| Loudness | ffmpeg | `raea media loudness out.mp4` (aim near -14 LUFS, true peak under -1 dBTP) |
| 3D map | three.js `FortMap` | Bevy meshes written in TSX (OSM buildings extruded by height) |
raea's HTML renderer has no WebGL, so the existing three.js map engine cannot run through it; the map has to be rebuilt as raea meshes. Muxing is plain ffmpeg in 0.1.1, foley comes from `build_foley.py` (raea's own `raea sao` needs a model download), and narration timing comes from whisper.

## 8. Verify before showing (L006)
1. Render frames and **look at them**: a contact sheet of the whole film, not a spot check.
2. `python3 tools/qa/run_evals.py projects/<name>` must print **READY TO SHOW** (palette, facts, novelty, slop, overlap, plus the regression cases).
3. Hand the **frames and the check output** (not your summary) to the `critic` agent and fix what it finds. If you are inside a fork and cannot run it, say so.
4. Listen to the audio once, especially names and years.

## 9. Ship and learn
- `python3 tools/loop/novelty_check.py projects/<name> --record` logs the film to the design log.
- Show the user the file and the check output. Say which lessons you applied.
- On any reaction: record it verbatim with `record_lesson.py`, add a check and case if testable, run `mark_handled.py`, and when the user reacts to the experiment run `record_experiment.py`.
- Commit as Tina after checking `git config user.name` and `gh auth status`. Generated media (frames, wav, most mp4) is gitignored; commit the final mp4 only when asked.

## Worked example: Kyani & Co., Marine Lines (2026-11-13)

| Step | What happened |
|---|---|
| Request | "come up with a new reel for bombaycafemap instagram" with the raea repo link |
| Retrieve | L048, L037, L039, L021, L041 surfaced |
| Subject | Araku Coffee was proposed first; its page named no dishes, so it was dropped. A scan of 191 site pages found Kyani & Co. (1904, Irani cafe, not yet featured). Dishes verified from outside sources: bun maska, mawa cake, keema pav, Parsi chicken patties, Irani chai. Shrewsbury biscuits and "best brun maska" were left out as unconfirmed |
| Design | "Marble Top": top-down table, ceiling-fan spin, chequered tablecloth wipe, bun split with butter melt, mawa cake slice, handwritten bill, variable-weight headline pulse as the experiment. Palette ink `#121316`, marble `#F1F4F6`, Irani red `#D0344A`. Six of seven animations new |
| Script | Approved after one change: open on the cafe name, end on Bombay Cafe Map (L051) |
| Build | Voice (Kokoro) with whisper word times, real logo files, OSM buildings for Marine Lines as raea meshes, hand-modelled Jer Mahal Estate, foley from `build_foley.py`, 675 frames rendered by raea, muxed with ffmpeg |
| Checks | `run_evals` READY TO SHOW, 13/13 cases; `raea check` 0 errors; -14.6 LUFS |
| Review by eye | v1 is a rough cut. Defects: low-contrast "& Co." in the first frame, a counter passing through "1872", flat 2D food on a mostly empty frame, keema pav never shown, empty map between island and building |
| Open for v2 | Fix the defects above, run the real critic, listen to the pronunciation of "Kyani" |
