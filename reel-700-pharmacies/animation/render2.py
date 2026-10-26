"""python3 render2.py <id> [--times t1,t2] [--fps 30] [--out DIR]  (design v2: cream cards over the footage)"""
import os, argparse
from playwright.sync_api import sync_playwright
JOBS = {
 "A_headline": ("headline", dict(dur=2.8)),
 "B_map":      ("map",      dict(dur=6.2, c0=2.55, fill=2.6)),
 "C_years":    ("years",    dict(dur=6.1, y0=0.7, y5=1.7, first=3.12, hundred=5.26)),
 "D_year":     ("year",     dict(dur=6.4, c0=0.25, fill=0.75, three=4.3, pulse=5.74)),
 "E_end":      ("end",      dict(dur=2.2)),
}
import json
_P=json.load(open("/root/reel4/params.json"))
for _k,_v in _P.items():
    if _k in JOBS: JOBS[_k][1].update({k:v for k,v in _v.items() if k!="start"})
ap=argparse.ArgumentParser(); ap.add_argument("id"); ap.add_argument("--fps",type=int,default=30); ap.add_argument("--times"); ap.add_argument("--out",default="/root/reel4/out2")
a=ap.parse_args(); name,P=JOBS[a.id]
d=os.path.join(a.out,a.id); os.makedirs(d,exist_ok=True)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox","--disable-gpu"]); pg=b.new_page(viewport={"width":1080,"height":1920})
    pg.on("pageerror",lambda e:print("pageerror",e))
    pg.goto("file:///root/reel4/gfx/gfx2.html"); pg.evaluate("([n,P])=>init(n,P)",[name,P])
    times=[float(x) for x in a.times.split(",")] if a.times else [i/a.fps for i in range(int(round(P["dur"]*a.fps)))]
    for i,t in enumerate(times):
        pg.evaluate("t=>seek(t)",min(t,P["dur"])); fn=f"{d}/t{t:06.2f}.png" if a.times else f"{d}/{i:04d}.png"; pg.screenshot(path=fn,omit_background=True)
    b.close()
print(a.id,len(times),"frames")
