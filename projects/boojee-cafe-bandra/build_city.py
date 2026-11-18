#!/usr/bin/env python3
"""Build data/city_data.js for Boojee Cafe: Mumbai island rings/roads (from the Mary Lodge Fort-frame data) shifted into the Bandra frame + the real OSM data (data/map.json). No route: the cafe is ~20 km north of Fort, so the dive is a camera flight plus an area pulse. Run from the project folder."""
import json, math
s = open('../mary-lodge-reel/data/map_data.js').read()
d = json.loads(s[s.index('=')+1:].rstrip().rstrip(';')); city = d['city']
m = json.load(open('data/map.json')); LAT, LON = m['origin']
kx = 111320*math.cos(math.radians(18.934473)); ky = 110574
FX = -(LON-72.840358)*kx; FY = (LAT-18.934473)*ky
shp = lambda pl: [round(v+(FX if i % 2 == 0 else FY)) for i, v in enumerate(pl)]
out = {'rings': [shp(r) for r in city['rings']], 'roads': [shp(r) for r in city['roads']], 'route': []}
open('data/city_data.js', 'w').write('window.MAPCITY='+json.dumps(out, separators=(',', ':'))+';\nwindow.MAPMID='+json.dumps(m, separators=(',', ':'))+';')
print('shift', round(FX), round(FY), 'rings', len(out['rings']), 'roads', len(out['roads']))
