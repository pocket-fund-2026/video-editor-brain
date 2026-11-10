#!/usr/bin/env python3
"""Synthesize a film's foley (needle ticks, thread pulls, cloth, ceramic, snips) and place it on the timeline.
Reads PROJECT/sfx.json:  {"<scene id>": [["kind", ...args], ...]}  with times in seconds LOCAL to the scene. Scene starts come from scenes.json.
Kinds: stitch t0 t1 rate gain | swish t0 t1 gain | rustle t0 t1 gain | clink t hz gain | pop t gain | thud t gain | snip t gain | creak t gain | fold t gain
Usage: build_foley.py PROJECT OUT.wav     (needs numpy only; every sound is generated, nothing is sampled or copied)
"""
import json, os, sys, wave
import numpy as np

SR = 44100
rng = np.random.default_rng(7)

def bp(x, f0, bw):                      # gaussian band-pass in log-frequency, via FFT
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); f[0] = 1
    H = np.exp(-((np.log(f / f0)) / bw) ** 2); return np.fft.irfft(X * H, len(x))

def tt(n): return np.arange(n) / SR
def sine(f, n, ph=0): return np.sin(2 * np.pi * f * tt(n) + ph)

def s_tick(g):
    n = int(0.014 * SR); t = tt(n); x = bp(rng.standard_normal(n), 3600, 0.55) * np.exp(-t / 0.0028) + 0.55 * sine(2500 + rng.uniform(-200, 200), n) * np.exp(-t / 0.002); return x * g * 0.9
def s_swish(d, g):
    n = int(d * SR); t = tt(n); env = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.5; x = bp(rng.standard_normal(n), 2600, 0.7) * env * (1 + 0.25 * np.sin(2 * np.pi * 37 * t)); return x * g * 0.55
def s_rustle(d, g):
    n = int(d * SR); t = tt(n); fl = np.convolve(np.abs(rng.standard_normal(n)), np.ones(900) / 900, 'same'); env = np.sin(np.pi * np.clip(t / d, 0, 1)) * (0.4 + 2.2 * fl); return bp(rng.standard_normal(n), 1700, 1.1) * env * g * 0.8
def s_clink(hz, g):
    n = int(0.45 * SR); t = tt(n); x = sum(a * sine(hz * m, n) * np.exp(-t / d) for m, a, d in [(1, 1, 0.16), (2.76, 0.5, 0.1), (5.4, 0.25, 0.05)]); x[:60] += rng.standard_normal(60) * 0.4; return x * g * 0.5
def s_pop(g):
    n = int(0.06 * SR); t = tt(n); f = 700 * np.exp(-t * 18) + 220; return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.018) * g * 0.8
def s_thud(g):
    n = int(0.3 * SR); t = tt(n); f = 120 * np.exp(-t * 12) + 48; return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.09) + 0.15 * bp(rng.standard_normal(n), 300, 0.8) * np.exp(-t / 0.03)) * g * 0.9
def s_snip(g):
    n = int(0.4 * SR); t = tt(n); x = np.zeros(n)
    for off, a in [(0, 1.0), (int(0.085 * SR), 0.75)]:
        m = int(0.05 * SR); tm = tt(m); b = (bp(rng.standard_normal(m), 6500, 0.5) * np.exp(-tm / 0.008) + 0.5 * sine(3300, m) * np.exp(-tm / 0.012)) * a; x[off:off + m] += b
    return x * g * 0.9
def s_creak(g):
    n = int(0.22 * SR); t = tt(n); f = 380 + 45 * np.sin(2 * np.pi * 17 * t); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.22) ** 2 * bp(rng.standard_normal(n), 900, 1.5) * 0.0 + np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.22) ** 2 * g * 0.18
def s_fold(g):
    return s_rustle(0.5, g * 0.9)[: int(0.5 * SR)] + np.pad(s_thud(g * 0.3)[: int(0.25 * SR)], (int(0.2 * SR), int(0.05 * SR)))

def main():
    P, OUT = sys.argv[1], sys.argv[2]; sc = json.load(open(f"{P}/scenes.json")); ev = json.load(open(f"{P}/sfx.json"))
    start, t0 = {}, 0.0
    for s in sc["scenes"]: start[s["id"]] = t0; t0 += s["dur"]
    total = t0; buf = np.zeros(int((total + 1.5) * SR))
    def put(t, x):
        i = int(t * SR); x = np.asarray(x); j = min(len(buf), i + len(x))
        if i >= 0 and j > i: buf[i:j] += x[: j - i]
    n_ev = 0
    for sid, lst in ev.items():
        b = start[sid]
        for e in lst:
            k = e[0]; n_ev += 1
            if k == "stitch":
                _, a, z, rate, g = e; t = a
                while t < z:
                    put(b + t, s_tick(g * rng.uniform(0.65, 1.0))); t += (1 / rate) * rng.uniform(0.7, 1.35)
            elif k == "swish": put(b + e[1], s_swish(e[2] - e[1], e[3]))
            elif k == "rustle": put(b + e[1], s_rustle(e[2] - e[1], e[3]))
            elif k == "clink": put(b + e[1], s_clink(e[2], e[3]))
            elif k == "pop": put(b + e[1], s_pop(e[2]))
            elif k == "thud": put(b + e[1], s_thud(e[2]))
            elif k == "snip": put(b + e[1], s_snip(e[2]))
            elif k == "creak": put(b + e[1], s_creak(e[2]))
            elif k == "fold": put(b + e[1], s_fold(e[2]))
            else: sys.exit("unknown sound kind " + k)
    buf = buf[: int(total * SR)]; pk = np.abs(buf).max() or 1; buf = buf / pk * 0.7          # peak about -3 dB; lay under a voice at -14 dB
    st = np.stack([buf, np.roll(buf, 40)], 1)                                                  # a hair of stereo width
    with wave.open(OUT, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(st, -1, 1) * 32767).astype("<i2").tobytes())
    print(f"foley: {n_ev} events over {total:.1f}s -> {OUT}")

if __name__ == "__main__":
    main()
