#!/usr/bin/env python3
"""Soft pad + light marimba-style pluck groove + low-key cafe room tone for the Javaphile Worli reel (numpy only, everything is synthesised).
Arc: soft pad from 0, pluck groove enters at the French toast scene, a resolving chord on the end card. Usage: build_music.py PROJECT OUT.wav"""
import json, sys, wave
import numpy as np
SR = 44100
P, OUT = sys.argv[1], sys.argv[2]
sc = json.load(open(f"{P}/scenes.json"))["scenes"]; start, t = {}, 0.0
for s in sc: start[s["id"]] = t; t += s["dur"]
total = t; n = int(total * SR); tt = np.arange(n) / SR; out = np.zeros(n); rng = np.random.default_rng(5)
mid = lambda m: 440 * 2 ** ((m - 69) / 12)
def chord(notes, t0, t1, g, att=1.2, rel=1.5):
    i0, i1 = int(t0 * SR), min(n, int(t1 * SR)); x = np.arange(i1 - i0) / SR; env = np.minimum(1, x / att) * np.minimum(1, (t1 - t0 - x) / rel).clip(0, 1)
    sig = sum(np.sin(2 * np.pi * mid(m) * x + 0.3 * np.sin(2 * np.pi * 0.2 * x)) * 0.6 + np.sin(2 * np.pi * mid(m) * 2.003 * x) * 0.12 for m in notes)
    out[i0:i1] += sig * env * g / len(notes)
# progression (Dmaj9 / Bm7 / Gmaj7 / A6) over the film, final resolve on the end card
prog = [[50, 57, 61, 64, 69], [47, 54, 57, 61, 66], [43, 50, 54, 59, 62], [45, 52, 57, 61, 66]]
cuts = [0, start["pour"], start["toast"], start["bowls"]]
for k, c in enumerate(prog): chord(c, cuts[k], cuts[k] + (cuts[k + 1] - cuts[k] if k < 3 else start["end"] - cuts[k]) + 0.8, 0.5)
chord([50, 57, 61, 66, 69, 74], start["end"], total, 0.6, att=0.4, rel=1.8)
# pluck groove (96 bpm, offbeat-leaning) from the toast scene on
def pluck(t0, m, g):
    i0 = int(t0 * SR); d = int(0.5 * SR); x = np.arange(d) / SR
    s = (np.sin(2 * np.pi * mid(m) * x) + 0.35 * np.sin(2 * np.pi * mid(m) * 4 * x) * np.exp(-x * 30)) * np.exp(-x * 7) * g
    j = min(n, i0 + d); out[i0:j] += s[: j - i0]
beat = 60 / 96; scale = {0: [62, 69, 66, 64], 1: [61, 66, 64, 69], 2: [59, 62, 66, 62], 3: [61, 64, 69, 66]}
tg = start["toast"]; k = 0
while tg + k * beat / 2 < start["end"] + 3.2:
    tk = tg + k * beat / 2; sec = 3 if tk >= start["bowls"] else (1 if tk >= start["toast"] + 4 else 0)
    if k % 4 in (0, 3) or (tk > start["bowls"] and k % 2 == 1): pluck(tk, scale[min(3, int((tk - tg) // 4)) % 4][k % 4], 0.16 if k % 4 == 0 else 0.1)
    k += 1
# bass on the downbeat
for kk in range(int((total - tg) / (beat * 2))):
    tk = tg + kk * beat * 2
    if tk < total - 1.0: i0 = int(tk * SR); d = int(0.9 * SR); x = np.arange(d) / SR; b = np.sin(2 * np.pi * mid([38, 35, 31, 33][kk % 4]) * x) * np.exp(-x * 3.0) * 0.22; out[i0:min(n, i0 + d)] += b[: min(n, i0 + d) - i0]
# room tone: very quiet low murmur
nz = rng.standard_normal(n); F = np.fft.rfft(nz); fr = np.fft.rfftfreq(n, 1 / SR); fr[0] = 1; out += np.fft.irfft(F * np.exp(-((np.log(fr / 450)) / 0.9) ** 2), n) * 0.0016
out *= np.minimum(1, (total - tt) / 1.0)
out = out / (np.abs(out).max() or 1) * 0.6
with wave.open(OUT, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); st = np.stack([out, np.roll(out, 60)], 1); w.writeframes((np.clip(st, -1, 1) * 32767).astype("<i2").tobytes())
print("music", total)
