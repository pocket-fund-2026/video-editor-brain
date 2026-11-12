# Bombay Island Coffee Company reel (bombaycafemap)
QA needs Playwright, which only the venv has. Always run the tools with it:
  cd ~/video-editor-brain
  ~/video-animations/.venv/bin/python tools/qa/run_evals.py projects/bombay-island-coffee
  ~/video-animations/.venv/bin/python projects/bombay-island-coffee/verify_sync.py   # run from the project folder
System python3 (/opt/homebrew/bin) has no playwright: overlap_check then fails with ModuleNotFoundError and run_evals prints NOT READY.
Rebuild: build_timing.py -> build_audio.py -> render_three.py (frames) -> ffmpeg (see render.log history in the report).
