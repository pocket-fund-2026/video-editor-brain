#!/usr/bin/env python3
"""Heuristic anti-slop check (lesson L013). Flags the defaults that make a film look AI-generated.
Only enforced for projects whose design_brief.json has "anti_slop": true (all new films). It is a floor, not a judge of taste.
FAIL: more than 1 gradient, any glow (box-shadow or text-shadow blur over 12px, filter blur/drop-shadow), any emoji, backdrop-filter, more than 6 uniform pill/card radii.
Usage: slop_check.py PROJECT
"""
import json, os, re, sys

def main():
    p = sys.argv[1]; bf = os.path.join(p, "design_brief.json")
    if not os.path.exists(bf) or not json.load(open(bf)).get("anti_slop"): print("slop_check: skipped (project not flagged anti_slop)"); return
    files = [os.path.join(p, "base.css"), os.path.join(p, "shared.js")] + [os.path.join(p, "scenes", f) for f in sorted(os.listdir(os.path.join(p, "scenes")))] if os.path.isdir(os.path.join(p, "scenes")) else []
    txt = {f: open(f, encoding="utf8").read() for f in files if os.path.exists(f)}
    fails = []; grads = 0; radii = 0
    for f, t in txt.items():
        n = os.path.basename(f)
        grads += len(re.findall(r"(linear|radial|conic)-gradient|createRadialGradient|createLinearGradient", t))
        radii += len(re.findall(r"border-radius:\s*(9{3}|50%|\d{2,}px)", t))
        for m in re.finditer(r"(box|text)-shadow:[^;\"']*?(\d+)px\s+(\d+)px\s+(\d+)px", t):
            if int(m.group(4)) > 12: fails.append(f"{n}: glow shadow ({m.group(0)[:50]})")
        if re.search(r"filter:\s*(blur|drop-shadow)|backdrop-filter|shadowBlur", t): fails.append(f"{n}: blur or glow filter")
        if re.search("[\U0001F300-\U0001FAFF☀-➿]", t): fails.append(f"{n}: emoji in the film")
    if grads > 1: fails.append(f"{grads} gradients (max 1): flat colour and real texture only")
    if radii > 6: fails.append(f"{radii} rounded pill/card radii (max 6): vary shapes, no uniform card grid")
    for x in fails: print("FAIL", x)
    print(f"slop_check: {len(fails)} fail ({grads} gradients, {radii} rounded boxes)"); sys.exit(1 if fails else 0)

if __name__ == "__main__":
    main()
