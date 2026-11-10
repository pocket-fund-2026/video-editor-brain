const { seg, eo, eio, lerp } = kit;
const ell = (cx, cy, rx, ry, n, a0) => { const a = []; n = n || 44; for (let i = 0; i <= n; i++) { const th = (a0 || 0) + i / n * 6.2832; a.push([cx + Math.cos(th) * rx, cy + Math.sin(th) * ry]); } return a; };
kit.scene('pasta', {
  init(kit) { Stitch.load(kit); kit.stage.append(kit.h('<div class="ground"><canvas class="mapc" width="1080" height="1920"></canvas></div>')); this.ctx = kit.stage.querySelector('canvas').getContext('2d'); },
  render(t, kit) {
    const ctx = this.ctx, S = Stitch, W = 1080, H = 1920, C = S.COL, h2 = S.h2, INK = '#141A3C'; S.cloth2(ctx, W, H);
    const PX = 500, PY = 790, p0 = seg(t, 0.1, 1.1);
    // plate, then sauce
    S.fillPoly(ctx, ell(PX, PY, 400, 325), C.chalk, 2.8, p0, 0.5, 4.2); S.line(ctx, ell(PX, PY, 400, 325), C.chalk, 7, p0, { len: 18, gap: 3, seed: 21 });
    S.line(ctx, ell(PX, PY + 4, 328, 262), INK, 6, p0, { len: 14, gap: 4, seed: 22, holes: false });
    S.fillPoly(ctx, ell(PX, PY + 6, 308, 246), C.rose, 2.8, seg(t, 0.8, 1.8), 0.4, 4);
    // three handkerchief sheets, ruffled edges, dropped on one by one; the top one is striped
    const sheets = [[PX - 120, PY - 30, 270, -0.3, 1.4], [PX + 120, PY + 20, 270, 0.35, 2.2], [PX, PY + 20, 300, 0.05, 3.0]];
    sheets.forEach((q, i) => { const p = seg(t, q[4], q[4] + 0.9); if (p <= 0) return; const drop = (1 - eo(p)) * -50;
      const pts = []; const N = 40; const cc = Math.cos(q[3]), ss = Math.sin(q[3]);
      for (let a = 0; a <= N; a++) { const u = a / N * 4, side = Math.floor(u), f = u - side; let x, y; const hs = q[2] / 2, w = Math.sin(f * 6.2832 * 2.5) * 9;
        if (side === 0) { x = -hs + f * 2 * hs; y = -hs + w; } else if (side === 1) { x = hs + w; y = -hs + f * 2 * hs; } else if (side === 2) { x = hs - f * 2 * hs; y = hs + w; } else { x = -hs + w; y = hs - f * 2 * hs; }
        pts.push([q[0] + x * cc - y * ss, q[1] + y * cc + x * ss + drop]); }
      S.fillPoly(ctx, pts, C.chalk, 2.8, Math.min(1, p * 1.5), 0.5, 3.6);
      if (i === 2) { for (let b = 0; b < 5; b++) { const y0 = -q[2] / 2 + 30 + b * (q[2] - 40) / 5, a = [[-q[2] / 2 + 14, y0], [q[2] / 2 - 14, y0]].map((z) => [q[0] + z[0] * cc - z[1] * ss, q[1] + z[1] * cc + z[0] * ss + drop]); S.line(ctx, a, C.rose, 20, seg(t, q[4] + 0.4, q[4] + 1.4), { len: 40, gap: 1, seed: 80 + b, holes: false }); } }
      else { for (let b = 0; b < 3; b++) { const y0 = -60 + b * 60, a = [[-90, y0], [90, y0 + 10]].map((z) => [q[0] + z[0] * cc - z[1] * ss, q[1] + z[1] * cc + z[0] * ss + drop]); S.line(ctx, a, INK, 3, p, { len: 14, gap: 6, seed: 90 + b + i * 3, holes: false }); } }
      S.line(ctx, pts, C.rose, 6, p, { len: 12, gap: 3, seed: 100 + i }); });
    // basil and parmesan
    const g = seg(t, 3.6, 4.6);
    [[350, 640, 0.6], [640, 680, -0.5], [560, 1000, 0.2], [380, 940, -0.3]].forEach((d, i) => { S.fillPoly(ctx, ell(d[0], d[1], 52, 26, 14, d[2]), C.mint, 2.6, g, 0.5, 3); S.line(ctx, [[d[0] - 40, d[1]], [d[0] + 40, d[1]]], INK, 3, g, { len: 20, gap: 2, seed: i, holes: false }); });
    for (let i = 0; i < 16; i++) S.line(ctx, S.circ(PX - 180 + h2(i, 5) * 360, PY - 100 + h2(i, 8) * 280, 5, 6), C.chalk, 5, g, { len: 4, gap: 1, seed: i, holes: false });
    S.text(ctx, 'Fazzoletti', { font: "700 112px Fraunces, Georgia, serif", x: 56, y: 1135, p: seg(t, 1.2, 3.0), step: 4, col: C.chalk, g: 'faz' });
    S.label(ctx, 'HANDKERCHIEF PASTA, CHORUS STRIPES', 56, 1280, { a: seg(t, 3, 3.6), g: 'fl' });
    S.logo(ctx, 48, 266, 400, 1, null, 'lockup'); S.logo(ctx, 800, 266, 130, 1, null, 'mono');
    S.caps(ctx, [["Pasta cut like a handkerchief,", 0.3, 3.2], ["striped like the brand.", 3.3, 7, ['striped']]], t, { back: true, y: 1340 });
  },
});
