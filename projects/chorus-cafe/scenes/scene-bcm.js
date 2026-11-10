const { seg, eo, eio, lerp } = kit;
kit.scene('bcm', {
  init(kit) { Stitch.load(kit); kit.stage.append(kit.h('<div class="ground"><canvas class="mapc" width="1080" height="1920"></canvas></div>')); this.ctx = kit.stage.querySelector('canvas').getContext('2d'); },
  render(t, kit) {
    const ctx = this.ctx, S = Stitch, W = 1080, H = 1920, C = S.COL, INK = '#141A3C';
    S.cloth2(ctx, W, H);
    S.drawMap(ctx, { W: W, H: H, cx: 0, cy: 40, s: 1.3, k: 0.7 }, { reveal: 1300, route: 1, rise: 0.6 });
    ctx.fillStyle = 'rgba(20,26,60,0.78)'; ctx.fillRect(0, 0, W, H);
    // map pin with a cup inside, thread-drawn
    const cx = 800, cy = 700, r = 140, pin = [], a0 = Math.PI / 2 + 0.5, a1 = Math.PI / 2 - 0.5 + 6.2832;
    for (let i = 0; i <= 40; i++) { const th = a0 + (a1 - a0) * i / 40; pin.push([cx + Math.cos(th) * r, cy + Math.sin(th) * r]); } pin.push([cx, cy + r * 1.75]); pin.push(pin[0]);
    const pp = seg(t, 0.2, 1.4);
    S.fillPoly(ctx, pin, C.rose, 2.8, pp, 0.5, 4); S.line(ctx, pin, C.chalk, 7, pp, { len: 16, gap: 3, seed: 5 });
    const cup = [[-62, -20], [62, -20], [48, 52], [-48, 52], [-62, -20]].map((z) => [cx + z[0], cy + z[1]]), cp = seg(t, 1.0, 2.0);
    S.fillPoly(ctx, cup, C.chalk, 2.8, cp, 0.5, 3.4); S.line(ctx, cup, INK, 4, cp, { seed: 6 });
    const hd = []; for (let i = 0; i <= 12; i++) { const th = -1.4 + i / 12 * 2.8; hd.push([cx + 62 + Math.cos(th) * 24, cy + 16 + Math.sin(th) * 26]); }
    S.line(ctx, hd, C.chalk, 7, cp, { len: 8, gap: 2, seed: 7, holes: false });
    [-26, 0, 26].forEach((d, i) => { const st = []; for (let k = 0; k <= 12; k++) st.push([cx + d + Math.sin(k * 0.8 + i) * 8, cy - 34 - k * 6]); S.line(ctx, st, C.chalk, 5, seg(t, 1.8 + i * 0.2, 2.8 + i * 0.2), { len: 9, gap: 4, seed: 8 + i, holes: false }); });
    ['Bombay', 'Cafe', 'Map'].forEach((w, i) => S.text(ctx, w, { font: "700 130px Fraunces, Georgia, serif", x: 56, y: 430 + i * 180, p: seg(t, 0.4 + i * 0.5, 1.6 + i * 0.5), step: 5, col: i === 2 ? C.rose : C.chalk, g: 'bcm' + i }));
    S.label(ctx, 'BOMBAYCAFEMAP.COM', 56, 985, { a: seg(t, 2.4, 3), g: 'url', font: "400 36px 'DM Mono', monospace" });
    S.label(ctx, '@BOMBAYCAFEMAP', 56, 1040, { a: seg(t, 2.7, 3.3), g: 'handle', font: "400 28px 'DM Mono', monospace" });
    S.line(ctx, [[56, 1095], [560, 1095]], C.rose, 5, seg(t, 2.6, 3.4), { len: 18, gap: 4, seed: 15, holes: false });
    S.label(ctx, 'Map data: OpenStreetMap contributors', 56, 1260, { a: 0.7 * seg(t, 2.2, 2.8), g: 'osm', font: "400 20px 'DM Mono', monospace", ls: 2 });
    S.logo(ctx, 48, 266, 400, 1, null, 'lockup'); S.logo(ctx, 800, 266, 130, 1, null, 'mono');
    S.caps(ctx, [["Find your next cafe.", 0.6, 5, ['cafe.']]], t, { back: true, y: 1340 });
  },
});
