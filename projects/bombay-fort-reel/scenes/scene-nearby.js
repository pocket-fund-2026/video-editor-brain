const { seg, eo, eio, eob, eox, lerp, TextFx } = kit;
const c01 = (x) => Math.max(0, Math.min(1, x));
const BX = 36, BY = -157;
kit.scene('nearby', {
  init(kit) {
    { const T = (kit.json('timing.json') || {})['nearby'] || {}; this.M = T.marks || {}; this.W = T.win; }
    FortMap.load(kit);
    let trail = '';
    for (let i = 0; i < 7; i++) trail += '<div class="nearby-w' + i + '" style="position:absolute;left:-14px;top:-14px;width:28px;height:28px;border-radius:50%;background:var(--main);opacity:0"></div>';
    kit.stage.append(kit.h('<div class="ground">' +
      '<canvas class="mapc" width="1080" height="1920"></canvas>' +
      '<div class="nearby-dim" style="position:absolute;inset:0;background:var(--ground);opacity:.45"></div>' +
      '<svg style="position:absolute;left:0;top:0;width:1080px;height:1920px;overflow:visible" viewBox="0 0 1080 1920"><mask id="nearby-m"><path class="nearby-mp" d="M0 0" fill="none" stroke="#fff" stroke-width="16" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/></mask><path class="nearby-ap" d="M0 0" fill="none" stroke="#EEF3F4" stroke-width="6" stroke-linecap="round" stroke-dasharray="2 16" mask="url(#nearby-m)"/></svg>' +
      trail +
      '<svg class="nearby-pin" width="60" height="80" viewBox="0 0 60 80" style="position:absolute;left:0;top:0;opacity:0"><path d="M30 4C16 4 6 14 6 28c0 20 24 46 24 46s24-26 24-46C54 14 44 4 30 4z" fill="#5FD0DB" stroke="#0B1013" stroke-width="4"/><circle cx="30" cy="28" r="10" fill="#0B1013"/></svg>' +
      '<div class="prog"><i></i></div>' +
      '<div class="hdr"><span>Next stop</span><b>Sprott Road</b></div>' +
      '<div class="words" style="left:56px;top:350px;width:968px"><h2 class="line">Then, a short walk.</h2></div>' +
      '<div class="tag nearby-a" style="left:0px;top:0px">Britannia &amp; Co</div>' +
      '<div class="tag nearby-b" style="left:0px;top:0px;opacity:0;color:var(--accent)">Bombay Coffee House</div>' +
      '<p class="cap nearby-c1" style="top:1300px">Then it is a short walk to Bombay Coffee House</p>' +
      '<p class="cap nearby-c2" style="top:1300px">for your next stop.</p></div>'));
    const q = (s) => kit.stage.querySelector(s);
    this.ctx = q('canvas').getContext('2d'); this.bar = q('.prog i').style; this.dim = q('.nearby-dim').style; this.line = q('.line');
    this.mp = q('.nearby-mp'); this.ap = q('.nearby-ap'); this.a = q('.nearby-a').style; this.b = q('.nearby-b').style; this.pin = q('.nearby-pin').style;
    this.w = [0, 1, 2, 3, 4, 5, 6].map((i) => q('.nearby-w' + i).style); this.c = [q('.nearby-c1'), q('.nearby-c2')];
  },
  render(t, kit) {
    const M = this.M, W0 = M.walk ?? 0.5, HZ = M.house ?? 1.4;
    const u = eox(seg(t, W0 - 0.3, HZ + 0.3));
    const cam = { W: 1080, H: lerp(1500, 1700, u), fx: BX * u, fy: BY * u, rot: lerp(1.6, 2.05, u), s: lerp(1.9, 3.0, u), k: 0.56, hk: 0.95 };
    const landed = t >= HZ;
    this.ctx.clearRect(0, 0, 1080, 1920);
    FortMap.draw(this.ctx, cam, { rise: 1, pins: [{ x: 0, y: 0, t: t, a: 1 }].concat(landed ? [{ x: BX, y: BY, t: t - HZ, a: 1, color: 'rgb(95,208,219)' }] : []) });
    this.dim.opacity = lerp(0.45, 0.0, eo(seg(t, 0, 0.9)));
    const p0 = FortMap.project(cam, 0, 0, 0), p1 = FortMap.project(cam, BX, BY, 0);
    const mx = (p0[0] + p1[0]) / 2 + 70, my = (p0[1] + p1[1]) / 2;
    const d = 'M ' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) + ' Q ' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1);
    this.mp.setAttribute('d', d); this.ap.setAttribute('d', d);
    const tau = eio(seg(t, W0, HZ));
    this.mp.setAttribute('stroke-dashoffset', String(1 - tau));
    for (let i = 0; i < 7; i++) {
      const g = Math.max(0, tau - i * 0.035), m = 1 - g;
      const x = m * m * p0[0] + 2 * m * g * mx + g * g * p1[0], y = m * m * p0[1] + 2 * m * g * my + g * g * p1[1];
      const on = t > W0 && t < HZ + 0.05 ? (1 - i / 7) * (1 - seg(t, HZ - 0.2, HZ + 0.05)) : 0;
      this.w[i].opacity = on; this.w[i].transform = 'translate(' + x + 'px,' + y + 'px) scale(' + (1 - i * 0.1) + ')';
    }
    const dp = seg(t, HZ - 0.55, HZ), bump = Math.max(0, 1 - Math.abs(t - HZ) / 0.2);
    this.pin.opacity = seg(t, HZ - 0.55, HZ - 0.4);
    this.pin.transform = 'translate(' + (p1[0] - 30) + 'px,' + (p1[1] - 78 - 430 * (1 - eo(dp)) * (1 - eo(dp))) + 'px) scale(' + (1 + 0.18 * bump) + ',' + (1 - 0.22 * bump) + ')';
    this.pin.transformOrigin = '30px 76px';
    this.a.opacity = 1 - seg(t, HZ - 0.5, HZ + 0.1);
    this.a.transform = 'translate(' + (p0[0] + 34) + 'px,' + (p0[1] - 110) + 'px)';
    const tp = eob(seg(t, HZ + 0.05, HZ + 0.65), 1.8);
    this.b.opacity = seg(t, HZ + 0.05, HZ + 0.3);
    this.b.transform = 'translate(' + (p1[0] - 250) + 'px,' + (p1[1] - 150 - (1 - tp) * 30) + 'px) scale(' + (0.8 + 0.2 * tp) + ')';
    this.bar.transform = 'scaleX(' + c01((kit.start + t) / 52) + ')';
    const win = this.W || [[0.2, 3.1], [3.2, 5.2]];
    for (let i = 0; i < 2; i++) {
      TextFx.fadeFromRight(this.c[i], t, win[i][0], { stagger: 0.14 });
      this.c[i].style.visibility = t >= win[i][0] - 0.05 && t < win[i][1] ? 'visible' : 'hidden';
    }
    TextFx.fadeFromRight(this.line, t, -0.4);
  },
});
