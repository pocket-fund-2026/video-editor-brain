"""python3 render3.py [--times t1,t2] : renders gfx3.html as two transparent 1920x1080 PNG sequences, out/back (behind Dev) and out/front."""
import json,os,argparse
from playwright.sync_api import sync_playwright
ap=argparse.ArgumentParser();ap.add_argument('--times');ap.add_argument('--layers',default='back,front');a=ap.parse_args()
P=json.load(open('/root/reel5/params.json'))
# the behind-Dev layer only has content during the two giant numbers; elsewhere it is blank
BK=[(P['w']['over1']-.2,8.9),(P['w']['hundred2']-.4,19.8)]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox","--disable-gpu"]);pg=b.new_page(viewport={"width":1920,"height":1080})
    pg.on("pageerror",lambda e:print("pageerror",e))
    pg.goto("file:///root/reel5/gfx/gfx3.html");pg.evaluate("P=>init(P)",P)
    times=[float(x) for x in a.times.split(',')] if a.times else [i/30 for i in range(int(round(P['dur']*30)))]
    for L in a.layers.split(','):
        d=f"/root/reel5/{'prev' if a.times else 'out'}/{L}";os.makedirs(d,exist_ok=True);pg.evaluate("m=>layer(m)",L);blank=None
        for i,t in enumerate(times):
            fn=f"{d}/t{t:06.2f}.png" if a.times else f"{d}/{i:04d}.png"
            if L=='back' and not a.times and not any(s<=t<=e for s,e in BK):
                if blank is None:
                    pg.evaluate("t=>seek(t)",0.0);pg.screenshot(path=fn,omit_background=True);blank=fn
                elif not os.path.exists(fn): os.link(blank,fn)
                continue
            pg.evaluate("t=>seek(t)",t);pg.screenshot(path=fn,omit_background=True)
    b.close()
print(len(times),"frames")
