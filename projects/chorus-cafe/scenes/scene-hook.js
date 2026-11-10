const { seg, eo, eio, lerp } = kit;
kit.scene('hook', {
  init(kit) { Stitch.load(kit); kit.stage.append(kit.h('<div class="ground"><canvas class="mapc" width="1080" height="1920"></canvas></div>')); this.ctx = kit.stage.querySelector('canvas').getContext('2d'); },
  render(t, kit) {
    const ctx = this.ctx, S = Stitch, W = 1080, H = 1920, T0 = 1.8, u = eio(seg(t, T0, 6.6)), slide = eio(seg(t, 1.7, 2.8));
    const cam = { W: W, H: H, cx: lerp(-60, 0, u), cy: lerp(-200, 20, u), s: lerp(0.62, 1.7, u), k: lerp(1, 0.62, eio(seg(t, 4.2, 6.8))) };
    const R = 40 + 1100 * eio(seg(t, T0 + 0.2, 6)), route = eio(seg(t, T0 + 0.1, 4.4)), rise = eio(seg(t, 4.2, 6.8));
    const r = S.drawMap(ctx, cam, { reveal: R, route: route, rise: rise }); const pin = S.project(cam, 0, 0);
    if (route > 0 && route < 1) S.needle(ctx, r.tip, cam.s);
    S.button(ctx, pin[0], pin[1], 26 * cam.s / 0.9 + 6, seg(t, 4.4, 5.3), t);
    const py = lerp(720, 300, slide);
    S.patch(ctx, 40, py, 1000, 360, seg(t, 0.05, 0.8), -0.02 * (1 - slide));
    const lg = S.logo(ctx, 110, py + 38, 860, seg(t, 0.5, 1.9), null, 'lockup'); if (lg) S.needle(ctx, lg, 0.9);
    S.caps(ctx, [["A cafe where even the pasta wears stripes.", 0.3, 7, ['pasta', 'stripes.']]], t, { back: true, font: "500 64px Fraunces, Georgia, serif", lh: 76, x: 70, y: 1330 });
  },
});
