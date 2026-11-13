#!/usr/bin/env python3
"""Real overlap check for film.html: every 0.25 s, find visible text/logo blocks that overlap or leave the 1080x1920 frame."""
import pathlib, sys
from playwright.sync_api import sync_playwright
P = pathlib.Path(__file__).parent / "film.html"
JS = r"""() => {
  const out = []; const ids = ['logo','tag','osm','jl','mq','tile0','tile1','tile2','tile3','fbl','fbs','dn','ename','ecard','eid','eplace'];
  const els = [...document.querySelectorAll('#logo,#tag,#osm,#jl,#mq,.tile,#fbl,#fbs,#dn,#ename,#ecard,#eid,#eplace')];
  els.forEach((e) => { const cs = getComputedStyle(e); let op = 1, vis = true; for (let x = e; x && x.id !== 'ui'; x = x.parentElement) { const c = getComputedStyle(x); op *= parseFloat(c.opacity); if (c.display === 'none') vis = false; }
    if (!vis || op < 0.5) return; const r = e.getBoundingClientRect(); out.push({ id: e.id || e.className, x0: r.left, y0: r.top, x1: r.right, y1: r.bottom }); });
  return out; }"""
fails = []
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=metal", "--ignore-gpu-blocklist"])
    pg = b.new_page(viewport={"width": 540, "height": 960}); pg.goto(P.as_uri() + "?w=540&h=960"); pg.wait_for_function("window.ready===true"); pg.wait_for_function("(window.pending||0)===0")
    for k in range(0, 80):
        t = k * 0.25; pg.evaluate(f"window.setT({t})"); bl = pg.evaluate(JS)
        for a in bl:
            if a["x0"] < -2 or a["y0"] < -2 or a["x1"] > 542 or a["y1"] > 962: fails.append(f"{t:.2f}s {a['id']} leaves the frame {a}")
        for i in range(len(bl)):
            for j in range(i + 1, len(bl)):
                a, c = bl[i], bl[j]
                if {a["id"], c["id"]} & {"logo"} and t > 16.5: continue
                ox = min(a["x1"], c["x1"]) - max(a["x0"], c["x0"]); oy = min(a["y1"], c["y1"]) - max(a["y0"], c["y0"])
                if ox > 3 and oy > 3: fails.append(f"{t:.2f}s overlap {a['id']} x {c['id']} ({ox:.0f}x{oy:.0f}px at half scale)")
    b.close()
for f in fails: print("FAIL", f)
print(f"overlap_film: {len(fails)} fail"); sys.exit(1 if fails else 0)
