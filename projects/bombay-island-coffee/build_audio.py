#!/usr/bin/env python3
"""Mix voice (placed at the film times from data/timing.json), score and foley into audio/mix.wav. Every sound effect is placed at a cue from the same timing file
(lesson L010), so picture, captions and sound share one clock. numpy only. Run from the project folder."""
import json, subprocess, wave
import numpy as np
SR = 44100; TM = json.load(open("data/timing.json")); CU = TM["cues"]; FILM = TM["film"]
n = int(FILM * SR); rng = np.random.default_rng(12); mid = lambda m: 440 * 2 ** ((m - 69) / 12)
music = np.zeros(n); fx = np.zeros(n)
def mixs(*s):
    o = np.zeros(max(len(a) for a in s))
    for a in s: o[: len(a)] += a
    return o
def put(buf, t0, sig, g=1.0):
    i0 = int(t0 * SR); i1 = min(n, i0 + len(sig))
    if i0 < 0 or i0 >= n: return
    buf[i0:i1] += sig[: i1 - i0] * g
def tone(f, d, att=0.005, dec=6.0): x = np.arange(int(d * SR)) / SR; return np.sin(2 * np.pi * f * x) * np.minimum(1, x / att) * np.exp(-x * dec)
def noise(d, lo=None, hi=None):
    z = rng.standard_normal(int(d * SR)); F = np.fft.rfft(z); fr = np.fft.rfftfreq(len(z), 1 / SR)
    if lo: F[fr < lo] = 0
    if hi: F[fr > hi] = 0
    return np.fft.irfft(F, len(z))
def swoosh(t_end, d=0.45, g=0.5, up=True):
    z = noise(d, 300, 5000); x = np.linspace(0, 1, len(z)); env = (x ** 1.6 if up else (1 - x) ** 1.6) * np.minimum(1, (1 - x) * 8 + (0 if up else 1)); put(fx, t_end - d, z * env / (np.abs(z).max() + 1e-9), g)
def thud(t, g=0.7): put(fx, t, mixs(tone(70, 0.5, 0.003, 7), 0.5 * tone(140, 0.25, 0.003, 14)), g)
def ping(t, m=88, g=0.25): put(fx, t, mixs(tone(mid(m), 0.9, 0.004, 3.2), 0.3 * tone(mid(m) * 2.76, 0.5, 0.004, 6)), g)
def tick(t, g=0.3, f=2400): put(fx, t, tone(f, 0.05, 0.001, 70), g)
def sweep(t0, d, f0, f1, g=0.18):
    x = np.arange(int(d * SR)) / SR; f = f0 + (f1 - f0) * (x / d) ** 1.4; ph = 2 * np.pi * np.cumsum(f) / SR; env = np.minimum(1, x / 0.05) * np.minimum(1, (d - x) / 0.15); put(fx, t0, np.sin(ph) * env, g)
# --- score: soft pad that moves with the story
def chord(notes, t0, t1, g, att=1.2, rel=1.4):
    i0, i1 = int(t0 * SR), min(n, int(t1 * SR)); x = np.arange(i1 - i0) / SR; env = np.minimum(1, x / att) * np.clip((t1 - t0 - x) / rel, 0, 1)
    sig = sum(np.sin(2 * np.pi * mid(m) * x + 0.3 * np.sin(2 * np.pi * 0.15 * x)) * 0.6 + np.sin(2 * np.pi * mid(m) * 1.003 * x) * 0.35 + np.sin(2 * np.pi * mid(m) * 2 * x) * 0.07 for m in notes)
    music[i0:i1] += sig * env * g / len(notes)
chord([38, 50, 53, 57, 64], 0.0, 10.4, 0.5); chord([34, 46, 53, 57, 62], 10.0, 15.2, 0.5); chord([36, 48, 55, 59, 64], 15.0, 22.8, 0.5); chord([38, 50, 53, 57, 62, 69], 22.6, 27.6, 0.52); chord([38, 50, 57, 62, 65, 72], 27.4, FILM, 0.6, att=0.4, rel=1.6)
beat = 60 / 64
for k in range(int((FILM - 1.5) / beat)):
    tk = 1.0 + k * beat; i0 = int(tk * SR); d = int(0.45 * SR); x = np.arange(d) / SR; j = min(n, i0 + d)
    if tk < FILM - 1.5: music[i0:j] += (np.sin(2 * np.pi * mid(26) * x) * np.exp(-x * 8) * 0.35)[: j - i0]
# --- foley, placed on cues
swoosh(2.9, 0.7, 0.35)                                                    # logo shrinks into the top bar
put(fx, 0.8, noise(6.6, 40, 220) * np.linspace(0.05, 0.5, int(6.6 * SR)), 0.5)   # map descent rumble
tick(CU["bi_badge"], 0.35, 1800); ping(CU["malad"], 84); thud(CU["malad"], 0.5); sweep(CU["y2018"], 1.25, 400, 900)
for k in range(1, 6): ping(CU["malad"] + k * 0.55, 96, 0.04)
for T in (10.0, 15.0, 22.6, 27.5): swoosh(T, 0.3, 0.45)                   # roast-curve wipes
d = 3.1; z = noise(d, 30, 200); put(fx, 10.2, z / (np.abs(z).max() + 1e-9) * np.hanning(len(z)) ** 0.5, 0.55)   # drum rumble
for k in range(70): tick(10.3 + rng.random() * 2.95, 0.06 * (0.6 + rng.random()), 900 + rng.random() * 1200)   # beans tumbling
tick(CU["roast"], 0.3, 1600); sweep(CU["roast"], 2.6, 200, 600, 0.1)
for k, dt in enumerate([0, 0.08, 0.17, 0.3, 0.41, 0.6, 0.86]): put(fx, CU["crack"] + dt, tone(1200 + 300 * (k % 3), 0.08, 0.001, 55) + noise(0.08, 2000, 6000)[: int(0.08 * SR)] * np.exp(-np.arange(int(0.08 * SR)) / SR * 60), 0.5 if k == 0 else 0.3)
swoosh(CU["menu"] + 0.1, 0.3, 0.4, up=False)
for k in range(5): tick(CU["menu"] + 0.3 + k * 0.12, 0.2, 1500)
put(fx, 15.4, noise(0.66, 800, 5000) * np.linspace(0, 1, int(0.66 * SR)), 0.35); thud(CU["vikhroli"], 0.7); ping(CU["vikhroli"], 91); sweep(CU["y2021"], 1.25, 400, 900)
put(fx, 18.2, noise(0.98, 800, 5000) * np.linspace(0, 1, int(0.98 * SR)), 0.35); thud(CU["andheri"], 0.5); ping(CU["andheri"], 84); sweep(CU["y2026"], 1.25, 400, 900)
for k in range(1, 5): ping(CU["andheri"] + k * 0.55, 96, 0.04)
d = CU["ice"] - CU["layers"]; zz = noise(d, 200, 900) * (0.6 + 0.4 * np.sin(np.arange(int(d * SR)) / SR * 38)); put(fx, CU["layers"], zz / (np.abs(zz).max() + 1e-9), 0.35)   # pour
for k in range(5): put(fx, CU["ice"] + k * 0.07, mixs(tone(3100 + 400 * k, 0.12, 0.001, 30), 0.5 * tone(4700, 0.08, 0.001, 40)), 0.35)   # ice clinks
d = 0.8; z = noise(d, 1500, 7000); put(fx, CU["foam"], z / (np.abs(z).max() + 1e-9) * np.hanning(len(z)) ** 0.5, 0.3)   # foam
swoosh(CU["bar"] + 0.5, 0.6, 0.35)
tick(CU["save"], 0.45, 2000); ping(CU["save"], 95, 0.18)
d = 0.55; x = np.arange(int(d * SR)) / SR; ph = 2 * np.pi * np.cumsum(2400 - 1700 * (x / d) ** 1.5) / SR; put(fx, CU["bean"] - d, np.sin(ph) * np.minimum(1, x / 0.04) * 0.2)   # bean falls
thud(CU["bean"], 0.55); ping(CU["bean"], 86, 0.3); ping(CU["bean"] + 0.18, 93, 0.18)
fade = np.clip((FILM - np.arange(n) / SR) / 1.2, 0, 1); music *= fade; fx *= fade
music = music / (np.abs(music).max() or 1) * 0.5; fx = fx / (np.abs(fx).max() or 1) * 0.8
def wr(path, a):
    with wave.open(path, "wb") as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); st = np.stack([a, np.roll(a, 50)], 1); w.writeframes((np.clip(st, -1, 1) * 32767).astype("<i2").tobytes())
wr("audio/music.wav", music); wr("audio/foley.wav", fx)
ins, fl, lab = [], [], []
clips = [(c, TM["clips"][c]["start"]) for c in ("l1", "l2", "l3", "l4", "l5", "l6")]
for i, (c, t) in enumerate(clips): ins += ["-i", f"voice/{c}_t.wav"]; ms = int(t * 1000); fl.append(f"[{i}:a]adelay={ms}|{ms},apad=whole_dur={FILM}[v{i}]"); lab.append(f"[v{i}]")
k = len(clips); ins += ["-i", "audio/music.wav", "-i", "audio/foley.wav"]
fc = (";".join(fl) + ";" + "".join(lab) + f"amix=inputs={k}:normalize=0,pan=stereo|c0=c0|c1=c0,loudnorm=I=-15:TP=-1.5:LRA=7[voice];[{k}:a]volume=0.38[m];[{k+1}:a]volume=0.5[f];[voice][m][f]amix=inputs=3:normalize=0:duration=longest,alimiter=limit=0.95[out]")
subprocess.run(["ffmpeg", "-v", "error", "-y", *ins, "-filter_complex", fc, "-map", "[out]", "-t", str(FILM), "-ar", "44100", "audio/mix.wav"], check=True); print("mix ok", FILM)
