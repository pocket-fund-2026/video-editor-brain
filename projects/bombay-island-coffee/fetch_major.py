#!/usr/bin/env python3
"""Fetch Mumbai's major roads and railway lines (OpenStreetMap) in Fort-frame metres so the high-altitude descent has real structure.
Map data: OpenStreetMap contributors. One gentle query."""
import json, math, urllib.parse, urllib.request
UA = {"User-Agent": "video-editor-brain/1.0 (map fetch)", "Accept": "application/json"}
FL, FO = 18.934473, 72.840358; kx = 111320 * math.cos(math.radians(FL)); ky = 110574
bb = "(18.89,72.76,19.28,73.00)"
q = f'[out:json][timeout:170];(way["highway"~"^(motorway|trunk|primary|secondary)$"]{bb};way["railway"="rail"]{bb};);out geom;'
req = urllib.request.Request("https://overpass-api.de/api/interpreter", data=urllib.parse.urlencode({"data": q}).encode(), headers=UA)
data = json.load(urllib.request.urlopen(req, timeout=190))
def simp(pts, tol=60):
    out = [pts[0]]
    for p in pts[1:]:
        if math.hypot(p[0] - out[-1][0], p[1] - out[-1][1]) >= tol: out.append(p)
    if out[-1] != pts[-1]: out.append(pts[-1])
    return out
roads, rails = [], []
for el in data["elements"]:
    if el["type"] != "way" or "geometry" not in el: continue
    pts = simp([(round((g["lon"] - FO) * kx), round(-(g["lat"] - FL) * ky)) for g in el["geometry"]])
    if len(pts) < 2: continue
    flat = [c for p in pts for c in p]; t = el.get("tags", {})
    if "railway" in t: rails.append(flat)
    else: roads.append({"p": flat, "w": {"motorway": 70, "trunk": 70, "primary": 55, "secondary": 40}.get(t.get("highway"), 40)})
json.dump({"roads": roads, "rails": rails}, open("data/major.json", "w"), separators=(",", ":"))
print(len(roads), "roads", len(rails), "rails")
