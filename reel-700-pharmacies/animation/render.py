"""Render a graphic as a transparent PNG sequence: python3 render.py <id> [--fps 30] [--times t1,t2,...] [--out DIR]
Each graphic is a paused GSAP timeline seeked per frame, so output is frame-exact."""
import sys, os, json, argparse
from playwright.sync_api import sync_playwright

JOBS = {
 "01_title":    ("title",    dict(dur=3.0)),
 "02_map":      ("map",      dict(dur=4.0)),
 "03_tag_5yrs": ("tag",      dict(dur=2.0, text="LESS THAN 5 YEARS")),
 "04_stat100":  ("stat",     dict(dur=5.0, kicker="YEAR ONE", to=100, suffix="+", label="ACQUISITIONS", c0=0.4, cd=1.5)),
 "05_calendar": ("calendar", dict(dur=3.0)),
 "06_london":   ("tag",      dict(dur=1.2, text="LONDON, UK", icon="pin")),
 "07_stat250":  ("stat",     dict(dur=5.0, kicker="", to=250, suffix="", label="SERIAL ACQUIRERS", c0=0.5, cd=1.3, logo="../logos/rollupeurope_white.png", top="330px")),
 "08_ring":     ("ring",     dict(dur=4.1, c0=0.8, land=2.45)),
 "09_bars":     ("bars",     dict(dur=4.4, t1=0.15, t2=2.05)),
 "10_tag_flow": ("tag",      dict(dur=2.0, text="CRITERIA: DEAL FLOW")),
 "11_checklist":("checklist",dict(dur=4.8, t1=0.05, t2=1.85, t3=3.35)),
 "12_end":      ("end",      dict(dur=6.0)),
 "00_scrim":    ("scrim",    dict(dur=0.04)),
}

ap = argparse.ArgumentParser(); ap.add_argument("id"); ap.add_argument("--fps", type=int, default=30)
ap.add_argument("--times"); ap.add_argument("--out", default="/root/reel4/out")
a = ap.parse_args()
name, P = JOBS[a.id]
outdir = os.path.join(a.out, a.id); os.makedirs(outdir, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox", "--disable-gpu"])
    pg = b.new_page(viewport={"width": 1080, "height": 1920})
    pg.goto("file:///root/reel4/gfx/gfx.html")
    dur = pg.evaluate("([n,P])=>init(n,P)", [name, P])
    times = [float(x) for x in a.times.split(",")] if a.times else [i / a.fps for i in range(int(round(P["dur"] * a.fps)))]
    for i, t in enumerate(times):
        pg.evaluate("t=>seek(t)", min(t, P["dur"]))
        fn = f"{outdir}/t{t:06.2f}.png" if a.times else f"{outdir}/{i:04d}.png"
        pg.screenshot(path=fn, omit_background=True)
    b.close()
print(a.id, "timeline", round(dur, 2), "s,", len(times), "frames ->", outdir)
