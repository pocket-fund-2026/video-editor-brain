const { seg, eo, eio, lerp } = kit;
kit.scene('close', {
  init(kit) { Stitch.load(kit); kit.stage.append(kit.h('<div class="ground"><canvas class="mapc" width="1080" height="1920"></canvas></div>')); this.ctx = kit.stage.querySelector('canvas').getContext('2d'); this.T = (kit.json('timing.json') || {}).close || {};  },
  render(t, kit) {
    const ctx = this.ctx, S = Stitch, W = 1080, H = 1920, prog = (kit.start + t) / 66.0, T = this.T;
    S.cloth2(ctx, W, H); S.hud(ctx, 'YOUR TURN', prog); const C = S.COL;
    const q1 = S.text(ctx, 'Which dish', { font: "700 104px Fraunces, Georgia, serif", x: 70, y: 330, p: seg(t, 0.2, 1.8), step: 4 }); const q2 = S.text(ctx, 'first?', { font: "italic 700 104px Fraunces, Georgia, serif", x: 70, y: 450, p: seg(t, 1.4, 2.6), step: 4, col: C.rose });
    [['QUILT', 250, 50, 0.3], ['FAZZOLETTI', 560, 140, 0.4], ['TEA FOR TWO', 830, 80, 0.35]].forEach((o, i) => { const p = seg(t, 2.6 + i * 0.4, 3.4 + i * 0.4); S.tag(ctx, o[1], 640, o[2], 250, 90, S.swing(t, 2.8 + i * 0.4, o[3] * 0.7, 1.4, 6 + i) * (t > 2.7 + i * 0.4 ? 1 : 0), p, (c) => { S.label(c, o[0], -100, 30, { a: seg(t, 3.0 + i * 0.4, 3.6 + i * 0.4), font: "400 22px 'DM Mono', monospace", ls: 2, g: 'op' + i }); }); });
    S.label(ctx, 'Map data: OpenStreetMap contributors', 74, 1440, { a: 0.7 * seg(t, 5.8, 6.4), font: "400 18px 'DM Mono', monospace", ls: 1.5 });
    S.label(ctx, 'COMMENT BELOW', 74, 1030, { a: seg(t, 3.8, 4.4) });
    const m = S.logo(ctx, 90, 1180, 104, seg(t, 3.6, 4.8), null, 'mono'); const lg = S.logo(ctx, 250, 1192, 330, seg(t, 4.6, 6.0), null, 'lockup'); if (m) S.needle(ctx, m, 0.5); if (lg) S.needle(ctx, lg, 0.5);
    // the thread tail from the last stitch, and the scissors that snip it
    const tx = 612, ty = 1300, snip = seg(t, 6.5, 7.0), fall = Math.max(0, t - 7.0);
    if (t > 6.0) { const grow = seg(t, 6.0, 6.5); if (snip < 1) S.line(ctx, [[tx, ty], [tx + 6, ty + 90 * grow]], S.COL.rose, 5, 1, { len: 16, gap: 4, seed: 180 }); else { S.line(ctx, [[tx, ty], [tx + 3, ty + 40]], S.COL.rose, 5, 1, { len: 16, gap: 4, seed: 181 }); if (fall < 0.8) S.line(ctx, [[tx + 6 + fall * 20, ty + 60 + 220 * fall * fall], [tx + 8 + fall * 20, ty + 100 + 220 * fall * fall]], S.COL.rose, 5, 1, { len: 16, gap: 4, seed: 182 }); } }
    if (t > 6.2 && t < 7.4) { const o = Math.abs(Math.sin((t - 6.4) * 14)) * (snip < 1 ? 1 : 0.2); ctx.save(); ctx.translate(tx + 14, ty + 55); ctx.strokeStyle = S.PAL.chalk; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.globalAlpha = seg(t, 6.2, 6.5) * (1 - seg(t, 7.1, 7.4)); ctx.beginPath(); ctx.moveTo(60, -26 * o - 6); ctx.lineTo(-8, 0); ctx.moveTo(60, 26 * o + 6); ctx.lineTo(-8, 0); ctx.stroke(); ctx.beginPath(); ctx.arc(-8, 0, 5, 0, 6.283); ctx.stroke(); ctx.restore(); }
  },
});
