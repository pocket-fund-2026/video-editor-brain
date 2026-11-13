// Scene: spotlight-follow map. Whole Mumbai island in the dark, one stage spotlight sweeps up the west coast and narrows onto Juhu,
// the camera descends with it, real OSM buildings rise inside the light, the Prithvi block lights lime, a pin lands.
// Local origin = Prithvi Theatre (19.1062109, 72.8256355). x east, z south, y up. Data: window.MAPD (data/map_data.js).
// Map data: OpenStreetMap contributors (credit is drawn by the film manager).
(function () {
window.SCENES.map = { dur: 10.6, build(THREE, ctx) {
  const { clamp, seg, lerp, eio, eo, eob } = window.C;
  const group = new THREE.Group();
  const D0 = window.MAPD, FX = 1548.627, FY = 18989.747;    // Fort-frame origin expressed in Prithvi frame
  const un = (p, ox, oz) => { const a = []; for (let i = 0; i < p.length; i += 2) a.push(new THREE.Vector2(p[i] + ox, p[i + 1] + oz)); return a; };
  const M = (c, r = 1) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: 0 });
  const hash = (i) => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };
  const BG = '#0e0714', LAND = '#3a2650', ROAD = '#c9bfe0', BLD = ['#f4f6fb', '#e6e9f2', '#d7dbe8', '#c8cde0', '#eceef6'], LIME = '#c6f24a';

  // sea
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(900000, 900000), M(BG)); sea.rotation.x = -Math.PI / 2; sea.position.y = -60; group.add(sea);
  // island slab + thin coast ribbon
  const landMat = M(LAND, 0.95); landMat.side = THREE.DoubleSide;
  D0.city.rings.forEach((r) => {
    const pts = un(r, FX, FY); if (pts.length < 8) return;
    const shape = new THREE.Shape(pts.map((p) => new THREE.Vector2(p.x, p.y)));
    const g = new THREE.ExtrudeGeometry(shape, { depth: 60, bevelEnabled: false }); g.rotateX(Math.PI / 2);
    group.add(new THREE.Mesh(g, landMat));
    const pos = [], n = pts.length;
    for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n], dx = b.x - a.x, dz = b.y - a.y, L = Math.hypot(dx, dz) || 1, nx = -dz / L * 45, nz = dx / L * 45;
      pos.push(a.x + nx, 3, a.y + nz, a.x - nx, 3, a.y - nz, b.x + nx, 3, b.y + nz, b.x + nx, 3, b.y + nz, a.x - nx, 3, a.y - nz, b.x - nx, 3, b.y - nz); }
    const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); cg.computeVertexNormals();
    group.add(new THREE.Mesh(cg, M('#6b5a85', 0.9)));
  });
  // coarse city roads
  { const pos = []; D0.city.roads.forEach((r) => { const p = un(r, FX, FY); for (let i = 0; i < p.length - 1; i++) { const a = p[i], b = p[i + 1], dx = b.x - a.x, dz = b.y - a.y, L = Math.hypot(dx, dz) || 1, nx = -dz / L * 28, nz = dx / L * 28;
      pos.push(a.x + nx, 2, a.y + nz, a.x - nx, 2, a.y - nz, b.x + nx, 2, b.y + nz, b.x + nx, 2, b.y + nz, a.x - nx, 2, a.y - nz, b.x - nx, 2, b.y - nz); } });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
    { const rm = M('#8071a0', 0.9); rm.side = THREE.DoubleSide; group.add(new THREE.Mesh(g, rm)); } }
  // detailed Juhu roads, parks, water
  { const pos = []; D0.mid.r.forEach((r) => { const p = un(r.p, 0, 0), w = Math.max(3, r.w || 5) * 0.5; for (let i = 0; i < p.length - 1; i++) { const a = p[i], b = p[i + 1], dx = b.x - a.x, dz = b.y - a.y, L = Math.hypot(dx, dz) || 1, nx = -dz / L * w, nz = dx / L * w;
      pos.push(a.x + nx, 4, a.y + nz, a.x - nx, 4, a.y - nz, b.x + nx, 4, b.y + nz, b.x + nx, 4, b.y + nz, a.x - nx, 4, a.y - nz, b.x - nx, 4, b.y - nz); } });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
    { const rm = M(ROAD, 0.9); rm.side = THREE.DoubleSide; group.add(new THREE.Mesh(g, rm)); } }
  const flat = (list, col, y) => list.forEach((o) => { const p = un(o.p, 0, 0); if (p.length < 4) return; const s = new THREE.Shape(p); const g = new THREE.ShapeGeometry(s); g.rotateX(Math.PI / 2); const fm = M(col, 1); fm.side = THREE.DoubleSide; const m = new THREE.Mesh(g, fm); m.position.y = y; group.add(m); });
  flat(D0.mid.g, '#4f6b4a', 3.5); flat(D0.mid.w, '#24415a', 3.6);

  // buildings: one merged mesh; heights animate on the CPU
  const B = D0.mid.b;
  const pos = [], nor = [], col = [], base = [], ranges = [], dist = [];
  const tri = (a, b, c, n, cc) => { const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const cr = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    const flip = cr[0] * n[0] + cr[1] * n[1] + cr[2] * n[2] < 0; const v = flip ? [a, c, b] : [a, b, c];
    v.forEach((q) => { pos.push(q[0], q[1], q[2]); nor.push(n[0], n[1], n[2]); col.push(cc.r, cc.g, cc.b); base.push(q[1]); }); };
  let nearest = -1, nd = 1e9;
  let HERO = -1; { let bd = 1e9; B.forEach((b, bi) => { let cx = 0, cz = 0, n = b.p.length / 2; for (let i = 0; i < b.p.length; i += 2) { cx += b.p[i]; cz += b.p[i + 1]; } const d = Math.hypot(cx / n, cz / n); if (d < bd) { bd = d; HERO = bi; } }); }
  B.forEach((b, bi) => {
    const p = un(b.p, 0, 0); if (p.length > 2 && p[0].distanceTo(p[p.length - 1]) < 0.01) p.pop(); if (p.length < 3) return;
    let cx = 0, cz = 0; p.forEach((q) => { cx += q.x; cz += q.y; }); cx /= p.length; cz /= p.length;
    const h = Math.max(7, b.h || 9) * 1.2 * (bi === HERO ? 1.8 : 1), dd = Math.hypot(cx, cz); if (dd < nd) { nd = dd; nearest = bi; }
    const cc = new THREE.Color(BLD[Math.floor(hash(bi) * BLD.length)]);
    dist.push(dd); const start = pos.length / 3; const wc = cc.clone().multiplyScalar(0.8), win = new THREE.Color('#7f89b8'), lit = new THREE.Color('#ffffff');
    for (let i = 0; i < p.length; i++) { const A = p[i], Bq = p[(i + 1) % p.length]; const dx = Bq.x - A.x, dz = Bq.y - A.y, L = Math.hypot(dx, dz) || 1; let n = [dz / L, 0, -dx / L];
      if (n[0] * (A.x - cx) + n[2] * (A.y - cz) < 0) n = [-n[0], 0, -n[2]];
      const nf = Math.max(1, Math.round(h / 3.4)), fh = h / nf;
      for (let f = 0; f < nf; f++) {
        const bands = [[0, 0.45, wc], [0.45, 0.82, win], [0.82, 1, wc]];
        bands.forEach((bd, k) => { let c2 = bd[2]; if (k === 1 && hash(bi * 131 + i * 17 + f * 7) < 0.14) c2 = lit;
          const y0 = 4 + f * fh + bd[0] * fh, y1 = 4 + f * fh + bd[1] * fh;
          tri([A.x, y0, A.y], [Bq.x, y0, Bq.y], [Bq.x, y1, Bq.y], n, c2); tri([A.x, y0, A.y], [Bq.x, y1, Bq.y], [A.x, y1, A.y], n, c2); });
      } }
    const idx = THREE.ShapeUtils.triangulateShape(p.map((q) => new THREE.Vector2(q.x, q.y)), []);
    idx.forEach((t) => tri([p[t[0]].x, 4 + h, p[t[0]].y], [p[t[1]].x, 4 + h, p[t[1]].y], [p[t[2]].x, 4 + h, p[t[2]].y], [0, 1, 0], cc.clone().multiplyScalar(1.0)));
    ranges.push([start, pos.length / 3, 4, bi]);
  });
  const bg = new THREE.BufferGeometry(); const posArr = new Float32Array(pos);
  bg.setAttribute('position', new THREE.BufferAttribute(posArr, 3)); bg.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); bg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  group.add(new THREE.Mesh(bg, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 })));
  // the Prithvi block lights lime
  const hi = ranges.findIndex((r) => r[3] === nearest);
  let HC = [0, 0, 0]; { const bb = B[HERO]; let cx = 0, cz = 0, n = bb.p.length / 2; for (let i = 0; i < bb.p.length; i += 2) { cx += bb.p[i]; cz += bb.p[i + 1]; } HC = [cx / n, (bb.h || 9) * 1.2 * 1.8 * 0.5, cz / n]; }
  if (hi >= 0) { const [s, e] = ranges[hi]; const lc = new THREE.Color(LIME); for (let i = s; i < e; i++) bg.attributes.color.setXYZ(i, lc.r, lc.g, lc.b); bg.attributes.color.needsUpdate = true; }
  let lastRise = -1;
  function rise(r) {
    if (Math.abs(r - lastRise) < 1e-4) return; lastRise = r;
    ranges.forEach((rg, i) => { const k0 = clamp(r * 2.2 - dist[i] / 420); const k = k0 * k0 * (3 - 2 * k0);
      for (let v = rg[0]; v < rg[1]; v++) posArr[v * 3 + 1] = 4 + (base[v] - 4) * k; });
    bg.attributes.position.needsUpdate = true; bg.computeBoundingSphere();
  }

  // stage light + visible pool edge
  const amb = new THREE.AmbientLight('#8d7fb0', 0.5); group.add(amb);
  const spot = new THREE.SpotLight('#fbfcff', 3.4, 0, 0.3, 0.7, 0); group.add(spot, spot.target);
  const edgeMat = new THREE.MeshBasicMaterial({ color: LIME, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
  const edge = new THREE.Mesh(new THREE.RingGeometry(0.985, 1, 96), edgeMat); edge.rotation.x = -Math.PI / 2; edge.position.y = 9; group.add(edge);
  const pin = new THREE.Group(); group.add(pin);
  { const pm = M(LIME, 0.5); const cone = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.6, 20), pm); cone.rotation.x = Math.PI; cone.position.y = 0.8; pin.add(cone);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.62, 24, 16), pm); ball.position.y = 1.9; pin.add(ball);
     }

  const FORT = [FX, FY], JUHU = [0, 0];
  function setT(t) {
    rise(eio(seg(t, 1.9, 4.7)));
    const a = eio(seg(t, 0.0, 4.6));                              // camera descent
    const o = eio(seg(t, 5.0, 10.6));                             // slow orbit around the Prithvi block
    const D = Math.exp(lerp(Math.log(32000), Math.log(520), a)) * (1 - 0.52 * o);
    const pitch = lerp(lerp(72, 38, eio(seg(t, 0.8, 4.6))), 24, o) * Math.PI / 180, yaw = lerp(0.1, -0.3, a) + o * 1.15;
    const sw = eio(seg(t, 0.0, 2.6));
    const sx = lerp(FORT[0] * 0.35, JUHU[0], sw) + (1 - sw) * 600 * Math.sin(t * 2), sz = lerp(FORT[1] * 0.85, JUHU[1], sw);
    const r = Math.exp(lerp(Math.log(5200), Math.log(240), eio(seg(t, 0.4, 4.4)))) * (1 - 0.4 * o);
    const lx = lerp(sx, HC[0], o), lz = lerp(sz, HC[2], o);
    spot.position.set(lx - r * 1.1, r * 2.7, lz + r * 1.7); spot.target.position.set(lx, 0, lz);
    spot.angle = Math.atan(r / Math.hypot(r * 1.1, r * 2.7, r * 1.7)) * 1.12; spot.distance = 0;
    edge.position.set(lx, 9, lz); edge.scale.set(r, r, 1); edgeMat.opacity = 0.85 * (1 - seg(t, 3.9, 4.6));
    const tg = [lerp(sx, HC[0], o), HC[1] * o, lerp(sz, HC[2], o)];
    const pos = [tg[0] + D * Math.sin(yaw) * Math.cos(pitch), tg[1] + D * Math.sin(pitch), tg[2] + D * Math.cos(yaw) * Math.cos(pitch)];
    const pd = seg(t, 4.3, 5.0), ps = Math.max(10, D * 0.034); pin.scale.set(ps, ps, ps);
    pin.position.y = 40 + (1 - eob(pd, 1.4)) * D * 0.3; pin.visible = pd > 0.001;
    return { pos, look: tg, fov: lerp(34, 40, a), near: Math.max(2, D * 0.02), far: D * 8 + 5000 };
  }
  return { group, lights: [], bg: BG, fog: null, setT };
} };
})();
