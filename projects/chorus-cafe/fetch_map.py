#!/usr/bin/env python3
"""Fetch the Kala Ghoda area from OpenStreetMap for the Stitched Map (roads with names, buildings, parks, water, named landmarks).
Output: data/kalaghoda.json, metres around the Chorus pin. Overpass needs a descriptive User-Agent and an Accept header."""
import json, math, urllib.parse, urllib.request
LAT, LON = 18.9290605, 72.8323474
DY, DX = 0.0062, 0.0068           # about 690 m north-south, 720 m east-west
s, w, n, e = LAT - DY, LON - DX, LAT + DY, LON + DX; bb = f"({s},{w},{n},{e})"
q = f'''[out:json][timeout:60];(
 way["building"]{bb}; way["highway"]{bb}; way["leisure"~"park|garden|pitch|playground"]{bb}; way["landuse"~"grass|recreation_ground|village_green"]{bb};
 way["natural"~"water|coastline|beach"]{bb}; way["waterway"]{bb}; way["railway"]{bb};
 nwr["name"]["tourism"~"museum|gallery|attraction|artwork"]{bb}; nwr["name"]["historic"]{bb};
 nwr["name"]["amenity"~"arts_centre|theatre|cinema|university|college|library|courthouse|place_of_worship|cafe|restaurant"]{bb};
 way["name"]["leisure"]{bb};
);out geom;'''
req = urllib.request.Request("https://overpass-api.de/api/interpreter", data=urllib.parse.urlencode({"data": q}).encode(), headers={"User-Agent": "video-editor-brain/1.0 (map fetch)", "Accept": "application/json"})
raw = json.load(urllib.request.urlopen(req, timeout=170))
kx = 111320 * math.cos(math.radians(LAT)); ky = 110574
P = lambda g: (round((g["lon"] - LON) * kx, 1), round(-(g["lat"] - LAT) * ky, 1))
def poly(el): return [P(g) for g in el["geometry"]] if "geometry" in el else None
out = {"origin": [LAT, LON], "roads": [], "buildings": [], "green": [], "water": [], "rail": [], "landmarks": []}
seen = set()
for el in raw["elements"]:
    t = el.get("tags", {})
    if el["type"] == "way" and "geometry" in el:
        pts = poly(el)
        if len(pts) < 2: continue
        flat = [round(c, 1) for p in pts for c in p]
        if "building" in t:
            out["buildings"].append({"p": flat, "name": t.get("name"), "levels": t.get("building:levels")})
        elif "highway" in t:
            out["roads"].append({"p": flat, "hw": t["highway"], "name": t.get("name")})
        elif t.get("leisure") or t.get("landuse") in ("grass", "recreation_ground", "village_green"):
            out["green"].append({"p": flat, "name": t.get("name")})
        elif t.get("natural") in ("water", "coastline", "beach") or "waterway" in t:
            out["water"].append({"p": flat, "name": t.get("name")})
        elif "railway" in t:
            out["rail"].append({"p": flat})
    nm = t.get("name")
    if nm and (t.get("tourism") or t.get("historic") or t.get("amenity")):
        c = el.get("center") or ({"lat": sum(g["lat"] for g in el["geometry"]) / len(el["geometry"]), "lon": sum(g["lon"] for g in el["geometry"]) / len(el["geometry"])} if "geometry" in el else {"lat": el.get("lat"), "lon": el.get("lon")})
        if c.get("lat") and (nm, el["type"]) not in seen:
            seen.add((nm, el["type"])); out["landmarks"].append({"name": nm, "x": P(c)[0], "y": P(c)[1], "kind": t.get("tourism") or t.get("historic") or t.get("amenity")})
import os; os.makedirs("data", exist_ok=True)
json.dump(out, open("data/kalaghoda.json", "w"), separators=(",", ":"))
print({k: len(v) for k, v in out.items() if isinstance(v, list)}, os.path.getsize("data/kalaghoda.json") // 1024, "KB")
for l in sorted(out["landmarks"], key=lambda l: math.hypot(l["x"], l["y"]))[:40]: print(f"  {l['name'][:40]:40s} {l['kind']:14s} {math.hypot(l['x'],l['y']):5.0f} m")
