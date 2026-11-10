# Mary Lodge by Subko reel (40 s, 1080x1920) - Three.js, ink/cel illustrated look
Latest cut: `out/mary-lodge-v2.mp4` (with generated foley, no music, no voiceover).
- Film page: `film.html` (clock `window.setT(T)`), scenes in `scenes/` (map, shopfront, pour, food), shared ink pass `scenes/ink.js`.
- Render: `python3 tools/three/render_three.py projects/mary-lodge-reel/film.html FRAMES --full --jpeg --fps 30 --dur 40` then ffmpeg + `tools/audio/build_foley.py` output.
- Checks: `python3 tools/qa/run_evals.py projects/mary-lodge-reel` (needs playwright; overlap_check understands film.html).
- Map data: OpenStreetMap contributors (credit on screen). Pin = OSM node "Subko Speciality Coffee Roasters and Bakehouse", Chapel Road.
- Open: storefront is a generated illustration (sign text "EST. 1925" / "COFFEE ROASTERY & CAFE" came from the image model, not verified); dish names come from reviews and must be checked against the menu; no rating shown (needs the user's own first-look score).
