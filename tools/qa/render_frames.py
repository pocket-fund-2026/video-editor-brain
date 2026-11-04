#!/usr/bin/env python3
"""Render frames of a Motion-film project WITHOUT the real player, using a small stand-in for the kit.

Project layout (see projects/bombay-fort-reel):
  scenes.json  base.css  shared.js  scenes/scene-<id>.js  data/<name>.json   (data is served by kit.json('<name>.json'))

Usage:
  python3 render_frames.py PROJECT --times hook:1.4,end:3.8 --out frames/ [--scale 0.4]
  python3 render_frames.py PROJECT --every 1.5 --out frames/ --sheet      # contact sheets of the whole film

Needs: pip install playwright pillow && python3 -m playwright install chromium
The stand-in kit only approximates the player (TextFx, easing). It is for catching layout, color and overlap
problems early. It does not replace watching the film in the real player.
"""
import argparse, json, os, sys, tempfile

CORE = r"""
(function(){
const cl=(x)=>Math.max(0,Math.min(1,x));
const eo=x=>1-Math.pow(1-cl(x),3), eio=x=>{x=cl(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2};
const eob=(x,o=1.4)=>{x=cl(x);const c3=o+1;return 1+c3*Math.pow(x-1,3)+o*Math.pow(x-1,2)};
const eox=x=>{x=cl(x);return x>=1?1:1-Math.pow(2,-10*x)};
const REG={};
window.kit={clamp01:cl,seg:(t,a,b)=>cl((t-a)/(b-a)),lerp:(a,b,t)=>a+(b-a)*t,eo,eio,eob,eox,ei:x=>x*x*x,
 scene:(id,def)=>{REG[id]=def}, fonts:{},
 TextFx:{fadeFromRight(el,t,t0,o){o=o||{};const st=o.stagger||.11,du=o.dur||.5,dx=o.dx||26;
   if(!el._w){const ws=el.textContent.split(' ');el.innerHTML=ws.map(w=>'<span style="display:inline-block">'+w+'</span>').join(' ');el._w=[...el.children]}
   el._w.forEach((s,i)=>{const p=eo((t-t0-i*st)/du);s.style.opacity=p;s.style.transform='translateX('+dx*(1-p)+'px)'})}}};
window.REG=REG;
})();
"""
SHOW = r"""
window.show=(id,t)=>{const host=document.getElementById('host');host.innerHTML='';
 const stage=document.createElement('div');stage.id='stage';stage.style.cssText='position:relative;width:'+WIDTH+'px;height:'+HEIGHT+'px;overflow:hidden;background:'+BG;host.appendChild(stage);
 const k=Object.assign({},kit,{stage,start:START[id],dur:DUR[id],h:(s)=>{const d=document.createElement('div');d.innerHTML=s;return d.firstElementChild},json:(n)=>DATA[n]});
 const ctx={};REG[id].init.call(ctx,k);REG[id].render.call(ctx,t,k);return true};
"""

def build(project):
    rd = lambda *p: open(os.path.join(project, *p), encoding="utf8").read()
    sc = json.loads(rd("scenes.json"))
    start, dur, t0 = {}, {}, 0.0
    for s in sc["scenes"]:
        start[s["id"]] = t0; dur[s["id"]] = s["dur"]; t0 += s["dur"]
    scenes = {s["id"]: rd("scenes", f"scene-{s['id']}.js") for s in sc["scenes"]}
    data = {}
    ddir = os.path.join(project, "data")
    if os.path.isdir(ddir):
        for f in os.listdir(ddir):
            data[f] = json.loads(rd("data", f))
    shared = rd("shared.js") if os.path.exists(os.path.join(project, "shared.js")) else ""
    html = ("<!doctype html><meta charset=utf-8><style>body{margin:0;background:#000}" + rd("base.css") + "</style><div id=host></div>"
            + "<script>" + shared + "</script><script>" + CORE + "</script><script>"
            + f"const WIDTH={sc['width']},HEIGHT={sc['height']},BG={json.dumps(sc['background'])},START={json.dumps(start)},DUR={json.dumps(dur)},DATA={json.dumps(data)};"
            + f"const SRC={json.dumps(scenes)};for(const n in SRC){{new Function('kit',SRC[n])(window.kit)}}" + SHOW + "</script>")
    path = os.path.join(tempfile.mkdtemp(prefix="harness_"), "harness.html")
    open(path, "w", encoding="utf8").write(html)
    return path, sc, start, dur

def open_page(pw, project, scale=1.0):
    path, sc, start, dur = build(project)
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width": sc["width"], "height": sc["height"]}, device_scale_factor=scale)
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
    pg.goto("file://" + path)
    return b, pg, sc, start, dur, errs

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project"); ap.add_argument("--times", default=""); ap.add_argument("--every", type=float, default=0)
    ap.add_argument("--out", default="frames"); ap.add_argument("--scale", type=float, default=0.4); ap.add_argument("--sheet", action="store_true")
    a = ap.parse_args()
    from playwright.sync_api import sync_playwright
    os.makedirs(a.out, exist_ok=True)
    with sync_playwright() as pw:
        b, pg, sc, start, dur, errs = open_page(pw, a.project, a.scale)
        frames = []
        if a.times:
            for x in a.times.split(","):
                s, t = x.split(":"); frames.append((s, float(t)))
        else:
            step = a.every or 1.5
            for s in sc["scenes"]:
                t = 0.2
                while t < s["dur"]:
                    frames.append((s["id"], round(t, 2))); t += step
        files = []
        for i, (s, t) in enumerate(frames):
            pg.evaluate("([a,b])=>show(a,b)", [s, t]); f = os.path.join(a.out, f"{i:03d}_{s}_{t}.png"); pg.screenshot(path=f); files.append(f)
        b.close()
    print("frames:", len(files), "| page errors:", errs[:5] if errs else "none")
    if a.sheet and files:
        from PIL import Image, ImageDraw
        w, h = Image.open(files[0]).size; cols = 5
        for n in range(0, len(files), 10):
            ch = files[n:n + 10]; rows = (len(ch) + cols - 1) // cols
            sh = Image.new("RGB", (cols * (w + 6), rows * (h + 6)), "white")
            for i, f in enumerate(ch):
                sh.paste(Image.open(f), ((i % cols) * (w + 6), (i // cols) * (h + 6)))
                ImageDraw.Draw(sh).text(((i % cols) * (w + 6) + 8, (i // cols) * (h + 6) + 8), os.path.basename(f)[4:-4], fill=(255, 255, 0))
            p = os.path.join(a.out, f"sheet_{n // 10 + 1}.png"); sh.save(p); print("sheet:", p)
    sys.exit(1 if errs else 0)

if __name__ == "__main__":
    main()
