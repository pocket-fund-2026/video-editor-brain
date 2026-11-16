// Scene 2: Colaba map dive for the Cafe Mondegar reel. Whole Mumbai island -> neon route draws itself down to Colaba Causeway -> pin on Cafe Mondegar.
// Local origin = Cafe Mondegar pin (18.9217 N, 72.8332 E). x east, z south, y up. Data: window.MAPCITY (island, Fort-frame data shifted to the pin frame),
// window.MAPMID (real OSM buildings/roads of Colaba, data/map.json). Map data: OpenStreetMap contributors (credit is drawn by the film manager, not here).
// Palette: midnight navy #0B1233, chrome white #EEF2F7, signal pink #FF3E8A. No orange, no cream.
(function () {
window.SCENES.map = { dur: 7, build(THREE, ctx) {
  const { clamp, seg, lerp, eio, eo, eob } = window.C; const cl = (x, a, b) => Math.max(a, Math.min(b, x));   // window.C.clamp is 0..1 only
  const group = new THREE.Group();
  const CITY = window.MAPCITY, MID = window.MAPMID;
  const un = (p) => { const a = []; for (let i = 0; i < p.length; i += 2) a.push(new THREE.Vector2(p[i], p[i + 1])); return a; };
  const M = (c, r = 1, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
  const hash = (i) => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };
  const NAVY = new THREE.Color('#0B1233'), DEEP = new THREE.Color('#1a2561'), CHROME = new THREE.Color('#EEF2F7'), PINK = new THREE.Color('#FF3E8A'), PINKW = new THREE.Color('#FFD3E4');

  // sea + land slab + coast ribbon
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(900000, 900000), M('#080d28')); sea.rotation.x = -Math.PI / 2; sea.position.y = -60; group.add(sea);
  const landMat = M('#121b48', 1); landMat.side = THREE.DoubleSide;
  const ribbonPos = (list, y, hw) => { const pos = []; list.forEach((r) => { const p = un(r); for (let i = 0; i < p.length - 1; i++) { const a = p[i], b = p[i + 1], dx = b.x - a.x, dz = b.y - a.y, L = Math.hypot(dx, dz) || 1, nx = -dz / L * hw, nz = dx / L * hw;
      pos.push(a.x + nx, y, a.y + nz, a.x - nx, y, a.y - nz, b.x + nx, y, b.y + nz, b.x + nx, y, b.y + nz, a.x - nx, y, a.y - nz, b.x - nx, y, b.y - nz); } }); return pos; };
  const basic = (pos, color, opacity) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: opacity < 1, opacity })); group.add(m); return m; };
  const coastW = [];
  CITY.rings.forEach((r) => {
    const pts = un(r); if (pts.length < 8) return;
    const g = new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: 60, bevelEnabled: false }); g.rotateX(Math.PI / 2);
    group.add(new THREE.Mesh(g, landMat));
    const closed = r.slice(); closed.push(r[0], r[1]);
    coastW.push(closed);
  });
  const coastWide = basic(ribbonPos(coastW, 3, 70), '#9db0f0', 0.9), coastThin = basic(ribbonPos(coastW, 3, 7), '#9db0f0', 0.9);
  const roadsWide = basic(ribbonPos(CITY.roads, 2, 38), '#2c3d8c', 0.95), roadsThin = basic(ribbonPos(CITY.roads, 2, 5), '#34469c', 1);   // coarse island roads
  basic(ribbonPos(MID.r.map((r) => r.p), 4.5, 2.4), '#6c84dc', 1);                       // real Colaba streets, thin and lit
  // parks as a faint lit patch
  MID.g.forEach((o) => { const p = un(o.p); if (p.length < 4) return; const g = new THREE.ShapeGeometry(new THREE.Shape(p)); g.rotateX(Math.PI / 2); const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: '#1f3a78', side: THREE.DoubleSide })); m.position.y = 3.5; group.add(m); });

  // buildings: one merged mesh + roof-edge lines, heights animate on the CPU
  const B = MID.b;
  const pos = [], nor = [], col = [], base = [], ranges = [], dist = [], delay = [];
  const lpos = [], lbase = [];
  const lerpC = (a, b, k) => [a.r + (b.r - a.r) * k, a.g + (b.g - a.g) * k, a.b + (b.b - a.b) * k];
  const tri = (a, b, c, n, colFn) => { const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const cr = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    const flip = cr[0] * n[0] + cr[1] * n[1] + cr[2] * n[2] < 0; const v = flip ? [a, c, b] : [a, b, c];
    v.forEach((q) => { pos.push(q[0], q[1], q[2]); nor.push(n[0], n[1], n[2]); const cc = colFn(q[1]); col.push(cc[0], cc[1], cc[2]); base.push(q[1]); }); };
  let nearest = -1, nd = 1e9, cafeRoof = 40;
  const info = [];
  B.forEach((b, bi) => {
    const p = un(b.p); if (p.length > 2 && p[0].distanceTo(p[p.length - 1]) < 0.01) p.pop(); if (p.length < 3) return;
    let cx = 0, cz = 0; p.forEach((q) => { cx += q.x; cz += q.y; }); cx /= p.length; cz /= p.length;
    const dd = Math.hypot(cx, cz); if (dd < nd) { nd = dd; nearest = bi; }
    info.push({ bi, p, cx, cz });
  });
  info.forEach((o) => {
    const { bi, p, cx, cz } = o, isCafe = bi === nearest;
    const h = Math.max(7, B[bi].h || 10) * 1.25 * (isCafe ? 2.2 : 1); if (isCafe) cafeRoof = 4 + h;
    const wallBase = isCafe ? PINK : NAVY.clone().lerp(DEEP, hash(bi) * 0.5), wallTop = isCafe ? PINKW : CHROME.clone().multiplyScalar(0.5 + 0.4 * hash(bi + 7));
    const wallCol = (y) => lerpC(wallBase, wallTop, Math.pow(clamp((y - 4) / h), 1.25));
    const roofC = isCafe ? PINKW : CHROME.clone().multiplyScalar(0.78 + 0.22 * hash(bi + 3)); const roofCol = () => [roofC.r, roofC.g, roofC.b];
    const start = pos.length / 3; dist.push(Math.hypot(cx, cz)); delay.push(clamp((cz + 700) / 1400) * 0.55 + hash(bi) * 0.18);
    for (let i = 0; i < p.length; i++) { const A = p[i], Bq = p[(i + 1) % p.length]; const dx = Bq.x - A.x, dz = Bq.y - A.y, L = Math.hypot(dx, dz) || 1; let n = [dz / L, 0, -dx / L];
      if (n[0] * (A.x - cx) + n[2] * (A.y - cz) < 0) n = [-n[0], 0, -n[2]];
      const a0 = [A.x, 4, A.y], b0 = [Bq.x, 4, Bq.y], a1 = [A.x, 4 + h, A.y], b1 = [Bq.x, 4 + h, Bq.y]; tri(a0, b0, b1, n, wallCol); tri(a0, b1, a1, n, wallCol);
      lpos.push(A.x, 4 + h + 0.4, A.y, Bq.x, 4 + h + 0.4, Bq.y); lbase.push(4 + h + 0.4, 4 + h + 0.4); }
    const idx = THREE.ShapeUtils.triangulateShape(p.map((q) => new THREE.Vector2(q.x, q.y)), []);
    idx.forEach((t) => tri([p[t[0]].x, 4 + h, p[t[0]].y], [p[t[1]].x, 4 + h, p[t[1]].y], [p[t[2]].x, 4 + h, p[t[2]].y], [0, 1, 0], roofCol));
    // rooftop box (stair/tank) on larger roofs: roof detail pass (L042)
    let area = 0; for (let i = 0; i < p.length; i++) { const A = p[i], Bq = p[(i + 1) % p.length]; area += A.x * Bq.y - Bq.x * A.y; } area = Math.abs(area) / 2;
    if (area > 90 && hash(bi + 11) > 0.35) { const s = Math.min(7, Math.sqrt(area) * 0.22), rh = 2.4 + hash(bi + 5) * 3, y0 = 4 + h, rc = (isCafe ? PINK : CHROME.clone().multiplyScalar(0.62)), cf = () => [rc.r, rc.g, rc.b];
      const x0 = cx - s, x1 = cx + s, z0 = cz - s, z1 = cz + s, y1 = y0 + rh;
      [[[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [0, 0, -1]], [[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0], [1, 0, 0]], [[x1, y0, z1], [x0, y0, z1], [x0, y1, z1], [x1, y1, z1], [0, 0, 1]], [[x0, y0, z1], [x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [-1, 0, 0]], [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1], [0, 1, 0]]]
        .forEach((f) => { tri(f[0], f[1], f[2], f[4], cf); tri(f[0], f[2], f[3], f[4], cf); }); }
    ranges.push([start, pos.length / 3]);
  });
  const bg = new THREE.BufferGeometry(); const posArr = new Float32Array(pos);
  bg.setAttribute('position', new THREE.BufferAttribute(posArr, 3)); bg.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); bg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  group.add(new THREE.Mesh(bg, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, metalness: 0.25 })));
  // roof edge lines (chrome) follow the same rise: line vertex i belongs to the building whose vertex range counts them, so keep a per-line-vertex building index
  const lineIdx = []; { let li = 0; info.forEach((o, k) => { const n = o.p.length * 2; for (let j = 0; j < n; j++) lineIdx.push(k); li += n; }); }
  const lpArr = new Float32Array(lpos); const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.BufferAttribute(lpArr, 3));
  group.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: '#EEF2F7', transparent: true, opacity: 0.85 })));
  let lastRise = -1;
  function rise(r) {
    if (Math.abs(r - lastRise) < 1e-4) return; lastRise = r;
    const kk = ranges.map((rg, i) => { const k0 = clamp(r * 1.7 - delay[i]); return k0 * k0 * (3 - 2 * k0); });
    ranges.forEach((rg, i) => { const k = kk[i]; for (let v = rg[0]; v < rg[1]; v++) posArr[v * 3 + 1] = 4 + (base[v] - 4) * k; });
    for (let v = 0; v < lineIdx.length; v++) lpArr[v * 3 + 1] = 4 + (lbase[v] - 4) * kk[lineIdx[v]];
    bg.attributes.position.needsUpdate = true; lg.attributes.position.needsUpdate = true; bg.computeBoundingSphere(); lg.computeBoundingSphere();
  }

  // neon route: a real road path (Dijkstra over OSM roads, Fort -> Colaba Causeway), drawn as a growing ribbon with a bright head
  const R = []; for (let i = 0; i < CITY.route.length; i += 2) R.push([CITY.route[i], CITY.route[i + 1]]);
  const cum = [0]; for (let i = 1; i < R.length; i++) cum.push(cum[i - 1] + Math.hypot(R[i][0] - R[i - 1][0], R[i][1] - R[i - 1][1]));
  const TOT = cum[cum.length - 1];
  const MAXQ = R.length * 2;
  const mkRibbon = (color, opacity, additive) => { const g = new THREE.BufferGeometry(); const arr = new Float32Array(MAXQ * 18); g.setAttribute('position', new THREE.BufferAttribute(arr, 3)); g.setDrawRange(0, 0);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending })); m.frustumCulled = false; m.renderOrder = 5; group.add(m); return { g, arr, m }; };
  const core = mkRibbon('#FF3E8A', 1, false), glow = mkRibbon('#FF3E8A', 0.35, true), hot = mkRibbon('#FFD3E4', 1, false);
  const pointAt = (d) => { d = clamp(d / TOT) * TOT; let i = 1; while (i < cum.length - 1 && cum[i] < d) i++; const k = (d - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1); return [lerp(R[i - 1][0], R[i][0], k), lerp(R[i - 1][1], R[i][1], k), i]; };
  const fillRibbon = (rb, upTo, hw, y, from) => { const arr = rb.arr; let n = 0; const pts = [];
    const s0 = from || 0; const a0 = pointAt(s0); pts.push([a0[0], a0[1]]); for (let i = 0; i < R.length; i++) if (cum[i] > s0 && cum[i] < upTo) pts.push(R[i]); const e = pointAt(upTo); pts.push([e[0], e[1]]);
    for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1, nx = -dz / L * hw, nz = dx / L * hw;
      const q = [a[0] + nx, y, a[1] + nz, a[0] - nx, y, a[1] - nz, b[0] + nx, y, b[1] + nz, b[0] + nx, y, b[1] + nz, a[0] - nx, y, a[1] - nz, b[0] - nx, y, b[1] - nz]; arr.set(q, n * 18); n++; }
    rb.g.setDrawRange(0, n * 6); rb.g.attributes.position.needsUpdate = true; };
  const head = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), new THREE.MeshBasicMaterial({ color: '#FFD3E4' })); head.renderOrder = 6; group.add(head);
  const headGlow = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), new THREE.MeshBasicMaterial({ color: '#FF3E8A', transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false })); headGlow.renderOrder = 6; group.add(headGlow);

  // highlight ring around Colaba (blooms in on the island, fades as we dive) + ground ripple rings under the pin
  const ringMat = new THREE.MeshBasicMaterial({ color: '#FF3E8A', side: THREE.DoubleSide, transparent: true, depthTest: false, depthWrite: false });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.84, 1, 72), ringMat); ring.renderOrder = 9; ring.frustumCulled = false; ring.rotation.x = -Math.PI / 2; ring.position.y = 9; group.add(ring);
  const ripples = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(0.93, 1, 72), new THREE.MeshBasicMaterial({ color: '#FFD3E4', side: THREE.DoubleSide, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.y = 0; m.renderOrder = 7; group.add(m); return m; });
  const pin = new THREE.Group(); group.add(pin);
  const pinMat = M('#FF3E8A', 0.35, 0.1); pinMat.emissive = new THREE.Color('#FF3E8A'); pinMat.emissiveIntensity = 0.45; const pinTop = new THREE.MeshBasicMaterial({ color: '#FFFFFF' });
  { const cone = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.6, 24), pinMat); cone.rotation.x = Math.PI; cone.position.y = 0.8; pin.add(cone);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.62, 28, 18), pinMat); ball.position.y = 1.9; pin.add(ball);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12), pinTop); dot.position.set(0, 1.95, 0.5); pin.add(dot); }
  pin.renderOrder = 8;

  const hemi = new THREE.HemisphereLight('#a9b8ff', '#0B1233', 1.05); group.add(hemi);
  const sun = new THREE.DirectionalLight('#EEF2F7', 1.9); sun.position.set(-8000, 12000, 6000); sun.target.position.set(0, 0, 0); group.add(sun, sun.target);
  const rim = new THREE.DirectionalLight('#FF3E8A', 1.9); rim.position.set(9000, 3500, -9000); rim.target.position.set(0, 0, 0); group.add(rim, rim.target);

  const T_PIN = 4.75;
  function setT(t) {
    rise(eio(seg(t, 2.5, 5.2)));
    // camera: whole island -> dive -> settle on the pin; target glides from the island centre to the pin
    const a = Math.pow(eio(seg(t, 0.2, 5.1)), 0.8);
    const D0 = Math.log(40000), D1 = Math.log(400);
    let D = Math.exp(lerp(D0, D1, a)); D = D * (1 - 0.16 * eio(seg(t, 5.1, 7)));            // settle: slow push in, ends nearly still
    const pitch = (lerp(70, 40, eio(seg(t, 1.8, 5.1))) + 5 * eio(seg(t, 5.1, 7))) * Math.PI / 180;
    const yaw = lerp(0.1, -0.2, a) + lerp(0, -0.22, eio(seg(t, 4.6, 7)));                   // slow orbit after the dive
    const k = eio(seg(t, 0.3, 3.9));
    const tg = [lerp(-1000, 0, k), lerp(0, 24, k), lerp(-7000, 30, k)];
    const cpos = [tg[0] + D * Math.sin(yaw) * Math.cos(pitch), tg[1] + D * Math.sin(pitch), tg[2] + D * Math.cos(yaw) * Math.cos(pitch)];

    // route draws itself 0.9 -> 4.6 s (width scales with altitude so it reads from the island view)
    const dr = Math.pow(eio(seg(t, 0.7, 4.3)), 0.8), len = Math.max(dr * TOT, t > 0.7 ? 2 : 0), w = cl(D * 0.0034, 3.2, 130), yo = Math.max(0, D * 0.006 - 20);
    const vis = len > 1;
    core.m.visible = glow.m.visible = hot.m.visible = head.visible = headGlow.visible = vis;
    if (vis) {
      fillRibbon(core, len, w, 9 + yo); fillRibbon(glow, len, w * 2.4, 8.5 + yo); fillRibbon(hot, len, w * 0.4, 10 + yo, Math.max(0, len - TOT * 0.07));
      const hp = pointAt(len); head.position.set(hp[0], 12 + yo, hp[1]); head.scale.setScalar(w * 1.9); headGlow.position.copy(head.position); headGlow.scale.setScalar(w * 4.2 * (1 + 0.12 * Math.sin(t * 14)));
      head.visible = headGlow.visible = len < TOT - 4; }

    const wf = 1 - eio(seg(D, 3500, 9000)); [coastWide, roadsWide].forEach((m) => { m.material.opacity = 0.95 * (1 - wf) ; m.visible = wf < 0.99; });
    // highlight ring on Colaba during the island view
    const ra = eo(seg(t, 0.3, 0.9)) * (1 - eio(seg(t, 3.0, 4.2))), rr = cl(D * 0.06, 160, 3200), pulse = 1 + 0.06 * Math.sin(t * 5);
    ring.position.y = 9 + yo; ring.visible = ra > 0.01; ring.scale.set(rr * pulse, rr * pulse, 1); ringMat.opacity = ra * 0.9;

    // pin drops, squashes, ripples
    const pd = seg(t, T_PIN, T_PIN + 0.55), ps = cl(D * 0.055, 9, 300); pin.visible = pd > 0.001;
    const fall = 1 - eob(pd, 0.0001 + 0.0001); const drop = pd < 1 ? (1 - pd * pd) : 0;
    const land = seg(t, T_PIN + 0.5, T_PIN + 0.95), sq = Math.exp(-land * 5) * Math.sin(land * 16) * 0.28 * (t >= T_PIN + 0.5 ? 1 : 0);
    pin.position.y = cafeRoof + 3 + drop * D * 0.55; pin.scale.set(ps * (1 + sq), ps * (1 - sq * 1.2), ps * (1 + sq));
    ripples.forEach((m, i) => { m.position.y = cafeRoof + 1.5; const u = (t - (T_PIN + 0.55 + i * 0.5)) / 1.5; const on = u > 0 && u < 1; m.visible = on; if (on) { const s = lerp(10, 190, eo(u)); m.scale.set(s, s, 1); m.material.opacity = (1 - u) * 0.9; } });
    // the pin's own beacon: a soft pulse on the ground ring after landing
    return { pos: cpos, look: tg, fov: lerp(34, 40, a), near: Math.max(2, D * 0.015), far: D * 12 + 8000 };
  }
  return { group, lights: [], bg: '#080d28', fog: null, setT };
} };
})();
