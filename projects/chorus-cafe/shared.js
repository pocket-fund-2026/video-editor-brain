// Stitch: an embroidery renderer. Everything is a pure function of time and position (seeded by hash, never Math.random).
window.Stitch = (function () {
  'use strict';
  const PAL = { ground: '#141A3C', weaveHi: '#1B2252', weaveLo: '#0F1432', rose: '#E0506F', roseSh: '#7C2640', roseHi: '#F59AAE',
    chalk: '#F2F5FA', chalkSh: '#5C6490', chalkHi: '#FFFFFF', mint: '#8ED8C4', mintSh: '#3F7A6C', mintHi: '#D2F5EA', tone: '#262F6A', tone2: '#1E2658' };
  const h2 = (a, b) => { const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return n - Math.floor(n); };
  const c01 = (x) => Math.max(0, Math.min(1, x));
  let DATA = null, cloth = null;

  function load(kit) {
    if (DATA) return DATA;
    const raw = kit.json('kalaghoda.json');
    const un = (p) => { const a = []; for (let i = 0; i < p.length; i += 2) a.push([p[i], p[i + 1]]); return a; };
    DATA = { roads: raw.roads.map((r) => ({ pts: un(r.p), hw: r.hw, name: r.name })), blds: raw.buildings.map((b) => ({ pts: un(b.p), name: b.name })),
      green: raw.green.map((g) => ({ pts: un(g.p), name: g.name })), water: raw.water.map((g) => ({ pts: un(g.p) })), rail: raw.rail.map((g) => ({ pts: un(g.p) })),
      lm: raw.landmarks, route: un(raw.route), logo: kit.json('chorus_logo_stitches.json'), lockup: kit.json('chorus_cafe_lockup.json'), mono: kit.json('chorus_monogram.json') };
    DATA.hl = [];
    const inside = (P, x, y) => { let ins = false; for (let j = 0, k = P.length - 1; j < P.length; k = j++) { if (((P[j][1] > y) !== (P[k][1] > y)) && (x < (P[k][0] - P[j][0]) * (y - P[j][1]) / (P[k][1] - P[j][1]) + P[j][0])) ins = !ins; } return ins; };
    const WANT = ['Jehangir Art Gallery', 'Chhatrapati Shivaji Maharaj Vastu Sangra', 'Max Mueller Bahvan', 'Sir David Sassoon Library', 'Mumbai University - Fort Campus'];
    DATA.lm.forEach((l) => { if (!WANT.some((w) => l.name.indexOf(w) === 0)) return; const b = DATA.blds.find((bd) => inside(bd.pts, l.x, l.y)); if (b) b.lm = true; if (b) DATA.hl.push({ pts: b.pts.concat([b.pts[0]]), name: l.name, x: l.x, y: l.y, d: Math.hypot(l.x, l.y) }); });
    DATA.roads.forEach((r) => { r.d = Math.min.apply(null, r.pts.map((q) => Math.hypot(q[0], q[1]))); });
    DATA.blds.forEach((b, i) => { b.d = Math.hypot(b.pts[0][0], b.pts[0][1]); const lv = parseFloat(b.levels); b.h = (lv > 0 ? lv * 3.4 : 9 + 17 * h2(i, 7)); });
    return DATA;
  }

  // woven cloth, drawn once into an offscreen canvas
  function makeCloth(W, H) {
    if (cloth && cloth.width === W && cloth.height === H) return cloth;
    cloth = document.createElement('canvas'); cloth.width = W; cloth.height = H; const c = cloth.getContext('2d');
    c.fillStyle = PAL.ground; c.fillRect(0, 0, W, H);
    for (let x = 0; x < W; x += 3) { c.fillStyle = h2(x, 1) > 0.5 ? PAL.weaveHi : PAL.weaveLo; c.globalAlpha = 0.18 + 0.22 * h2(x, 9); c.fillRect(x, 0, 1.2, H); }
    for (let y = 0; y < H; y += 3) { c.fillStyle = h2(2, y) > 0.5 ? PAL.weaveHi : PAL.weaveLo; c.globalAlpha = 0.14 + 0.2 * h2(7, y); c.fillRect(0, y, W, 1.2); }
    for (let i = 0; i < 2600; i++) { const x = h2(i, 3) * W, y = h2(i, 5) * H, l = 4 + 10 * h2(i, 8); c.globalAlpha = 0.1 + 0.14 * h2(i, 2); c.fillStyle = h2(i, 6) > 0.5 ? PAL.weaveHi : PAL.weaveLo; c.fillRect(x, y, h2(i, 4) > 0.5 ? l : 1.4, h2(i, 4) > 0.5 ? 1.4 : l); }
    c.globalAlpha = 1; return cloth;
  }

  function cum(pts) { const c = [0]; for (let i = 1; i < pts.length; i++) c.push(c[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return c; }
  function at(pts, c, d) {
    let lo = 0, hi = c.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (c[m] <= d) lo = m; else hi = m; }
    const t = (d - c[lo]) / Math.max(1e-6, c[hi] - c[lo]); return [pts[lo][0] + (pts[hi][0] - pts[lo][0]) * t, pts[lo][1] + (pts[hi][1] - pts[lo][1]) * t];
  }
  // collect stitches along a polyline (screen px), revealed up to fraction p. Returns the segments and the last stitch.
  function stitches(pts, o, out) {
    const c = cum(pts), L = c[c.length - 1]; if (L < 2) return null;
    const lim = L * c01(o.p == null ? 1 : o.p), seed = Math.round(pts[0][0] * 7 + pts[0][1] * 13 + o.seed); let d = 0, k = 0, last = null;
    while (d < lim) {
      const ln = o.len * (0.78 + 0.5 * h2(seed, k)), gp = o.gap * (0.7 + 0.7 * h2(seed + 5, k)), e = Math.min(d + ln, lim);
      const a = at(pts, c, d), b = at(pts, c, e), j = (h2(seed + 9, k) - 0.5) * o.jit;
      const nx = -(b[1] - a[1]), ny = b[0] - a[0], nl = Math.hypot(nx, ny) || 1;
      const seg = [a[0] + nx / nl * j, a[1] + ny / nl * j, b[0] + nx / nl * j, b[1] + ny / nl * j]; out.push(seg); last = seg; d += ln + gp; k++;
    }
    return last;
  }
  // draw a batch of stitches in one colour set (shadow, thread, highlight): three paths, no blur
  function draw(ctx, segs, col, w, o) {
    if (!segs.length) return; ctx.lineCap = 'round'; o = o || {};
    if (o.holes !== false) { ctx.fillStyle = 'rgba(6,8,22,0.85)'; ctx.beginPath(); segs.forEach((s) => { ctx.moveTo(s[0] + 1.1, s[1]); ctx.arc(s[0], s[1], 1.1, 0, 6.283); ctx.moveTo(s[2] + 1.1, s[3]); ctx.arc(s[2], s[3], 1.1, 0, 6.283); }); ctx.fill(); }
    ctx.strokeStyle = col.sh; ctx.lineWidth = w; ctx.beginPath(); segs.forEach((s) => { ctx.moveTo(s[0] + 0.9, s[1] + 1.3); ctx.lineTo(s[2] + 0.9, s[3] + 1.3); }); ctx.stroke();
    ctx.strokeStyle = col.c; ctx.lineWidth = w; ctx.beginPath(); segs.forEach((s) => { ctx.moveTo(s[0], s[1]); ctx.lineTo(s[2], s[3]); }); ctx.stroke();
    ctx.strokeStyle = col.hi; ctx.lineWidth = Math.max(0.6, w * 0.3); ctx.beginPath(); segs.forEach((s) => { ctx.moveTo(s[0] - 0.3, s[1] - 0.5); ctx.lineTo(s[2] - 0.3, s[3] - 0.5); }); ctx.stroke();
    if (w >= 2.2) {   // twist of the thread: short diagonal ticks across each stitch
      ctx.strokeStyle = col.sh; ctx.globalAlpha = 0.55; ctx.lineWidth = 0.9; ctx.beginPath();
      segs.forEach((s) => { const dx = s[2] - s[0], dy = s[3] - s[1], L = Math.hypot(dx, dy); if (L < 4) return; const ux = dx / L, uy = dy / L, nx = -uy, ny = ux, n = Math.floor(L / (w * 0.9)), a = w * 0.42;
        for (let i = 1; i < n; i++) { const px = s[0] + ux * i * w * 0.9, py = s[1] + uy * i * w * 0.9; ctx.moveTo(px - nx * a - ux * a * 0.5, py - ny * a - uy * a * 0.5); ctx.lineTo(px + nx * a + ux * a * 0.5, py + ny * a + uy * a * 0.5); } });
      ctx.stroke(); ctx.globalAlpha = 1; }
  }
  const COL = { rose: { c: PAL.rose, sh: PAL.roseSh, hi: PAL.roseHi }, chalk: { c: PAL.chalk, sh: PAL.chalkSh, hi: PAL.chalkHi }, mint: { c: PAL.mint, sh: PAL.mintSh, hi: PAL.mintHi } };

  // hatch fill of a polygon (screen px): short straight stitches across the shape, like a satin fill
  function hatch(pts, d, th, out) {
    const ca = Math.cos(th), sa = Math.sin(th), r = pts.map((q) => [q[0] * ca + q[1] * sa, -q[0] * sa + q[1] * ca]);
    let y0 = Infinity, y1 = -Infinity; r.forEach((q) => { y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); });
    for (let y = Math.ceil(y0 / d) * d; y < y1; y += d) {
      const xs = []; for (let i = 0; i < r.length; i++) { const a = r[i], b = r[(i + 1) % r.length]; if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) xs.push(a[0] + (y - a[1]) / (b[1] - a[1]) * (b[0] - a[0])); }
      xs.sort((p, q) => p - q);
      for (let i = 0; i + 1 < xs.length; i += 2) { if (xs[i + 1] - xs[i] < 1.5) continue; out.push([xs[i] * ca - y * sa, xs[i] * sa + y * ca, xs[i + 1] * ca - y * sa, xs[i + 1] * sa + y * ca]); }
    }
  }

  function project(cam, x, y) { return [cam.W / 2 + (x - cam.cx) * cam.s, cam.H / 2 + (y - cam.cy) * cam.s * (cam.k || 1)]; }
  const onScreen = (pts, W, H, pad) => { let a = 1e9, b = -1e9, c2 = 1e9, d2 = -1e9; for (let i = 0; i < pts.length; i++) { a = Math.min(a, pts[i][0]); b = Math.max(b, pts[i][0]); c2 = Math.min(c2, pts[i][1]); d2 = Math.max(d2, pts[i][1]); } return b > -pad && a < W + pad && d2 > -pad && c2 < H + pad; };

  // The whole stitched map. st = {reveal: metres of radius stitched so far, route: 0..1 progress of the lead thread, tone: 0..1 of building tone}
  function drawMap(ctx, cam, st) {
    const W = cam.W, H = cam.H, s = cam.s; ctx.clearRect(0, 0, W, H); ctx.drawImage(makeCloth(W, H), 0, 0);
    const R = st.reveal, fade = (d) => c01((R - d) / 90);
    // parks: seed stitches (short, scattered, seeded by position)
    const seeds = [];
    DATA.green.forEach((g) => { const P = g.pts.map((q) => project(cam, q[0], q[1])); if (!onScreen(P, W, H, 40)) return; const cx = g.pts[0][0], cy = g.pts[0][1], dd = Math.hypot(cx, cy); const f = fade(dd); if (f <= 0) return;
      let a = 1e9, b = -1e9, c2 = 1e9, d2 = -1e9; P.forEach((q) => { a = Math.min(a, q[0]); b = Math.max(b, q[0]); c2 = Math.min(c2, q[1]); d2 = Math.max(d2, q[1]); });
      const area = (b - a) * (d2 - c2), n = Math.min(900, area / 230) * f;
      for (let i = 0; i < n; i++) { const x = a + h2(i, cx) * (b - a), y = c2 + h2(cy, i) * (d2 - c2); let ins = false; for (let j = 0, k = P.length - 1; j < P.length; k = j++) { if (((P[j][1] > y) !== (P[k][1] > y)) && (x < (P[k][0] - P[j][0]) * (y - P[j][1]) / (P[k][1] - P[j][1]) + P[j][0])) ins = !ins; }
        if (ins) { const an = h2(i, 77 + cx) * 6.283, l = 3 + 3 * h2(i, 5); seeds.push([x, y, x + Math.cos(an) * l, y + Math.sin(an) * l]); } } });
    ctx.globalAlpha = 0.8; draw(ctx, seeds, COL.mint, 1.5); ctx.globalAlpha = 1;
    // streets: thread by importance, revealed outward from the cafe
    const minor = [], mid = [], major = [], foot = [];
    DATA.roads.forEach((r, i) => { const p = c01((R - r.d) / 160); if (p <= 0) return; const P = r.pts.map((q) => project(cam, q[0], q[1])); if (!onScreen(P, W, H, 20)) return;
      const big = r.hw === 'primary' || r.hw === 'secondary' || r.hw.endsWith('_link'), md = r.hw === 'tertiary';
      if (r.hw === 'footway') stitches(P, { p, len: 2.4, gap: 5, jit: 0.6, seed: i }, foot);
      else if (big) stitches(P, { p, len: 11 * s / 0.9, gap: 4.5, jit: 1.4, seed: i }, major);
      else if (md) stitches(P, { p, len: 9 * s / 0.9, gap: 4.2, jit: 1.2, seed: i }, mid);
      else stitches(P, { p, len: 8 * s / 0.9, gap: 3.4, jit: 1.1, seed: i }, minor); });
    ctx.globalAlpha = 0.62; draw(ctx, minor, COL.chalk, Math.max(1.8, 2.1 * s / 0.9), { holes: false }); ctx.globalAlpha = 1; draw(ctx, mid, COL.chalk, Math.max(2.6, 2.9 * s / 0.9)); draw(ctx, foot, COL.mint, 1.4, { holes: false }); draw(ctx, major, COL.chalk, Math.max(3.6, 4.0 * s / 0.9));
    // landmark buildings: a mint running-stitch outline
    const lmS = []; DATA.hl.forEach((h, i) => { const p = c01((R - h.d) / 120); if (p > 0) stitches(h.pts.map((q) => project(cam, q[0], q[1])), { p, len: 7, gap: 3, jit: 0.8, seed: 40 + i }, lmS); }); draw(ctx, lmS, COL.mint, 2.6);
    // railway: ties
    const tie = []; DATA.rail.forEach((r) => { const P = r.pts.map((q) => project(cam, q[0], q[1])); if (onScreen(P, W, H, 20) && fade(Math.hypot(r.pts[0][0], r.pts[0][1])) > 0) stitches(P, { p: 1, len: 1.6, gap: 6, jit: 5, seed: 3 }, tie); });
    draw(ctx, tie, COL.mint, 1.6);
    // buildings: flat satin hatch at rest; raised (stumpwork) walls and roofs as they pop up, nearest the cafe first
    const flatA = [], flatB = [], lift = [], hk = 0.95;
    DATA.blds.forEach((bd) => { const f = fade(bd.d); if (f <= 0) return; const P = bd.pts.map((q) => project(cam, q[0], q[1])); if (!onScreen(P, W, H, 80)) return;
      const x = st.rise ? c01(st.rise * 1.9 - bd.d / 520) : 0, g = x * x * (3 - 2 * x);
      if (g < 0.02) hatch(P, Math.max(3.2, 3.6 * s / 0.9), 0.78, bd.d % 2 > 1 ? flatA : flatB); else lift.push({ bd: bd, P: P, g: g, my: P.reduce((m, q) => m + q[1], 0) / P.length }); });
    ctx.lineCap = 'butt'; ctx.lineWidth = 1.4; ctx.strokeStyle = PAL.tone; ctx.beginPath(); flatA.forEach((q) => { ctx.moveTo(q[0], q[1]); ctx.lineTo(q[2], q[3]); }); ctx.stroke();
    ctx.strokeStyle = PAL.tone2; ctx.beginPath(); flatB.forEach((q) => { ctx.moveTo(q[0], q[1]); ctx.lineTo(q[2], q[3]); }); ctx.stroke();
    lift.sort((p, q) => p.my - q.my);
    lift.forEach((o) => { const hh = o.bd.h * (o.bd.lm ? 1.6 : 1) * o.g * s * hk, P = o.P, n = P.length, T = P.map((q) => [q[0], q[1] - hh]);
      for (let i = 0; i < n; i++) { const a2 = P[i], b2 = P[(i + 1) % n], ta = T[i], tb = T[(i + 1) % n], lit = (-(b2[1] - a2[1]) * -0.7 + (b2[0] - a2[0]) * -0.7) > 0; const quad = [a2, b2, tb, ta];
        ctx.fillStyle = lit ? '#1F2A6E' : '#161D57'; ctx.beginPath(); quad.forEach((q, j) => { j ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath(); ctx.fill();
        const hs = []; hatch(quad, 3.1, 1.45, hs); ctx.strokeStyle = lit ? '#3C4A9C' : '#2D3A88'; ctx.lineWidth = 1.5; ctx.beginPath(); hs.forEach((q) => { ctx.moveTo(q[0], q[1]); ctx.lineTo(q[2], q[3]); }); ctx.stroke(); }
      ctx.fillStyle = o.bd.lm ? '#2A6256' : '#263381'; ctx.beginPath(); T.forEach((q, j) => { j ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath(); ctx.fill();
      const rs = []; hatch(T, 3.0, 0.6, rs); ctx.strokeStyle = o.bd.lm ? PAL.mint : '#6678CC'; ctx.lineWidth = 1.7; ctx.beginPath(); rs.forEach((q) => { ctx.moveTo(q[0], q[1]); ctx.lineTo(q[2], q[3]); }); ctx.stroke();
      ctx.strokeStyle = o.bd.lm ? PAL.mintHi : PAL.chalk; ctx.globalAlpha = 0.7; ctx.lineWidth = 1.6; ctx.beginPath(); T.forEach((q, j) => { j ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath(); ctx.stroke(); ctx.globalAlpha = 1; });
    // lead thread: the route, in rose, with the needle at its tip
    let tip = null; const RP = DATA.route.map((q) => project(cam, q[0], q[1])); RP.push(project(cam, 0, 0)); const segs = [];
    const last = stitches(RP, { p: st.route, len: 20 * s / 0.9, gap: 5.5 * s / 0.9, jit: 1.2, seed: 11 }, segs); draw(ctx, segs, COL.rose, Math.max(5.4, 6 * s / 0.9)); tip = last;
    if (st.route > 0) { const k = RP[0]; ctx.fillStyle = PAL.rose; ctx.beginPath(); ctx.arc(k[0], k[1], 7 * s / 0.9 + 2, 0, 6.283); ctx.fill(); ctx.strokeStyle = PAL.roseSh; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(k[0], k[1], 4 * s / 0.9 + 1, 0, 6.283); ctx.stroke(); }  // the knot where the thread starts
    return { tip: tip, route: RP };
  }

  function needle(ctx, tip, s) {
    if (!tip) return; const dx = tip[2] - tip[0], dy = tip[3] - tip[1], an = Math.atan2(dy, dx), ex = tip[2], ey = tip[3], L = 46 * s / 0.9 + 18;
    ctx.save(); ctx.translate(ex, ey); ctx.rotate(an); ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(11,14,35,0.55)'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(2, 3); ctx.lineTo(L, 3); ctx.stroke();
    ctx.strokeStyle = PAL.chalk; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(L, 0); ctx.stroke();
    ctx.strokeStyle = PAL.chalkHi; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(0, -0.6); ctx.lineTo(L, -0.6); ctx.stroke();
    ctx.fillStyle = PAL.ground; ctx.strokeStyle = PAL.chalk; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.ellipse(L - 7, 0, 5.5, 1.5, 0, 0, 6.283); ctx.fill(); ctx.stroke(); ctx.restore();
    ctx.strokeStyle = PAL.rose; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.quadraticCurveTo(ex + Math.cos(an) * L * 0.5, ey + Math.sin(an) * L * 0.5 + 9, ex + Math.cos(an) * (L - 7), ey + Math.sin(an) * (L - 7)); ctx.stroke();
  }

  // a sew-on button at the cafe: pearl-white disc, four holes, a rose cross-stitch; settles with a small wobble (p 0..1)
  function button(ctx, x, y, r, p, t) {
    if (p <= 0) return; const sc = 0.85 + 0.15 * c01(p * 2), wob = Math.sin(t * 9) * (1 - c01(p)) * 0.12;
    ctx.save(); ctx.translate(x, y); ctx.rotate(wob); ctx.scale(sc, sc);
    ctx.fillStyle = 'rgba(8,10,26,0.6)'; ctx.beginPath(); ctx.arc(2.6, 3.4, r, 0, 6.283); ctx.fill();
    ctx.fillStyle = PAL.chalk; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.283); ctx.fill();
    ctx.strokeStyle = PAL.chalkSh; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(0, 0, r * 0.74, 0, 6.283); ctx.stroke();
    const o = r * 0.3; ctx.fillStyle = PAL.ground; [[-o, -o], [o, -o], [-o, o], [o, o]].forEach((q) => { ctx.beginPath(); ctx.arc(q[0], q[1], r * 0.12, 0, 6.283); ctx.fill(); });
    const k = c01((p - 0.35) / 0.65); ctx.strokeStyle = PAL.rose; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-o, -o); ctx.lineTo(-o + 2 * o * k, -o + 2 * o * k); ctx.stroke(); ctx.beginPath(); ctx.moveTo(o, -o); ctx.lineTo(o - 2 * o * k, -o + 2 * o * k); ctx.stroke(); ctx.restore();
  }

  // the Chorus wordmark as a satin-stitch fill: rows of thread, serpentine, needle at the head. p 0..1
  function logo(ctx, x, y, w, p, col, which) {
    const L = which ? DATA[which] : DATA.logo, sc = w / L.w; let total = 0; L.rows.forEach((r) => r[1].forEach((q) => { total += q[1] - q[0]; }));
    const lim = total * c01(p); let acc = 0, segs = [], lastS = null; const rows = L.rows;
    for (let i = 0; i < rows.length && acc < lim; i++) { const y0 = rows[i][0], runs = i % 2 ? rows[i][1].slice().reverse() : rows[i][1];
      for (let j = 0; j < runs.length && acc < lim; j++) { const a = runs[j][0], b = runs[j][1], ln = b - a, use = Math.min(ln, lim - acc), fw = i % 2 === 0;
        const x0 = fw ? a : b, x1 = fw ? a + use : b - use, yy = y0 + (h2(i, j) - 0.5) * 0.9; segs.push([x + x0 * sc, y + yy * sc, x + x1 * sc, y + (yy + (h2(j, i) - 0.5) * 0.8) * sc]); acc += use; lastS = segs[segs.length - 1]; } }
    draw(ctx, segs, col || COL.chalk, Math.max(2.4, L.step * sc * 1.15)); return p < 1 ? lastS : null;
  }

  // an appliqued patch: dark fabric, slightly turned, blanket-stitched in rose. p 0..1 draws the border
  function patch(ctx, x, y, w, h, p, rot) {
    if (p <= 0.001) return; ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(rot || 0); const hw = w / 2, hh = h / 2;
    ctx.fillStyle = 'rgba(4,6,18,0.55)'; ctx.fillRect(-hw + 5, -hh + 7, w, h); ctx.fillStyle = '#0D1130'; ctx.fillRect(-hw, -hh, w, h);
    for (let yy = -hh + 3; yy < hh; yy += 4) { ctx.fillStyle = h2(yy, 5) > 0.5 ? '#141A3C' : '#0A0D26'; ctx.globalAlpha = 0.5; ctx.fillRect(-hw, yy, w, 1.2); } ctx.globalAlpha = 1;
    const segs = [], per = 2 * (w + h), n = Math.floor(per / 13), lim = Math.floor(n * c01(p));
    for (let i = 0; i < lim; i++) { let d = (i / n) * per, ax, ay, nx, ny; if (d < w) { ax = -hw + d; ay = -hh; nx = 0; ny = 1; } else if (d < w + h) { ax = hw; ay = -hh + (d - w); nx = -1; ny = 0; } else if (d < 2 * w + h) { ax = hw - (d - w - h); ay = hh; nx = 0; ny = -1; } else { ax = -hw; ay = hh - (d - 2 * w - h); nx = 1; ny = 0; }
      const l = 8 + 2 * h2(i, 3); segs.push([ax, ay, ax + nx * l, ay + ny * l]); }
    draw(ctx, segs, COL.rose, 3.2); ctx.strokeStyle = PAL.rose; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-hw + 4, -hh + 1.5); ctx.lineTo(-hw + 4 + (w - 8) * c01(p), -hh + 1.5); ctx.stroke(); ctx.restore();
  }


  // ---------- v2 primitives: text, shapes, tags, captions ----------
  const BOX = [];
  const reg = (t, x0, y0, x1, y1, g, ctx) => { if (ctx && ctx.getTransform) { const m = ctx.getTransform(), P = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map((q) => [m.a * q[0] + m.c * q[1] + m.e, m.b * q[0] + m.d * q[1] + m.f]); x0 = Math.min.apply(null, P.map((q) => q[0])); x1 = Math.max.apply(null, P.map((q) => q[0])); y0 = Math.min.apply(null, P.map((q) => q[1])); y1 = Math.max.apply(null, P.map((q) => q[1])); } BOX.push({ t: String(t).slice(0, 38), x0: x0, y0: y0, x1: x1, y1: y1, g: g || String(t) }); };
  const TC = {};
  function rowsOf(str, font, step) {
    const key = font + '|' + str + '|' + step; if (TC[key]) return TC[key];
    const c = document.createElement('canvas'), x = c.getContext('2d'); x.font = font; const size = parseInt(font.match(/(\d+)px/)[1]), pad = 6, w = Math.ceil(x.measureText(str).width) + pad * 2, h = Math.ceil(size * 1.45) + pad * 2;
    c.width = w; c.height = h; x.font = font; x.fillStyle = '#fff'; x.fillText(str, pad, pad + size * 1.05); const a = x.getImageData(0, 0, w, h).data, rows = [];
    for (let y = 1; y < h; y += step) { const runs = []; let on = false, s = 0; for (let xx = 0; xx < w; xx++) { const v = a[(y * w + xx) * 4 + 3] > 110; if (v && !on) { on = true; s = xx; } if ((!v || xx === w - 1) && on) { const e = v ? xx + 1 : xx; if (e - s >= 2) runs.push([s, e]); on = false; } } if (runs.length) rows.push([y, runs]); }
    return (TC[key] = { w: w, h: h, rows: rows, pad: pad, size: size, step: step });
  }
  // satin-stitched text. o: {font, x, y (top-left), p 0..1, col, step}. Returns {w, h, tip}
  function text(ctx, str, o) {
    const R = rowsOf(str, o.font, o.step || 3); let total = 0; R.rows.forEach((r) => r[1].forEach((q) => { total += q[1] - q[0]; }));
    const lim = total * c01(o.p == null ? 1 : o.p); let acc = 0, segs = [], lastS = null;
    for (let i = 0; i < R.rows.length && acc < lim; i++) { const runs = i % 2 ? R.rows[i][1].slice().reverse() : R.rows[i][1];
      for (let j = 0; j < runs.length && acc < lim; j++) { const a = runs[j][0], b = runs[j][1], use = Math.min(b - a, lim - acc), fw = i % 2 === 0, yy = R.rows[i][0] + (h2(i, j) - 0.5) * 0.7;
        segs.push([o.x + (fw ? a : b) - R.pad, o.y + yy - R.pad, o.x + (fw ? a + use : b - use) - R.pad, o.y + yy - R.pad + (h2(j, i) - 0.5) * 0.7]); acc += use; lastS = segs[segs.length - 1]; } }
    draw(ctx, segs, o.col || COL.chalk, Math.max(2.1, R.step * 0.95), { holes: false }); reg(str, o.x, o.y, o.x + R.w - R.pad * 2, o.y + R.size * 1.2, o.g, ctx);
    return { w: R.w - R.pad * 2, h: R.size * 1.2, tip: (o.p != null && o.p < 1) ? lastS : null };
  }
  function label(ctx, str, x, y, o) {   // small woven-label text: plain mono capitals
    o = o || {}; ctx.save(); ctx.font = (o.font || "400 22px 'DM Mono', monospace"); ctx.letterSpacing = (o.ls || 3) + 'px'; ctx.textBaseline = 'top'; ctx.fillStyle = o.color || PAL.chalk; ctx.globalAlpha = o.a == null ? 0.9 : o.a;
    const w = ctx.measureText(str).width; ctx.fillText(str, x, y); ctx.restore(); reg(str, x, y, x + w, y + 26, o.g, ctx); return w;
  }
  function caption(ctx, str, t, t0, o) {   // word-by-word, left aligned, wraps at 940 px, drawn in Fraunces
    o = o || {}; ctx.save(); const f = o.font || "500 54px Fraunces, Georgia, serif"; ctx.font = f; ctx.textBaseline = 'top'; const words = str.split(' '), maxW = o.w || 940, lh = o.lh || 66; let x = 0, y = 0, lines = [[]];
    words.forEach((wd) => { const w = ctx.measureText(wd + ' ').width; if (x + w > maxW && lines[lines.length - 1].length) { lines.push([]); x = 0; } lines[lines.length - 1].push([wd, x, lines.length - 1]); x += w; });
    if (o.back) { const mw = Math.max.apply(null, lines.map((l) => l.length ? l[l.length - 1][1] + ctx.measureText(l[l.length - 1][0]).width : 0).concat([1])); ctx.globalAlpha = 0.9 * c01((t - t0) / 0.3); ctx.fillStyle = '#0A0D26'; ctx.fillRect((o.x || 70) - 28, (o.y || 1300) - 22, mw + 56, lines.length * (o.lh || 66) + 36); ctx.globalAlpha = 1; }
    let k = 0; const per = o.per || 0.16;
    lines.forEach((ln, li) => { ln.forEach((w) => { const a = c01((t - t0 - k * per) / 0.35); k++; ctx.globalAlpha = a; ctx.fillStyle = (o.hl && o.hl.indexOf(w[0].replace(/[.,]/g, '')) >= 0) ? PAL.rose : PAL.chalk; ctx.fillText(w[0], (o.x || 70) + w[1] + (1 - a) * 18, (o.y || 1300) + li * lh); }); });
    ctx.restore(); const wmax = Math.max.apply(null, lines.map((l) => l.length ? l[l.length - 1][1] + ctx.measureText(l[l.length - 1][0]).width : 0).concat([1]));
    reg(str, o.x || 70, o.y || 1300, (o.x || 70) + wmax, (o.y || 1300) + lines.length * lh, 'cap');
  }
  // stitched polyline / polygon outline (screen px). col: COL.*, p: reveal 0..1
  function line(ctx, pts, col, w, p, o) { o = o || {}; const segs = []; stitches(pts, { p: p == null ? 1 : p, len: o.len || 12, gap: o.gap || 4.5, jit: o.jit == null ? 1.1 : o.jit, seed: o.seed || 1 }, segs); draw(ctx, segs, col, w, o); return segs.length ? segs[segs.length - 1] : null; }
  function fillPoly(ctx, pts, col, w, p, th, d) { const segs = []; hatch(pts, d || 3.4, th == null ? 0.7 : th, segs); segs.sort((a, b) => a[1] - b[1]); draw(ctx, segs.slice(0, Math.floor(segs.length * c01(p == null ? 1 : p))), col, w || 2.6, { holes: false }); }
  const circ = (cx, cy, r, n) => { const a = []; for (let i = 0; i <= (n || 40); i++) { const th = i / (n || 40) * 6.2832; a.push([cx + Math.cos(th) * r, cy + Math.sin(th) * r]); } return a; };
  const swing = (t, t0, A, k, w) => t < t0 ? A * 1.0 : A * Math.exp(-(t - t0) * (k || 1.5)) * Math.cos((t - t0) * (w || 6.5));
  // hang-tag: a patch swinging from a thread. cb(ctx) draws the tag's contents in tag coordinates (origin = top-centre of the tag)
  function tag(ctx, ax, ay, len, w, h, ang, p, cb) {
    if (p <= 0.001) return; ctx.save(); ctx.translate(ax, ay); ctx.rotate(ang);
    const strg = []; stitches([[0, 0], [0, len]], { p: 1, len: 40, gap: 0.1, jit: 0, seed: 5 }, strg); draw(ctx, strg, COL.chalk, 2.2, { holes: false });
    ctx.translate(0, len); patch(ctx, -w / 2, 0, w, h, p, 0); ctx.fillStyle = PAL.ground; ctx.beginPath(); ctx.arc(0, 14, 7, 0, 6.283); ctx.fill(); ctx.strokeStyle = PAL.chalk; ctx.lineWidth = 2; ctx.stroke();
    if (cb) cb(ctx); ctx.restore();
  }
  function cloth2(ctx, W, H) { ctx.clearRect(0, 0, W, H); ctx.drawImage(makeCloth(W, H), 0, 0); BOX.length = 0; }
  const HAND = [[0, 10], [-9, 2], [-10, -10], [-7, -22], [-4, -12], [-4, -30], [0, -33], [3, -30], [3, -14], [6, -32], [10, -30], [9, -12], [12, -26], [16, -23], [12, -4], [14, 2], [8, 12]];


  // film HUD: a stitched progress thread across the top and a small place label
  const TOTAL = 45.3;
  function hud(ctx, str, prog) { ctx.fillStyle = 'rgba(10,13,38,0.88)'; ctx.fillRect(40, 262, 420, 40); line(ctx, [[56, 252], [1024, 252]], COL.chalk, 2.2, 1, { len: 6, gap: 6, jit: 0.4, seed: 3, holes: false }); line(ctx, [[56, 252], [1024, 252]], COL.rose, 3.4, c01(prog), { len: 9, gap: 3, jit: 0.4, seed: 4, holes: false }); label(ctx, str, 56, 274, { a: 0.8, g: 'hud' }); }
  // chunked captions: only the active chunk shows. chunks = [[text, t0, t1, [emphasis words]]]
  function caps(ctx, chunks, t, o) { for (let i = 0; i < chunks.length; i++) { const c = chunks[i]; if (t >= c[1] && t < c[2]) caption(ctx, c[0], t, c[1], Object.assign({ hl: c[3] }, o || {})); } }

  return { PAL, COL, hud, caps, patch, text, label, caption, line, fillPoly, circ, swing, tag, cloth2, HAND, boxes: () => BOX.slice(), load, drawMap, needle, button, logo, project, h2, c01, get data() { return DATA; } };
})();
