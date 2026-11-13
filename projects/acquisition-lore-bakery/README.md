# Acquisition Lore: "Buy a ₹1 Cr bakery for ₹27 L" (first reel, Aryan's script)
Brand guide: Google Doc "Acquisition Lore - Brand Guidelines" (Paper Trail look, the Host mascot, Archivo / Instrument Serif / JetBrains Mono).
Output: `out/acquisition-lore-bakery-v1.mp4` (1080x1920, 30 fps, ~70.9 s, voice + foley + music).

## How it is built (everything is driven by the voice's word times: L010 / L044)
1. `script.json` -> Kokoro male voice via `tools/voice/generate_narration_json.mts` (writes `voice/sN.wav` + `sN.words.json`).
2. `build_assets.py` -> Host cut-outs (`assets/host_*.png`, from the guide's JPEGs), `voice_master.wav`, `data/timing.json`.
3. `build_cues.py` -> `sync/cues.json`: scene starts, caption phrases, named events (all word times). Single source of truth.
4. `build_film.py` -> `film.html` (scenes.js + film.src.html; window.setT(t) engine).
5. `foley.py` -> `foley.wav`, `music.wav`, `mix_raw.wav` from the same cues; loudnorm two-pass to `mix.wav`.
6. Render: `python3 tools/three/render_three.py film.html frames --full --jpeg --fps 30 --dur 70.925` (playwright venv at ~/video-animations/.venv), then ffmpeg mux.
7. `python3 tools/qa/run_evals.py projects/acquisition-lore-bakery` (use the playwright venv python).

## Open items / decisions
- Voice is Kokoro "michael" (US male), not the brand's late-20s Indian-English voice ID. Swap when the brand voice exists; re-run steps 1-5.
- Host art is static cut-outs: breathing + 2-3 degree nods on keywords, pose pops; no lip-sync or blink.
- Host face sits partly in the bottom 24% UI zone (the guide's own frames do this too; the guide text says it may not). Caption band is above his head.
- Music is a synthetic placeholder pad/pluck. Final mix is about -15 LUFS (target -14).
- The bakery is a hypothetical: spoken as "Let's say", stamped HYPOTHETICAL, slips labelled ILLUSTRATIVE FIGURES.
