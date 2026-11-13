#!/usr/bin/env python3
"""Mix voice (word-timed, timing.py), foley (tools/audio/build_foley.py) and a soft pad into audio/mix.wav. Voice first; music and foley sit under it."""
import subprocess, json
total = json.load(open("data_timing.json"))["total"]
fc = ("[1:a]volume=0.30[m];[2:a]volume=0.55[f];[0:a][m][f]amix=inputs=3:normalize=0:duration=longest,alimiter=limit=0.8:level=0,loudnorm=I=-14:TP=-1.5:LRA=7[out]")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "audio/voice.wav", "-i", "audio/music.wav", "-i", "audio/foley.wav", "-filter_complex", fc, "-map", "[out]", "-t", str(total), "-ar", "44100", "audio/mix.wav"], check=True)
print("mix ok", total)
