#!/usr/bin/env python3
"""Render frames of a three.js page that exposes window.setT(t) and window.ready.
Usage (scene harness: page scene_test.html, --query "&scene=pour"): render_three.py page.html OUT_DIR --times 0,3,5 [--w 1080 --h 1920] [--fps 30 --dur 8 (renders every frame)]
Run with a Python that has playwright (e.g. the scratchpad venv)."""
import argparse, os, pathlib
from playwright.sync_api import sync_playwright
ap = argparse.ArgumentParser(); ap.add_argument("page"); ap.add_argument("out")
ap.add_argument("--times"); ap.add_argument("--w", type=int, default=1080); ap.add_argument("--h", type=int, default=1920)
ap.add_argument("--query", default=""); ap.add_argument("--full", action="store_true"); ap.add_argument("--jpeg", action="store_true"); ap.add_argument("--fps", type=int, default=30); ap.add_argument("--dur", type=float)
a = ap.parse_args(); os.makedirs(a.out, exist_ok=True)
ts = [float(x) for x in a.times.split(",")] if a.times else [i / a.fps for i in range(int(a.dur * a.fps))]
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=metal", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"])
    pg = b.new_page(viewport={"width": a.w, "height": a.h})
    pg.on("console", lambda m: print("console:", m.text)); pg.on("pageerror", lambda e: print("pageerror:", e))
    pg.goto(pathlib.Path(a.page).resolve().as_uri() + f"?w={a.w}&h={a.h}" + a.query); pg.wait_for_function("window.ready===true", timeout=15000)
    pg.wait_for_function("(window.pending||0)===0", timeout=20000)
    for i, t in enumerate(ts):
        pg.evaluate(f"window.setT({t})")
        ext = "jpg" if a.jpeg else "png"; name = f"f{i:05d}.{ext}" if a.dur else f"t{t:05.2f}.{ext}"
        (pg.locator("#stage") if a.full else pg.locator("canvas")).screenshot(path=os.path.join(a.out, name), **({"type": "jpeg", "quality": 93} if a.jpeg else {}))
    b.close()
print("done", len(ts))
