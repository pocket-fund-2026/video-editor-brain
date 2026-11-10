# Bombay Cafe Map x Javaphile Café, Worli reel (20 s, 1080x1920, 30 fps), two-ink risograph look
Latest cut: `out/javaphile-worli-v4-20s.mp4` (measured 20.000 s, 600 frames, constant 30 fps, yuv420p, faststart). Frame-diff tool: `framediff.py`.
- v4 changes: voice line 2 is now "Javaphile Cafe, Wawrlee" (phonetic spelling so Kokoro says Worli; whisper hears Java File Cafe, Warly), "three ways" voice line cut; persistent "Javaphile Café" tag (56 px, above the ring) from 5.4 s to the end card; end card shows Javaphile Café at headline size above a smaller lockup. Timeline: map 0-8.5, pour 8.5-11.9, toast 11.9-14.4, bowls 14.4-16.6, end 16.6-20.
- Opening (user: the hook must be Bombay Cafe Map): frame 0 is the real lockup, one cobalt ink on bone, large; at 1.3 s it settles into a top bar while a letter-O reveal opens the Mumbai island, which zooms into Worli (pin ~5.7 s, cafe name 6.0 s). The lockup stays as a top bar in every scene; the end card swaps it for the big stacked lockup with @bombaycafemap and bombaycafemap.com.
- Timeline: map 0-7.3 (logo hold to 1.3) -> pour 7.3-10.9 -> French toast three ways 10.9-14.2 -> grain bowl + tartine 14.2-16.6 -> end card 16.6-20 (3.4 s hold). Transitions: 12-frame letter-O reveal, the next scene already inside the counter, no blank frame.
- Logo: geometry copied from the real `brand/logo/bombaycafemap-icon.svg` (steaming cup; coffee band as a one-ink halftone), wordmark typeset in the brand serif (Newsreader, roman + bold Map, as in the real lockup PNGs). Originals copied to `assets/`. NOTE: the real files use a cup icon and Newsreader; the earlier notes (pin-and-bean, Fraunces italic Map) describe the live site, not these brand files.
- Voice: `narration.json` lines at Kokoro "heart" speed 0.5 (0.88-0.92 could not meet 2.2 words/s for line 1), per-line clips in `voice/`, placed at 0.3, 6.1, 7.5, 11.1, 17.0 s. Words/s: line 1 (11 words, 5.38 s) 2.04; "Worli" 1 word; line 3 1.66; line 4 1.59; line 5 (5 words, 2.30 s, slowed 7% with atempo) 2.18. Air between lines >= 0.4 s.
- Render: `python3 tools/three/render_three.py projects/javaphile-worli/film.html FRAMES --full --jpeg --fps 30 --dur 20` (playwright venv python), then ffmpeg with `audio/mix.wav` (voice, `audio/foley.wav`, `audio/music.wav`).
- Checks: `python3 tools/qa/run_evals.py projects/javaphile-worli` -> READY TO SHOW (11/11).
Map data: OpenStreetMap contributors (credit on screen while the map shows).

## Open items
- Facts come from two press articles only (no official Javaphile page); no hours, prices, address, score or storefront on screen. Food is 3D-modelled from press descriptions; tiramisu / raspberry / blueberry are captions only (voice says "three ways"). The chia bowl was cut for time.
- Frame diffs on the mp4: median 3.18; outside transitions max 17.0 (toast slice landing, 11.53 s); inside transitions max 38.1 (1.53 s).
- Bowls scene is small in frame (two dishes shown together from a high camera). Coffee now reads dark blue with a pale crema but is not natural brown (two-ink look kept).
- Map pin is the area point, labelled only "Worli". `tools/qa/overlap_check.py` tolerates films without `#logo`.
- Not done: `novelty_check.py --record` and `record_experiment.py` after the user reacts. Nothing committed or pushed.
