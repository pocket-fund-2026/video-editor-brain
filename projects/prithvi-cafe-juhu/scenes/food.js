// FOOD scene: kheema pav (0-1.5), Amritsari kulcha (1.5-3.0), Irish coffee (3.0-4.5). One table, three dishes, one spotlight that slides from dish to dish.
// Everything is a pure function of t. Units ~ centimetres. Food keeps natural colour; the light is cool white so nothing reads orange.
(function () {
window.SCENES.food = { dur: 4.5, build(THREE, ctx) {
  const { clamp, seg, lerp, eio, eo, rng } = window.C;
  const PI = Math.PI, TAU = Math.PI * 2;
  const group = new THREE.Group();
  const R = rng(11);
  // ---------- helpers
  function mkNoise(seed) {
    const r = rng(seed), P = []; for (let i = 0; i < 256; i++) P.push(i);
    for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = P[i]; P[i] = P[j]; P[j] = t; }
    const V = P.map(() => r()), h = (x, y) => V[P[(P[x & 255] + y) & 255]], sm = (t) => t * t * (3 - 2 * t);
    const n = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), u = sm(x - xi), v = sm(y - yi); return lerp(lerp(h(xi, yi), h(xi + 1, yi), u), lerp(h(xi, yi + 1), h(xi + 1, yi + 1), u), v); };
    return (x, y, o = 3) => { let a = 0, amp = 0.5, fr = 1, s = 0; for (let i = 0; i < o; i++) { a += amp * n(x * fr, y * fr); s += amp; amp *= 0.5; fr *= 2; } return a / s; };
  }
  const NZ = mkNoise(5);
  const col = (h) => new THREE.Color(h);
  const std = (c, r = 0.7, m = 0, extra) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: r, metalness: m }, extra || {}));
  const vcMat = (r = 0.7, extra) => new THREE.MeshStandardMaterial(Object.assign({ vertexColors: true, roughness: r, metalness: 0 }, extra || {}));
  const mesh = (g, m, parent, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.castShadow = true; o.receiveShadow = true; o.position.set(x, y, z); if (parent) parent.add(o); return o; };
  const lathe = (pts, seg = 64) => new THREE.LatheGeometry(pts.map((p) => new THREE.Vector2(p[0], p[1])), seg);
  const paint = (g, fn) => { const p = g.attributes.position, c = new Float32Array(p.count * 3), t = new THREE.Color();
    for (let i = 0; i < p.count; i++) { fn(p.getX(i), p.getY(i), p.getZ(i), t, i); c[i * 3] = t.r; c[i * 3 + 1] = t.g; c[i * 3 + 2] = t.b; } g.setAttribute('color', new THREE.BufferAttribute(c, 3)); };
  const mix = (a, b, k) => col(a).lerp(col(b), clamp(k));

  // ---------- table
  const table = new THREE.Mesh(new THREE.PlaneGeometry(2400, 1200), std('#2b1c39', 0.55)); table.rotation.x = -PI / 2; table.receiveShadow = true; group.add(table);
  const plateMat = std('#bfc5d6', 0.5);
  function plate(parent, r = 12.5, x = 0, z = 0) {
    const g = lathe([[0, 0], [r * 0.78, 0], [r * 0.9, 0.5], [r, 1.5], [r * 1.01, 1.7], [r * 0.95, 1.7], [r * 0.86, 0.95], [r * 0.78, 0.7], [0, 0.7]]);
    return mesh(g, plateMat, parent, x, 0, z);
  }

  // ---------- steam
  const steamTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); return t; })();
  function steam(parent, n, seed) {
    const r = rng(seed), sp = [];
    for (let i = 0; i < n; i++) { const m = new THREE.SpriteMaterial({ map: steamTex, transparent: true, depthWrite: false, opacity: 0 }); const s = new THREE.Sprite(m); parent.add(s); sp.push({ s, ox: (r() - 0.5) * 3, oz: (r() - 0.5) * 3, ph: r(), sc: 1.4 + r() * 1.2 }); }
    return (t, x0, y0, z0, k) => sp.forEach((o) => { const u = (t * 0.45 + o.ph) % 1; o.s.position.set(x0 + o.ox + Math.sin(u * 6 + o.ph * 9) * 0.9, y0 + u * 8, z0 + o.oz); o.s.scale.setScalar(o.sc * (0.6 + u)); o.s.material.opacity = Math.sin(u * PI) * 0.22 * k; });
  }

  // ====================== DISH 1: kheema pav ======================
  const D1 = new THREE.Group(); D1.position.x = -46; group.add(D1);
  plate(D1, 13.5);
  // kheema bowl (ceramic) + minced meat surface
  const bowl = new THREE.Group(); bowl.position.set(-1.5, 0.7, -1); D1.add(bowl);
  mesh(lathe([[0, 0], [3.2, 0], [4.6, 0.7], [5.9, 2.9], [6.3, 4.4], [6.0, 4.4], [5.5, 3.0], [4.3, 1.0], [0, 1.0]]), std('#d5dae8', 0.35), bowl);
  { const g = new THREE.RingGeometry(0.01, 5.7, 56, 16); g.rotateX(-PI / 2);
    const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), rr = Math.hypot(x, z), bump = (NZ(x * 0.7 + 9, z * 0.7, 3) - 0.4) * 0.7 + NZ(x * 2.2, z * 2.2, 2) * 0.12; p.setY(i, 3.9 + bump * clamp(1 - rr / 6.3) * 1.4 + 0.3); }
    g.computeVertexNormals();
    paint(g, (x, y, z, t) => { const n1 = NZ(x * 1.8 + 3, z * 1.8, 3), n2 = NZ(x * 5, z * 5, 2); t.copy(mix('#3b1a10', '#6b3020', n1)); if (n2 > 0.8) t.copy(mix('#3f7a34', '#8fc267', n1)); else if (n2 < 0.2) t.copy(col('#24100a')); });
    mesh(g, vcMat(0.38), bowl); }
  // peas, oil sheen disc, ginger
  for (let i = 0; i < 7; i++) { const a = R() * TAU, rr = R() * 4.4, pea = mesh(new THREE.SphereGeometry(0.24, 10, 8), std('#78a845', 0.5), bowl, Math.cos(a) * rr, 4.35, Math.sin(a) * rr); }
  // pav buns: superellipsoid, golden top, pale sides
  function pavGeo(w, d, h, e = 0.5) {
    const nu = 24, nv = 40, pos = [], idx = []; const sp = (v, ex) => Math.sign(v) * Math.pow(Math.abs(v), ex);
    for (let i = 0; i <= nu; i++) { const u = -PI / 2 + (i / nu) * PI; for (let j = 0; j <= nv; j++) { const v = -PI + (j / nv) * TAU;
      pos.push(w / 2 * sp(Math.cos(u), e) * sp(Math.cos(v), e), h / 2 * sp(Math.sin(u), e), d / 2 * sp(Math.cos(u), e) * sp(Math.sin(v), e)); } }
    for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) { const a = i * (nv + 1) + j, b = a + nv + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    paint(g, (x, y, z, t) => { const k = clamp((y / (h / 2) + 0.15) * 1.3), n = NZ(x * 0.7 + 4, z * 0.7, 3); t.copy(mix('#f0dcb4', '#c98a45', Math.pow(k, 1.6) * (0.7 + n * 0.6))); }); return g; }
  const bunMat = vcMat(0.62);
  [[7.3, -3.4, 0.2, 0.02], [7.8, 3.6, -0.15, -0.02], [4.2, 8.4, 0.0, 0.1]].forEach((b, i) => { const m = mesh(pavGeo(7.2, 6.8, 4.6), bunMat, D1, b[0], 3.0, b[1]); m.position.y = 0.7 + 2.3; m.rotation.y = b[2] + i * 0.25; });
  // butter pat on a bun, lime wedge, onion rings
  mesh(new THREE.BoxGeometry(2.2, 0.7, 1.8), std('#f6e9a6', 0.35), D1, 7.2, 5.3, -3.2).rotation.y = 0.3;
  { const lime = mesh(new THREE.CylinderGeometry(2.6, 2.6, 1.4, 20, 1, false, 0, PI * 0.7), std('#8fc23a', 0.45), D1, -8.6, 1.6, 7.8); lime.rotation.set(0, 0.6, 0); mesh(new THREE.CylinderGeometry(2.3, 2.3, 1.45, 20, 1, false, 0, PI * 0.7), std('#d6e58b', 0.5), D1, -8.6, 1.6, 7.8).rotation.y = 0.6; }
  for (let i = 0; i < 3; i++) { const o = mesh(new THREE.TorusGeometry(1.6 - i * 0.3, 0.22, 8, 24), std('#d9c2e6', 0.5), D1, 4.8 + i * 1.7, 1.5, 9.2 - i * 0.6); o.rotation.x = PI / 2; }
  const steam1 = steam(group, 9, 3);

  // ====================== DISH 2: Amritsari kulcha ======================
  const D2 = new THREE.Group(); D2.position.x = 0; group.add(D2);
  plate(D2, 14, 0, 0);
  function kulchaHalf(sign) {
    const pts = []; pts.push([0, 1.9]);
    for (let i = 1; i <= 24; i++) { const r = 9 * i / 24, k = 1 - (r / 9) * (r / 9); pts.push([r, 1.5 + k * 1.1 + (NZ(r * 0.6 + sign * 3, 2, 2) - 0.4) * 0.35]); }
    pts.push([9.3, 1.0]); pts.push([9.3, 0.0]); pts.push([0, 0.0]);
    const g = new THREE.LatheGeometry(pts.map((q) => new THREE.Vector2(q[0], q[1])), 48, sign > 0 ? 0 : PI, PI);
    paint(g, (x, y, z, t) => { const n = NZ(x * 0.6 + 2, z * 0.6, 4), n2 = NZ(x * 2.0, z * 2.0 + 5, 2); if (y > 1.0) { t.copy(mix('#e0b36a', '#c88a45', n)); if (n2 > 0.64) t.copy(mix('#a2602a', '#5b2c12', (n2 - 0.64) * 4)); if (n2 < 0.13) t.copy(col('#f7f1e1')); } else t.copy(col('#d2a05a')); });
    return g; }
  const hv = [1, -1].map((s) => { const m = mesh(kulchaHalf(s), vcMat(0.7, { side: THREE.DoubleSide }), D2, 0, 0.7, s * 0.02); m.rotation.y = 0; return m; });
  // stuffed cut faces (potato filling) and layered edge
  const cutMat = std('#ead9a0', 0.8);
  const cuts = [1, -1].map((s) => { const m = mesh(new THREE.BoxGeometry(0.12, 2.4, 18.4), cutMat, D2, 0, 1.9, 0); return m; });
  // butter square, raita, onion, chilli
  const butter = mesh(new THREE.BoxGeometry(3.4, 1.4, 3.4), std('#f7e8a0', 0.3), D2, -2.6, 4.0, -2.3); butter.rotation.y = 0.35;
  const raita = new THREE.Group(); raita.position.set(10.5, 0.7, 6.8); D2.add(raita);
  mesh(lathe([[0, 0], [2.4, 0], [3.4, 0.6], [4.6, 2.4], [4.9, 3.4], [4.6, 3.4], [4.2, 2.4], [3.2, 0.9], [0, 0.9]]), std('#d5dae8', 0.35), raita);
  { const rg = new THREE.RingGeometry(0.01, 4.3, 40, 8); rg.rotateX(-PI / 2); rg.translate(0, 3.0, 0); mesh(rg, std('#fbfcff', 0.25), raita); for (let i = 0; i < 12; i++) { const a = R() * TAU, rr = R() * 3.6; mesh(new THREE.SphereGeometry(0.16, 6, 5), std('#4d3a20', 0.8), raita, Math.cos(a) * rr, 3.1, Math.sin(a) * rr); } }
  for (let i = 0; i < 2; i++) { const o = mesh(new THREE.TorusGeometry(1.7 - i * 0.35, 0.22, 8, 24), std('#d9c2e6', 0.5), D2, -10.5 + i * 2.0, 1.5, 8.8 + i * 0.7); o.rotation.x = PI / 2; }
  { const ch = mesh(new THREE.CapsuleGeometry(0.32, 4.4, 4, 10), std('#4f9a37', 0.45), D2, -6, 1.2, 11.2); ch.rotation.z = PI / 2; ch.rotation.y = 0.35; }
  const steam2 = steam(group, 8, 7);

  // ====================== DISH 3: Irish coffee ======================
  const D3 = new THREE.Group(); D3.position.x = 46; group.add(D3);
  plate(D3, 11.5);   // saucer
  const glassMat = new THREE.MeshStandardMaterial({ color: '#dfe8ff', roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide });
  const mug = new THREE.Group(); mug.position.y = 0.7; D3.add(mug);
  mesh(lathe([[0, 0], [3.4, 0], [3.8, 0.5], [4.1, 9.6], [4.35, 10.4], [4.15, 10.4], [3.95, 9.6], [3.6, 0.9], [0, 0.9]], 56), glassMat, mug);
  { const h = new THREE.TorusGeometry(2.6, 0.38, 10, 28, PI * 1.15); const hm = mesh(h, glassMat, mug, 4.5, 5.2, 0); hm.rotation.set(0, 0, -PI * 0.58); }
  const coffee = mesh(new THREE.CylinderGeometry(3.7, 3.45, 7.2, 48), std('#3a1c0f', 0.2, 0.1, { emissive: '#1c0b05' }), mug, 0, 4.7, 0);
  const cream = new THREE.Group(); cream.position.y = 8.2; mug.add(cream);
  mesh(lathe([[0, 0], [3.7, 0], [3.95, 0.5], [3.9, 1.2], [3.2, 1.8], [1.6, 2.1], [0, 2.15]], 48), std('#fbf9f4', 0.5), cream);
  mesh(new THREE.CircleGeometry(1.5, 24), std('#6b4a35', 0.9, 0, { transparent: true, opacity: 0.55 }), cream, 0.3, 2.17, 0.2).rotation.x = -PI / 2;
  for (let i = 0; i < 3; i++) { const b = mesh(new THREE.SphereGeometry(0.42, 12, 10), std('#2b160c', 0.4), cream, Math.cos(i * 2.1) * 1.2, 2.3, Math.sin(i * 2.1) * 1.2); b.scale.set(1, 0.7, 0.75); b.rotation.y = i; }
  const spoon = new THREE.Group(); group.add(spoon); D3.add(spoon);
  { const bowlS = mesh(new THREE.SphereGeometry(1.2, 16, 12), std('#cfd6e4', 0.25, 0.6), spoon); bowlS.scale.set(1.2, 0.35, 0.8); const stem = mesh(new THREE.CylinderGeometry(0.16, 0.2, 11, 10), std('#cfd6e4', 0.25, 0.6), spoon, 5.6, 0.1, 0); stem.rotation.z = PI / 2; }
  mesh(new THREE.BoxGeometry(7, 0.5, 5), std('#eef1f8', 0.5), D3, 11, 0.9, 6);   // biscuit-like coaster tile
  const steam3 = steam(group, 8, 13);

  // ---------- lights
  group.add(new THREE.AmbientLight('#9d90c0', 0.42));
  const spot = new THREE.SpotLight('#f7f9ff', 6.2, 0, 0.5, 0.75, 0); spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024); spot.shadow.bias = -0.0004; group.add(spot, spot.target);
  const rim = new THREE.DirectionalLight('#8fa4ff', 0.35); rim.position.set(-60, 40, -50); group.add(rim);

  const XS = [D1.position.x, D2.position.x, D3.position.x];
  function focusX(t) { return lerp(lerp(XS[0], XS[1], eio(seg(t, 1.45, 1.85))), XS[2], eio(seg(t, 2.8, 3.2))); }
  function setT(t) {
    const fx = focusX(t);
    spot.position.set(fx - 14, 62, 26); spot.target.position.set(fx, 0, 0);
    // cut: kulcha halves part, butter melts
    const cutK = eio(seg(t, 1.95, 2.55)), melt = seg(t, 1.8, 3.0);
    hv[0].position.x = 0.02 + cutK * 1.2; hv[1].position.x = -0.02 - cutK * 1.2; cuts[0].position.x = 0.07 + cutK * 1.2; cuts[1].position.x = -0.07 - cutK * 1.2;
    butter.scale.set(1 + melt * 0.6, 1 - melt * 0.55, 1 + melt * 0.6); butter.position.y = 4.1 - melt * 0.3; butter.position.x = -2.6 - cutK * 1.2;
    // coffee: cream lifted on with a spoon
    const cr = eo(seg(t, 3.15, 4.1)); cream.scale.set(1, Math.max(0.02, cr), 1); cream.visible = cr > 0.01;
    spoon.position.set(D3.position.x - 0.3 + Math.sin(t * 5) * 0.4, 0.7 + 9.2 + (1 - cr) * 4.5 + Math.sin(seg(t, 3.1, 4.2) * PI) * 1.6, 0.4);
    spoon.rotation.set(0, 0, 0.18 - cr * 0.12); spoon.visible = t > 3.0 && t < 4.35;
    steam1(t, XS[0] - 1.5, 6.5, -1, 1 - seg(t, 1.3, 1.8)); steam2(t, XS[1], 5.5, 0, seg(t, 1.4, 1.9) * (1 - seg(t, 2.8, 3.2))); steam3(t, XS[2], 12.5, 0, seg(t, 3.3, 3.9));
    // camera: 3/4 view that pushes in on each dish
    const st = t < 1.7 ? 0 : (t < 3.0 ? 1.7 : 3.0), ln = t < 1.7 ? 1.7 : (t < 3.0 ? 1.3 : 1.5), k = clamp((t - st) / ln), d = lerp(66, 54, eio(k)), el = lerp(40, 33, eio(k)) * PI / 180, dh = t < 2.9 ? 0 : 3;
    const pos = [fx + lerp(5, -3, k), dh + 3 + d * Math.sin(el), d * Math.cos(el)];
    return { pos, look: [fx, 2.2 + dh * 0.6, 0], fov: 34, near: 1, far: 600 };
  }
  return { group, lights: [], bg: '#0e0714', fog: [110, 380], setT };
} };
})();
