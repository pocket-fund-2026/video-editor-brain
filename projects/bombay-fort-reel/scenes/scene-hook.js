const { seg, eo, eio, eob, lerp, TextFx } = kit;
const c01 = (x) => Math.max(0, Math.min(1, x));
const sm = (x) => x * x * (3 - 2 * x);
const S0 = 0.021, S1 = 2.1, CX = 292, CY = -12645;
kit.scene('hook', {
  init(kit) {
    { const T = (kit.json('timing.json') || {})['hook'] || {}; this.M = T.marks || {}; this.W = T.win; }
    FortMap.load(kit); FortMap.loadCity(kit);
    kit.stage.append(kit.h('<div class="ground">' +
      '<canvas class="mapc hook-cv" width="1080" height="1920"></canvas>' +
      '<div class="prog"><i></i></div>' +
      '<div class="hdr"><span class="hook-l">Mumbai</span><b class="hook-yr">India</b></div>' +
      '<div class="words" style="left:56px;top:350px;width:968px"><h2 class="line">You\'ve heard of this one.</h2></div>' +
      '<div class="tag hook-fort" style="left:0px;top:0px;opacity:0">Fort &amp; Ballard Estate</div>' +
      '<div class="tag hook-tag" style="left:0px;top:0px;opacity:0">Britannia &amp; Co<small>SINCE 1923</small></div>' +
      '<p class="cap hook-c1">You\'ve definitely heard of this cafe.</p>' +
      '<p class="cap hook-c2">Britannia and Co, Ballard Estate.</p>' +
      '<p class="cap hook-c3">Serving lunch since 1923.</p></div>'));
    const q = (s) => kit.stage.querySelector(s);
    this.cv = q('canvas'); this.ctx = this.cv.getContext('2d'); this.bar = q('.prog i').style;
    this.l = q('.hook-l'); this.yr = q('.hook-yr'); this.fort = q('.hook-fort').style; this.tag = q('.hook-tag').style;
    this.line = q('.line'); this.c = [1, 2, 3].map((i) => q('.hook-c' + i));
  },
  render(t, kit) {
    const M = this.M;
    const z = seg(t, 1.9, 5.4), zz = eio(z);
    const s = S0 * Math.pow(S1 / S0, zz), w = (S0 / s) * (1 - zz);
    const cam = { W: 1080, H: 1920, fx: CX * w, fy: CY * w, rot: -0.2 * zz + 0.1 * (1 - zz), s: s,
      k: lerp(1, 0.56, sm(seg(z, 0.25, 1))), hk: 0.95 * sm(seg(z, 0.55, 1)) };
    const ha = eo(seg(t, 0.9, 1.7)) * (1 - sm(seg(z, 0.62, 0.95)));
    const rise = eio(seg(t, 4.7, 6.5));
    this.ctx.clearRect(0, 0, 1080, 1920);
    FortMap.draw(this.ctx, cam, { city: true, mid: sm(seg(z, 0.3, 0.8)), rise: rise, roads: sm(seg(z, 0.55, 1)),
      hl: { r: 1700, a: ha, t: t }, pins: t > 1.2 ? [{ x: 0, y: 0, t: t, a: eo(seg(t, 1.2, 1.8)), fixed: true }] : [] });
    const punch = Math.max(0, 1 - Math.abs(t - 5.45) / 0.28) * 0.045;
    this.cv.style.transformOrigin = '540px 960px'; this.cv.style.transform = 'scale(' + (1 + punch) + ')';
    const p = FortMap.project(cam, 0, 0, 0);
    this.fort.opacity = seg(t, 1.5, 1.9) * (1 - seg(t, 4.1, 4.6));
    this.fort.transform = 'translate(' + (p[0] + 40) + 'px,' + (p[1] - 150 + (1 - eo(seg(t, 1.5, 2.1))) * 20) + 'px)';
    const tp = eob(seg(t, 5.8, 6.4), 1.6);
    this.tag.opacity = seg(t, 5.8, 6.1);
    this.tag.transform = 'translate(' + (p[0] + 40) + 'px,' + (p[1] - 130 - (1 - tp) * 26) + 'px) scale(' + (0.85 + 0.15 * tp) + ')';
    const hp = seg(t, 4.3, 4.8); this.l.textContent = hp < 0.5 ? 'Mumbai' : 'Ballard Estate';
    this.l.style.opacity = t < 4.3 ? 1 : Math.abs(hp - 0.5) * 2;
    this.yr.textContent = t < 4.6 ? 'India' : String(Math.round(lerp(1900, 1923, eio(seg(t, 4.8, 6.6)))));
    this.bar.transform = 'scaleX(' + c01((kit.start + t) / 52) + ')';
    const win = this.W || [[0.2, 2.7], [2.9, 5.3], [5.5, 7.4]];
    for (let i = 0; i < 3; i++) {
      TextFx.fadeFromRight(this.c[i], t, win[i][0], { stagger: 0.14 });
      this.c[i].style.visibility = t >= win[i][0] - 0.05 && t < win[i][1] ? 'visible' : 'hidden';
    }
    TextFx.fadeFromRight(this.line, t, -0.4);
  },
});
