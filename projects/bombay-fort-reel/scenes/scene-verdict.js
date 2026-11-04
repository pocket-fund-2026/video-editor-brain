const { seg, eo, eio, eob, lerp, TextFx } = kit;
const c01 = (x) => Math.max(0, Math.min(1, x));
const STAR = '32,4 40,24 62,24 44,38 51,60 32,46 13,60 20,38 2,24 24,24';
kit.scene('verdict', {
  init(kit) {
    { const T = (kit.json('timing.json') || {})['verdict'] || {}; this.M = T.marks || {}; this.W = T.win; }
    FortMap.load(kit);
    let stars = '', ghost = '';
    for (let i = 0; i < 5; i++) {
      stars += '<polygon points="' + STAR + '" transform="translate(' + i * 72 + ' 0)"/>';
      ghost += '<polygon points="' + STAR + '" transform="translate(' + i * 72 + ' 0)" fill="none" stroke="#EEF3F4" stroke-opacity=".3" stroke-width="3"/>';
    }
    kit.stage.append(kit.h('<div class="ground">' +
      '<canvas class="mapc" width="1080" height="1920"></canvas>' +
      '<div class="verdict-dim" style="position:absolute;inset:0;background:var(--ground);opacity:0"></div>' +
      '<div class="prog"><i></i></div>' +
      '<div class="hdr"><span>The verdict</span><b>Since 1923</b></div>' +
      '<div class="words" style="left:56px;top:350px;width:968px"><h2 class="line verdict-h">So, worth the trip?</h2></div>' +
      '<div style="position:absolute;left:0;width:1080px;top:540px;display:flex;justify-content:center"><div class="stamp verdict-st" style="position:relative;opacity:0">Must try</div></div>' +
      '<div class="mono verdict-s1" style="position:absolute;left:0;width:1080px;text-align:center;top:690px;opacity:0">The berry pulao</div>' +
      '<div class="mono verdict-s2" style="position:absolute;left:0;width:1080px;text-align:center;top:740px;opacity:0;color:var(--main);font-size:28px">Worth the trip: yes, definitely</div>' +
      '<div class="card verdict-card" style="left:56px;top:830px;width:968px;height:370px;opacity:0">' +
      '<div class="mono">Public rating</div>' +
      '<div class="verdict-n" style="position:absolute;left:44px;top:80px;font-family:var(--display, var(--sans));font-weight:900;font-size:190px;line-height:1;color:var(--main);font-variant-numeric:tabular-nums">0.0</div>' +
      '<svg style="position:absolute;left:400px;top:96px" width="360" height="64" viewBox="0 0 360 64"><defs><clipPath id="verdict-cp"><rect class="verdict-cr" x="0" y="0" width="0" height="64"/></clipPath></defs>' + ghost + '<g fill="#E8B04A" clip-path="url(#verdict-cp)">' + stars + '</g></svg>' +
      '<div style="position:absolute;left:400px;top:190px;width:500px;height:16px;border-radius:8px;background:color-mix(in srgb, var(--second) 16%, transparent)"><div class="verdict-f" style="height:100%;width:84%;border-radius:8px;background:var(--main);transform-origin:0 50%"></div></div>' +
      '<div class="mono" style="position:absolute;left:44px;bottom:36px">607 reviews, via District</div></div>' +
      '<p class="cap verdict-c1" style="top:1300px">So, worth the trip? Yes. Definitely.</p>' +
      '<p class="cap verdict-c2" style="top:1300px">Order the berry pulao, take your time,</p>' +
      '<p class="cap verdict-c3" style="top:1300px">and sit inside a hundred years of old Bombay.</p>' +
      '<p class="cap verdict-c4" style="top:1300px">Public rating, four point two.</p></div>'));
    const q = (s) => kit.stage.querySelector(s);
    this.ctx = q('canvas').getContext('2d'); this.bar = q('.prog i').style; this.dim = q('.verdict-dim').style;
    this.h = q('.verdict-h'); this.st = q('.verdict-st').style; this.s1 = q('.verdict-s1').style; this.s2 = q('.verdict-s2').style;
    this.card = q('.verdict-card').style; this.n = q('.verdict-n'); this.cr = q('.verdict-cr'); this.f = q('.verdict-f').style;
    this.c = [1, 2, 3, 4].map((i) => q('.verdict-c' + i));
  },
  render(t, kit) {
    const M = this.M, D = M.def ?? 2.5, P = M.pub ?? 8.6;
    const u = eio(seg(t, 0, 11));
    const cam = { W: 1080, H: 1500, fx: 0, fy: lerp(6, 0, u), rot: lerp(0.85, 1.3, u), s: lerp(3.2, 2.3, u), k: 0.56, hk: 0.95 };
    this.ctx.clearRect(0, 0, 1080, 1920);
    FortMap.draw(this.ctx, cam, { rise: 1, pins: [{ x: 0, y: 0, t: t, a: 1 }] });
    this.dim.opacity = 0.45 * eo(seg(t, 0.2, 1.4));
    this.bar.transform = 'scaleX(' + c01((kit.start + t) / 50) + ')';
    const hp = seg(t, D - 0.2, D + 0.4);
    this.h.textContent = hp < 0.5 ? 'So, worth the trip?' : 'Yes. Definitely.';
    this.h.style.color = hp < 0.5 ? '' : 'var(--main)';
    this.h.style.opacity = t < D - 0.2 ? 1 : Math.abs(hp - 0.5) * 2;
    const sp = seg(t, D - 0.4, D - 0.05), sh = Math.max(0, 1 - seg(t, D - 0.1, D + 0.4));
    this.st.opacity = seg(t, D - 0.4, D - 0.25);
    this.st.transform = 'rotate(-6deg) scale(' + (1.7 - 0.7 * eo(sp)) + ') translate(' + Math.sin(t * 90) * 7 * sh + 'px,' + Math.cos(t * 83) * 5 * sh + 'px)';
    this.s1.opacity = seg(t, D + 0.1, D + 0.5); this.s2.opacity = seg(t, D + 0.6, D + 1.0);
    const cp = seg(t, P - 0.6, P + 0.2); this.card.opacity = cp; this.card.transform = 'translateY(' + (1 - eo(cp)) * 40 + 'px)';
    const fill = eob(seg(t, P + 0.1, P + 1.8), 1.5), val = 4.2 * fill;
    this.n.textContent = (Math.round(val * 10) / 10).toFixed(1);
    this.cr.setAttribute('width', String(Math.max(0, Math.min(360, val / 5 * 360 + 4))));
    this.f.transform = 'scaleX(' + Math.min(1.04, fill) + ')';
    const w = this.W || [[0.2, 3.0], [3.2, 5.8], [6.0, 8.4], [8.6, 11.2]];
    for (let i = 0; i < 4; i++) {
      TextFx.fadeFromRight(this.c[i], t, w[i][0], { stagger: 0.14 });
      this.c[i].style.visibility = t >= w[i][0] - 0.05 && t < w[i][1] ? 'visible' : 'hidden';
    }
  },
});
