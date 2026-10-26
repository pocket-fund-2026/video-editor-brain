# 700 pharmacies reel

Everything for the first reel, built from Dev's London recordings (clip 0621).

- `REEL_FINAL_SCRIPT.md` final spoken script, cut list with exact source times, captions, and the on-screen plan with every time
- `clip0621_full_transcript.txt` the whole clip, word for word (Whisper medium)
- `timeline.json`, `params.json` the cut points and the timings every graphic is built from (derived from real word times)
- `animation/` the graphics: `gfx/gfx2.html` (GSAP timelines, one per card), `render2.py` renders each as a transparent PNG sequence, `compose*.py` previews them over a real frame. `gfx_v1_superseded.html` is the first design, replaced. Needs the Montserrat ExtraBold and Cormorant Garamond 600 font files in `fonts/` (open licences); swap in Gotham there when supplied.
- `design-comps/graphics_preview.mp4` the five animated graphics playing in order over a frame of the footage (no captions, no audio)
- `design-comps/` the graphics over a frame of the footage with captions. `final_sheet_uncropped.png` and `G_*.png` are the current layout (footage uncropped, in a band); the older `superseded_*` and `F_*` files used a cropped portrait strip
- `reference-reels/` the six inspiration reels: Whisper transcripts, frame sheets, and the times each visual changes, plus the scripts that produced them

Not included: the rendered frame sequences (150 MB), the videos, and any API keys.
