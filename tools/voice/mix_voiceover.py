#!/usr/bin/env python3
"""Place per-scene narration clips on the film's timeline and mix them into one loudness-normalised track.
Usage: mix_voiceover.py SCENES_JSON CLIPS_DIR OUT.wav     (clips named <scene-id>.wav, from generate_narration.mts)
A clip starts 0.15 s after its scene begins, or at the scene start when it would otherwise run past the scene's end.
Overlay on an exported film (keeps its music, ducked): ffmpeg -i film.mp4 -i OUT.wav -filter_complex "[0:a]volume=0.45[m];[m][1:a]amix=inputs=2:normalize=0[a]" -map 0:v -map "[a]" -c:v copy final.mp4
"""
import json, os, subprocess, sys, wave

def secs(p):
    with wave.open(p) as w: return w.getnframes() / w.getframerate()

sc = json.load(open(sys.argv[1])); clips = sys.argv[2]; out = sys.argv[3]
t0 = 0.0; ins = []; fl = []; lab = []; total = sum(s["dur"] for s in sc["scenes"])
for s in sc["scenes"]:
    f = os.path.join(clips, s["id"] + ".wav")
    if os.path.exists(f):
        d = secs(f); off = 0.15 if d + 0.15 <= s["dur"] else 0.0
        if d > s["dur"]: print(f"WARNING {s['id']}: narration {d:.2f}s is longer than its {s['dur']}s scene; speed it up or trim the words")
        i = len(ins) // 2; ms = int((t0 + off) * 1000); ins += ["-i", f]
        fl.append(f"[{i}:a]adelay={ms}|{ms},apad=whole_dur={total}[a{i}]"); lab.append(f"[a{i}]")
    t0 += s["dur"]
fc = ";".join(fl) + ";" + "".join(lab) + f"amix=inputs={len(lab)}:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=7[out]"
subprocess.run(["ffmpeg", "-v", "error", "-y", *ins, "-filter_complex", fc, "-map", "[out]", "-t", str(total), "-ar", "44100", out], check=True)
print("wrote", out)
