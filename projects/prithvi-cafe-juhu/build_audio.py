#!/usr/bin/env python3
"""Mix voice clips (placed on the timeline), foley and music into audio/mix.wav. Voice first, music and foley sit under it.
Run from projects/prithvi-cafe-juhu."""
import subprocess

V = "voice"
# (clip, start second, tempo)
clips = [("l1_t", 1.4, 1.0), ("l2_t", 6.8, 1.0), ("l3_t", 8.4, 1.0), ("l4a_t", 12.15, 1.0), ("l4b_t", 13.85, 1.0), ("l4c_t", 15.1, 1.0), ("l5_t", 16.55, 1.03)]
ins, fl, lab = [], [], []
for i, (n, t, tempo) in enumerate(clips):
    ins += ["-i", f"{V}/{n}.wav"]
    ms = int(t * 1000)
    fl.append(f"[{i}:a]" + (f"atempo={tempo}," if tempo != 1.0 else "") + f"adelay={ms}|{ms},apad=whole_dur=20[v{i}]")
    lab.append(f"[v{i}]")
k = len(clips)
ins += ["-i", "audio/music.wav", "-i", "audio/foley.wav"]
fc = (";".join(fl) + ";" + "".join(lab)
      + f"amix=inputs={k}:normalize=0,pan=stereo|c0=c0|c1=c0,loudnorm=I=-15:TP=-1.5:LRA=7[voice];"
      + f"[{k}:a]volume=0.42[m];[{k+1}:a]volume=0.55[f];"
      + "[voice][m][f]amix=inputs=3:normalize=0:duration=longest,alimiter=limit=0.95[out]")
subprocess.run(["ffmpeg", "-v", "error", "-y", *ins, "-filter_complex", fc, "-map", "[out]", "-t", "20", "-ar", "44100", "audio/mix.wav"], check=True)
print("mix ok")
