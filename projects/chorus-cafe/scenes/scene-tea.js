const { seg, eo, eio, lerp } = kit;
const ell = (cx, cy, rx, ry, n) => { const a = []; n = n || 30; for (let i = 0; i <= n; i++) { const th = i / n * 6.2832; a.push([cx + Math.cos(th) * rx, cy + Math.sin(th) * ry]); } return a; };
kit.scene('tea', {
  init(kit) { Stitch.load(kit); kit.stage.append(kit.h('<div class="ground"><canvas class="mapc" width="1080" height="1920"></canvas></div>')); this.ctx = kit.stage.querySelector('canvas').getContext('2d'); },
  render(t, kit) {
    const ctx = this.ctx, S = Stitch, W = 1080, H = 1920, C = S.COL; S.cloth2(ctx, W, H);
    const plates = [
      { x: 260, y: 620, r: 150, t0: 1.2, lab: ['Truffle taleggio', 'toast'], lx: 450, ly: 560 },
      { x: 810, y: 860, r: 150, t0: 3.2, lab: ['Citrus', 'cheesecake'], lx: 60, ly: 800 },
      { x: 280, y: 1090, r: 140, t0: 5.0, lab: ['Pistachio', 'cannoli'], lx: 460, ly: 1030 },
    ];
    plates.forEach((P, i) => {
      const p = seg(t, P.t0, P.t0 + 1.2); if (p <= 0) return;
      S.fillPoly(ctx, S.circ(P.x, P.y, P.r, 36), C.chalk, 2.6, p, 0.28, 5); S.line(ctx, S.circ(P.x, P.y, P.r, 36), C.chalk, 6, p, { len: 16, seed: 90 + i });
      S.line(ctx, S.circ(P.x, P.y, P.r * 0.8, 34), '#141A3C', 4, p, { len: 12, gap: 5, seed: 95 + i, holes: false });
      const q = seg(t, P.t0 + 0.6, P.t0 + 1.6);
      if (i === 0) { const sl = [[-85, 90], [85, 90], [92, -10], [70, -60], [30, -85], [-30, -85], [-70, -60], [-92, -10], [-85, 90]].map((z) => [P.x + z[0], P.y + z[1]]);
        S.fillPoly(ctx, sl, C.chalk, 3, q, 0.5, 3.6); S.line(ctx, sl, C.rose, 9, q, { len: 14, gap: 3, seed: 7 });
        S.line(ctx, ell(P.x, P.y, 52, 36, 20), '#141A3C', 4, q, { len: 10, gap: 4, seed: 8, holes: false });
        [[-40, 20], [30, 30], [10, -30]].forEach((d, k) => S.fillPoly(ctx, ell(P.x + d[0], P.y + d[1], 17, 10, 10), C.rose, 2.6, q, 0.5, 3));
        [[-30, -45], [35, -10], [-10, 55]].forEach((d, k) => S.line(ctx, [[P.x + d[0], P.y + d[1]], [P.x + d[0] + 22, P.y + d[1] + 4]], '#141A3C', 4, q, { len: 22, gap: 1, seed: 40 + k, holes: false })); }
      if (i === 1) { const wd = [[-125, 70], [115, 70], [115, -20], [-125, -75], [-125, 70]].map((z) => [P.x + z[0], P.y + z[1]]);
        S.fillPoly(ctx, wd, C.chalk, 3, q, 0.5, 3.6); S.fillPoly(ctx, [[-125, 40], [115, 40], [115, 70], [-125, 70]].map((z) => [P.x + z[0], P.y + z[1]]), C.rose, 3, q, 0.5, 3.4);
        S.line(ctx, [[P.x - 125, P.y + 40], [P.x + 115, P.y + 40]], '#141A3C', 4, q, { len: 14, gap: 3, seed: 9, holes: false }); S.line(ctx, wd, '#141A3C', 4, q, { seed: 10 });
        S.fillPoly(ctx, ell(P.x + 40, P.y - 55, 40, 22, 20), C.mint, 3, q, 0.5, 3.2); S.line(ctx, ell(P.x + 40, P.y - 55, 40, 22, 20), C.chalk, 4, q, { len: 10, seed: 11 });
        for (let k = 0; k < 5; k++) S.line(ctx, [[P.x + 40, P.y - 55], [P.x + 40 + Math.cos(k * 1.256) * 36, P.y - 55 + Math.sin(k * 1.256) * 19]], C.chalk, 3, q, { len: 20, gap: 1, seed: k, holes: false }); }
      if (i === 2) { [[-40, -50, 0.5], [-30, 30, 0.5]].forEach((d, k) => { const a = d[2], ex = Math.cos(a) * 95, ey = Math.sin(a) * 95, o = [[P.x + d[0] - ex, P.y + d[1] - ey], [P.x + d[0] + ex, P.y + d[1] + ey]]; S.line(ctx, o, C.rose, 34, q, { len: 20, gap: 2, seed: 30 + k, holes: false });
          for (let r = 1; r < 8; r++) { const u = r / 8, mx = o[0][0] + (o[1][0] - o[0][0]) * u, my = o[0][1] + (o[1][1] - o[0][1]) * u; S.line(ctx, [[mx + 8, my - 14], [mx - 8, my + 14]], '#141A3C', 3, q, { len: 28, gap: 1, seed: r, holes: false }); }
          S.line(ctx, [o[1], [o[1][0] + 2, o[1][1] + 2]], C.mint, 38, q, { len: 6, gap: 1, seed: 33 + k, holes: false }); S.line(ctx, [o[0], [o[0][0] + 2, o[0][1] + 2]], C.mint, 38, q, { len: 6, gap: 1, seed: 36 + k, holes: false }); });
        for (let k = 0; k < 10; k++) S.line(ctx, S.circ(P.x - 90 + k * 20, P.y + 100 + (k % 2) * 12, 3, 6), C.chalk, 4, q, { len: 3, gap: 1, seed: k, holes: false }); }
      S.text(ctx, P.lab[0], { font: "700 58px Fraunces, Georgia, serif", x: P.lx, y: P.ly, p: seg(t, P.t0 + 0.8, P.t0 + 1.8), step: 3, col: C.chalk, g: 'l' + i + 'a' });
      S.text(ctx, P.lab[1], { font: "700 58px Fraunces, Georgia, serif", x: P.lx, y: P.ly + 70, p: seg(t, P.t0 + 1.1, P.t0 + 2.0), step: 3, col: C.rose, g: 'l' + i + 'b' });
    });
    S.label(ctx, 'AFTERNOON TEA FOR TWO', 56, 420, { a: seg(t, 0, 0.6), g: 'h' });
    S.logo(ctx, 48, 266, 400, 1, null, 'lockup'); S.logo(ctx, 800, 266, 130, 1, null, 'mono');
    S.caps(ctx, [["Afternoon tea for two.", 0.2, 8]], t, { back: true, y: 1340 });
  },
});
