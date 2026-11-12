#!/usr/bin/env python3
"""python sheet.py OUT.png t1,t2,... [--cols 6]  renders film frames at those times and tiles them (run with the playwright venv)."""
import subprocess, sys, os, shutil
from PIL import Image
out, times = sys.argv[1], sys.argv[2]; d = "frames/_s"; shutil.rmtree(d, ignore_errors=True)
subprocess.run([sys.executable, os.path.expanduser("~/video-editor-brain/tools/three/render_three.py"), "film.html", d, "--times", times, "--full"], check=True, capture_output=True)
ts = [float(x) for x in times.split(",")]; ims = [Image.open(f"{d}/t{t:05.2f}.png").resize((360, 640)) for t in ts]
cols = min(6, len(ims)); rows = (len(ims) + cols - 1) // cols; s = Image.new("RGB", (360 * cols, 640 * rows))
for i, im in enumerate(ims): s.paste(im, ((i % cols) * 360, (i // cols) * 640))
s.save(out); print(out)
