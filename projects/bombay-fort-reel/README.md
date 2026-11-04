# Bombay Fort reel: Britannia & Co (52 s, 1080x1920)
Source of the film published as a Motion artifact. Script: `SCRIPT.md`. Scenes: `scenes/`. Real-map engine: `shared.js` (`FortMap`, `Logo`). Data: `data/map.json` (207 buildings, 164 roads around Britannia) and `data/mumbai.json` (city outline, mid-zoom streets and footprints). Score: `score.js`. Narration: see `tools/voice/`.
- Check it: `python3 tools/qa/run_evals.py projects/bombay-fort-reel`
- Frames: `python3 tools/qa/render_frames.py projects/bombay-fort-reel --every 1.5 --sheet --out frames/`
- Feedback received and applied: L001 (palette looked like Claude's branding, now the reference reel's gold / cool white / cyan on near-black), L002 (end card text overlap, now measured and checked).
- Open: hours and prices unverified so not shown; distance between the two cafes is 161 m on the OSM map versus 80 m on the site, so no distance is shown; pronunciation of the narration not checked by ear.
