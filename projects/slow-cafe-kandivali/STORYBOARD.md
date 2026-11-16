# Slow Cafe: storyboard and palette (L040: swatches before building)

## Palette (the cafe's own scheme: logo disc, shirts, mugs, concrete; no orange/cream; SLOW pink is dusty #E8A5B3, not Mondegar's hot pink)
| role | name | hex |
|---|---|---|
| ground | charcoal (logo disc) | #2F2E2C |
| ground 2 | concrete | #7C8088 |
| light | cool white (logo ring) | #F4F5F7 |
| accent | SLOW pink (shirts) | #E8A5B3 |
| accent 2 | sage (mugs) | #9AB89D |
Food keeps natural colour (palette_allow.json). Fonts: one soft humanist serif with italic accents + DM Mono labels (two faces only).

## Frames to render for approval (scene, key frame, what must be visible)
1. hook @ 0.6 s: SLOW CAFE stamped large, tilted-O ring mid-settle, tiramisu French toast with cocoa puff behind, safe zones clear.
2. map @ 7 s: dark island, buildings rising, "Mahavir Nagar" pulse, OSM credit, small Bombay Cafe Map top-bar mark.
3. burrata @ 12 s: three pendants lit, knife splitting the burrata, tag "Tomato confit and burrata", ring 25 %.
4. noodles @ 18 s: top-down bowl, chopsticks lifting a swirl, steam, tag "Gochujang noodle bowl", ring 60 %.
5. fries @ 23 s: fry mid-dunk with a drip, tag "Sweet potato fries", breathing caption mid-word, ring 85 %.
6. end @ 29 s: charcoal ground, large real Bombay Cafe Map stacked lockup, handle + site, "Slow Cafe" small line with tilted-O.

## Logos
- Cafe: redraw tilted white ring "O" on charcoal disc from assets/logo/slow_ig_profile_150.jpg (only 150 px available). Wordmark "SLOW" in white humanist sans as on the team shirts. Replace with the official file if the user supplies it.
- Bombay Cafe Map: assets/bcm/logo/bombaycafemap-lockup-stacked-ondark.png (end card), bombaycafemap-icon.svg (top bar).

## Build order
timing.py (copy from cafe-mondegar-colaba, set SCENE starts to 0.9, 5.5, 10.3, 15.7, 21.1, 26.1) -> map (reuse FortMap engine, area centre in data/place.json) -> dishes in three.js -> film -> frames sheets -> run_evals.py -> critic.
