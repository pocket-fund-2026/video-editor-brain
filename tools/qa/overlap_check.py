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


def raea_project(project):
    import glob
    return bool(glob.glob(os.path.join(project, "*.tsx"))) and not os.path.exists(os.path.join(project, "film.html")) and not os.path.isdir(os.path.join(project, "scenes"))

def run_raea(project):
    """A raea composition project: text clipped / cramped / safe areas come from `raea check` (quick, on the composition) and the export check (video)."""
    import glob, subprocess, shutil
    raea = shutil.which("raea") or os.path.expanduser("~/.local/bin/raea"); bad = 0
    tsx = sorted(glob.glob(os.path.join(project, "*.tsx")))[0]
    outs = [f for f in sorted(glob.glob(os.path.join(project, "out", "*.mp4"))) if "silent" not in f]
    for cmd in ([raea, "check", tsx, "--quick", "--shape", "9:16", "--platform", "reels"], [raea, "check", outs[-1], "--shape", "9:16", "--platform", "reels"] if outs else None):
        if not cmd: continue
        r = subprocess.run(cmd, capture_output=True, text=True); out = (r.stdout + r.stderr)
        for line in out.splitlines():
            if line.startswith("error") or line.startswith("  error"): print("FAIL", line.strip()); bad += 1
            elif line.startswith(("warn", "  warn")) and "frozen" not in line and "exposure" not in line: print("WARN", line.strip())
    print(f"overlap_check (raea check): {bad} fail"); sys.exit(1 if bad else 0)

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

FILM_JS = r"""
() => { const out = []; const ui = document.getElementById('ui'); const k = 1080 / document.getElementById('stage').getBoundingClientRect().width;
  document.querySelectorAll('#ui .tag').forEach((el) => { const cs = getComputedStyle(el); if (cs.display === 'none' || parseFloat(cs.opacity) < 0.35) return;
    const b = el.getBoundingClientRect(), s = document.getElementById('stage').getBoundingClientRect();
    out.push({ t: el.textContent.trim().slice(0, 38), x0: (b.left - s.left) * k, y0: (b.top - s.top) * k, x1: (b.right - s.left) * k + 9, y1: (b.bottom - s.top) * k + 9, g: el.textContent }); });
  const lg = document.getElementById('logo'), s = document.getElementById('stage').getBoundingClientRect();
  if (lg) { const l = lg.getBoundingClientRect(); out.push({ t: 'LOGO', x0: (l.left - s.left) * k, y0: (l.top - s.top) * k, x1: (l.right - s.left) * k, y1: (l.bottom - s.top) * k, g: 'logo' }); }
  return out; }
"""


SCENE_JS = r"""
() => { const out = []; if (!document.querySelector('.scene')) return out; const S = document.getElementById('stage').getBoundingClientRect();
  const eff = (el) => { let o = 1; for (let e = el; e && e.id !== 'stage'; e = e.parentElement) { const c = getComputedStyle(e); if (c.display === 'none') return 0; o *= parseFloat(c.opacity); } return o; };
  const clip = (el, r) => { for (let e = el.parentElement; e && e.id !== 'stage'; e = e.parentElement) { if (e.classList.contains('m')) { const m = e.getBoundingClientRect(); r = { left: Math.max(r.left, m.left), right: Math.min(r.right, m.right), top: Math.max(r.top, m.top), bottom: Math.min(r.bottom, m.bottom) }; } } return r; };
  const add = (el, t, kind) => { let r = el.getBoundingClientRect(); r = clip(el, r); if (r.right - r.left < 4 || r.bottom - r.top < 4) return; if (eff(el) < 0.35) return;
    out.push({ t: t.trim().slice(0, 38), x0: r.left - S.left, y0: r.top - S.top, x1: r.right - S.left, y1: r.bottom - S.top, g: kind, kind }); };
  document.querySelectorAll('.scene').forEach((sc) => { if (getComputedStyle(sc).display === 'none') return;
    sc.querySelectorAll('.cap, .lab, .w, .row span, .mono, .stamp').forEach((el) => { if (el.children.length && !el.classList.contains('w') && !el.classList.contains('cap')) return; const tx = el.textContent; if (!tx.trim()) return; add(el, tx, el.classList.contains('stamp') ? 'stamp' : 'text'); });
    const h = sc.querySelector('.host'); if (h) { const r = h.getBoundingClientRect(); const w = r.right - r.left, hh = r.bottom - r.top; out.push({ t: 'HOST FACE', x0: r.left - S.left + w * 0.28, y0: r.top - S.top + hh * 0.05, x1: r.right - S.left - w * 0.28, y1: r.top - S.top + hh * 0.56, g: 'host', kind: 'host' }); } });
  const b = document.getElementById('bug'); if (b && eff(b) > 0.35) { const r = b.getBoundingClientRect(); out.push({ t: 'LOGO', x0: r.left - S.left, y0: r.top - S.top, x1: r.right - S.left, y1: r.bottom - S.top, g: 'logo', kind: 'logo' }); }
  return out; }
"""

def film_main(a):
    """Three.js film (film.html): sample the whole timeline, check caption tags + logo for overlap, frame bounds and UI zones."""
    import pathlib
    from playwright.sync_api import sync_playwright
    fails, warns, errs = {}, {}, []
    with sync_playwright() as pw:
        b = pw.chromium.launch(args=["--use-gl=angle", "--use-angle=metal", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"])
        pg = b.new_page(viewport={"width": 540, "height": 960}); pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(pathlib.Path(os.path.join(a.project, "film.html")).resolve().as_uri() + "?w=540&h=960"); pg.wait_for_function("window.ready===true && (window.pending||0)===0", timeout=60000)
        t = 0.2
        T_END = pg.evaluate("typeof CUES!=='undefined' ? CUES.film : 40"); SL = pg.evaluate("typeof CUES!=='undefined' ? Object.values(CUES.starts) : []")
        while t < T_END:
            if any(s - 0.26 <= t < s + 0.01 for s in SL if s > 0): t = round(t + a.step, 2); continue   # paper slide windows overlap by design
            pg.evaluate(f"window.setT({t})"); items = pg.evaluate(FILM_JS) + pg.evaluate(SCENE_JS)
            for i, p in enumerate(items):
                if p["x0"] < -2 or p["x1"] > 1082 or p["y0"] < -2 or p["y1"] > 1922: fails.setdefault(f"outside frame: '{p['t']}'", []).append(t)
                if p["t"] != "LOGO":
                    if p["x1"] > 960 or p["y0"] < 250 or p["y1"] > 1500: warns.setdefault(f"outside safe zone (y 250-1500, x<960): '{p['t']}'", []).append(t)
                for q in items[i + 1:]:
                    if p.get('kind') == 'stamp' and q.get('kind') != 'host' or q.get('kind') == 'stamp' and p.get('kind') != 'host': continue   # stamps land on the paper on purpose
                    if p.get('kind') == 'host' and q.get('kind') == 'host': continue
                    ix = min(p["x1"], q["x1"]) - max(p["x0"], q["x0"]); iy = min(p["y1"], q["y1"]) - max(p["y0"], q["y0"])
                    if ix > 4 and iy > 4: fails.setdefault(f"overlap: '{p['t']}' x '{q['t']}'", []).append(t)
                    elif ix > -24 and iy > -24 and ix > 0 or (iy > -24 and iy <= 0 and ix > 4): warns.setdefault(f"closer than 24px: '{p['t']}' / '{q['t']}'", []).append(t)
            t = round(t + a.step, 2)
        b.close()
    for m, ts in sorted(fails.items()): print(f"FAIL {m}  at t={ts[0]}..{ts[-1]}s ({len(ts)} samples)")
    for m, ts in sorted(warns.items()): print(f"WARN {m}  at t={ts[0]}..{ts[-1]}s")
    if errs: print("PAGE ERRORS:", errs[:3])
    print(f"overlap_check: {len(fails)} fail, {len(warns)} warn"); sys.exit(1 if fails or errs else 0)

def film_check(project):
    """Single-page film layout: build film/film.html, then check text overlap and the safe area every 0.25 s (node + playwright-core)."""
    import subprocess
    fd = os.path.join(project, "film")
    b = subprocess.run([sys.executable, "build_film.py"], cwd=fd, capture_output=True, text=True)
    if b.returncode: print("FAIL film build failed:", (b.stdout + b.stderr)[-300:]); return 1
    r = subprocess.run(["node", "film_overlap.cjs"], cwd=fd, capture_output=True, text=True, timeout=600)
    out = (r.stdout + r.stderr)
    for line in out.splitlines():
        if line.startswith(("FAIL", "WARN", "OK")): print(line)
    if "Cannot find module" in out or r.returncode not in (0, 1): print("FAIL film_overlap.cjs could not run:", out[-300:]); return 1
    print("overlap_check: film layout,", "no overlaps" if r.returncode == 0 else "overlaps found"); return r.returncode

def main():
    if raea_project(sys.argv[1]): run_raea(sys.argv[1])
    if len(sys.argv) > 1 and not os.path.isdir(os.path.join(sys.argv[1], "scenes")) and os.path.exists(os.path.join(sys.argv[1], "film", "film_template.html")): sys.exit(film_check(sys.argv[1]))
    ap = argparse.ArgumentParser(); ap.add_argument("project"); ap.add_argument("--step", type=float, default=0.5)
    a = ap.parse_args()
    if os.path.exists(os.path.join(a.project, 'film.html')): return film_main(a)
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
