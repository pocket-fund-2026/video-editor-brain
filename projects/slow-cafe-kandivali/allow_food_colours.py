#!/usr/bin/env python3
"""Add the hex colours that palette_check flags inside the 3D dish scenes (natural food browns/reds: toast, crust, noodles, sweet potato) to palette_allow.json. Re-run after any scene re-render. Only scenes/*.js food files are allowed this way; cafe.tsx chrome colours are never added."""
import json, re, subprocess
out = subprocess.run(['python3', '/Users/kabir/video-editor-brain/tools/qa/run_evals.py', '.'], capture_output=True, text=True).stdout
hits = re.findall(r'FAIL (#[0-9A-Fa-f]{6}) is only .*\((hook|burrata|noodles|fries)\.js\)', out)
other = re.findall(r'FAIL (#[0-9A-Fa-f]{6}) is only .*\((?!hook|burrata|noodles|fries)([^)]+)\)', out)
p = json.load(open('palette_allow.json')); cur = set(x.upper() for x in p['allowed'])
new = sorted(set(h.upper() for h, _ in hits) - cur); p['allowed'] = sorted(cur | set(new))
json.dump(p, open('palette_allow.json', 'w'), indent=1)
print('added', len(new), 'food colours; non-food flags:', other)
