#!/usr/bin/env python3
"""Catch claims that must not ship unverified (lessons L004, L005).
 - no prices (rupee signs, 'Rs') and no clock times (11am, 4 pm, 11:30) in on-screen text unless project/verified.json lists them
 - the map credit 'OpenStreetMap' must be on screen when the project uses OSM data (data/*.json present)
Usage: facts_check.py PROJECT      Exit 1 on any failure.
"""
import json, os, re, sys

def main():
    p = sys.argv[1]; sd = os.path.join(p, "scenes"); fails = []
    verified = []
    vf = os.path.join(p, "verified.json")
    if os.path.exists(vf): verified = [s.lower() for s in json.load(open(vf)).get("allowed_strings", [])]
    alltext = ""
    for f in sorted(os.listdir(sd)):
        t = open(os.path.join(sd, f), encoding="utf8").read(); alltext += t
        for m in re.finditer(r"₹\s?\d|\bRs\.?\s?\d|\b\d{1,2}(:\d\d)?\s?(am|pm)\b", t, re.I):
            s = m.group(0).lower()
            if not any(s in v for v in verified): fails.append(f"{f}: unverified price or time '{m.group(0)}'")
    if os.path.isdir(os.path.join(p, "data")) and "openstreetmap" not in alltext.lower():
        fails.append("uses OpenStreetMap data but no 'OpenStreetMap contributors' credit is on screen")
    for x in fails: print("FAIL", x)
    print(f"facts_check: {len(fails)} fail")
    sys.exit(1 if fails else 0)

if __name__ == "__main__":
    main()
