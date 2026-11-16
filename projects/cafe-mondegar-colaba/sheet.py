#!/usr/bin/env python3
"""Contact sheet of a folder of frames: sheet.py DIR OUT.png [cols] [labels comma separated]"""
import sys, os
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]; cols = int(sys.argv[3]) if len(sys.argv) > 3 else 4
labels = sys.argv[4].split(",") if len(sys.argv) > 4 else []
fs = sorted(f for f in os.listdir(d) if f.endswith(".png") and f.startswith("frame"))
w, h = 360, 640; rows = (len(fs) + cols - 1) // cols
S = Image.new("RGB", (cols * w, rows * (h + 24)), (30, 30, 30))
for i, f in enumerate(fs):
    im = Image.open(os.path.join(d, f)).convert("RGB").resize((w, h)); x, y = (i % cols) * w, (i // cols) * (h + 24)
    S.paste(im, (x, y + 24)); ImageDraw.Draw(S).text((x + 6, y + 6), labels[i] if i < len(labels) else f, fill=(255, 255, 255))
S.save(out, quality=88); print(out, S.size)
