# Editing playbook (rules promoted from lessons; keep each rule one line)

## Look
- Use the palette of the reference video the user supplied; confirm before changing it.
- Avoid orange/terracotta + warm cream palettes (reads as Claude branding).
- Client logo artwork keeps its own colors; list them in the project's palette_allow.json.
- Type: one bold display face, a mono face for small labels, short headlines (under 5 words).

## Layout (1080x1920 vertical)
- Reels UI covers the top 250, bottom 420 and right 120 px: keep text inside y 250-1500, x under 960.
- Captions start at y 1300 or higher; headlines at y 350.
- Show each piece of text once per frame; leave 24 px or more between text blocks.
- Padded boxes use border-box sizing.

## Motion
- Everything is a function of time t; no timers or CSS transitions.
- Open on a strong first frame; hold the end card for 3 seconds or more.
- Count-ups, stamps with a small shake, springs on arrival (overshoot 1.5-1.9), staggers of 0.12-0.2 s.
- Zoom in log space; keep the target near the screen center while zooming.

## Maps
- Open on the city shape, highlight the area, zoom in, then glide pin to pin. Rotate slowly the whole time.
- Real data only: OSM buildings and roads, Nominatim boundaries. Credit OSM on screen.
- Measure distances on the map before saying them aloud.

## Facts
- Verify prices, hours and dates by phone, visit or primary source; keep a verified.json per project.
- Say "one of the oldest", never "the oldest", without a source.

## Audio
- Ask about narration at the start. Generate it separately (Ripping free voice), mix with ffmpeg.
- Score arc: soft pad, then groove, hits on stamps and landings, resolving chord on the end card.

## Process
- One scene per build step; preview early; render frames; run run_evals.py; critic review; then show.

## Anti-slop (lesson L013: the user said "dont make it ai slop")
- No gradients, glows, blur or emoji; flat colour and real texture only.
- One idea per scene; asymmetric composition; no grid of identical rounded cards.
- Use real specifics: real menu words, real prices, real streets, real materials.
- Make imperfection from data, not random shimmer: uneven stitch spacing, slight wobble, seeded by position.
- Every motion has a physical reason (a needle pulls thread, a tag swings from a string); no floaty bounce for its own sake.
- Typography with a point of view: two faces at most, real hierarchy, no default centred headline stack.
