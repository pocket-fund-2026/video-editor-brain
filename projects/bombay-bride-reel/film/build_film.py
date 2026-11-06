#!/usr/bin/env python3
"""Build film.html for this project from film_template.html (self-contained: fonts, photos and the Bb outlines live in assets/).
Usage: python3 build_film.py      -> film/film.html and ../scenes.json. Needs ../data/timing.json (word times from the voice)."""
import json, base64, os
HERE = os.path.dirname(os.path.abspath(__file__))
def b64(p): return base64.b64encode(open(p, 'rb').read()).decode()
F = os.path.join(HERE, 'assets', 'fonts') + '/'
FONTS = f"""@font-face{{font-family:"Bodoni Moda";font-style:normal;font-weight:400 900;src:url(data:font/woff2;base64,{b64(F+'bodoni.woff2')}) format("woff2")}}
@font-face{{font-family:"Bodoni Moda";font-style:italic;font-weight:400 900;src:url(data:font/woff2;base64,{b64(F+'bodoni_i.woff2')}) format("woff2")}}
@font-face{{font-family:"Jost";font-style:normal;font-weight:100 900;src:url(data:font/woff2;base64,{b64(F+'jost.woff2')}) format("woff2")}}"""
timing = json.load(open(os.path.join(HERE, '..', 'data', 'timing.json')))
scenes = [('hook', 3.0), ('cover', 2.6), ('gold', 4.4), ('silk', 4.4), ('paithani', 4.0), ('mehndi', 3.7), ('bangles', 3.6), ('back', 4.0)]
for sid, d in scenes:
    assert d >= timing[sid]['seconds'] + 0.15 - 0.01, (sid, d)
bb = json.load(open(os.path.join(HERE, 'assets', 'bb_snippet.json')))
PH = 'file://' + os.path.join(HERE, 'assets', 'img') + '/'
t = open(os.path.join(HERE, 'film_template.html')).read().replace('__FONTS__', FONTS).replace('__TIMING__', json.dumps(timing)).replace('__BB__', json.dumps(bb)).replace('__SCENES__', json.dumps([{'id': s, 'dur': d} for s, d in scenes])).replace('__PH__', PH)
open(os.path.join(HERE, 'film.html'), 'w').write(t)
json.dump({"v": 1, "scenes": [{"id": s, "dur": d} for s, d in scenes]}, open(os.path.join(HERE, '..', 'scenes.json'), 'w'), indent=1)
print('built film.html, total', round(sum(d for s, d in scenes), 2), 's')
