// Scene 1: real-geography 3D map descent. Whole Mumbai island, then a long glide north and down into Bandra, over ~4,100 real OSM buildings,
// ending above Chapel Road at the Subko pin. Local origin = the pin. x east, z south (map y), y up. Data: window.MAPD (data/map_data.js).
// Map data: OpenStreetMap contributors (credit is drawn by the film manager).
(function () {
window.SCENES.map = { dur: 8, build(THREE, ctx) {
  const { clamp, seg, lerp, eio, eo, eob } = window.C;
  const group = new THREE.Group();
  const D0 = window.MAPD, FX = 1082.195, FY = 13124.26;      // Fort-frame origin expressed in pin frame (city outline is in the Fort frame)
  const un = (p, ox, oz) => { const a = []; for (let i = 0; i < p.length; i += 2) a.push(new THREE.Vector2(p[i] + ox, p[i + 1] + oz)); return a; };
  const M = (c, r = 1) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: 0 });
  const hash = (i) => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };

  // sea (cool teal) and land slab (pale paper) with a coast ink ribbon
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(900000, 900000), M('#2c5b66')); sea.rotation.x = -Math.PI / 2; sea.position.y = -60; group.add(sea);
  const landMat = M('#dfe5e3'); landMat.side = THREE.DoubleSide;
  D0.city.rings.forEach((r, ri) => {
    const pts = un(r, FX, FY); if (pts.length < 8) return;
    const shape = new THREE.Shape(pts.map((p) => new THREE.Vector2(p.x, p.y)));
    const g = new THREE.ExtrudeGeometry(shape, { depth: 60, bevelEnabled: false }); g.rotateX(Math.PI / 2); // shape y -> world z, extrusion goes -y
    g.translate(0, 0, 0); const m = new THREE.Mesh(g, landMat); m.position.y = 0; group.add(m);
    // coast line as a ribbon on top of the land
    const pos = [], n = pts.length;
    for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n], dx = b.x - a.x, dz = b.y - a.y, L = Math.hypot(dx, dz) || 1, nx = -dz / L * 55, nz = dx / L * 55;
      pos.push(a.x + nx, 3, a.y + nz, a.x - nx, 3, a.y - nz, b.x + nx, 3, b.y + nz, b.x + nx, 3, b.y + nz, a.x - nx, 3, a.y - nz, b.x - nx, 3, b.y - nz); }
    const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); cg.computeVertexNormals();
    group.add(new THREE.Mesh(cg, new THREE.MeshBasicMaterial({ color: '#10201f', side: THREE.DoubleSide })));
  });
  // coarse city roads (visible mid-zoom)
  { const pos = []; D0.city.roads.forEach((r) => { const p = un(r, FX, FY); for (let i = 0; i < p.length - 1; i++) { const a = p[i], b = p[i + 1], dx = b.x - a.x, dz = b.y - a.y, L = Math.hypot(dx, dz) || 1, nx = -dz / L * 45, nz = dx / L * 45;
      pos.push(a.x + nx, 2, a.y + nz, a.x - nx, 2, a.y - nz, b.x + nx, 2, b.y + nz, b.x + nx, 2, b.y + nz, a.x - nx, 2, a.y - nz, b.x - nx, 2, b.y - nz); } });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
    group.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: '#b3bfbd', side: THREE.DoubleSide }))); }

  // detailed Bandra roads, parks, water (flat ribbons/polygons just above the slab)
  { const pos = []; D0.mid.r.forEach((r) => { const p = un(r.p, 0, 0), w = Math.max(3, r.w || 5) * 0.5; for (let i = 0; i < p.length - 1; i++) { const a = p[i], b = p[i + 1], dx = b.x - a.x, dz = b.y - a.y, L = Math.hypot(dx, dz) || 1, nx = -dz / L * w, nz = dx / L * w;
      pos.push(a.x + nx, 4, a.y + nz, a.x - nx, 4, a.y - nz, b.x + nx, 4, b.y + nz, b.x + nx, 4, b.y + nz, a.x - nx, 4, a.y - nz, b.x - nx, 4, b.y - nz); } });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
    group.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: '#8a9795', side: THREE.DoubleSide }))); }
  const flat = (list, col, y) => list.forEach((o) => { const p = un(o.p, 0, 0); if (p.length < 4) return; const s = new THREE.Shape(p); const g = new THREE.ShapeGeometry(s); g.rotateX(Math.PI / 2); const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide })); m.position.y = y; group.add(m); });
  flat(D0.mid.g, '#8fb394', 3.5); flat(D0.mid.w, '#2c5b66', 3.6);

  // buildings: one merged mesh, heights animate on the CPU (so the normal/depth ink pass stays correct)
  const B = D0.mid.b, pal = ['#f0f2f1', '#e2e7e6', '#d4dcdb', '#c7d1d0', '#e9e4dc'];
  const pos = [], nor = [], col = [], base = [], ranges = [], dist = [];
  const tri = (a, b, c, n, cc, y0) => { const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const cr = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    const flip = cr[0] * n[0] + cr[1] * n[1] + cr[2] * n[2] < 0; const v = flip ? [a, c, b] : [a, b, c];
    v.forEach((q) => { pos.push(q[0], q[1], q[2]); nor.push(n[0], n[1], n[2]); col.push(cc.r, cc.g, cc.b); base.push(q[1]); }); };
  let nearest = -1, nd = 1e9;
  B.forEach((b, bi) => {
    const p = un(b.p, 0, 0); if (p.length > 2 && p[0].distanceTo(p[p.length - 1]) < 0.01) p.pop(); if (p.length < 3) return;
    let cx = 0, cz = 0; p.forEach((q) => { cx += q.x; cz += q.y; }); cx /= p.length; cz /= p.length;
    const h = Math.max(6, b.h || 9) * 1.15, dd = Math.hypot(cx, cz); if (dd < nd) { nd = dd; nearest = bi; }
    const cc = new THREE.Color(bi === -1 ? '#fff' : pal[Math.floor(hash(bi) * pal.length)]);
    const start = pos.length / 3; dist.push(dd);
    for (let i = 0; i < p.length; i++) { const A = p[i], Bq = p[(i + 1) % p.length]; const dx = Bq.x - A.x, dz = Bq.y - A.y, L = Math.hypot(dx, dz) || 1; let n = [dz / L, 0, -dx / L];
      if (n[0] * (A.x - cx) + n[2] * (A.y - cz) < 0) n = [-n[0], 0, -n[2]];
      const a0 = [A.x, 4, A.y], b0 = [Bq.x, 4, Bq.y], a1 = [A.x, 4 + h, A.y], b1 = [Bq.x, 4 + h, Bq.y]; tri(a0, b0, b1, n, cc); tri(a0, b1, a1, n, cc); }
    const idx = THREE.ShapeUtils.triangulateShape(p.map((q) => new THREE.Vector2(q.x, q.y)), []);
    idx.forEach((t) => tri([p[t[0]].x, 4 + h, p[t[0]].y], [p[t[1]].x, 4 + h, p[t[1]].y], [p[t[2]].x, 4 + h, p[t[2]].y], [0, 1, 0], cc.clone().multiplyScalar(0.96)));
    ranges.push([start, pos.length / 3, 4, bi]);
  });
  const bg = new THREE.BufferGeometry(); const posArr = new Float32Array(pos);
  bg.setAttribute('position', new THREE.BufferAttribute(posArr, 3)); bg.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); bg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const bm = new THREE.Mesh(bg, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 })); group.add(bm);
  // the cafe building: a deep green block marking the pin building
  const cafeIdx = ranges.findIndex((r) => r[3] === nearest);
  if (cafeIdx >= 0) { const [s, e] = ranges[cafeIdx]; const cg = new THREE.Color('#2c5a48'); for (let i = s; i < e; i++) { bg.attributes.color.setXYZ(i, cg.r, cg.g, cg.b); } bg.attributes.color.needsUpdate = true; }
  let lastRise = -1;
  function rise(r) {
    if (Math.abs(r - lastRise) < 1e-4) return; lastRise = r;
    ranges.forEach((rg, i) => { const k0 = clamp(r * 2.2 - dist[i] / 1100); const k = k0 * k0 * (3 - 2 * k0);
      for (let v = rg[0]; v < rg[1]; v++) posArr[v * 3 + 1] = 4 + (base[v] - 4) * k; });
    bg.attributes.position.needsUpdate = true; bg.computeBoundingSphere();
  }

  // highlight ring + pin
  const ringMat = new THREE.MeshBasicMaterial({ color: '#10201f', side: THREE.DoubleSide, transparent: true });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.88, 1, 64), ringMat); ring.rotation.x = -Math.PI / 2; ring.position.y = 9; group.add(ring);
  const ring2 = new THREE.Mesh(new THREE.RingGeometry(0.94, 1, 64), ringMat.clone()); ring2.rotation.x = -Math.PI / 2; ring2.position.y = 9; group.add(ring2);
  const pin = new THREE.Group(); group.add(pin);
  const pinMat = M('#2c5a48', 0.6), pinTop = M('#eef3f0', 0.5);
  { const cone = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.6, 20), pinMat); cone.rotation.x = Math.PI; cone.position.y = 0.8; pin.add(cone);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.62, 24, 16), pinMat); ball.position.y = 1.9; pin.add(ball);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12), pinTop); dot.position.set(0, 1.95, 0.5); pin.add(dot); }

  const hemi = new THREE.HemisphereLight('#dbeaf2', '#7b8b86', 0.95); group.add(hemi);
  const sun = new THREE.DirectionalLight('#f4f7fa', 1.9); sun.position.set(-8000, 12000, 6000); sun.target.position.set(0, 0, 0); group.add(sun, sun.target);

  function setT(t) {
    rise(eio(seg(t, 2.6, 6.2)));
    const a = eio(seg(t, 0.9, 7.4));
    const D = Math.exp(lerp(Math.log(40000), Math.log(560), a));
    const pitch = lerp(74, 36, eio(seg(t, 2.0, 7.4))) * Math.PI / 180, yaw = lerp(0.12, -0.32, a);
    const tg = [lerp(1000, 0, eio(seg(t, 0.9, 4.8))), 0, lerp(6000, 0, eio(seg(t, 0.9, 4.8)))];
    const pos = [tg[0] + D * Math.sin(yaw) * Math.cos(pitch), tg[1] + D * Math.sin(pitch), tg[2] + D * Math.cos(yaw) * Math.cos(pitch)];
    // highlight ring around Bandra: blooms in, then fades as we dive
    const ra = eo(seg(t, 0.8, 1.6)) * (1 - seg(t, 4.6, 6.0)), rr = clamp(D * 0.075, 140, 4200), pulse = 1 + 0.06 * Math.sin(t * 4);
    ring.visible = ring2.visible = ra > 0.01; ring.scale.set(rr * pulse, rr * pulse, 1); ring2.scale.set(rr * 0.55, rr * 0.55, 1);
    ringMat.opacity = ra; ring2.material.opacity = ra * 0.9;
    // pin drops with a springy landing
    const pd = seg(t, 5.6, 6.5), ps = clamp(D * 0.07, 14, 1e9); pin.scale.set(ps, ps, ps);
    pin.position.y = 40 + (1 - eob(pd, 1.5)) * D * 0.35; pin.visible = pd > 0.001;
    const fov = lerp(34, 42, a);
    return { pos, look: tg, fov, near: Math.max(2, D * 0.02), far: D * 8 + 5000 };
  }
  return { group, lights: [], bg: '#2c5b66', fog: null, setT };
} };
})();
