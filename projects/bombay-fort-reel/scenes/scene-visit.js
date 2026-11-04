const { seg, eo, eio, eob, lerp, TextFx } = kit;
const c01 = (x) => Math.max(0, Math.min(1, x));
const IC = {
  pin: '<path d="M20 4c-7 0-12 5-12 12 0 9 12 20 12 20s12-11 12-20c0-7-5-12-12-12z"/><circle cx="20" cy="16" r="4"/>',
  eat: '<path d="M10 6v10M15 6v10M20 6v10M10 16q5 5 10 0M15 18v16M29 6c-5 4-5 12 0 15v13"/>',
  cal: '<rect x="6" y="9" width="28" height="25" rx="4"/><path d="M6 17h28M13 5v7M27 5v7M15 22l10 9M25 22l-10 9"/>',
  cash: '<rect x="4" y="10" width="32" height="21" rx="4"/><circle cx="20" cy="20.5" r="5"/><path d="M9 20.5h.1M31 20.5h.1"/>',
};
const ROWS = [['pin', 'Address', 'Wakefield House, 11 Sprott Road', 0.9], ['eat', 'Serves', 'Lunch only', 1.6], ['cal', 'Closed', 'Sundays', 3.1], ['cash', 'Pay', 'Bring cash', 4.1]];
kit.scene('visit', {
  init(kit) {
    FortMap.load(kit);
    let rows = '';
    ROWS.forEach((r, i) => {
      rows += '<div class="visit-r' + i + '" style="position:absolute;left:40px;right:40px;top:' + (232 + i * 118) + 'px;height:100px">' +
        '<div style="position:absolute;left:0;top:6px;width:84px;height:84px;border-radius:50%;background:var(--main)"><svg viewBox="0 0 40 40" width="84" height="84" style="position:absolute;left:0;top:0" fill="none" stroke="#0B1013" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' + IC[r[0]] + '</svg></div>' +
        '<svg class="visit-k' + i + '" viewBox="-50 -50 100 100" width="170" height="170" style="position:absolute;left:-43px;top:-37px;overflow:visible" stroke="#E8B04A" stroke-width="4" stroke-linecap="round"></svg>' +
        '<div class="mono" style="position:absolute;left:112px;top:2px;color:var(--main)">' + r[1] + '</div>' +
        '<div class="visit-v' + i + '" style="position:absolute;left:112px;top:46px;font-size:40px;font-weight:700;white-space:nowrap"></div></div>';
    });
    kit.stage.append(kit.h('<div class="ground">' +
      '<canvas class="mapc" width="1080" height="1920"></canvas>' +
      '<div style="position:absolute;inset:0;background:var(--ground);opacity:.78"></div>' +
      '<div class="prog"><i></i></div>' +
      '<div class="hdr"><span>Visit card</span><b>Britannia &amp; Co</b></div>' +
      '<div class="visit-tk" style="position:absolute;left:90px;top:500px;width:900px;height:740px;border-radius:40px;background:color-mix(in srgb, var(--ground) 86%, var(--second));border:2px solid color-mix(in srgb, var(--second) 22%, transparent);opacity:0">' +
      '<div class="visit-lg" style="position:absolute;left:40px;top:36px;width:120px;height:120px">' + Logo.svg('vl', 120) + '</div>' +
      '<div style="position:absolute;left:190px;top:46px;font-family:var(--display, var(--sans));font-weight:800;font-size:56px;line-height:1">Visit card</div>' +
      '<div class="mono" style="position:absolute;left:192px;top:130px">Bombay Cafe Map</div>' +
      '<div style="position:absolute;left:36px;right:36px;top:187px;border-top:4px dashed color-mix(in srgb, var(--second) 28%, transparent)"></div>' +
      '<div style="position:absolute;left:-30px;top:157px;width:60px;height:60px;border-radius:50%;background:var(--ground)"></div><div style="position:absolute;right:-30px;top:157px;width:60px;height:60px;border-radius:50%;background:var(--ground)"></div>' + rows +
      '<div class="stamp visit-gh" style="left:500px;top:648px;font-size:46px;padding:4px 20px;opacity:0">Go hungry</div></div>' +
      '<p class="cap visit-c1" style="top:1300px">Lunch only, closed by four on weekdays,</p>' +
      '<p class="cap visit-c2" style="top:1300px">shut on Sundays. Bring cash, and go hungry.</p></div>'));
    const q = (s) => kit.stage.querySelector(s);
    this.root = kit.stage; this.ctx = q('canvas').getContext('2d'); this.bar = q('.prog i').style; this.tk = q('.visit-tk').style; this.gh = q('.visit-gh').style;
    this.r = ROWS.map((r, i) => q('.visit-r' + i).style); this.v = ROWS.map((r, i) => q('.visit-v' + i)); this.k = ROWS.map((r, i) => q('.visit-k' + i));
    this.k.forEach((s) => { let h = ''; for (let a = 0; a < 8; a++) { const an = a * Math.PI / 4; h += '<line x1="' + Math.cos(an) * 36 + '" y1="' + Math.sin(an) * 36 + '" x2="' + Math.cos(an) * 46 + '" y2="' + Math.sin(an) * 46 + '"/>'; } s.innerHTML = h; });
    this.c = [q('.visit-c1'), q('.visit-c2')];
  },
  render(t, kit) {
    const u = eio(seg(t, 0, 6));
    const cam = { W: 1080, H: 1500, fx: 0, fy: 0, rot: lerp(1.6, 1.9, u), s: lerp(1.9, 1.6, u), k: 0.56, hk: 0.95 };
    this.ctx.clearRect(0, 0, 1080, 1920);
    FortMap.draw(this.ctx, cam, { rise: 1, pins: [{ x: 0, y: 0, t: t, a: 1 }] });
    this.bar.transform = 'scaleX(' + c01((kit.start + t) / 52) + ')';
    const ep = eob(seg(t, 0.1, 0.9), 1.5);
    this.tk.opacity = seg(t, 0.1, 0.35);
    this.tk.transform = 'translateY(' + (1 - ep) * 520 + 'px) rotate(' + (Math.sin(t * 1.7) * 1.1 + (1 - ep) * -6) + 'deg)';
    Logo.steam(this.root, 'vl', t);
    ROWS.forEach((r, i) => {
      const a = r[3], p = eob(seg(t, a, a + 0.5), 1.9);
      this.r[i].opacity = seg(t, a, a + 0.15);
      this.r[i].transform = 'translateX(' + (1 - p) * -70 + 'px) scale(' + (0.9 + 0.1 * p) + ')';
      const n = Math.floor(Math.max(0, t - a - 0.2) * 32);
      this.v[i].textContent = r[2].slice(0, Math.min(r[2].length, n));
      const b = seg(t, a + 0.1, a + 0.6);
      this.k[i].style.opacity = b > 0 && b < 1 ? 1 - b : 0; this.k[i].style.transform = 'scale(' + (0.4 + 0.9 * eo(b)) + ')';
    });
    const gp = seg(t, 5.0, 5.3);
    this.gh.opacity = seg(t, 5.0, 5.1);
    this.gh.transform = 'rotate(-7deg) scale(' + (1.8 - 0.8 * eo(gp)) + ')';
    const win = [[0.2, 3.1], [3.2, 6.2]];
    for (let i = 0; i < 2; i++) {
      TextFx.fadeFromRight(this.c[i], t, win[i][0], { stagger: 0.14 });
      this.c[i].style.visibility = t >= win[i][0] - 0.05 && t < win[i][1] ? 'visible' : 'hidden';
    }
  },
});
