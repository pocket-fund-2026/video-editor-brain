#!/usr/bin/env python3
"""Learn editing rules from earlier work and write lessons.json for the studio.

Sources (all optional, missing ones are skipped):
  - reel4/params.json + timeline.json : how graphics were timed to words in the shipped 700-pharmacies reel
  - style-reels/cuts/*.txt            : scene-change times of the reference reels (cut rhythm)
  - plans/*.json                      : plans the studio saved (what the user kept / retimed) -> edits win over defaults
Run:  python3 learn.py [--root /root] [--plans DIR]  ->  ../lessons.json
"""
import json, glob, os, statistics as st, sys, argparse

ap = argparse.ArgumentParser()
ap.add_argument('--root', default='/root'); ap.add_argument('--plans'); ap.add_argument('--out', default=os.path.join(os.path.dirname(__file__), '..', 'lessons.json'))
a = ap.parse_args(); R = a.root
L = {'sources': {}, 'rules': {}}

# 1. cut rhythm from the reference reels (merge flash cuts < 0.35 s)
shots = []
for f in glob.glob(f'{R}/style-reels/cuts/*.txt'):
    t = sorted(float(x) for x in open(f).read().split() if x.strip())
    c = [t[0]] if t else []
    for x in t[1:]:
        if x - c[-1] >= 0.35: c.append(x)
    shots += [b - a_ for a_, b in zip(c, c[1:])]
if shots:
    L['sources']['style_reels_shots'] = len(shots)
    L['rules']['avg_shot_s'] = round(st.median(shots), 2)
    L['rules']['shot_range_s'] = [round(st.quantiles(shots, n=10)[0], 2), round(st.quantiles(shots, n=10)[-1], 2)]

# 2. graphic timing vs spoken words from the shipped reel
try:
    P = json.load(open(f'{R}/reel4/params.json')); TL = json.load(open(f'{R}/reel4/timeline.json'))
    W = {}  # reel-time word starts
    for s in TL:
        for w0, w1, w in s['words']: W.setdefault(w.lower(), w0)
    # (graphic key, internal offset of its key beat, spoken key word)
    pairs = [('B_map', 'c0', 'over'), ('C_years', 'y0', 'years'), ('C_years', 'hundred', 'hundred'), ('D_year', 'c0', 'one'), ('F_push', 'push', 'inspires')]
    reveal, lead = [], []
    for g, k, word in pairs:
        if g in P and k in P[g] and word in W:
            absb = P[g]['start'] + P[g][k]
            reveal.append(round(W[word] - absb, 2)); lead.append(round(W[word] - P[g]['start'], 2))
    durs = [v['dur'] for k, v in P.items() if isinstance(v, dict) and 'dur' in v]
    if reveal:
        L['sources']['shipped_reel_pairs'] = len(reveal)
        L['rules']['reveal_before_word_s'] = round(st.median(reveal), 2)   # key beat lands this long before the word (neg = after)
        L['rules']['graphic_lead_in_s'] = round(max(0.3, min(st.median(lead), 3.0)), 2)  # graphic appears this long before its key word
    if durs:
        L['rules']['graphic_len_s'] = [round(min(durs), 1), round(max(durs), 1)]
    L['rules']['avg_cut_len_s'] = round(st.mean(s['reel'][1] - s['reel'][0] for s in TL if s['reel'][1] - s['reel'][0] > 1.5), 2)
except Exception as e:
    L['sources']['shipped_reel_error'] = str(e)

# 3. what the user actually did in the studio
if a.plans:
    offs, durs, used = [], [], {}
    for f in glob.glob(os.path.join(a.plans, '*.json')):
        d = json.load(open(f)); p = d.get('plan', d)
        for an in p.get('anims', []):
            if an.get('on', True):
                offs.append(an['o']); durs.append(an['d']); used[an['t']] = used.get(an['t'], 0) + 1
    if offs:
        L['sources']['studio_animations'] = len(offs)
        L['rules']['user_offset_s'] = round(st.median(offs), 2); L['rules']['user_len_s'] = round(st.median(durs), 2)
        L['rules']['favourite_animations'] = sorted(used, key=used.get, reverse=True)[:5]

# defaults when nothing could be learned
L['rules'].setdefault('graphic_lead_in_s', 0.8); L['rules'].setdefault('reveal_before_word_s', 0.1)
L['rules'].setdefault('avg_shot_s', 3.0); L['rules'].setdefault('graphic_len_s', [3.0, 6.0])
json.dump(L, open(a.out, 'w'), indent=2); print(json.dumps(L, indent=2))
