const { seg, eo, eio, lerp } = kit;
kit.scene('cup', {
  init(kit) { Stitch.load(kit); kit.stage.append(kit.h('<div class="ground"><canvas class="mapc" width="1080" height="1920"></canvas></div>')); this.ctx = kit.stage.querySelector('canvas').getContext('2d'); this.T = (kit.json('timing.json') || {}).cup || {};  },
  render(t, kit) {
    const ctx = this.ctx, S = Stitch, W = 1080, H = 1920, prog = (kit.start + t) / 66.0, T = this.T;
    S.cloth2(ctx, W, H); S.hud(ctx, 'OR JUST A COFFEE', prog); const C = S.COL;
    const cup = [[160, 900], [460, 900], [430, 1100], [190, 1100], [160, 900]]; S.fillPoly(ctx, cup, C.chalk, 2.6, seg(t, 0.4, 1.8), 0.4, 3.6); S.line(ctx, cup, C.chalk, 4, seg(t, 0.2, 1.2), { len: 16, seed: 130 });
    S.line(ctx, S.circ(500, 990, 60, 24).filter((q) => q[0] > 440), C.chalk, 5, seg(t, 1.2, 1.9), { len: 12, seed: 131 }); S.line(ctx, [[110, 1128], [540, 1128]], C.rose, 5, seg(t, 1.0, 1.8), { len: 22, gap: 6, seed: 132 });
    const st = []; for (let i = 0; i <= 40; i++) st.push([310 + Math.sin(i * 0.38) * 22, 880 - i * 7.5]); S.line(ctx, st, C.rose, 5, seg(t, 1.8, 3.6), { len: 18, gap: 4, seed: 133 });
    const pr = S.text(ctx, '₹450', { font: "700 150px Fraunces, Georgia, serif", x: 610, y: 900, p: seg(t, 1.4, 3.2), step: 4, col: C.rose }); S.label(ctx, 'CAPPUCCINO', 616, 1090, { a: seg(t, 2.6, 3.2) });
    S.caps(ctx, [['Or just a cappuccino: four fifty.', 0.2, 4.6]], t);
  },
});
