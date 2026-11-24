// Scene 2: King's Circle, Matunga East map dive for the Cafe Madras reel (pin = real OSM node) (adapted from the Mondegar map; no route and no pin: the exact cafe location is unverified).
// ORIGINAL NOTE: Whole Mumbai island -> neon route draws itself down to Colaba Causeway -> pin on Cafe Mondegar.
// Local origin = Cafe Mondegar pin (18.9217 N, 72.8332 E). x east, z south, y up. Data: window.MAPCITY (island, Fort-frame data shifted to the pin frame),
// window.MAPMID (real OSM buildings/roads of Colaba, data/map.json). Map data: OpenStreetMap contributors (credit is drawn by the film manager, not here).
// Palette: midnight navy #0B1233, chrome white #EEF2F7, signal pink #FF3E8A. No orange, no cream.
(function () {
window.SCENES.map = { dur: 4.8, build(THREE, ctx) {
  const { clamp, seg, lerp, eio, eo, eob } = window.C; const cl = (x, a, b) => Math.max(a, Math.min(b, x));   // window.C.clamp is 0..1 only
  const group = new THREE.Group();
  const CITY = window.MAPCITY, MID = window.MAPMID;
  const un = (p) => { const a = []; for (let i = 0; i < p.length; i += 2) a.push(new THREE.Vector2(p[i], p[i + 1])); return a; };
  const M = (c, r = 1, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
  const hash = (i) => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };
  const NAVY = new THREE.Color('#0F2A22'), DEEP = new THREE.Color('#2E5A4A'), CHROME = new THREE.Color('#F4F6F1'), PINK = new THREE.Color('#4F7DF0'), PINKW = new THREE.Color('#A9C2FA');

  // sea + land slab + coast ribbon
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(900000, 900000), M('#07140F')); sea.rotation.x = -Math.PI / 2; sea.position.y = -60; group.add(sea);
  const landMat = M('#17382D', 1); landMat.side = THREE.DoubleSide;
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
  const coastWide = basic(ribbonPos(coastW, 3, 120), '#B5BDC2', 0.9), coastThin = basic(ribbonPos(coastW, 3, 14), '#B5BDC2', 0.9);
  const roadsFar = basic(ribbonPos(CITY.roads, 2.6, 130), '#5E8576', 0.6);
  const roadsWide = basic(ribbonPos(CITY.roads, 2, 38), '#4F6F63', 0.95), roadsThin = basic(ribbonPos(CITY.roads, 2, 5), '#7FA395', 1);   // coarse island roads
  basic(ribbonPos(MID.r.map((r) => r.p), 4.5, 2.4), '#B5BDC2', 1);                       // real Colaba streets, thin and lit
  // parks as a faint lit patch
  MID.g.forEach((o) => { const p = un(o.p); if (p.length < 4) return; const g = new THREE.ShapeGeometry(new THREE.Shape(p)); g.rotateX(Math.PI / 2); const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: '#3d5446', side: THREE.DoubleSide })); m.position.y = 3.5; group.add(m); });

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

  // highlight ring around Colaba (blooms in on the island, fades as we dive) + ground ripple rings under the pin
  const ringMat = new THREE.MeshBasicMaterial({ color: '#4F7DF0', side: THREE.DoubleSide, transparent: true, depthTest: false, depthWrite: false });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.84, 1, 72), ringMat); ring.renderOrder = 9; ring.frustumCulled = false; ring.rotation.x = -Math.PI / 2; ring.position.y = 9; group.add(ring);
  const ripples = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(0.93, 1, 72), new THREE.MeshBasicMaterial({ color: '#A9C2FA', side: THREE.DoubleSide, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.y = 0; m.renderOrder = 7; group.add(m); return m; });
  const pin = new THREE.Group(); group.add(pin);
  const pinMat = M('#4F7DF0', 0.35, 0.1); pinMat.emissive = new THREE.Color('#4F7DF0'); pinMat.emissiveIntensity = 0.45; const pinTop = new THREE.MeshBasicMaterial({ color: '#FFFFFF' });
  { const cone = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.6, 24), pinMat); cone.rotation.x = Math.PI; cone.position.y = 0.8; pin.add(cone);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.62, 28, 18), pinMat); ball.position.y = 1.9; pin.add(ball);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12), pinTop); dot.position.set(0, 1.95, 0.5); pin.add(dot); }
  pin.renderOrder = 8;
  // ---- location pulse (replaces the unverified pin): glowing core + light beam + sonar ripples locked to the voice ("Mahavir" at 1.35 s, then every 0.45 s)
  const PK = new THREE.Color('#4F7DF0'), PW = new THREE.Color('#FFFFFF');
  const mkMat = (c, o, add) => new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide, transparent: true, opacity: o, depthTest: false, depthWrite: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending });
  const core = new THREE.Mesh(new THREE.CircleGeometry(1, 40), mkMat(PW, 1)); core.rotation.x = -Math.PI / 2; core.renderOrder = 20; group.add(core);
  const coreHalo = new THREE.Mesh(new THREE.CircleGeometry(1, 40), mkMat(PK, 0.55, true)); coreHalo.rotation.x = -Math.PI / 2; coreHalo.renderOrder = 19; group.add(coreHalo);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.6, 1, 24, 1, true), mkMat(PK, 0.4, true)); beam.renderOrder = 18; group.add(beam);
  const PR = [0, 1, 2, 3].map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 96), mkMat(PK, 0.9)); m.rotation.x = -Math.PI / 2; m.renderOrder = 17; group.add(m);
    const w = new THREE.Mesh(new THREE.RingGeometry(0.97, 1, 96), mkMat(PW, 0.9)); w.rotation.x = -Math.PI / 2; w.renderOrder = 17; group.add(w); return [m, w]; });


  const hemi = new THREE.HemisphereLight('#d7e4de', '#0E241E', 1.05); group.add(hemi);
  const sun = new THREE.DirectionalLight('#F4F5F7', 1.9); sun.position.set(-8000, 12000, 6000); sun.target.position.set(0, 0, 0); group.add(sun, sun.target);
  const rim = new THREE.DirectionalLight('#4F7DF0', 1.6); rim.position.set(9000, 3500, -9000); rim.target.position.set(0, 0, 0); group.add(rim, rim.target);

  const grid = new THREE.GridHelper(160000, 80, '#7f9186', '#566159'); grid.position.set(0, 3, 14000); grid.material.transparent = true; grid.material.opacity = 0.3; grid.renderOrder = 1; group.add(grid);
  const T_PIN = 4.75;
  function setT0(t) {
    rise(eio(seg(t, 0.9, 3.0)));
    // camera: whole island -> dive -> settle on the pin; target glides from the island centre to the pin
    const a = 1 - Math.pow(1 - seg(t, 0.2, 3.9), 2.4);
    const D0 = Math.log(60000), D1 = Math.log(400);
    let D = Math.exp(lerp(D0, D1, a)); D = D * (1 - 0.16 * eio(seg(t, 3.9, 7)));            // settle: slow push in, ends nearly still
    const pitch = (lerp(70, 40, eio(seg(t, 1.2, 3.9))) + 5 * eio(seg(t, 3.9, 7))) * Math.PI / 180;
    const yaw = lerp(0.1, -0.2, a) + lerp(0, -0.22, eio(seg(t, 3.9, 7)));                   // slow orbit after the dive
    const k = eo(seg(t, 0.2, 2.3));
    const tg = [lerp(300, 0, k), lerp(0, 24, k), lerp(16000, 30, k)];
    const cpos = [tg[0] + D * Math.sin(yaw) * Math.cos(pitch), tg[1] + D * Math.sin(pitch), tg[2] + D * Math.cos(yaw) * Math.cos(pitch)];



    const yo = Math.max(0, D * 0.006 - 20);
    roadsFar.material.opacity = 0.6 * (1 - eio(seg(D, 2200, 7000)));  roadsFar.visible = roadsFar.material.opacity > 0.01;
    grid.material.opacity = 0.34 * (1 - eio(seg(D, 900, 5000)));
    const wf = 1 - eio(seg(D, 3500, 9000)); [coastWide, roadsWide].forEach((m) => { m.material.opacity = 0.95 * (1 - wf) ; m.visible = wf < 0.99; });
    // highlight ring on Colaba during the island view
    const ra = eo(seg(t, 0.3, 0.9)) * (1 - eio(seg(t, 1.6, 2.4))), rr = cl(D * 0.06, 160, 3200), pulse = 1 + 0.06 * Math.sin(t * 5);
    ring.position.y = 9 + yo; ring.visible = ra > 0.01; ring.scale.set(rr * pulse, rr * pulse, 1); ringMat.opacity = ra * 0.9;

    // pin drops, squashes, ripples
    const pd = seg(t, T_PIN, T_PIN + 0.55), ps = cl(D * 0.055, 9, 300); pin.visible = false;
    const fall = 1 - eob(pd, 0.0001 + 0.0001); const drop = pd < 1 ? (1 - pd * pd) : 0;
    const land = seg(t, T_PIN + 0.5, T_PIN + 0.95), sq = Math.exp(-land * 5) * Math.sin(land * 16) * 0.28 * (t >= T_PIN + 0.5 ? 1 : 0);
    pin.position.y = cafeRoof + 3 + drop * D * 0.55; pin.scale.set(ps * (1 + sq), ps * (1 - sq * 1.2), ps * (1 + sq));
    ripples.forEach((m, i) => { m.position.y = cafeRoof + 1.5; const u = (t - (T_PIN + 0.55 + i * 0.5)) / 1.5; const on = u > 0 && u < 1; m.visible = false; if (on) { const s = lerp(10, 190, eo(u)); m.scale.set(s, s, 1); m.material.opacity = (1 - u) * 0.9; } });
    { const tc = t * 4.8 / 7 - 0.6, ps2 = cl(D * 0.03, 11, 170), y0 = 8 + yo, on = seg(tc, 1.1, 1.35);
      const beat = 1 + 0.18 * Math.sin(tc * 9) * Math.exp(-Math.max(0, tc - 1.35) * 0.4);
      core.position.set(0, y0 + 0.5, 0); core.scale.setScalar(ps2 * 0.55 * beat * eo(on)); core.visible = tc > 1.05;
      coreHalo.position.set(0, y0, 0); coreHalo.scale.setScalar(ps2 * 1.5 * (1 + 0.25 * Math.sin(tc * 9)) * eo(on)); coreHalo.visible = tc > 1.05;
      beam.position.set(0, y0 + ps2 * 7, 0); beam.scale.set(ps2 * 0.16, ps2 * 14 * eo(seg(tc, 1.2, 1.8)), ps2 * 0.16); beam.visible = tc > 1.15; beam.material.opacity = 0.35 * (0.7 + 0.3 * Math.sin(tc * 6)) * (1 - 0.6 * eio(seg(tc, 3.3, 4.8)));
      PR.forEach((pair, i) => { const u = (tc - (1.35 + i * 0.45)) / 1.7, vis = u > 0 && u < 1; pair.forEach((m, j) => { m.visible = vis; if (vis) { const r = ps2 * lerp(0.7, 10 - i * 0.8, eo(u)); m.position.set(0, y0 + 0.2, 0); m.scale.set(r, r, 1); m.material.opacity = (1 - u) * (j ? 0.55 : 0.85); } }); }); }
    // the pin's own beacon: a soft pulse on the ground ring after landing
    return { pos: cpos, look: tg, fov: lerp(34, 40, a), near: Math.max(2, D * 0.015), far: D * 12 + 8000 };
  }
  const setT = (t) => setT0(t * 7 / 4.8);
  return { group, lights: [], bg: '#07140F', fog: null, setT };
} };
})();
