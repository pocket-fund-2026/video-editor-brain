#!/usr/bin/env python3
"""Cafe Mondegar sound: synthesized foley + jazzy bed (numpy only), mixed under the voice with ducking -> audio/mix.wav, and eq.json (12 band energies per frame) for the audio-reactive bars.
Event times are FILM seconds (scene starts: 0, 5.8, 11.2, 16.6, 22.0, 27.4). Run: python3 build_audio.py"""
import json, subprocess, wave, numpy as np
SR = 44100; rng = np.random.default_rng(11)
T = json.load(open("data_timing.json"))["total"]; N = int(T * SR); tt = lambda n: np.arange(n) / SR
def bp(x, f0, bw):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); f[0] = 1; return np.fft.irfft(X * np.exp(-((np.log(f / f0)) / bw) ** 2), len(x))
def sine(f, n): return np.sin(2 * np.pi * f * tt(n))
buf = np.zeros(N + SR * 3)
def put(t, x, g=1.0):
    i = int(t * SR); j = min(len(buf), i + len(x))
    if i >= 0 and j > i: buf[i:j] += x[: j - i] * g
def coin(): n = int(.7 * SR); t = tt(n); return sum(a * sine(f, n) * np.exp(-t / d) for f, a, d in [(2637, 1, .25), (3520, .6, .18), (5274, .3, .1)])
def clunk(): n = int(.5 * SR); t = tt(n); f = 150 * np.exp(-t * 14) + 45; return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .14) * 1.4 + .3 * bp(rng.standard_normal(n), 400, .8) * np.exp(-t / .03)
def thud(g=1): n = int(.3 * SR); t = tt(n); f = 120 * np.exp(-t * 12) + 48; return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .09) * g
def swish(d, lo=900, hi=4200):
    n = int(d * SR); t = tt(n); env = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.6; f0 = lo * (hi / lo) ** (t / d)
    x = rng.standard_normal(n); out = np.zeros(n)
    for a, b in [(0, n // 3), (n // 3, 2 * n // 3), (2 * n // 3, n)]: out[a:b] = bp(x, f0[(a + b) // 2], .6)[a:b]
    return out * env * .6
def click(): n = int(.05 * SR); t = tt(n); return (bp(rng.standard_normal(n), 2800, .5) * np.exp(-t / .004) + .6 * sine(1800, n) * np.exp(-t / .006))
def clink(hz=1900): n = int(.5 * SR); t = tt(n); return sum(a * sine(hz * m, n) * np.exp(-t / d) for m, a, d in [(1, 1, .14), (2.76, .5, .09), (5.4, .25, .05)])
def noise_bed(d, f0, bw, am=0): n = int(d * SR); t = tt(n); x = bp(rng.standard_normal(n), f0, bw) * (1 + am * np.sin(2 * np.pi * 2.3 * t)); e = np.minimum(1, np.minimum(t / .4, (d - t) / .4)); return x * e
def crackle(d): n = int(d * SR); x = np.zeros(n); k = rng.integers(0, n, int(d * 28)); x[k] = rng.standard_normal(len(k)); return bp(x, 3500, .8) * 3
# ---- foley events
put(.12, coin(), .5); put(.5, coin(), .35); put(.62, clunk(), 1.1); put(.62, noise_bed(.5, 200, 1.2), .15)
put(0.94, thud(.5)); put(1.25, thud(.55)); put(2.84, click(), .7)
for k, s in enumerate([5.8, 11.2, 16.6, 22.0, 27.4]): put(s - .45, swish(.9), .55)
put(6.0, swish(4.4, 400, 6000), .30); put(10.6, thud(1.0)); put(10.6, clink(1200), .2)
put(11.4, noise_bed(5.0, 600, 1.4, .3), .10)
put(18.25, click(), .9); put(18.55, click(), .5); put(19.0, swish(1.7, 500, 1800), .35); put(20.8, thud(.7)); put(20.85, clink(900), .25)
put(22.8, clink(1700), .5); put(23.45, swish(.9, 600, 2400), .35); put(24.6, thud(.55)); put(24.95, thud(.5)); put(25.1, clink(2300), .12)
put(25.2, noise_bed(2.1, 5200, .9, .6), .16)
put(27.55, swish(2.2, 3000, 300), .5); put(28.0, clink(1500), .25); put(29.6, clink(2100), .35); put(29.62, clink(3150), .18)
put(0.7, crackle(T - .7), .06)
# ---- music bed: 96 bpm swing, Dm9 | G13 | Cmaj9 | A7b9, brushed hats, walking bass, soft rhodes
BPM = 96; beat = 60 / BPM; mus = np.zeros(len(buf)); mf = lambda m: 440 * 2 ** ((m - 69) / 12)
CH = [[50, 53, 57, 60, 64], [55, 59, 62, 65, 69], [48, 52, 55, 59, 62], [45, 49, 52, 55, 58]]; BASS = [[38, 41, 43, 45], [43, 45, 47, 38], [36, 40, 43, 40], [33, 37, 40, 43]]
def tone(m, d, g, fm=2.0):
    n = int(d * SR); t = tt(n); f = mf(m); env = np.exp(-t / (d * .55)) * np.minimum(1, t / .01) * np.clip((d - t) / .06, 0, 1)
    return (np.sin(2 * np.pi * f * t + 1.6 * np.sin(2 * np.pi * f * fm * t) * np.exp(-t / .12)) + .3 * np.sin(2 * np.pi * 2 * f * t)) * env * g
bars = int(T / (4 * beat)) + 2
for b in range(bars):
    t0 = .8 + b * 4 * beat; c = b % 4; lv = np.clip((t0 - .3) / 6, 0, 1) * (1 if t0 < 27 else .8)
    for m in CH[c]: x = tone(m, 1.6 * beat, .06 * lv); i = int(t0 * SR); mus[i:i + len(x)] += x[: len(mus) - i] if i < len(mus) else 0
    for k in range(4):
        tb = t0 + k * beat; x = tone(BASS[c][k] , .9 * beat, .25 * lv, 1.0); i = int(tb * SR)
        if i < len(mus): mus[i:i + len(x)] += x[: len(mus) - i]
        for off, g in [(0, .5), (beat * .667, .3)]:
            n = int(.07 * SR); h = bp(rng.standard_normal(n), 7500, .5) * np.exp(-tt(n) / .02) * g * .05 * lv; i = int((tb + off) * SR)
            if i + n < len(mus): mus[i:i + n] += h
buf[: len(mus)] += mus * 1.0
fo = buf[:N]; fo = fo / (np.abs(fo).max() or 1) * .8
st = np.stack([fo, np.roll(fo, 30)], 1)
with wave.open("audio/bed.wav", "wb") as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype(np.int16).tobytes())
# duck bed under the voice, then mix
fc = "[1:a]asplit[a][b];[b]volume=1,aformat=channel_layouts=mono[sc];[a][sc]sidechaincompress=threshold=0.04:ratio=6:attack=15:release=350:level_sc=1[bd];[bd]volume=0.55[bd2];[0:a][bd2]amix=inputs=2:normalize=0:duration=longest,alimiter=limit=0.9,loudnorm=I=-14:TP=-1.5:LRA=7[out]"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "audio/voice.wav", "-i", "audio/bed.wav", "-filter_complex", fc, "-map", "[out]", "-t", str(T), "-ar", "44100", "audio/mix.wav"], check=True)
# audio-reactive EQ: 12 log bands per film frame, from the final mix (voice + music + foley)
with wave.open("audio/mix.wav") as w: a = np.frombuffer(w.readframes(w.getnframes()), np.int16).reshape(-1, w.getnchannels()).mean(1) / 32768
edges = np.geomspace(90, 7000, 13); fps = 30; hop = SR // fps; rows = []
for f in range(int(T * fps)):
    seg = a[f * hop: f * hop + 2048]; seg = np.pad(seg, (0, 2048 - len(seg))) * np.hanning(2048); S = np.abs(np.fft.rfft(seg)); fr = np.fft.rfftfreq(2048, 1 / SR)
    rows.append([float(S[(fr >= edges[i]) & (fr < edges[i + 1])].mean()) for i in range(12)])
R = np.array(rows); R = np.log1p(R * 18); R = R / np.percentile(R, 97); R = np.clip(R, 0, 1)
for i in range(1, len(R)): R[i] = np.maximum(R[i], R[i - 1] * .8)       # fast attack, smooth release
json.dump(np.round(R, 3).tolist(), open("src/eq.json", "w"))
open("src/eq.ts", "w").write("export const EQ: number[][] = " + json.dumps(np.round(R, 2).tolist()) + ";\n")
print("mix ok", T, "eq frames", len(R))
