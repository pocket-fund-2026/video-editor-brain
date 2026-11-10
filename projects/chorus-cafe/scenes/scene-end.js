const { seg, eo, eio, lerp } = kit;
const star = (cx, cy, R) => { const a = []; for (let i = 0; i <= 10; i++) { const r = i % 2 ? R * 0.42 : R, th = -Math.PI / 2 + i * Math.PI / 5; a.push([cx + Math.cos(th) * r, cy + Math.sin(th) * r]); } return a; };
kit.scene('end', {
  init(kit) { Stitch.load(kit); kit.stage.append(kit.h('<div class="ground"><canvas class="mapc" width="1080" height="1920"></canvas></div>')); this.ctx = kit.stage.querySelector('canvas').getContext('2d'); },
  render(t, kit) {
    const ctx = this.ctx, S = Stitch, W = 1080, H = 1920, C = S.COL; S.cloth2(ctx, W, H);
    S.text(ctx, '4.7', { font: "700 300px Fraunces, Georgia, serif", x: 40, y: 420, p: seg(t, 0.2, 2.2), step: 5, col: C.rose, g: 'score' });
    for (let i = 0; i < 5; i++) { const cx = 100 + i * 130, cy = 865, p = seg(t, 1.6 + i * 0.25, 2.4 + i * 0.25), fill = i < 4 ? 1 : 0.7;
      S.line(ctx, star(cx, cy, 58), C.chalk, 5, p, { len: 12, seed: 100 + i });
      const pts = star(cx, cy, 58).map((q) => [lerp(cx - 58, q[0], 1), q[1]]); if (fill > 0) { const cut = cx - 58 + 116 * fill; S.fillPoly(ctx, pts.map((q) => [Math.min(q[0], cut), q[1]]), C.rose, 2.6, p, 0.5, 3.6); } }
    S.label(ctx, 'OUR FIRST LOOK SCORE, OUT OF 5', 56, 950, { a: seg(t, 2.6, 3.2), g: 'fl1', font: "400 28px 'DM Mono', monospace" });
    S.label(ctx, 'FROM THE MENU, THE SPACE AND THE PRESS. NOT A MEAL REVIEW.', 56, 990, { a: seg(t, 2.8, 3.4), g: 'fl2', font: "400 20px 'DM Mono', monospace", ls: 2 });
    const o = eio(seg(t, 3.7, 4.5)); if (o > 0) { ctx.globalAlpha = o; S.patch(ctx, 40, 1035, 1000, 250, o, 0.012); ctx.globalAlpha = 1; S.logo(ctx, 170, 1050, 680, seg(t, 3.9, 5.6), null, 'lockup'); }
    S.label(ctx, 'OPEN DAILY 11AM TO 8PM · MITTAL AVENUE, FORT', 56, 1310, { a: seg(t, 4.6, 5.2), g: 'hrs', font: "400 22px 'DM Mono', monospace", ls: 2 });
    S.logo(ctx, 48, 266, 400, 1, null, 'lockup'); S.logo(ctx, 800, 266, 130, 1, null, 'mono');
    S.caps(ctx, [["Which dish first?", 7.85, 10.6, ['first?']]], t, { back: true, y: 1355, font: "500 64px Fraunces, Georgia, serif" });
  },
});
