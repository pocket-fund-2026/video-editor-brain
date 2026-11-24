#!/usr/bin/env python3
"""records.coffee sound: synthesized foley + soft pad bed (numpy only), ducked under the voice -> audio/mix.wav. Event times are FILM seconds (scene starts: 0, 4.4, 8.8, 13.2). No pouring sounds anywhere (L059). Run: python3 build_audio.py"""

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
# hook: window light whoosh over the name, record spines thud in, one spine pulled out on "Veranda" (1.36), Pali Hill tag pings
put(0.1, swish(1.8, 400, 3800), .3); put(0.3, thud(.8), .5)
for i in range(0, 21, 2): put(0.3 + i * .045, click(), .22)
put(1.3, swish(.35, 1200, 2800), .3); put(1.4, clack(), .5); put(2.32, chime(), .25)
# venetian-blind wipe into every scene (slat swish + soft thud)
for s_ in [3.9, 7.7, 13.7]:
    put(s_-.35, swish(.7, 700, 3600), .45)
    for k in range(5): put(s_-.3+k*.05, tick(), .22)
    put(s_, thud(.5), .25)
# map: dive whoosh, key tag swings on "boutique hotel", street words tick, area ripples
put(4.0, swish(2.4, 300, 5000), .28)
put(4.5, clink(1700), .35); put(4.75, clink(2100), .18); put(5.0, clink(1900), .1)
for tm in [5.86, 6.18, 6.65]: put(tm, tick(), .5)
def ping(g=1): n=int(.9*SR); t=tt(n); return (sine(880,n)*np.exp(-t/.28)+.4*sine(1760,n)*np.exp(-t/.18))*g
for i,tm in enumerate([4.7,5.2,5.7]): put(tm, ping(.35/(1+i*.4)))
# food A (7.7): milk layer, coffee layer rise, ice cubes clack in, straw slides
put(8.0, swish(.5, 500, 1400), .25); put(8.3, swish(.6, 400, 1200), .25)
for i in range(5): put(8.55+i*.12, clack(), .45); 
put(8.95, swish(.4, 1500, 3000), .22)
# food B (10.1): frappe fills, cream stacks, drizzle, hazelnuts pop
put(10.15, swish(.5, 500, 1500), .25)
for i in range(3): put(10.6+i*.14, tick(), .5)
put(11.05, swish(.45, 1800, 3400), .25)
for i in range(5): put(11.2+i*.1, click(), .4)
# food C (11.93): pastry pops, splits with a crunch, crumbs
put(11.98, thud(.6), .5); put(12.42, crunch(), .9); put(12.5, crunch(), .6); put(12.6, swish(.3,1200,2600), .25)
for i in range(6): put(12.7+i*.05, tick(), .25)
# end card: chime, soft thud
put(13.8, chime(), .45); put(14.05, thud(.5)); put(16.3, clink(2093), .2)
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
    t0=.4+b*4*beat; c=b%4; lv=np.clip((t0+1)/5,0,1)*(1 if t0<13 else 1.15)
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
