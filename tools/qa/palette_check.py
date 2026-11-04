#!/usr/bin/env python3
"""Fail when a film's palette sits close to colors that read as Claude/Anthropic branding (lesson L001).

The blocklist (memory/brand_blocklist.json) holds approximate lookalike colors: terracotta/orange and warm cream.
Checks the four palette variables in base.css plus every hex color used in shared.js and the scenes.
Usage: palette_check.py PROJECT [--max-delta 22]     Exit 1 when a color is too close.
"""
import argparse, json, os, re, sys

def lab(h):
    h = h.lstrip("#"); r, g, b = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    f = lambda c: ((c + 0.055) / 1.055) ** 2.4 if c > 0.04045 else c / 12.92
    r, g, b = f(r), f(g), f(b)
    x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047; y = 0.2126 * r + 0.7152 * g + 0.0722 * b; z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883
    g_ = lambda t: t ** (1 / 3) if t > 0.008856 else 7.787 * t + 16 / 116
    return (116 * g_(y) - 16, 500 * (g_(x) - g_(y)), 200 * (g_(y) - g_(z)))

def delta(a, b):
    return sum((p - q) ** 2 for p, q in zip(lab(a), lab(b))) ** 0.5

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("project"); ap.add_argument("--max-delta", type=float, default=22)
    ap.add_argument("--blocklist", default=os.path.join(os.path.dirname(__file__), "..", "..", "memory", "brand_blocklist.json"))
    a = ap.parse_args()
    block = json.load(open(a.blocklist)); bad = [(n, c) for n, cs in block.items() if not n.startswith("_") for c in cs]
    cr = block.get("_cream_rule", {"L_min": 82, "b_min": 5, "b_max": 28})
    files = [os.path.join(a.project, "base.css"), os.path.join(a.project, "shared.js")] + [os.path.join(a.project, "scenes", f) for f in sorted(os.listdir(os.path.join(a.project, "scenes")))]
    found = {}
    for f in files:
        if not os.path.exists(f): continue
        txt = open(f, encoding="utf8").read()
        for h in re.findall(r"#[0-9a-fA-F]{6}\b", txt): found.setdefault(h.upper(), set()).add(os.path.basename(f))
        for r, g, b in re.findall(r"rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)", txt):
            found.setdefault("#%02X%02X%02X" % (int(r), int(g), int(b)), set()).add(os.path.basename(f))
    fails = []
    ap_ = os.path.join(a.project, "palette_allow.json")   # client logo artwork etc. may keep its own colors
    allow = {c.upper() for c in json.load(open(ap_)).get("allowed", [])} if os.path.exists(ap_) else set()
    found = {h: fs for h, fs in found.items() if h not in allow}
    for h, fs in sorted(found.items()):
        for name, c in bad:
            d = delta(h, c)
            if d < a.max_delta: fails.append((h, name, c, round(d, 1), sorted(fs)))
    for h, fs in sorted(found.items()):
        L, A, B = lab(h)
        if L > cr["L_min"] and cr["b_min"] < B < cr["b_max"]: fails.append((h, "warm-cream", "(warm light neutral)", round(B, 1), sorted(fs)))
    for h, name, c, d, fs in fails: print(f"FAIL {h} is only dE {d} from {name} {c}  ({', '.join(fs)})")
    print(f"palette_check: {len(found)} colors checked, {len(fails)} too close to a Claude lookalike")
    sys.exit(1 if fails else 0)

if __name__ == "__main__":
    main()
