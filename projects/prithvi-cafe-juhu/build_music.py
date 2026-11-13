#!/usr/bin/env python3
"""Stage-night score: low pad, slow heartbeat pulse, soft bell notes that enter with the food, a resolving chord on the curtain drop. numpy only.
Usage: build_music.py PROJECT OUT.wav"""
import json, sys, wave
import numpy as np
SR = 44100
P, OUT = sys.argv[1], sys.argv[2]
sc = json.load(open(f"{P}/scenes.json"))["scenes"]; start, t = {}, 0.0
for s in sc: start[s["id"]] = t; t += s["dur"]
total = t; n = int(total * SR); out = np.zeros(n); rng = np.random.default_rng(9)
mid = lambda m: 440 * 2 ** ((m - 69) / 12)
def chord(notes, t0, t1, g, att=1.4, rel=1.6):
    i0, i1 = int(t0 * SR), min(n, int(t1 * SR)); x = np.arange(i1 - i0) / SR; env = np.minimum(1, x / att) * np.minimum(1, (t1 - t0 - x) / rel).clip(0, 1)
    sig = sum(np.sin(2 * np.pi * mid(m) * x + 0.4 * np.sin(2 * np.pi * 0.17 * x)) * 0.6 + np.sin(2 * np.pi * mid(m) * 1.004 * x) * 0.35 + np.sin(2 * np.pi * mid(m) * 2 * x) * 0.08 for m in notes)
    out[i0:i1] += sig * env * g / len(notes)
# Em9 -> Cmaj9 -> Am9 -> Bsus, resolve to Em on the end card
chord([40, 52, 55, 59, 66], 0.0, start["map"] + 4.8, 0.5)
chord([36, 48, 55, 59, 62], start["map"] + 4.2, start["food"] + 0.8, 0.5)
chord([33, 45, 52, 55, 60], start["food"], start["end"] + 0.5, 0.5)
chord([40, 52, 55, 59, 62, 71], start["end"], total, 0.62, att=0.3, rel=1.8)
# heartbeat pulse from the map descent
beat = 60 / 62
for k in range(int((total - 1.4) / beat)):
    tk = 1.4 + k * beat
    if tk > total - 1.2: break
    i0 = int(tk * SR); d = int(0.5 * SR); x = np.arange(d) / SR; b = np.sin(2 * np.pi * mid(28) * x) * np.exp(-x * 7) * 0.5
    j = min(n, i0 + d); out[i0:j] += b[: j - i0]
# soft bell notes with the food
def bell(t0, m, g):
    i0 = int(t0 * SR); d = int(1.2 * SR); x = np.arange(d) / SR
    s = (np.sin(2 * np.pi * mid(m) * x) + 0.4 * np.sin(2 * np.pi * mid(m) * 2.76 * x) * np.exp(-x * 5)) * np.exp(-x * 3.2) * g
    j = min(n, i0 + d); out[i0:j] += s[: j - i0]
for k, (tt_, m) in enumerate([(12.2, 76), (12.9, 71), (13.7, 74), (14.4, 71), (15.1, 79), (15.8, 76)]): bell(tt_, m, 0.12)
bell(start["end"] + 0.8, 76, 0.16); bell(start["end"] + 1.3, 83, 0.1)
nz = rng.standard_normal(n); F = np.fft.rfft(nz); fr = np.fft.rfftfreq(n, 1 / SR); fr[0] = 1; out += np.fft.irfft(F * np.exp(-((np.log(fr / 380)) / 0.9) ** 2), n) * 0.0016
out *= np.minimum(1, (total - np.arange(n) / SR) / 1.0)
out = out / (np.abs(out).max() or 1) * 0.6
with wave.open(OUT, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); st = np.stack([out, np.roll(out, 60)], 1); w.writeframes((np.clip(st, -1, 1) * 32767).astype("<i2").tobytes())
print("music", total)
