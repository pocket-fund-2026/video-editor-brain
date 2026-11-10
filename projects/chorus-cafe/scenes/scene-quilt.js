const { seg, eo, eio, lerp } = kit;
const ell = (cx, cy, rx, ry, n, a0) => { const a = []; n = n || 44; for (let i = 0; i <= n; i++) { const th = (a0 || 0) + i / n * 6.2832; a.push([cx + Math.cos(th) * rx, cy + Math.sin(th) * ry]); } return a; };
const DIPS = [
  { n: 'Black garlic hummus', c: 'chalk' }, { n: 'Smoked carrot', c: 'rose' }, { n: 'Romesco', c: 'rose' },
  { n: 'Herb cream cheese', c: 'mint' }, { n: 'Yogurt, spinach, chives', c: 'chalk' },
];
kit.scene('quilt', {
  init(kit) { Stitch.load(kit); kit.stage.append(kit.h('<div class="ground"><canvas class="mapc" width="1080" height="1920"></canvas></div>')); this.ctx = kit.stage.querySelector('canvas').getContext('2d'); },
  render(t, kit) {
    const ctx = this.ctx, S = Stitch, W = 1080, H = 1920, C = S.COL, h2 = S.h2; S.cloth2(ctx, W, H);
    const BX = 450, BY = 700, RX = 360, RY = 255, INK = '#141A3C';
    // the bowl: thick rim, shadow ring, inner well
    const pb = seg(t, 0.2, 1.2);
    S.fillPoly(ctx, ell(BX, BY, RX, RY), C.chalk, 2.8, pb, 0.5, 4);
    S.line(ctx, ell(BX, BY, RX, RY), C.chalk, 7, pb, { len: 18, gap: 3, seed: 11 });
    S.line(ctx, ell(BX, BY + 6, RX * 0.84, RY * 0.84), INK, 6, pb, { len: 14, gap: 4, seed: 12, holes: false });
    const k = Math.max(0, Math.min(4, Math.floor((t - 1.0) / 0.9)));
    for (let j = 0; j <= k; j++) { const t0 = 1.0 + j * 0.9, d = DIPS[j];
      const p = j < k ? 1 : seg(t, t0, t0 + 0.65);
      S.fillPoly(ctx, ell(BX, BY + 6, RX * 0.8, RY * 0.8), C[d.c], 2.8, p, 0.45, 3.8);
      if (j === k) {
        const gp = seg(t, t0 + 0.4, t0 + 0.9);
        // swirl made by the spoon
        const sw = []; for (let i = 0; i <= 60; i++) { const a = i * 0.3, r = 8 + i * 4.2; sw.push([BX + Math.cos(a) * r * 1.2, BY + 6 + Math.sin(a) * r * 0.85]); }
        S.line(ctx, sw, INK, 5, gp, { len: 16, gap: 4, seed: 40 + j, holes: false });
        const pt = (i, R) => [BX + (h2(i, 3 + j) - 0.5) * 2 * RX * R, BY + 6 + (h2(i, 9 + j) - 0.5) * 2 * RY * R];
        const inside = (q, R) => Math.pow((q[0] - BX) / (RX * R), 2) + Math.pow((q[1] - BY - 6) / (RY * R), 2) < 1;
        if (j === 0) { S.line(ctx, ell(BX, BY + 6, RX * 0.58, RY * 0.58, 40), C.mint, 6, gp, { len: 5, gap: 7, seed: 51, holes: false }); for (let i = 0; i < 18; i++) { const q = pt(i, 0.62); if (inside(q, 0.55)) S.line(ctx, [q, [q[0] + 8, q[1] + 3]], C.rose, 8, gp, { len: 8, gap: 1, seed: i, holes: false }); } }
        if (j === 1) { for (let i = 0; i < 26; i++) { const q = pt(i, 0.7); if (inside(q, 0.62)) S.line(ctx, [q, [q[0] + 14, q[1] - 5]], C.chalk, 5, gp, { len: 14, gap: 1, seed: i, holes: false }); } S.line(ctx, ell(BX, BY + 6, RX * 0.6, RY * 0.6, 40), C.chalk, 4, gp, { len: 6, gap: 9, seed: 52, holes: false }); }
        if (j === 2) { for (let i = 0; i < 9; i++) { const q = pt(i, 0.62); if (inside(q, 0.55)) S.line(ctx, [[q[0] - 24, q[1] + 8], [q[0] + 24, q[1] - 8]], C.chalk, 11, gp, { len: 48, gap: 1, seed: i, holes: false }); } }
        if (j === 3) { for (let i = 0; i < 10; i++) { const a = -0.9 + i * 0.22, sx = BX - 60 + i * 14, sy = BY + 70; S.line(ctx, [[sx, sy], [sx + Math.cos(a) * 190, sy + Math.sin(a) * 190 - 40]], C.chalk, 5, gp, { len: 24, gap: 1, seed: i, holes: false }); } }
        if (j === 4) { [[-110, -60, 0.3], [90, -80, -0.4], [-30, 70, 0.8], [140, 40, 0.1], [-170, 50, -0.6]].forEach((d, i) => { const lf = ell(BX + d[0], BY + d[1], 46, 22, 14, d[2]); S.fillPoly(ctx, lf, C.mint, 2.6, gp, 0.5, 3); });
          for (let i = 0; i < 14; i++) { const q = pt(i, 0.62); if (inside(q, 0.55)) S.line(ctx, S.circ(q[0], q[1], 8, 8), C.mint, 4, gp, { len: 5, gap: 2, seed: i, holes: false }); } }
        // name, one at a time, below the bowl
        S.text(ctx, d.n, { font: "700 62px Fraunces, Georgia, serif", x: 56, y: 985, p: seg(t, t0 + 0.05, t0 + 0.75), step: 3, col: C.chalk, g: 'dip' });
      }
    }
    // torn warm bread arrives after the dips
    const b0 = 5.8;
    if (t > b0) {
      const chunks = [[250, 1205, 260, 130, -0.08], [560, 1185, 270, 135, 0.07], [880, 1215, 210, 120, 0.2]];
      chunks.forEach((q, i) => { const p = seg(t, b0 + i * 0.4, b0 + i * 0.4 + 1.0); if (p <= 0) return; const pts = []; for (let a = 0; a <= 28; a++) { const th = a / 28 * 6.2832, r = 1 + (h2(a % 28, i + 20) - 0.5) * 0.18; const x = Math.cos(th) * q[2] / 2 * r, y = Math.sin(th) * q[3] / 2 * r * (th > 3.14 ? 1.15 : 0.9), c = Math.cos(q[4]), s = Math.sin(q[4]); pts.push([q[0] + x * c - y * s, q[1] + x * s + y * c]); }
        S.fillPoly(ctx, pts, C.chalk, 2.8, Math.min(1, p * 1.5), 0.5, 3.6); S.line(ctx, pts, C.rose, 8, p, { len: 14, gap: 3, seed: 60 + i });
        for (let m = 0; m < 5; m++) { const hx = q[0] + (h2(m, i + 7) - 0.5) * q[2] * 0.6, hy = q[1] + (h2(m, i + 31) - 0.5) * q[3] * 0.5; S.line(ctx, S.circ(hx, hy, 4 + h2(m, i) * 5, 8), INK, 4, p, { len: 4, gap: 1, seed: m, holes: false }); } });
      [[820, 1130], [880, 1120], [940, 1135]].forEach((s, i) => S.line(ctx, [[s[0], s[1]], [s[0] - 16, s[1] - 40], [s[0] + 14, s[1] - 80], [s[0] - 10, s[1] - 120]], C.mint, 4, seg(t, b0 + 0.9 + i * 0.2, b0 + 2.2 + i * 0.2), { len: 12, gap: 6, seed: 70 + i, holes: false }));
      S.label(ctx, 'WARM PULL-APART BREAD', 56, 1078, { a: seg(t, b0 + 0.6, b0 + 1.2), g: 'bread', font: "400 26px 'DM Mono', monospace" });
    }
    S.logo(ctx, 48, 266, 400, 1, null, 'lockup'); S.logo(ctx, 800, 266, 130, 1, null, 'mono');
    S.caps(ctx, [["Everything's vegetarian.", 0.2, 2.4], ["The Chorus Quilt: five house made dips.", 2.5, 6.0, ['dips.']], ["Warm bread to scoop.", 6.2, 10, ['bread']]], t, { back: true, y: 1340 });
  },
});
