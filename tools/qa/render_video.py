#!/usr/bin/env python3
"""Render a Motion-film project to an MP4 on this computer, with an optional narration track.
Uses the same stand-in player as render_frames.py, so caption motion can differ slightly from the real player,
and the player's synthesized music and effects are NOT included (they only exist inside the Artifact).

Usage: render_video.py PROJECT OUT.mp4 [--voice voiceover.wav] [--fps 30]
Needs: playwright + chromium, ffmpeg. Fonts load from Google Fonts (needs the network).
"""
import argparse, os, subprocess, sys, time
sys.path.insert(0, os.path.dirname(__file__))
from render_frames import build

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;600;700;800&family=DM+Mono:wght@400;500&family=Fraunces:wght@400;700&display=swap">'
         "<style>#host{--display:'Inter',system-ui,sans-serif;--sans:'Plus Jakarta Sans',system-ui,sans-serif;--mono:'DM Mono',ui-monospace,monospace;--serif:'Fraunces',Georgia,serif}</style>")
BEGIN = """([id]) => { const host = document.getElementById('host'); host.innerHTML = '';
  const stage = document.createElement('div'); stage.id = 'stage';
  stage.style.cssText = 'position:relative;width:' + WIDTH + 'px;height:' + HEIGHT + 'px;overflow:hidden;background:' + BG; host.appendChild(stage);
  window._k = Object.assign({}, kit, { stage, start: START[id], dur: DUR[id], h: (s) => { const d = document.createElement('div'); d.innerHTML = s; return d.firstElementChild }, json: (n) => DATA[n] });
  window._c = {}; window._id = id; REG[id].init.call(window._c, window._k); return true }"""
STEP = "(t) => { REG[window._id].render.call(window._c, t, window._k); return true }"

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("project"); ap.add_argument("out"); ap.add_argument("--voice"); ap.add_argument("--fps", type=int, default=30)
    a = ap.parse_args()
    from playwright.sync_api import sync_playwright
    path, sc, start, dur = build(a.project)
    html = open(path, encoding="utf8").read().replace("<style>", FONTS + "<style>", 1)
    open(path, "w", encoding="utf8").write(html)
    W, H = sc["width"], sc["height"]; total = int(round(sum(s["dur"] for s in sc["scenes"]) * a.fps))
    cmd = ["ffmpeg", "-v", "error", "-y", "-f", "image2pipe", "-framerate", str(a.fps), "-i", "-"]
    if a.voice: cmd += ["-i", a.voice]
    cmd += ["-map", "0:v"] + (["-map", "1:a", "-c:a", "aac", "-b:a", "192k"] if a.voice else []) + ["-c:v", "libx264", "-crf", "18", "-preset", "veryfast", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-shortest", a.out]
    ff = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    t_start = time.time(); n = 0
    with sync_playwright() as pw:
        b = pw.chromium.launch(); pg = b.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
        errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto("file://" + path); pg.evaluate("Promise.all([document.fonts.load('700 40px Fraunces'), document.fonts.load('500 40px Fraunces'), document.fonts.load('400 22px \"DM Mono\"'), document.fonts.load('400 40px Inter')]).then(() => document.fonts.ready)")
        first = sc["scenes"][0]["id"]; pg.evaluate(BEGIN, [first]); pg.evaluate(STEP, 0.0); pg.wait_for_timeout(1500); pg.evaluate("document.fonts.ready")
        for s in sc["scenes"]:
            pg.evaluate(BEGIN, [s["id"]])
            for i in range(int(round(s["dur"] * a.fps))):
                pg.evaluate(STEP, i / a.fps)
                ff.stdin.write(pg.screenshot(type="jpeg", quality=92)); n += 1
                if n % 120 == 0: print(f"{n}/{total} frames, {time.time() - t_start:.0f}s", flush=True)
        b.close()
    ff.stdin.close(); ff.wait()
    print("page errors:", errs[:3] if errs else "none"); print("wrote", a.out, "frames", n)
    sys.exit(1 if errs or ff.returncode else 0)

if __name__ == "__main__":
    main()
