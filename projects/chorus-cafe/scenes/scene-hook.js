const { seg, eo, eio, lerp } = kit;
kit.scene('hook', {
  init(kit) {
    Stitch.load(kit);
    kit.stage.append(kit.h('<div class="ground"><canvas class="mapc" width="1080" height="1920"></canvas></div>'));
    this.ctx = kit.stage.querySelector('canvas').getContext('2d');
  },
  render(t, kit) {
    const ctx = this.ctx, u = eio(seg(t, 0.2, 6.2));
    const cam = { W: 1080, H: 1920, cx: lerp(-70, 0, u), cy: lerp(-210, 30, u), s: lerp(0.62, 1.12, u) };
    const R = 40 + 1100 * eio(seg(t, 0.6, 5.6)), route = eio(seg(t, 0.35, 3.3));
    const r = Stitch.drawMap(ctx, cam, { reveal: R, route: route });
    const pin = Stitch.project(cam, 0, 0);
    if (route < 1) Stitch.needle(ctx, r.tip, cam.s);
    Stitch.button(ctx, pin[0], pin[1], 26 * cam.s / 0.9 + 6, seg(t, 3.3, 4.3), t);
    Stitch.patch(ctx, 110, 290, 860, 300, seg(t, 3.8, 5.0), -0.012);
    const lg = Stitch.logo(ctx, 220, 325, 640, seg(t, 4.6, 6.8), null, 'lockup');
    if (lg) Stitch.needle(ctx, lg, 0.9);
  },
});
