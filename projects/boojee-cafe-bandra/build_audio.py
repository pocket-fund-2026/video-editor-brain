#!/usr/bin/env python3
"""Boojee Cafe sound: synthesized foley + soft pad bed (numpy only), ducked under the voice -> audio/mix.wav. Event times are FILM seconds (scene starts: 0, 5.0, 9.8, 15.2, 20.6, 25.6). No pouring sounds anywhere (L059). Run: python3 build_audio.py"""

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
# ---- foley events (film seconds)
def puff(d=1.4): n=int(d*SR); t=tt(n); return bp(rng.standard_normal(n), 1800, 1.1)*np.exp(-t/.35)*np.minimum(1,t/.02)*.7
def tick(): n=int(.04*SR); t=tt(n); return bp(rng.standard_normal(n), 3600, .6)*np.exp(-t/.006)
def stamp(g=1):
    a=thud(g*.6); c=click()*0.4; a[:len(c)]+=c; return a
def bulb(): return click()*0.8
def slice_(): n=int(.35*SR); t=tt(n); return bp(rng.standard_normal(n), 2400, .9)*np.exp(-t/.09)*.8
def clack(): n=int(.12*SR); t=tt(n); return (sine(900,n)*np.exp(-t/.025)+.5*sine(1650,n)*np.exp(-t/.015))*.9
def crunch(): n=int(.25*SR); t=tt(n); x=np.zeros(n); k=rng.integers(0,n,40); x[k]=rng.standard_normal(40); return bp(x,2600,.9)*3*np.exp(-t/.12)
def splash(): n=int(.35*SR); t=tt(n); return bp(rng.standard_normal(n), 900, 1.0)*np.exp(-t/.08)*.6
def chime(): return clink(2093)*0.9+0.5*clink(3136)
# hook: spray hiss paints BOOJEE (name at 0.24), marker squeak under it
put(0.1, noise_bed(1.9, 5200, 1.0, .3), .22); put(0.3, thud(1.0)); put(0.3, click(), .5); put(2.3, noise_bed(1.4, 3800, .5, 1.5), .08); put(2.35, tick(), .5)
# paint-roller wipe into every scene (swish + soft thud)
for s_ in [5.2, 11.7, 17.0, 22.3, 27.5]: put(s_-.4, swish(.8, 500, 3000), .5); put(s_-.05, thud(.5), .25)
# map: dive whoosh, 2019 stamp, seat count ticks, pin pings
put(5.3, swish(2.4, 300, 5000), .28); put(5.6, stamp(1.0), .7)
def ping(g=1): n=int(.9*SR); t=tt(n); return (sine(880,n)*np.exp(-t/.28)+.4*sine(1760,n)*np.exp(-t/.18))*g
for i in range(7): put(8.9+i*.1, tick(), .4)
for i,tm in enumerate([9.6,10.05,10.5,10.95]): put(tm, ping(.5/(1+i*.45))); put(tm, thud(.7/(1+i*.5)))
# croissant: crisp layers pull apart, almond flakes
put(12.4, crunch(), .9); put(13.2, crunch(), .7); put(13.5, swish(.4, 1500, 3200), .25); put(14.4, tick(), .4); put(14.5, tick(), .3); put(14.6, tick(), .3)
# avocado toast: fork mash and spread, chilli flakes tick
put(17.8, slice_(), .5); put(18.5, slice_(), .5); put(19.1, swish(.5, 900, 2200), .3); put(20.0, tick(), .4); put(20.05, tick(), .3); put(20.1, tick(), .3)
# crepes: fold, fold, sugar sift
put(23.2, swish(.4, 1200, 2800), .3); put(23.7, thud(.4)); put(24.3, swish(.4, 1200, 2800), .3); put(24.8, noise_bed(2.2, 6000, .9, .2), .07)
# end card: chime and pad swell
put(27.6, chime(), .45); put(27.9, thud(.5)); put(30.0, clink(2093), .2)
put(0.7, crackle(T-.7), .02)
# ---- music bed: slow soft pad (Cmaj9 | Am9 | Fmaj7 | G6), 66 bpm, sparse plucks, no drums
BPM=66; beat=60/BPM; mus=np.zeros(len(buf)); mf=lambda m: 440*2**((m-69)/12)
CH=[[48,55,59,62,64],[45,52,55,59,64],[41,48,52,57,60],[43,50,55,59,64]]
def pad(m, d, g):
    n=int(d*SR); t=tt(n); f=mf(m); env=np.minimum(1,t/1.2)*np.clip((d-t)/1.4,0,1)
    return (np.sin(2*np.pi*f*t)+.5*np.sin(2*np.pi*f*1.004*t)+.2*np.sin(2*np.pi*2*f*t))*env*g
def pluck(m, g):
    n=int(1.4*SR); t=tt(n); f=mf(m); return (np.sin(2*np.pi*f*t)+.4*np.sin(2*np.pi*2*f*t)*np.exp(-t/.3))*np.exp(-t/.5)*np.minimum(1,t/.004)*g
bars=int(T/(4*beat))+2
for b in range(bars):
    t0=.4+b*4*beat; c=b%4; lv=np.clip((t0+1)/5,0,1)*(1 if t0<26 else 1.15)
    for m in CH[c]:
        x=pad(m,4.4*beat,.05*lv); i=int(t0*SR)
        if i<len(mus): mus[i:i+len(x)]+=x[:len(mus)-i]
    for k,off in enumerate([1,2.5,3.5]):
        m=CH[c][(k*2+1)%5]+12; x=pluck(m,.05*lv); i=int((t0+off*beat)*SR)
        if i<len(mus): mus[i:i+len(x)]+=x[:len(mus)-i]
buf[:len(mus)]+=mus

fo = buf[:N]; fo = fo / (np.abs(fo).max() or 1) * .8
st = np.stack([fo, np.roll(fo, 30)], 1)
with wave.open("audio/bed.wav", "wb") as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype(np.int16).tobytes())
# duck bed under the voice, then mix
fc = "[1:a]asplit[a][b];[b]volume=1,aformat=channel_layouts=mono[sc];[a][sc]sidechaincompress=threshold=0.04:ratio=6:attack=15:release=350:level_sc=1[bd];[bd]volume=0.55[bd2];[0:a][bd2]amix=inputs=2:normalize=0:duration=longest,alimiter=limit=0.9,loudnorm=I=-12.6:TP=-1.5:LRA=7[out]"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "audio/voice.wav", "-i", "audio/bed.wav", "-filter_complex", fc, "-map", "[out]", "-t", str(T), "-ar", "44100", "audio/mix.wav"], check=True)
print("mix ok", T)
