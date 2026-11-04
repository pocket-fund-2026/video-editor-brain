const { seg, eo, eio, lerp } = kit;
kit.scene('food', {
  init(kit) { Stitch.load(kit); kit.stage.append(kit.h('<div class="ground"><canvas class="mapc" width="1080" height="1920"></canvas></div>')); this.ctx = kit.stage.querySelector('canvas').getContext('2d'); this.T = (kit.json('timing.json') || {}).food || {}; const c01 = (x) => Math.max(0, Math.min(1, x)); },
  render(t, kit) {
    const ctx = this.ctx, S = Stitch, W = 1080, H = 1920, prog = (kit.start + t) / 66.0, T = this.T;
    S.cloth2(ctx, W, H); S.hud(ctx, 'THE FOOD · VEGETARIAN', prog); const C = S.COL;
    // tag 1: the Chorus Quilt
    S.tag(ctx, 330, 300, 60, 440, 210, S.swing(t, 0.5, 0.3, 1.2, 6.5) * Math.min(1, t * 3), seg(t, 0.4, 1.4), (c) => { S.text(c, 'Chorus Quilt', { font: "700 50px Fraunces, Georgia, serif", x: -200, y: 50, p: seg(t, 1.0, 2.2), step: 3 }); S.label(c, '₹950', -200, 135, { a: seg(t, 1.8, 2.4), color: Stitch.PAL.rose }); });
    const dips = [[130, 760, C.chalk], [262, 760, C.rose], [394, 760, C.mint], [526, 760, C.chalk], [658, 760, C.rose]]; dips.forEach((d, i) => { const p = seg(t, (T.d1 || 2.6) + i * 0.62, (T.d1 || 2.6) + i * 0.62 + 0.75); S.line(ctx, S.circ(d[0], d[1], 52, 30), C.chalk, 3, Math.min(1, p * 3), { len: 9, seed: 70 + i }); S.fillPoly(ctx, S.circ(d[0], d[1], 46, 24), d[2], 2.6, p, 0.5 + i * 0.4, 3.2); });
    const bp = seg(t, (T.d1 || 2.6) + 3.4, (T.d1 || 2.6) + 4.2); S.fillPoly(ctx, S.circ(840, 760, 66, 28).filter((q) => q[1] <= 760), C.chalk, 2.6, bp, 0.3, 3.4); S.line(ctx, [[774, 760], [906, 760]], C.chalk, 3, bp, { len: 12, seed: 80 });
    S.label(ctx, 'FIVE HOUSE-MADE DIPS · WARM BREAD', 90, 850, { a: seg(t, 3.0, 3.8) });
    // tag 2: Fazzoletti, and the napkin folding
    S.tag(ctx, 740, 930, 50, 400, 200, S.swing(t, 6.5, 0.3, 1.2, 6.5) * (t > 6.4 ? 1 : 0), seg(t, 6.5, 7.4), (c) => { S.text(c, 'Fazzoletti', { font: "700 50px Fraunces, Georgia, serif", x: -180, y: 48, p: seg(t, 7.0, 8.2), step: 3 }); S.label(c, '₹900', -180, 130, { a: seg(t, 7.8, 8.4), color: Stitch.PAL.rose }); });
    const NX = 150, NY = 940, NS = 280, fold = eio(seg(t, 8.4, 9.6));
    S.line(ctx, [[NX, NY], [NX + NS, NY], [NX + NS, NY + NS], [NX, NY + NS], [NX, NY]], C.chalk, 3, seg(t, 6.6, 7.6), { len: 14, seed: 90 });
    for (let i = 0; i < 5; i++) { const o = (i + 1) * NS / 6, col = i % 2 ? C.rose : C.chalk; S.line(ctx, [[NX + o, NY + 2], [NX + 2, NY + o]], col, 3.4, seg(t, 7.2 + i * 0.25, 8.0 + i * 0.25), { len: 12, gap: 3, seed: 91 + i }); if (o + NS / 6 < NS) S.line(ctx, [[NX + NS - 2, NY + o + 4], [NX + o + 4, NY + NS - 2]], col, 3.4, seg(t, 7.2 + i * 0.25, 8.0 + i * 0.25), { len: 12, gap: 3, seed: 100 + i }); }
    if (fold > 0) { ctx.save(); ctx.translate(NX + NS / 2, NY + NS / 2); ctx.rotate(-Math.PI / 4); ctx.scale(1, Math.cos(Math.PI * fold)); ctx.strokeStyle = S.PAL.rose; ctx.lineWidth = 3; ctx.setLineDash([14, 6]); ctx.beginPath(); ctx.moveTo(-NS * 0.7, 0); ctx.lineTo(NS * 0.7, 0); ctx.stroke(); ctx.restore(); }
    S.caps(ctx, [['Everything\'s vegetarian.', 0.2, 2.4], ['The Chorus Quilt is five house made dips with warm bread.', 2.4, 6.6, ['five']], ['The fazzoletti is pasta shaped like a handkerchief.', 6.6, 11, ['handkerchief']]], t);
  },
});
