// Shared food-modelling helpers (canvas textures, rounded boxes, bowls, drop/pop animation). All functions are pure in t.
window.FC = (function () {
  const { clamp, seg, lerp, eo, eio, eob, rng } = window.C;
  const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
  const tex = (THREE, c, rep) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t; };
  const std = (THREE, o) => new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.7, metalness: 0 }, o));
  function mk(THREE, geo, mat, parent, pos) { const m = new THREE.Mesh(geo, mat); m.castShadow = m.receiveShadow = true; if (pos) m.position.set(...pos); if (parent) parent.add(m); return m; }
  // box with rounded edges (radius r) and optional dome on the top; exact analytic normals on the rounded parts
  function roundedBox(THREE, w, h, d, r, seg, dome) {
    seg = seg || [18, 6, 18]; const g = new THREE.BoxGeometry(w, h, d, seg[0], seg[1], seg[2]); const p = g.attributes.position, n = g.attributes.normal;
    const hx = w / 2 - r, hy = h / 2 - r, hz = d / 2 - r, v = new THREE.Vector3(), inner = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i); inner.set(clamp2(v.x, -hx, hx), clamp2(v.y, -hy, hy), clamp2(v.z, -hz, hz)); const dir = v.clone().sub(inner);
      if (dir.length() > 1e-6) { const nn = dir.clone().normalize(); n.setXYZ(i, nn.x, nn.y, nn.z); dir.setLength(r); }
      v.copy(inner).add(dir);
      if (dome && v.y > 0) { const q = (v.x * v.x) / (w * w / 4) + (v.z * v.z) / (d * d / 4); v.y += dome * Math.max(0, 1 - q); }
      p.setXYZ(i, v.x, v.y, v.z);
    }
    return g;
  }
  const clamp2 = (x, a, b) => Math.max(a, Math.min(b, x));
  const lathe = (THREE, pts, seg) => new THREE.LatheGeometry(pts.map((p) => new THREE.Vector2(p[0], p[1])), seg || 96);
  // a falling body: returns {y, sx, sy, since} where y is the added height above rest; before t0 it is hidden (y=1e3)
  function drop(t, t0, H, fall) {
    fall = fall || 0.3; const u = t - t0; if (u < 0) return { y: 1e3, sx: 1, sy: 1, since: -1, vis: false };
    if (u < fall) { const k = u / fall; return { y: H * (1 - k * k), sx: 1 - 0.03 * k, sy: 1 + 0.06 * k, since: -1, vis: true }; }
    const v = u - fall, a = Math.exp(-v * 7), s = Math.sin(v * 20);
    return { y: 0.014 * a * Math.abs(s), sx: 1 + 0.10 * a * Math.max(0, -s) , sy: 1 - 0.16 * a * Math.max(0, -s) + 0.04 * a * Math.max(0, s), since: v, vis: true };
  }
  // topping pop-in with overshoot, then falls away after t1
  function pop(g, t, t0, t1, ex) {
    const u = t - t0; if (u < 0 || t > t1 + 0.7) { g.visible = false; return; }
    g.visible = true; let s = eob(seg(u, 0, 0.38), 1.8), y = 0, rz = 0, rx = 0;
    if (t > t1) { const e = t - t1; y = -3.2 * e * e - 0.0; s *= 1 - seg(e, 0.35, 0.7); rz = e * 2.4; rx = e * 1.4; }
    g.scale.setScalar(Math.max(0.0001, s)); g.position.y = (ex || 0) + y * 0.4 + (1 - eo(seg(u, 0, 0.3))) * 0.05; g.rotation.z = rz; g.rotation.x = rx;
  }
  function speck(w, h, base, cols, n, rMin, rMax, seed) { const R = rng(seed || 3), [c, g] = cv(w, h); g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < n; i++) { g.fillStyle = cols[Math.floor(R() * cols.length)]; g.globalAlpha = 0.25 + 0.6 * R(); g.beginPath(); g.arc(R() * w, R() * h, rMin + R() * (rMax - rMin), 0, 7); g.fill(); } g.globalAlpha = 1; return c; }
  return { cv, tex, std, mk, roundedBox, lathe, drop, pop, speck, clamp2 };
})();
