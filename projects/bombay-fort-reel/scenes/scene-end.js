const { seg, eo, eio, eob, lerp, TextFx } = kit;
const c01 = (x) => Math.max(0, Math.min(1, x));
const sm = (x) => x * x * (3 - 2 * x);
const S0 = 0.021, S1 = 3.0, CX = 292, CY = -12645, TX = 36, TY = -157;
const OPT = ['Kyani & Co?', 'Yazdani?', 'Cafe Military?'];
kit.scene('end', {
  init(kit) {
    { const T = (kit.json('timing.json') || {})['end'] || {}; this.M = T.marks || {}; this.W = T.win; }
    FortMap.load(kit); FortMap.loadCity(kit);
    let pills = '';
    OPT.forEach((o, i) => { pills += '<span class="end-p' + i + '" style="display:inline-block;padding:14px 28px;border-radius:999px;border:2px solid color-mix(in srgb, var(--main) 70%, transparent);font-size:34px;font-weight:700;color:var(--main);white-space:nowrap">' + o.replace('&', '&amp;') + '</span>'; });
    kit.stage.append(kit.h('<div class="ground">' +
      '<canvas class="mapc" width="1080" height="1920"></canvas>' +
      '<div class="end-dim" style="position:absolute;inset:0;background:var(--ground);opacity:.2"></div>' +
      '<div class="prog"><i></i></div>' +
      '<div class="hdr"><span>Your turn</span><b>Your pick</b></div>' +
      '<div class="end-lg" style="position:absolute;left:410px;top:380px;width:260px;height:260px;opacity:0">' + Logo.svg('el', 260) + '</div>' +
      '<div class="wm" style="position:absolute;left:0;width:1080px;top:672px;text-align:center;font-size:92px;line-height:1;white-space:nowrap"><span class="end-w0" style="display:inline-block">Bombay</span> <span class="end-w1" style="display:inline-block">Cafe</span> <span class="end-w2" style="display:inline-block;font-weight:700">Map</span></div>' +
      '<div class="wm end-tg" style="position:absolute;left:0;width:1080px;top:796px;text-align:center;font-size:36px;color:color-mix(in srgb, var(--second) 62%, var(--ground))">Mumbai cafes you can actually work from.</div>' +
      '<div style="position:absolute;left:0;width:1080px;top:872px;text-align:center"><span class="mono" style="color:var(--main);font-size:30px">bombaycafemap.com</span><div class="end-ul" style="margin:12px auto 0;width:420px;height:4px;background:var(--main);transform-origin:0 50%;transform:scaleX(0)"></div></div>' +
      '<div class="card end-poll" style="left:56px;top:1000px;width:968px;height:220px;opacity:0"><div class="mono">Vote in the comments</div><div style="position:absolute;left:30px;right:30px;top:92px;display:flex;gap:16px;justify-content:center">' + pills + '</div></div>' +
      '<div class="mono" style="position:absolute;left:0;width:1080px;top:1242px;text-align:center;font-size:20px;opacity:.75">Map data: OpenStreetMap contributors</div>' +
      '<p class="cap end-c1" style="top:1300px">Which Mumbai institution should we visit next?</p>' +
      '<p class="cap end-c2" style="top:1300px">Comment below.</p></div>'));
    const q = (s) => kit.stage.querySelector(s);
    this.root = kit.stage; this.ctx = q('canvas').getContext('2d'); this.bar = q('.prog i').style; this.dim = q('.end-dim').style;
    this.lg = q('.end-lg').style; this.w = [0, 1, 2].map((i) => q('.end-w' + i).style); this.tg = q('.end-tg').style; this.ul = q('.end-ul').style;
    this.poll = q('.end-poll').style; this.p = [0, 1, 2].map((i) => q('.end-p' + i).style); this.c = [q('.end-c1'), q('.end-c2')];
  },
  render(t, kit) {
    const M = this.M, P0 = M.poll ?? 0.7;
    const zz = eio(seg(t, 0, 2.2)), s = S1 * Math.pow(S0 / S1, zz), w = (S0 / s) * zz;
    const cam = { W: 1080, H: lerp(1500, 1920, zz), fx: TX + (CX - TX) * w, fy: TY + (CY - TY) * w, rot: lerp(2.05, 0.1, zz), s: s,
      k: lerp(0.56, 1, sm(zz)), hk: 0.95 * (1 - sm(seg(zz, 0, 0.6))) };
    this.ctx.clearRect(0, 0, 1080, 1920);
    FortMap.draw(this.ctx, cam, { city: true, mid: 1 - sm(seg(zz, 0.35, 0.85)), rise: 1 - sm(seg(zz, 0.1, 0.5)), roads: 1,
      hl: { r: 1700, a: eo(seg(t, 1.5, 2.3)), t: t }, pins: [{ x: 0, y: 0, t: t, a: 1, fixed: true }] });
    this.dim.opacity = lerp(0.15, 0.5, eo(seg(t, 0.5, 1.5)));
    this.bar.transform = 'scaleX(' + c01((kit.start + t) / 52) + ')';
    const lp = eob(seg(t, 0.9, 1.5), 1.9);
    this.lg.opacity = seg(t, 0.9, 1.05);
    this.lg.transform = 'scale(' + (0.3 + 0.7 * lp) + ') rotate(' + (1 - lp) * -14 + 'deg)';
    Logo.steam(this.root, 'el', t);
    for (let i = 0; i < 3; i++) {
      const a = 1.35 + i * 0.13, p = eo(seg(t, a, a + 0.5));
      this.w[i].opacity = p; this.w[i].transform = 'translateY(' + (1 - p) * 34 + 'px)';
    }
    this.tg.opacity = eo(seg(t, 1.9, 2.4));
    this.ul.transform = 'scaleX(' + eio(seg(t, P0 + 0.1, P0 + 0.7)) + ')';
    const pp = eo(seg(t, P0, P0 + 0.6)); this.poll.opacity = pp; this.poll.transform = 'translateY(' + (1 - pp) * 50 + 'px)';
    for (let i = 0; i < 3; i++) {
      const a = P0 + 0.4 + i * 0.18, p = eob(seg(t, a, a + 0.45), 1.9);
      this.p[i].opacity = seg(t, a, a + 0.1); this.p[i].transform = 'scale(' + (0.6 + 0.4 * p) + ')';
    }
    const win = this.W || [[0.2, 2.7], [2.8, 4.4]];
    for (let i = 0; i < 2; i++) {
      TextFx.fadeFromRight(this.c[i], t, win[i][0], { stagger: 0.14 });
      this.c[i].style.visibility = t >= win[i][0] - 0.05 && t < win[i][1] ? 'visible' : 'hidden';
    }
  },
});
