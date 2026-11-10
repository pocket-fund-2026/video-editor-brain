const { seg, eo, eio, lerp } = kit;
kit.scene('space', {
  init(kit) { Stitch.load(kit); kit.stage.append(kit.h('<div class="ground"><canvas class="mapc" width="1080" height="1920"></canvas></div>')); this.ctx = kit.stage.querySelector('canvas').getContext('2d'); this.T = (kit.json('timing.json') || {}).space || {};  },
  render(t, kit) {
    const ctx = this.ctx, S = Stitch, W = 1080, H = 1920, prog = (kit.start + t) / 66.0, T = this.T;
    S.cloth2(ctx, W, H); S.hud(ctx, 'LEVEL 2 AND THE SHOP BELOW', prog);
    const X0 = 150, X1 = 790, Y0 = 640, Y1 = 900, Y2 = 1160, C = S.COL;
    S.line(ctx, [[X0, Y1], [X0, Y0], [X1, Y0], [X1, Y1]], C.chalk, 3.6, seg(t, 0.2, 1.6), { len: 14, seed: 21 });
    S.line(ctx, [[X0, Y1], [X0, Y2], [X1, Y2], [X1, Y1]], C.chalk, 3.6, seg(t, 0.8, 2.2), { len: 14, seed: 22 });
    S.line(ctx, [[X0, Y1], [X1, Y1]], C.rose, 4.4, seg(t, 1.4, 2.4), { len: 22, gap: 6, seed: 23 });
    S.label(ctx, 'LEVEL 2', 190, 800, { a: seg(t, 1.8, 2.4) }); const cf = S.text(ctx, 'Café', { font: "700 86px Fraunces, Georgia, serif", x: 186, y: 690, p: seg(t, 2.0, 3.4), step: 4 });
    S.label(ctx, 'CLOTHES · TEXTILES · CERAMICS', 190, 1010, { a: seg(t, 2.8, 3.6) });
    S.label(ctx, 'GROUND FLOOR', 190, 1090, { a: seg(t, 2.8, 3.6) * 0.75 });
    // the artwork on the upper wall: chain-stitch waves
    const AX = 480, AY = 668, AW = 270, AH = 210; S.line(ctx, [[AX, AY], [AX + AW, AY], [AX + AW, AY + AH], [AX, AY + AH], [AX, AY]], C.mint, 2.6, seg(t, 3.4, 4.4), { len: 8, gap: 3, seed: 31 });
    for (let k = 0; k < 6; k++) { const pts = []; for (let i = 0; i <= 30; i++) { const x = AX + 10 + i * (AW - 20) / 30; pts.push([x, AY + 24 + k * 31 + Math.sin(i * 0.5 + k) * 9]); } S.line(ctx, pts, k % 2 ? C.rose : C.chalk, 2.4, seg(t, 3.8 + k * 0.1, 5.2 + k * 0.1), { len: 7, gap: 2.4, jit: 0.6, seed: 40 + k }); }
    // hidden hands, found one by one
    const HP = [[540, 735], [690, 760], [600, 820], [720, 690], [520, 850]]; HP.forEach((q, i) => { const p = seg(t, 5.6 + i * 0.55, 6.1 + i * 0.55); if (p <= 0) return; const poly = S.HAND.map((h) => [q[0] + h[0] * 0.9, q[1] + h[1] * 0.9]); S.fillPoly(ctx, poly, C.mint, 2.2, p, 0.5, 2.6); });
    // a detail inset of the hands
    const ip = seg(t, 6.0, 7.4); if (ip > 0) { const cx = 560, cy = 470; S.line(ctx, S.circ(cx, cy, 130, 44), C.rose, 4, ip, { len: 16, gap: 5, seed: 51 }); HP.forEach((q, i) => { const pp = seg(t, 6.4 + i * 0.35, 6.9 + i * 0.35); if (pp > 0) S.fillPoly(ctx, S.HAND.map((h) => [cx + (q[0] - 600) * 0.5 + h[0] * 1.5, cy + (q[1] - 780) * 0.5 + h[1] * 1.5]), C.mint, 2.4, pp, 0.5, 3.2); }); }
    // eat, then shop: one thread from the café down to the shop
    const eat = [[X1 + 20, 770]]; for (let i = 1; i <= 24; i++) { const th = i / 24; eat.push([X1 + 20 + Math.sin(th * 3.14159) * 70, 770 + th * 270]); } S.line(ctx, eat, C.rose, 4, seg(t, 1.0, 2.0), { len: 16, gap: 5, seed: 61 });
    S.label(ctx, 'EAT', 830, 726, { a: seg(t, 1.2, 1.8) }); S.label(ctx, 'SHOP', 830, 1050, { a: seg(t, 1.6, 2.2) });
    S.caps(ctx, [['Grab something to eat, then shop too, all at the same place.', 0.2, 4.4, ['eat', 'shop']], ['Clothes, textiles and ceramics downstairs.', 4.4, 7.0], ['Upstairs, a giant embroidered artwork, with hidden hands worked into it to honour the makers.', 7.0, 11, ['hidden', 'hands']]], t);
  },
});
