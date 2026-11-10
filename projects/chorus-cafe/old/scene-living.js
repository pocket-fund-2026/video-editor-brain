const { seg, eo, eio, lerp } = kit;
kit.scene('living', {
  init(kit) { Stitch.load(kit); kit.stage.append(kit.h('<div class="ground"><canvas class="mapc" width="1080" height="1920"></canvas></div>')); this.ctx = kit.stage.querySelector('canvas').getContext('2d'); this.T = (kit.json('timing.json') || {}).living || {};  },
  render(t, kit) {
    const ctx = this.ctx, S = Stitch, W = 1080, H = 1920, prog = (kit.start + t) / 66.0, T = this.T;
    const u = eio(seg(t, 0, 6)), cam = { W: W, H: H, cx: 0, cy: lerp(20, 0, u), s: lerp(1.75, 2.0, u), k: 0.6 };
    const r = S.drawMap(ctx, cam, { reveal: 2400, route: 1, rise: 1 }); const pin = S.project(cam, 0, 0);
    S.button(ctx, pin[0], pin[1], 26 * cam.s / 0.9 + 6, 1, t);
    const ring = S.circ(pin[0], pin[1], 74 * cam.s / 1.2, 36).map((q, i) => [q[0] + (S.h2(i, 3) - 0.5) * 5, q[1] + (S.h2(5, i) - 0.5) * 5]); S.line(ctx, ring, S.COL.rose, 4.2, seg(t, 0.3, 1.5), { len: 16, gap: 5, seed: 8 });
    S.patch(ctx, 50, 340, 700, 300, seg(t, 0.2, 1.2), 0.01);
    S.label(ctx, 'OPENED', 90, 375, { a: 0.85 * seg(t, 0.8, 1.4) });
    const a = S.text(ctx, 'Nov 2025', { font: "700 120px Fraunces, Georgia, serif", x: 86, y: 420, p: seg(t, 0.9, 3.4), step: 4 }); if (a.tip && t < 3.4) S.needle(ctx, a.tip, 0.9);
    S.hud(ctx, 'KALA GHODA, MUMBAI', prog);
    S.caps(ctx, [['Chorus Café opened in November 2025, and calls itself a cultural living room.', 0.2, 6.2, ['cultural', 'living', 'room']]], t, { back: true });
  },
});
