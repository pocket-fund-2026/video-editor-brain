const { seg, eo, eio, lerp } = kit;
kit.scene('tea', {
  init(kit) { Stitch.load(kit); kit.stage.append(kit.h('<div class="ground"><canvas class="mapc" width="1080" height="1920"></canvas></div>')); this.ctx = kit.stage.querySelector('canvas').getContext('2d'); this.T = (kit.json('timing.json') || {}).tea || {};  },
  render(t, kit) {
    const ctx = this.ctx, S = Stitch, W = 1080, H = 1920, prog = (kit.start + t) / 66.0, T = this.T;
    S.cloth2(ctx, W, H); S.hud(ctx, 'TEA SERVICE · FOR TWO', prog); const C = S.COL;
    const n = S.text(ctx, '₹3,600', { font: "700 170px Fraunces, Georgia, serif", x: 70, y: 330, p: seg(t, 0.3, 2.6), step: 4, col: C.rose }); if (n.tip) S.needle(ctx, n.tip, 0.9);
    S.label(ctx, 'AFTERNOON TEA FOR TWO', 76, 560, { a: seg(t, 1.8, 2.6) });
    const items = [['CHÈVRE & FRUIT', 0], ['AVOCADO TOAST', 1], ['TALEGGIO & ONION', 2], ['PICNIC SANDWICH', 3], ['CITRUS CHEESECAKE', 4], ['PISTACHIO CANNOLI', 5]];
    items.forEach((it, i) => { const col = i % 2, row = (i / 2) | 0, x = col ? 530 : 70, y = 650 + row * 190 + (col ? 40 : 0), w = col ? 430 : 410, p = seg(t, 2.2 + i * 0.7, 2.9 + i * 0.7), rot = [-0.02, 0.014, 0.01, -0.016, -0.012, 0.018][i];
      ctx.save(); ctx.translate(x + w / 2, y + 70); ctx.rotate(rot); ctx.translate(-(x + w / 2), -(y + 70)); S.patch(ctx, x, y, w, 140, p, 0); const ic = [x + 56, y + 70];
      const icon = [S.circ(ic[0], ic[1], 28, 20), [[ic[0] - 30, ic[1] - 18], [ic[0] + 30, ic[1] - 18], [ic[0] + 30, ic[1] + 18], [ic[0] - 30, ic[1] + 18], [ic[0] - 30, ic[1] - 18]], [[ic[0] - 30, ic[1] + 20], [ic[0], ic[1] - 26], [ic[0] + 30, ic[1] + 20], [ic[0] - 30, ic[1] + 20]], [[ic[0] - 28, ic[1] + 16], [ic[0] + 28, ic[1] - 20], [ic[0] + 28, ic[1] + 16], [ic[0] - 28, ic[1] + 16]], [[ic[0] - 30, ic[1] + 20], [ic[0] - 20, ic[1] - 22], [ic[0] + 22, ic[1] - 22], [ic[0] + 30, ic[1] + 20], [ic[0] - 30, ic[1] + 20]], [[ic[0] - 30, ic[1] - 6], [ic[0] + 30, ic[1] - 6], [ic[0] + 30, ic[1] + 8], [ic[0] - 30, ic[1] + 8], [ic[0] - 30, ic[1] - 6]]][i];
      S.line(ctx, icon, i % 2 ? C.mint : C.chalk, 3, seg(t, 2.5 + i * 0.7, 3.2 + i * 0.7), { len: 8, gap: 3, seed: 120 + i }); S.label(ctx, it[0], x + 110, y + 52, { a: seg(t, 2.7 + i * 0.7, 3.3 + i * 0.7), font: "400 20px 'DM Mono', monospace", ls: 2, g: 'it' + i }); ctx.restore(); });
    S.caps(ctx, [['Afternoon tea for two is three thousand six hundred rupees, truffle taleggio toast included.', 0.2, 8.5, ['three', 'thousand', 'six', 'hundred', 'rupees,']]], t);
  },
});
