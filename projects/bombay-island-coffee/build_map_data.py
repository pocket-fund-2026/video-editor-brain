#!/usr/bin/env python3
"""Compose data/map_data.js: city outline + coarse roads (Fort frame, from the earlier Fort/Prithvi data) + three OSM detail clusters
(Malad, Vikhroli East, Andheri West) placed in the same Fort-frame metres. Map data: OpenStreetMap contributors."""
import json, math, re
src = open("../prithvi-cafe-juhu/data/map_data.js").read()
city = json.loads(re.search(r"window\.MAPD=(\{.*\});?\s*$", src, re.S).group(1))["city"]
FL, FO = 18.934473, 72.840358; kx = 111320 * math.cos(math.radians(FL)); ky = 110574
pins = {"malad": (19.1852851, 72.8358611), "vikhroli": (19.0943733, 72.9225649), "andheri": (19.1172495, 72.8339680)}
out = {"city": city, "cl": {}}
for k, (la, lo) in pins.items():
    d = json.load(open(f"data/{k}.json"))
    out["cl"][k] = {"c": [round((lo - FO) * kx, 1), round(-(la - FL) * ky, 1)], "b": d["b"], "r": d["r"], "g": d["g"], "w": d["w"]}
    print(k, out["cl"][k]["c"], len(d["b"]), "buildings")
open("data/map_data.js", "w").write("window.MAPD=" + json.dumps(out, separators=(",", ":")) + ";")
import os; print(os.path.getsize("data/map_data.js") // 1024, "KiB")
