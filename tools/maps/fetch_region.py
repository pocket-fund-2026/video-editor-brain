#!/usr/bin/env python3
"""Fetch a real-geography region for the FortMap engine (projects/*/shared.js) from OpenStreetMap.
Output: data/map.json (buildings with heights, roads, green, water in metres around the main pin).
Usage: fetch_region.py --lat 18.934473 --lon 72.840358 --radius 420 --halfbox 0.010 --out projects/NEW/data/map.json
Rules: Overpass needs a descriptive User-Agent and an Accept header (otherwise HTTP 406). Be gentle: one query per region.
Credit "Map data: OpenStreetMap contributors" must be on screen. City outline: Nominatim search with polygon_geojson=1.
"""
import argparse, json, math, random, urllib.parse, urllib.request

UA = {"User-Agent": "video-editor-brain/1.0 (map fetch)", "Accept": "application/json"}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lat", type=float, required=True); ap.add_argument("--lon", type=float, required=True)
    ap.add_argument("--radius", type=float, default=420); ap.add_argument("--halfbox", type=float, default=0.010); ap.add_argument("--out", required=True)
    a = ap.parse_args()
    s, w, n, e = a.lat - a.halfbox, a.lon - a.halfbox, a.lat + a.halfbox, a.lon + a.halfbox; bb = f"({s},{w},{n},{e})"
    q = f'[out:json][timeout:90];(way["building"]{bb};way["highway"]{bb};way["natural"="water"]{bb};way["leisure"~"park|garden|pitch"]{bb};);out geom;'
    req = urllib.request.Request("https://overpass-api.de/api/interpreter", data=urllib.parse.urlencode({"data": q}).encode(), headers=UA)
    data = json.load(urllib.request.urlopen(req, timeout=170))
    kx = 111320 * math.cos(math.radians(a.lat)); ky = 110574
    P = lambda g: (round((g["lon"] - a.lon) * kx), round(-(g["lat"] - a.lat) * ky))
    def simp(pts, tol=1.2):
        out = [pts[0]]
        for p in pts[1:]:
            if math.hypot(p[0] - out[-1][0], p[1] - out[-1][1]) >= tol: out.append(p)
        return out
    inside = lambda pts: any(abs(x) < a.radius and abs(y) < a.radius * 1.6 for x, y in pts)
    random.seed(7); b, r, g, wt = [], [], [], []
    for el in data["elements"]:
        t = el.get("tags", {})
        if el["type"] != "way" or "geometry" not in el: continue
        pts = simp([P(q) for q in el["geometry"]])
        if len(pts) < 2 or not inside(pts): continue
        flat = [c for q in pts for c in q]
        if "building" in t and len(pts) >= 3:
            h = None
            for key, mul in (("height", 1), ("building:levels", 3.3)):
                try: h = h or float(str(t[key]).split()[0]) * mul
                except Exception: pass
            b.append({"p": flat, "h": round(h if h else random.uniform(10, 22))})
        elif "highway" in t:
            r.append({"p": flat, "w": {"primary": 16, "secondary": 14, "tertiary": 12, "residential": 9, "service": 5, "footway": 3}.get(t["highway"], 7)})
        elif t.get("natural") == "water": wt.append({"p": flat})
        else: g.append({"p": flat})
    json.dump({"origin": [a.lat, a.lon], "b": b, "r": r, "w": wt, "g": g}, open(a.out, "w"), separators=(",", ":"))
    print(f"buildings {len(b)} roads {len(r)} water {len(wt)} green {len(g)} -> {a.out}")

if __name__ == "__main__":
    main()
