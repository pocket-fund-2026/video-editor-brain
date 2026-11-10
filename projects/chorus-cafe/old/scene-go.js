const { seg, eo, eio, lerp } = kit;
kit.scene('go', {
  init(kit) { Stitch.load(kit); kit.stage.append(kit.h('<div class="ground"><canvas class="mapc" width="1080" height="1920"></canvas></div>')); this.ctx = kit.stage.querySelector('canvas').getContext('2d'); this.T = (kit.json('timing.json') || {}).go || {};  },
  render(t, kit) {
    const ctx = this.ctx, S = Stitch, W = 1080, H = 1920, prog = (kit.start + t) / 66.0, T = this.T;
    S.cloth2(ctx, W, H); S.hud(ctx, 'OPEN DAILY', prog); const C = S.COL, CX = 320, CY = 860, R = 190;
    S.line(ctx, S.circ(CX, CY, R, 60), C.chalk, 4, seg(t, 0.2, 1.8), { len: 14, seed: 140 });
    for (let h = 0; h < 12; h++) { const a = h / 12 * 6.2832 - 1.5708; S.line(ctx, [[CX + Math.cos(a) * (R - 30), CY + Math.sin(a) * (R - 30)], [CX + Math.cos(a) * (R - 8), CY + Math.sin(a) * (R - 8)]], C.chalk, 3.4, seg(t, 0.8 + h * 0.05, 1.4 + h * 0.05), { len: 30, gap: 0.1, jit: 0, seed: 150 + h }); }
    const arc = []; for (let i = 0; i <= 54; i++) { const a = (11 + i / 54 * 9) / 12 * 6.2832 - 1.5708; arc.push([CX + Math.cos(a) * (R - 55), CY + Math.sin(a) * (R - 55)]); } const tip = S.line(ctx, arc, C.rose, 7, seg(t, 1.6, 4.4), { len: 20, gap: 4, seed: 160 }); if (t < 4.4 && tip) S.needle(ctx, tip, 0.9);
    const a11 = 11 / 12 * 6.2832 - 1.5708, a8 = 20 / 12 * 6.2832 - 1.5708; S.label(ctx, '11 AM', CX + Math.cos(a11) * (R + 52) - 40, CY + Math.sin(a11) * (R + 52) - 12, { a: seg(t, 2.0, 2.6) }); S.label(ctx, '8 PM', CX + Math.cos(a8) * (R + 40) - 30, CY + Math.sin(a8) * (R + 40) - 10, { a: seg(t, 3.8, 4.4) });
    S.label(ctx, 'EVERY DAY', CX - 80, CY + R + 80, { a: seg(t, 4.2, 4.8) });
    S.tag(ctx, 770, 640, 70, 380, 200, S.swing(t, 4.6, 0.26, 1.3, 6.5) * (t > 4.5 ? 1 : 0), seg(t, 4.5, 5.4), (c) => { S.text(c, 'Mittal Avenue', { font: "700 42px Fraunces, Georgia, serif", x: -170, y: 44, p: seg(t, 5.0, 6.4), step: 3, g: 'adr' }); S.label(c, 'FORT · LEVEL 2', -170, 128, { a: seg(t, 6.0, 6.6), g: 'adr' }); });
    S.tag(ctx, 800, 1010, 40, 310, 110, S.swing(t, 6.2, 0.3, 1.3, 7) * (t > 6.1 ? 1 : 0), seg(t, 6.2, 7.0), (c) => { S.label(c, '+10% SERVICE', -128, 30, { a: seg(t, 6.8, 7.4), font: "400 19px 'DM Mono', monospace", ls: 2, g: 'svc' }); S.label(c, 'CHARGE & TAXES', -128, 62, { a: seg(t, 6.8, 7.4), font: "400 19px 'DM Mono', monospace", ls: 2, g: 'svc' }); });
    S.caps(ctx, [['Open daily, eleven to eight, on Mittal Avenue in Fort.', 0.2, 5.0, ['eleven', 'eight,']], ['Prices exclude service charge and tax.', 5.0, 8.5]], t);
  },
});
