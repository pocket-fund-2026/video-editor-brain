const { seg, eo, eio, lerp } = kit;
kit.scene('hook', {
  init(kit) { Stitch.load(kit); kit.stage.append(kit.h('<div class="ground"><canvas class="mapc" width="1080" height="1920"></canvas></div>')); this.ctx = kit.stage.querySelector('canvas').getContext('2d'); },
  render(t, kit) {
    const ctx = this.ctx, S = Stitch, W = 1080, H = 1920, T0 = 2.6, u = eio(seg(t, T0, 8.2)), slide = eio(seg(t, 2.4, 3.6));
    const cam = { W: W, H: H, cx: lerp(-70, 0, u), cy: lerp(-210, 20, u), s: lerp(0.62, 1.75, u), k: lerp(1, 0.6, eio(seg(t, 5.0, 8.4))) };
    const R = 40 + 1100 * eio(seg(t, T0 + 0.3, 7.2)), route = eio(seg(t, T0 + 0.2, 5.4)), rise = eio(seg(t, 5.2, 8.4));
    const r = S.drawMap(ctx, cam, { reveal: R, route: route, rise: rise }); const pin = S.project(cam, 0, 0);
    if (route > 0 && route < 1) S.needle(ctx, r.tip, cam.s);
    S.button(ctx, pin[0], pin[1], 26 * cam.s / 0.9 + 6, seg(t, 5.4, 6.4), t);
    const py = lerp(790, 330, slide);
    S.patch(ctx, 110, py, 860, 300, seg(t, 0.1, 1.0), -0.012 * (1 - slide));
    const lg = S.logo(ctx, 220, py + 35, 640, seg(t, 0.8, 2.5), null, 'lockup'); if (lg) S.needle(ctx, lg, 0.9);
    S.hud(ctx, 'KALA GHODA, MUMBAI', (kit.start + t) / 66.0);
    S.caps(ctx, [["Upstairs from a fashion store in Kala Ghoda, there's a cafe where even the pasta wears stripes.", 0.4, 8.6, ['pasta', 'stripes.']]], t, { back: true });
  },
});
