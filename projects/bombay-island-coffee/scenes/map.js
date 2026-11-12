// Scene: real-geography 3D map (reuses the Fort/Prithvi city outline + OSM detail clusters). Opens on the shape of Mumbai, descends on Malad,
// later glides Malad -> Vikhroli East -> Andheri West. Everything is a pure function of mapT; the cue times come from data/timing.js (voice word times).
// Map data: OpenStreetMap contributors (credit is drawn by the film manager).
// Frame: Fort pin = origin, x east, z south, y up, metres. Phase 1 = film 0-10 s (mapT = t); phase 2 = film 15-22.6 s (mapT = t - 5).
(function () {
window.SCENES.map = { dur: 17.6, build(THREE, ctx) {
  const { clamp, seg, lerp, eio, eo, eob } = window.C;
  const TM = window.TIMING.cues;
  const CUE = { malad: TM.malad, vikhroli: TM.vikhroli - 5, andheri: TM.andheri - 5 };   // in mapT
  const group = new THREE.Group();
  const D0 = window.MAPD;
  const BG = '#1c1919', LAND = '#3F3A3A', COAST = '#7b7373', ROADC = '#6e6666', ROAD = '#8d8686', GREEN = '#2c5a4e', WATER = '#1f4f5e';
  const BLD = ['#F4F7F6', '#e2e8e6', '#d2dad8', '#c3cdca', '#eaf0ee'], TEAL = '#108474', SIGNAL = '#2fd8bd';
  const M = (c, r = 1) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: 0 });
  const hash = (i) => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };
  const un = (p, ox, oz) => { const a = []; for (let i = 0; i < p.length; i += 2) a.push(new THREE.Vector2(p[i] + ox, p[i + 1] + oz)); return a; };
  const ribbon = (pos, a, b, y, w) => { const dx = b.x - a.x, dz = b.y - a.y, L = Math.hypot(dx, dz) || 1, nx = -dz / L * w, nz = dx / L * w;
    pos.push(a.x + nx, y, a.y + nz, a.x - nx, y, a.y - nz, b.x + nx, y, b.y + nz, b.x + nx, y, b.y + nz, a.x - nx, y, a.y - nz, b.x - nx, y, b.y - nz); };
  const addMesh = (parent, pos, mat) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals(); mat.side = THREE.DoubleSide; const m = new THREE.Mesh(g, mat); parent.add(m); return m; };

  // sea + island slab + coast ribbon + coarse roads
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(900000, 900000), M(BG)); sea.rotation.x = -Math.PI / 2; sea.position.y = -60; group.add(sea);
  const landMat = M(LAND, 0.95); landMat.side = THREE.DoubleSide;
  D0.city.rings.forEach((r) => { const pts = un(r, 0, 0); if (pts.length < 8) return;
    const g = new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: 60, bevelEnabled: false }); g.rotateX(Math.PI / 2); group.add(new THREE.Mesh(g, landMat));
    const pos = [], n = pts.length; for (let i = 0; i < n; i++) ribbon(pos, pts[i], pts[(i + 1) % n], 3, 45); addMesh(group, pos, M(COAST, 0.9)); });
  { const pos = []; D0.city.roads.forEach((r) => { const p = un(r, 0, 0); for (let i = 0; i < p.length - 1; i++) ribbon(pos, p[i], p[i + 1], 2, 28); }); addMesh(group, pos, M(ROADC, 0.9)); }

  if (window.MAJOR) { const pos = [], pr = [];
    window.MAJOR.roads.forEach((r) => { const p = un(r.p, 0, 0), w = r.w * 0.55; for (let i = 0; i < p.length - 1; i++) ribbon(pos, p[i], p[i + 1], 2.5, w); }); addMesh(group, pos, M('#7a7272', 0.9));
    window.MAJOR.rails.forEach((r) => { const p = un(r, 0, 0); for (let i = 0; i < p.length - 1; i++) ribbon(pr, p[i], p[i + 1], 2.2, 18); }); addMesh(group, pr, M('#4f8f86', 0.9)); }
  // detail clusters
  const cl = {}, pinsW = {};
  Object.keys(D0.cl).forEach((k, ci) => {
    const C = D0.cl[k], g = new THREE.Group(); g.position.set(C.c[0], 0, C.c[1]); group.add(g);
    const pos = []; C.r.forEach((r) => { const p = un(r.p, 0, 0), w = Math.max(3, r.w || 5) * 0.5; for (let i = 0; i < p.length - 1; i++) ribbon(pos, p[i], p[i + 1], 4, w); }); addMesh(g, pos, M(ROAD, 0.9));
    const flat = (list, col, y) => list.forEach((o) => { const p = un(o.p, 0, 0); if (p.length < 4) return; const sg = new THREE.ShapeGeometry(new THREE.Shape(p)); sg.rotateX(Math.PI / 2); const fm = M(col, 1); fm.side = THREE.DoubleSide; const m = new THREE.Mesh(sg, fm); m.position.y = y; g.add(m); });
    flat(C.g, GREEN, 3.5); flat(C.w, WATER, 3.6);
    const pos2 = [], nor = [], col = [], base = [], ranges = [], dist = [];
    const tri = (a, b, c, n, cc) => { const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
      const cr = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
      const flip = cr[0] * n[0] + cr[1] * n[1] + cr[2] * n[2] < 0; const v = flip ? [a, c, b] : [a, b, c];
      v.forEach((q) => { pos2.push(q[0], q[1], q[2]); nor.push(n[0], n[1], n[2]); col.push(cc.r, cc.g, cc.b); base.push(q[1]); }); };
    let nearest = -1, nd = 1e9;
    C.b.forEach((b, bi) => {
      const p = un(b.p, 0, 0); if (p.length > 2 && p[0].distanceTo(p[p.length - 1]) < 0.01) p.pop(); if (p.length < 3) return;
      let cx = 0, cz = 0; p.forEach((q) => { cx += q.x; cz += q.y; }); cx /= p.length; cz /= p.length;
      const h = Math.max(7, b.h || 9) * 1.2, dd = Math.hypot(cx, cz); if (dd < nd) { nd = dd; nearest = ranges.length; }
      const cc = new THREE.Color(BLD[Math.floor(hash(bi + ci * 99) * BLD.length)]); dist.push(dd);
      const start = pos2.length / 3, wc = cc.clone().multiplyScalar(0.82), win = new THREE.Color('#6f8f8a'), lit = new THREE.Color('#ffffff');
      for (let i = 0; i < p.length; i++) { const A = p[i], Bq = p[(i + 1) % p.length], dx = Bq.x - A.x, dz = Bq.y - A.y, L = Math.hypot(dx, dz) || 1; let n = [dz / L, 0, -dx / L];
        if (n[0] * (A.x - cx) + n[2] * (A.y - cz) < 0) n = [-n[0], 0, -n[2]];
        const nf = Math.max(1, Math.round(h / 3.4)), fh = h / nf;
        for (let f = 0; f < nf; f++) [[0, 0.45, wc], [0.45, 0.82, win], [0.82, 1, wc]].forEach((bd, kk) => { let c2 = bd[2]; if (kk === 1 && hash(bi * 131 + i * 17 + f * 7) < 0.14) c2 = lit;
          const y0 = 4 + f * fh + bd[0] * fh, y1 = 4 + f * fh + bd[1] * fh;
          tri([A.x, y0, A.y], [Bq.x, y0, Bq.y], [Bq.x, y1, Bq.y], n, c2); tri([A.x, y0, A.y], [Bq.x, y1, Bq.y], [A.x, y1, A.y], n, c2); }); }
      THREE.ShapeUtils.triangulateShape(p.map((q) => new THREE.Vector2(q.x, q.y)), []).forEach((t) => tri([p[t[0]].x, 4 + h, p[t[0]].y], [p[t[1]].x, 4 + h, p[t[1]].y], [p[t[2]].x, 4 + h, p[t[2]].y], [0, 1, 0], cc));
      ranges.push([start, pos2.length / 3]);
    });
    const bg = new THREE.BufferGeometry(), posArr = new Float32Array(pos2);
    bg.setAttribute('position', new THREE.BufferAttribute(posArr, 3)); bg.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); bg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.add(new THREE.Mesh(bg, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 })));
    if (k === 'vikhroli' && nearest >= 0) { const lc = new THREE.Color(TEAL); for (let i = ranges[nearest][0]; i < ranges[nearest][1]; i++) bg.attributes.color.setXYZ(i, lc.r, lc.g, lc.b); bg.attributes.color.needsUpdate = true; }
    let last = -1;
    cl[k] = { g, rise(r) { if (Math.abs(r - last) < 1e-4) return; last = r;
      ranges.forEach((rg, i) => { const k0 = clamp(r * 2.2 - dist[i] / 480), kk = k0 * k0 * (3 - 2 * k0); for (let v = rg[0]; v < rg[1]; v++) posArr[v * 3 + 1] = 4 + (base[v] - 4) * kk; });
      bg.attributes.position.needsUpdate = true; bg.computeBoundingSphere(); } };
    pinsW[k] = [C.c[0], 0, C.c[1]];
  });

  // lights
  group.add(new THREE.HemisphereLight('#f4f7f6', '#3a3636', 0.85));
  const sun = new THREE.DirectionalLight('#ffffff', 1.5); sun.position.set(-4000, 6000, 3000); group.add(sun, sun.target);

  // markers: Vikhroli = exact address pin; Malad and Andheri West = locality pulse rings (no street address is published)
  const pinM = M(SIGNAL, 0.45), pin = new THREE.Group(); group.add(pin);
  { const cone = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.6, 20), pinM); cone.rotation.x = Math.PI; cone.position.y = 0.8; pin.add(cone);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.62, 24, 16), pinM); ball.position.y = 1.9; pin.add(ball); }
  const mkRing = (n) => Array.from({ length: n }, () => { const m = new THREE.MeshBasicMaterial({ color: SIGNAL, side: THREE.DoubleSide, transparent: true, opacity: 0, depthWrite: false });
    const r = new THREE.Mesh(new THREE.RingGeometry(0.93, 1, 80), m); r.rotation.x = -Math.PI / 2; r.position.y = 9; r.visible = false; group.add(r); return r; });
  const rings = { malad: mkRing(3), andheri: mkRing(3), vikhroli: mkRing(2) };
  const dot = (k) => { const m = new THREE.Mesh(new THREE.CircleGeometry(1, 40), new THREE.MeshBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0 })); m.rotation.x = -Math.PI / 2; m.position.y = 10; group.add(m); return m; };
  const dots = { malad: dot(), andheri: dot() };

  const P = pinsW, V = (a) => new THREE.Vector3(a[0], a[1], a[2]);
  const OPEN = [3500, -16500];
  let state = {};
  function setT(t) {
    // ---- camera focus
    let tx, tz, D, pitch, yaw;
    if (t < 10.4) {
      const a = eio(seg(t, 0.8, 7.4)), o = Math.max(0, t - 7.4);
      tx = lerp(OPEN[0], P.malad[0], a); tz = lerp(OPEN[1], P.malad[2], a);
      D = Math.exp(lerp(Math.log(62000), Math.log(640), a)) * (1 - 0.06 * Math.min(1, o / 3));
      pitch = lerp(88, 42, eio(seg(t, 1.4, 7.4))) * Math.PI / 180; yaw = lerp(0.05, -0.35, a) + o * 0.05;
    } else if (t < 13.2) {
      const e = eio(seg(t, 10.4, 11.45)), arc = Math.exp(Math.log(30) * Math.sin(Math.PI * seg(t, 10.4, 11.45)));
      tx = lerp(P.malad[0], P.vikhroli[0], e); tz = lerp(P.malad[2], P.vikhroli[2], e);
      D = lerp(600, 760, e) * arc; pitch = lerp(42, 40, e) * Math.PI / 180; yaw = lerp(-0.2, 0.3, e) + Math.max(0, t - 11.45) * 0.045;
    } else {
      const e = eio(seg(t, 13.2, 14.25)), arc = Math.exp(Math.log(14) * Math.sin(Math.PI * seg(t, 13.2, 14.25))), o = Math.max(0, t - 14.25);
      tx = lerp(P.vikhroli[0], P.andheri[0], e); tz = lerp(P.vikhroli[2], P.andheri[2], e);
      D = lerp(760, 760, e) * arc * (1 - 0.05 * Math.min(1, o / 3)); pitch = lerp(40, 41, e) * Math.PI / 180; yaw = lerp(0.379, -0.25, e) + o * 0.05;
    }
    // detail rises as the camera arrives
    cl.malad.rise(eio(seg(t, 5.2, 7.6))); cl.vikhroli.rise(eio(seg(t, 10.7, 12.3))); cl.andheri.rise(eio(seg(t, 13.5, 15.2)));
    // look target is nudged toward the camera so the pin sits in the upper half of the frame (labels live below it)
    const hx = Math.sin(yaw), hz = Math.cos(yaw), dl = D * 0.13 * eio(seg(t, 5.5, 7.4));
    const tg = [tx + hx * dl, 0, tz + hz * dl];
    const pos = [tg[0] + D * Math.sin(yaw) * Math.cos(pitch), tg[1] + D * Math.sin(pitch), tg[2] + D * Math.cos(yaw) * Math.cos(pitch)];
    // ---- markers, all timed to the voice word cues
    const sc = Math.max(10, D * 0.03);
    const pd = seg(t, CUE.vikhroli - 0.42, CUE.vikhroli), landed = t >= CUE.vikhroli - 0.001;
    pin.visible = pd > 0.001; pin.scale.set(sc, sc, sc); pin.position.set(P.vikhroli[0], 40 + (1 - eob(pd, 1.3)) * D * 0.35, P.vikhroli[2]);
    ['malad', 'andheri'].forEach((k) => { const c = CUE[k], on = t >= c - 0.001, rr = Math.max(60, Math.min(D * 0.16, 260));
      dots[k].visible = on; dots[k].position.set(P[k][0], 10, P[k][2]); const dk = eob(seg(t, c, c + 0.35), 1.5); dots[k].scale.set(rr * 0.13 * dk, rr * 0.13 * dk, 1); dots[k].material.opacity = on ? 1 : 0;
      rings[k].forEach((r, i) => { const u = ((t - c - i * 0.55) / 1.65); const live = on && u > 0; r.visible = live; if (!live) return; const f = u - Math.floor(u); r.position.set(P[k][0], 9, P[k][2]); r.scale.set(rr * (0.2 + f), rr * (0.2 + f), 1); r.material.opacity = 0.9 * (1 - f); }); });
    { const on = t >= CUE.vikhroli - 0.001, rr = Math.max(50, Math.min(D * 0.14, 200)); rings.vikhroli.forEach((r, i) => { const u = (t - CUE.vikhroli - i * 0.7) / 1.8, live = on && u > 0; r.visible = live; if (!live) return; const f = u - Math.floor(u); r.position.set(P.vikhroli[0], 9, P.vikhroli[2]); r.scale.set(rr * (0.2 + f), rr * (0.2 + f), 1); r.material.opacity = 0.9 * (1 - f); }); }
    state = { t, D, pinLanded: pin.visible && Math.abs(pin.position.y - 40) < 0.6, pd, maladOn: dots.malad.visible && dots.malad.scale.x > 0.5 && dots.malad.material.opacity > 0.02, andheriOn: dots.andheri.visible && dots.andheri.scale.x > 0.5 && dots.andheri.material.opacity > 0.02 };
    return { pos, look: tg, fov: lerp(34, 40, clamp(1 - D / 62000)), near: Math.max(2, D * 0.02), far: D * 8 + 5000 };
  }
  return { group, lights: [], bg: BG, fog: null, setT, pins: pinsW, CUE, state: () => state };
} };
})();
