#!/usr/bin/env python3
"""Catch claims that must not ship unverified (lessons L004, L005).
 - no prices (rupee signs, 'Rs') and no clock times (11am, 4 pm, 11:30) in on-screen text unless project/verified.json lists them
 - the map credit 'OpenStreetMap' must be on screen when the project uses OSM data (data/*.json present)
Usage: facts_check.py PROJECT      Exit 1 on any failure.
"""
import json, os, re, sys

def norm(s):
    return re.sub(r"[^a-z0-9 ]+", "", re.sub(r"[\u2018\u2019\u201c\u201d'\"]", "", s.lower())).split()

def main():
    p = sys.argv[1]; sd = os.path.join(p, "scenes"); fails = []
    verified = []
    vf = os.path.join(p, "verified.json")
    vdoc = json.load(open(vf)) if os.path.exists(vf) else {}
    verified = [s.lower() for s in vdoc.get("allowed_strings", [])]
    film = not os.path.isdir(sd)
    files = [os.path.join(p, "film", "film_template.html")] if film else [os.path.join(sd, f) for f in sorted(os.listdir(sd))]
    alltext = ""
    if film:   # every spoken sentence (data/timing.json) must be one of verified.json's strings
        vs = [" ".join(norm(x.get("text", ""))) for x in vdoc.get("strings", [])]
        tj = os.path.join(p, "data", "timing.json")
        spoken = [(k, v["text"]) for k, v in json.load(open(tj)).items()] if os.path.exists(tj) else []
        for sid, text in spoken:
            for sent in re.split(r"(?<=[.!?])\s+", text):
                w = norm(sent)
                if len(w) <= 2: continue          # one-word labels like 'Gold.' and 'Silk.'
                if not any(" ".join(w) in v for v in vs): fails.append(f"{sid}: spoken line not in verified.json: '{sent}'")
    for fpath in files:
        f = os.path.basename(fpath); t = open(fpath, encoding="utf8").read(); alltext += t
        for m in re.finditer(r"₹\s?\d|\bRs\.?\s?\d|\b\d{1,2}(:\d\d)?\s?(am|pm)\b", t, re.I):
            s = m.group(0).lower()
            if not any(s in v for v in verified): fails.append(f"{f}: unverified price or time '{m.group(0)}'")
    mapdata = [x for x in (os.listdir(os.path.join(p, "data")) if os.path.isdir(os.path.join(p, "data")) else []) if x != "timing.json"]
    if mapdata and "openstreetmap" not in alltext.lower():
        fails.append("uses OpenStreetMap data but no 'OpenStreetMap contributors' credit is on screen")
    for x in fails: print("FAIL", x)
    print(f"facts_check: {len(fails)} fail")
    sys.exit(1 if fails else 0)

if __name__ == "__main__":
    main()
