#!/usr/bin/env python3
"""Sync verification (lesson L010 + user feedback 'the animations and subtitles shouldnt mismatch').
Steps the film at 30 fps, measures WHEN each caption word actually becomes visible (DOM opacity >= 0.5) and WHEN each key animation actually
starts (read from real scene/DOM state via window.measure(), not from the cue table), and compares each caption/animation pair and each
caption/voice-word pair. Every pair must be within 0.15 s. Run with the playwright venv."""
import json, pathlib, sys
from playwright.sync_api import sync_playwright
TOL = 0.15
P = pathlib.Path("film.html").resolve().as_uri() + "?w=540&h=960"
TM = json.load(open("data/timing.json")); CAPS = TM["captions"]; CU = TM["cues"]
# (caption clip, word index, animation measure key, what is on screen)
PAIRS = [("l2", 0, "bi_badge", "Bombay Island logo badge pops into the top bar"), ("l2", 4, "malad", "Malad pulse ring lands on the map"), ("l2", 6, "y2018", "progress ring starts filling (micro-roastery plate)"),
         ("l3", 1, "roast", "roast curve starts drawing, beans start browning"), ("l3", 3, "crack", "first-crack pop + FIRST CRACK tag on the curve"), ("l3", 4, "menu", "signature menu card flips in"),
         ("l4", 0, "vikhroli", "Vikhroli pin lands on the map"), ("l4", 1, "y2021", "progress ring fills (Island 1.0 plate)"), ("l4", 2, "andheri", "Andheri West pulse ring lands"), ("l4", 4, "y2026", "progress ring fills (Island 2.0 plate)"),
         ("l5", 2, "layers", "coffee layer starts filling the glass"), ("l5", 3, "ice", "ice cubes drop in"), ("l5", 4, "foam", "cream foam rises"), ("l5", 7, "bar", "camera pulls back to reveal the brew bar"),
         ("l6", 0, "save", "bookmark icon fills"), ("l6", 6, "bean", "bean lands in the roaster hopper, ring pulse")]
cap_on, anim_on = {}, {}
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=metal", "--ignore-gpu-blocklist"]); pg = b.new_page(viewport={"width": 540, "height": 960}); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e))); pg.goto(P); pg.wait_for_function("window.ready===true && (window.pending||0)===0")
    n = int(TM["film"] * 30)
    for i in range(n):
        t = i / 30; pg.evaluate(f"window.setT({t})")
        r = pg.evaluate("""() => ({ caps: CAPLOG.map((c) => { let vis = c.el.parentElement.style.display !== 'none' && document.getElementById('cap').style.display !== 'none'; return vis ? parseFloat(c.el.style.opacity || 0) : 0; }), m: window.measure() })""")
        for k, o in enumerate(r["caps"]):
            if o >= 0.5 and k not in cap_on: cap_on[k] = t
        for k, v in r["m"].items():
            if v and k not in anim_on: anim_on[k] = t
    b.close()
flat = [(c, i, w, tt) for c in ("l1", "l2", "l3", "l4", "l5", "l6") for i, (w, tt) in enumerate(CAPS[c])]
idx = {(c, i): k for k, (c, i, w, tt) in enumerate(flat)}
print(f"{'caption word':<14}{'voice word t':>13}{'caption on':>12}{'d(cap-voice)':>14}   {'animation':<10}{'anim on':>9}{'d(cap-anim)':>13}  what is on screen")
bad = 0
for c, i, key, what in PAIRS:
    k = idx[(c, i)]; w, tv = flat[k][2], flat[k][3]; tc = cap_on.get(k); ta = anim_on.get(key)
    if tc is None or ta is None: print(f"{w:<14}{tv:>13.2f}  MISSING caption={tc} anim={ta} ({key})"); bad += 1; continue
    d1, d2 = tc - tv, tc - ta; ok = abs(d1) <= TOL and abs(d2) <= TOL; bad += (not ok)
    print(f"{w:<14}{tv:>13.2f}{tc:>12.2f}{d1:>+14.2f}   {key:<10}{ta:>9.2f}{d2:>+13.2f}  {what} {'OK' if ok else 'FAIL'}")
alld = [abs(cap_on[k] - flat[k][3]) for k in cap_on]
print(f"\nall {len(alld)} caption words vs their voice word times: max {max(alld):.2f}s, mean {sum(alld)/len(alld):.3f}s ({sum(a > TOL for a in alld)} over {TOL}s)")
print("PAGE ERRORS:", errs[:3] if errs else "none"); print("SYNC", "FAIL" if bad or errs or any(a > TOL for a in alld) else "OK (every pair within 0.15 s)")
sys.exit(1 if bad or errs or any(a > TOL for a in alld) else 0)
