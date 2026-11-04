#!/usr/bin/env python3
"""Find text that overlaps other text, spills out of the frame, or sits in the Reels/TikTok UI zones.

Samples every scene every --step seconds (default 0.5) in the stand-in player (render_frames.py).
FAIL  = two different text blocks overlap, or text leaves the frame.   (lessons: L002)
WARN  = text inside the platform UI zones: top 250, bottom 420, right 120 px of a 1080x1920 frame. (lesson: L003)
Exit code 1 when anything FAILs.   Usage: python3 overlap_check.py PROJECT [--step 0.5]
"""
import argparse, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from render_frames import open_page

JS = r"""
() => {
  const stage = document.getElementById('stage'), sr = stage.getBoundingClientRect(), out = [];
  const GROUP = '.cap,.line,.tag,.stamp,.hdr,.wm,.mono,h1,h2,h3,p';
  const walker = document.createTreeWalker(stage, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  while (walker.nextNode()) {
    const n = walker.currentNode; if (!n.textContent.trim()) continue;
    const el = n.parentElement; if (seen.has(el)) continue; seen.add(el);
    let op = 1, vis = true;
    for (let e = el; e && e !== stage.parentElement; e = e.parentElement) {
      const cs = getComputedStyle(e); op *= parseFloat(cs.opacity);
      if (cs.visibility === 'hidden' || cs.display === 'none') vis = false;
    }
    if (!vis || op < 0.35) continue;
    const r = document.createRange(); r.selectNodeContents(n); const b = r.getBoundingClientRect();
    if (b.width < 2 || b.height < 2) continue;
    const g = el.closest(GROUP) || el;
    if (!g._gid) g._gid = Math.random().toString(36).slice(2);
    out.push({ t: n.textContent.trim().slice(0, 38), x0: b.left - sr.left, y0: b.top - sr.top, x1: b.right - sr.left, y1: b.bottom - sr.top, g: g._gid });
  }
  if (window.Stitch && window.Stitch.boxes) window.Stitch.boxes().forEach((b) => out.push({ t: b.t, x0: b.x0, y0: b.y0, x1: b.x1, y1: b.y1, g: 'c:' + b.g }));
  return out;
}
"""

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("project"); ap.add_argument("--step", type=float, default=0.5)
    a = ap.parse_args()
    from playwright.sync_api import sync_playwright
    fails, warns = {}, {}
    with sync_playwright() as pw:
        b, pg, sc, start, dur, errs = open_page(pw, a.project, 1.0)
        W, H = sc["width"], sc["height"]
        for s in sc["scenes"]:
            t = 0.2
            while t < s["dur"]:
                pg.evaluate("([a,b])=>show(a,b)", [s["id"], t]); items = pg.evaluate(JS)
                for i, p in enumerate(items):
                    if p["x0"] < -2 or p["x1"] > W + 2 or p["y0"] < -2 or p["y1"] > H + 2:
                        fails.setdefault((s["id"], f"outside frame: '{p['t']}'"), []).append(t)
                    if p["y1"] > H - 420:
                        warns.setdefault((s["id"], f"bottom UI zone: '{p['t']}'"), []).append(t)
                    elif p["x1"] > W - 120:
                        warns.setdefault((s["id"], f"right UI zone: '{p['t']}'"), []).append(t)
                    for q in items[i + 1:]:
                        if p["g"] == q["g"]: continue
                        ix = min(p["x1"], q["x1"]) - max(p["x0"], q["x0"]); iy = min(p["y1"], q["y1"]) - max(p["y0"], q["y0"])
                        if ix > 4 and iy > 4:
                            small = min((p["x1"] - p["x0"]) * (p["y1"] - p["y0"]), (q["x1"] - q["x0"]) * (q["y1"] - q["y0"]))
                            if ix * iy > 40 and ix * iy / small > 0.06:
                                fails.setdefault((s["id"], f"overlap: '{p['t']}' x '{q['t']}'"), []).append(t)
                t = round(t + a.step, 2)
        b.close()
    for (sid, msg), ts in sorted(fails.items()): print(f"FAIL [{sid}] {msg}  at t={ts[0]}..{ts[-1]}s ({len(ts)} samples)")
    for (sid, msg), ts in sorted(warns.items()):
        if "hdr" in msg: continue
        print(f"WARN [{sid}] {msg}  at t={ts[0]}..{ts[-1]}s")
    if errs: print("PAGE ERRORS:", errs[:3])
    print(f"overlap_check: {len(fails)} fail, {len(warns)} warn")
    sys.exit(1 if fails or errs else 0)

if __name__ == "__main__":
    main()
