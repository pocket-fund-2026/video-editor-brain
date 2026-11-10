// FOOD scene: croissant (0-3.2), tea-marmalade muffin (3.2-6.2), friand (6.2-9). Everything is a pure function of t.
(function () {
  const { clamp, seg, lerp, eo, eio, rng } = C;
  const PI = Math.PI, TAU = Math.PI * 2;
  const PLATE_Y = 0.009;

  function mkNoise(seed) {
    const r = rng(seed), P = [];
    for (let i = 0; i < 256; i++) P.push(i);
    for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const tmp = P[i]; P[i] = P[j]; P[j] = tmp; }
    const V = P.map(() => r());
    const h = (x, y) => V[P[(P[x & 255] + y) & 255]];
    const sm = (t) => t * t * (3 - 2 * t);
    const n = (x, y) => {
      const xi = Math.floor(x), yi = Math.floor(y), u = sm(x - xi), v = sm(y - yi);
      return lerp(lerp(h(xi, yi), h(xi + 1, yi), u), lerp(h(xi, yi + 1), h(xi + 1, yi + 1), u), v);
    };
    const f = (x, y, o = 4) => { let a = 0, amp = 0.5, fr = 1, s = 0; for (let i = 0; i < o; i++) { a += amp * n(x * fr, y * fr); s += amp; amp *= 0.5; fr *= 2; } return a / s; };
    return { n, f };
  }
  const hex = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

  function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function tex(THREE, c, rep) {
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
    return t;
  }
  function pixels(w, h, fn) {
    const c = canvas(w, h), x = c.getContext('2d'), im = x.createImageData(w, h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const o = (j * w + i) * 4, col = fn(i / w, j / h); im.data[o] = col[0]; im.data[o + 1] = col[1]; im.data[o + 2] = col[2]; im.data[o + 3] = col.length > 3 ? col[3] : 255; }
    x.putImageData(im, 0, 0); return c;
  }

  // ---------- textures ----------
  function slateTex(THREE) {
    const nz = mkNoise(31), a = hex('#222b2f'), b = hex('#3a464b');
    const c = pixels(512, 512, (u, v) => {
      let n = nz.f(u * 6, v * 6, 4), vein = nz.f(u * 3 + v * 14, v * 2, 3);
      let t = clamp(n * 1.2 - 0.25 + (vein - 0.5) * 0.5);
      const sp = nz.n(u * 220, v * 220) > 0.86 ? 0.15 : 0;
      return mix3(a, b, clamp(t + sp)).map((x) => Math.round(x));
    });
    return tex(THREE, c, true);
  }

  function shellTex(THREE) {
    const nz = mkNoise(41), lo = hex('#e0a95a'), hi = hex('#7e3d14'), fl = hex('#f2c987');
    const N = 256;
    const mk = (bump) => pixels(N, N, (u, v) => {
      const th = u * TAU, ridge = Math.abs(v - 0.5) * 2, top = 0.5 + 0.5 * Math.sin(th);
      const cx = Math.cos(th), sy = Math.sin(th);
      const nse = nz.f(cx * 3, sy * 3 + v * 5, 4), streak = nz.f(cx * 1.5, sy * 1.5 + v * 26, 3), fine = nz.n(cx * 20 + v * 40, sy * 20 + v * 30);
      if (bump) { const h = 150 + (streak - 0.5) * 120 - sstep(0.55, 1, ridge) * 90 + (fine - 0.5) * 50; return [h, h, h]; }
      let heat = 0.28 + 0.4 * top + (nse - 0.5) * 0.9 + (streak - 0.5) * 0.55 + sstep(0.55, 1, ridge) * 0.5;
      let c = mix3(lo, hi, clamp(heat));
      if (fine > 0.82 && ridge < 0.8) c = mix3(c, fl, 0.55);
      return c.map((x) => Math.round(x));
    });
    return { map: tex(THREE, mk(false), true), bump: tex(THREE, mk(true), true) };
  }

  // honeycomb laminated crumb cross-section (ellipse-filling)
  function crumbTex(THREE) {
    const S = 512, c = canvas(S, S), x = c.getContext('2d'), r = rng(77), nz = mkNoise(78);
    x.fillStyle = '#f0cf86'; x.fillRect(0, 0, S, S);
    const base = x.createImageData(S, S);
    for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) { const o = (j * S + i) * 4, n = nz.f(i / 40, j / 40, 3); base.data[o] = 244 + (n - 0.5) * 24; base.data[o + 1] = 208 + (n - 0.5) * 30; base.data[o + 2] = 136 + (n - 0.5) * 50; base.data[o + 3] = 255; }
    x.putImageData(base, 0, 0);
    x.save(); x.beginPath(); x.ellipse(256, 256, 238, 238, 0, 0, TAU); x.clip();
    // lamination layers: arcs of elongated air pockets
    for (let row = -2; row < 22; row++) {
      const y0 = 30 + row * 24 + r() * 6;
      let xx = -20;
      while (xx < S + 20) {
        const dc = Math.hypot(xx - 256, y0 - 256) / 240;
        const big = 1.25 - dc * 0.6;
        const w = (10 + r() * 34) * big, hh = (4 + r() * 11) * big * (0.7 + 0.5 * r());
        const bend = 0.0009 * Math.pow(xx - 256, 2) * (row % 2 ? 0.6 : 1) - 30;
        const cy = y0 + bend * 0.5 + (r() - 0.5) * 10;
        const rot = (r() - 0.5) * 0.35;
        x.fillStyle = 'rgba(196,142,70,0.5)'; x.beginPath(); x.ellipse(xx, cy, w, hh, rot, 0, TAU); x.fill();
        x.fillStyle = 'rgba(150,100,42,0.6)'; x.beginPath(); x.ellipse(xx, cy - hh * 0.1, w * 0.62, hh * 0.62, rot, 0, TAU); x.fill();
        x.fillStyle = 'rgba(255,238,190,0.55)'; x.beginPath(); x.ellipse(xx + w * 0.1, cy + hh * 0.75, w * 0.8, hh * 0.18, 0, 0, TAU); x.fill();
        xx += w * (1.2 + r() * 0.9);
      }
      x.strokeStyle = 'rgba(190,130,60,0.45)'; x.lineWidth = 2; x.beginPath();
      for (let i = -10; i <= S + 10; i += 16) { const yy = y0 + 12 + 0.0009 * Math.pow(i - 256, 2) * 0.5 - 15 + Math.sin(i * 0.05 + row) * 3; i < -9 ? x.moveTo(i, yy) : x.lineTo(i, yy); }
      x.stroke();
    }
    for (let i = 0; i < 700; i++) { x.fillStyle = r() < 0.5 ? 'rgba(130,85,35,0.5)' : 'rgba(255,240,200,0.5)'; const px = r() * S, py = r() * S; x.beginPath(); x.arc(px, py, 1 + r() * 2.2, 0, TAU); x.fill(); }
    x.restore();
    // crust ring
    x.lineWidth = 46; x.strokeStyle = '#8c4a1a'; x.beginPath(); x.ellipse(256, 256, 244, 244, 0, 0, TAU); x.stroke();
    x.lineWidth = 16; x.strokeStyle = '#c88335'; x.beginPath(); x.ellipse(256, 256, 214, 214, 0, 0, TAU); x.stroke();
    for (let i = 0; i < 90; i++) { const a = r() * TAU, rr = 200 + r() * 20; x.fillStyle = 'rgba(232,185,100,0.7)'; x.beginPath(); x.ellipse(256 + Math.cos(a) * rr, 256 + Math.sin(a) * rr, 3 + r() * 6, 2 + r() * 3, a, 0, TAU); x.fill(); }
    return tex(THREE, c, false);
  }

  function muffinTopTex(THREE, o) {
    const S = 512, nz = mkNoise(o.seed), r = rng(o.seed + 5), a = hex(o.lo), b = hex(o.hi);
    const c = pixels(S, S, (u, v) => {
      const n = nz.f(u * 7, v * 7, 4), m = nz.f(u * 26, v * 26, 2);
      const d = Math.hypot(u - 0.5, v - 0.5) * 2;
      return mix3(a, b, clamp(0.3 + n * 0.9 + (m - 0.5) * 0.4 + d * 0.15)).map((q) => Math.round(q));
    });
    const x = c.getContext('2d');
    // cracks: lighter, raised fissures showing the paler interior
    for (let k = 0; k < o.cracks; k++) {
      let px = 256 + (r() - 0.5) * 140, py = 256 + (r() - 0.5) * 140, ang = r() * TAU;
      const len = 20 + r() * 26;
      const branch = (px, py, ang, steps, w) => {
        for (let s = 0; s < steps; s++) {
          const nx = px + Math.cos(ang) * 9, ny = py + Math.sin(ang) * 9;
          x.strokeStyle = o.crack; x.lineWidth = w * (0.5 + 0.7 * Math.sin(PI * s / steps)); x.lineCap = 'round';
          x.beginPath(); x.moveTo(px, py); x.lineTo(nx, ny); x.stroke();
          px = nx; py = ny; ang += (r() - 0.5) * 0.9;
          if (r() < 0.07 && w > 2) branch(px, py, ang + (r() < 0.5 ? 0.8 : -0.8), Math.floor(steps * 0.4), w * 0.6);
        }
      };
      branch(px, py, ang, Math.floor(len), 3 + r() * 5);
    }
    for (let i = 0; i < o.sugar; i++) {
      const px = r() * S, py = r() * S;
      if (Math.hypot(px - 256, py - 256) > 250) continue;
      x.fillStyle = r() < 0.7 ? o.fleck : 'rgba(90,50,18,0.55)'; x.beginPath(); x.arc(px, py, 0.8 + r() * 2.2, 0, TAU); x.fill();
    }
    return tex(THREE, c, false);
  }

  function sugarTex(THREE) {
    const nz = mkNoise(91), r = rng(92), S = 512;
    const c = pixels(S, S, (u, v) => { const n = nz.f(u * 9, v * 9, 3), d = Math.hypot(u - 0.5, v - 0.5) * 2; const a = clamp((n - 0.45) * 1.6) * clamp(1 - d * 0.8) * 70; return [244, 249, 249, a]; });
    const x = c.getContext('2d');
    for (let i = 0; i < 4500; i++) {
      const px = r() * S, py = r() * S, d = Math.hypot(px - 256, py - 256) / 256;
      if (d > 1 || r() > 1.15 - d) continue;
      x.fillStyle = 'rgba(247,251,251,' + (0.5 + r() * 0.5) + ')'; x.beginPath(); x.arc(px, py, 0.8 + r() * 2.1, 0, TAU); x.fill();
    }
    return tex(THREE, c, false);
  }

  function marmaladeCapTex(THREE, outline) {
    const S = 512, c = canvas(S, S), x = c.getContext('2d'), r = rng(133), nz = mkNoise(134);
    const im = x.createImageData(S, S);
    for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) { const o = (j * S + i) * 4, n = nz.f(i / 30, j / 30, 3), m = nz.f(i / 5, j / 5, 2); im.data[o] = 240 + (n - 0.5) * 30 + (m - 0.5) * 24; im.data[o + 1] = 204 + (n - 0.5) * 40 + (m - 0.5) * 30; im.data[o + 2] = 136 + (n - 0.5) * 44 + (m - 0.5) * 24; im.data[o + 3] = 255; }
    x.putImageData(im, 0, 0);
    for (let i = 0; i < 1100; i++) {
      const px = r() * S, py = r() * S, rr = 1.2 + r() * 4.2;
      x.fillStyle = 'rgba(138,92,40,0.42)'; x.beginPath(); x.ellipse(px, py, rr, rr * (0.6 + r() * 0.5), r() * 3, 0, TAU); x.fill();
      x.fillStyle = 'rgba(255,238,196,0.4)'; x.beginPath(); x.ellipse(px + 1, py + rr * 0.7, rr * 0.8, rr * 0.25, 0, 0, TAU); x.fill();
    }
    for (let i = 0; i < 170; i++) { x.fillStyle = 'rgba(66,44,22,0.8)'; x.beginPath(); x.ellipse(r() * S, r() * S, 0.8 + r() * 1.8, 0.6 + r() * 1.2, r() * 3, 0, TAU); x.fill(); }
    // marmalade ribbons (amber, glossy) swirling through the crumb
    const ribbon = (cy, amp, ph, w0, x0, x1) => {
      const pts = [];
      for (let i = 0; i <= 60; i++) { const f = i / 60, px = lerp(x0, x1, f); pts.push([px, cy + Math.sin(f * 7 + ph) * amp * (0.5 + 0.7 * Math.sin(f * 3.1 + ph * 2)) + (r() - 0.5) * 2]); }
      const pass = (col, wm, dy) => {
        for (let i = 1; i < pts.length; i++) { const f = i / pts.length, w = w0 * wm * (0.35 + 0.8 * Math.sin(PI * f) * (0.7 + 0.5 * nz.n(f * 6, ph))); x.strokeStyle = col; x.lineWidth = w; x.lineCap = 'round'; x.beginPath(); x.moveTo(pts[i - 1][0], pts[i - 1][1] + dy); x.lineTo(pts[i][0], pts[i][1] + dy); x.stroke(); }
      };
      pass('rgba(150,78,14,0.9)', 1.25, 1.5); pass('rgba(206,124,26,0.95)', 1, 0); pass('rgba(244,176,60,0.75)', 0.38, -1.5);
    };
    ribbon(250, 40, 0.3, 17, 110, 410); ribbon(318, 34, 2.1, 14, 90, 400); ribbon(190, 26, 4.0, 11, 150, 370);
    // a loop of swirl
    x.lineCap = 'round';
    for (let i = 1; i < 120; i++) {
      const f0 = (i - 1) / 120, f1 = i / 120, a0 = f0 * TAU * 1.7, a1 = f1 * TAU * 1.7, rd0 = 14 + f0 * 56, rd1 = 14 + f1 * 56;
      x.strokeStyle = 'rgba(198,114,22,0.92)'; x.lineWidth = 6 + 7 * Math.sin(PI * f1);
      x.beginPath(); x.moveTo(300 + Math.cos(a0) * rd0, 280 + Math.sin(a0) * rd0 * 0.8); x.lineTo(300 + Math.cos(a1) * rd1, 280 + Math.sin(a1) * rd1 * 0.8); x.stroke();
    }
    for (let i = 0; i < 40; i++) { x.fillStyle = r() < 0.5 ? 'rgba(232,150,34,0.95)' : 'rgba(160,84,16,0.9)'; x.beginPath(); x.ellipse(110 + r() * 300, 170 + r() * 190, 2 + r() * 4, 1.4 + r() * 2.6, r() * 3, 0, TAU); x.fill(); }
    // crust along dome edge
    x.lineJoin = 'round'; x.lineCap = 'round';
    const pxy = (p) => [(p[0] + 0.05) / 0.1 * S, S - p[1] / 0.1 * S];
    x.strokeStyle = '#8f5220'; x.lineWidth = 26; x.beginPath(); outline.forEach((p, i) => { const q = pxy(p); i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1]); }); x.stroke();
    x.strokeStyle = '#b97a34'; x.lineWidth = 9; x.beginPath(); outline.forEach((p, i) => { const q = pxy(p); i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1]); }); x.stroke();
    return tex(THREE, c, false);
  }

  // ---------- geometry helpers ----------
  function makePlate(THREE, M, s) {
    const pts = [[0, 0], [0.05, 0], [0.056, 0.003], [0.062, 0.0075], [0.064, 0.0095], [0.078, 0.0105], [0.096, 0.019], [0.108, 0.026], [0.111, 0.0275], [0.1105, 0.0285], [0.107, 0.0278], [0.094, 0.0225], [0.078, 0.0155], [0.064, 0.0113], [0.0, 0.0095]].map((p) => new THREE.Vector2(p[0] * s, p[1] * s * (s < 1 ? 1.1 : 1)));
    const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 72), M); m.castShadow = m.receiveShadow = true; return m;
  }

  function buildGrid(THREE, pos, uv, nu, nv, flip) {
    // grid (nv+1 rows) x (nu+1 cols); tri order (j,i),(j+1,i),(j,i+1)
    const idx = [];
    for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
      const a = j * (nu + 1) + i, b = (j + 1) * (nu + 1) + i, c = a + 1, d = b + 1;
      if (!flip) idx.push(a, b, c, b, d, c); else idx.push(a, c, b, b, c, d);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals();
    // weld seam normals (first and last column) for closed rings
    return g;
  }
  function weldSeam(g, nu, nv) {
    const n = g.attributes.normal;
    for (let j = 0; j <= nv; j++) {
      const a = j * (nu + 1), b = a + nu;
      const x = n.getX(a) + n.getX(b), y = n.getY(a) + n.getY(b), z = n.getZ(a) + n.getZ(b), l = Math.hypot(x, y, z) || 1;
      n.setXYZ(a, x / l, y / l, z / l); n.setXYZ(b, x / l, y / l, z / l);
    }
    n.needsUpdate = true;
  }

  function makeDome(THREE, o) {
    const nz = mkNoise(o.seed), sx = o.scaleX || 1;
    const Rth = (th) => o.R * (1 + 0.035 * (nz.f(Math.cos(th) * 1.5 + 9, Math.sin(th) * 1.5 + 9, 2) - 0.5) * 2);
    const yAt = (rho, th) => {
      const x = rho * Math.cos(th), z = rho * Math.sin(th);
      const crown = Math.pow(Math.max(0, 1 - Math.pow(rho, o.p || 2.3)), o.q || 0.6);
      return o.H * crown * (1 + o.lump * (nz.f(x * 3 + 5, z * 3 + 5, 3) - 0.5) * 2) + o.bump * (nz.f(x * 11 + 2, z * 11 + 2, 2) - 0.5) * crown;
    };
    const nth = o.nth, nr = o.nr, pos = [], uv = [];
    for (let k = 0; k <= nr; k++) {
      const rho = 1 - k / nr;
      for (let i = 0; i <= nth; i++) {
        const th = lerp(o.th0, o.th1, i / nth), r = Rth(th) * rho, x = r * Math.cos(th), z = r * Math.sin(th);
        pos.push(x * sx, o.y0 + yAt(rho, th), z); uv.push(x / (2 * o.R) + 0.5, z / (2 * o.R) + 0.5);
      }
    }
    const g = buildGrid(THREE, pos, uv, nth, nr, false);
    if (o.th1 - o.th0 >= TAU - 1e-6) weldSeam(g, nth, nr);
    return {
      geo: g, yAt, Rth,
      hAt: (x, z) => { const xx = x / sx, th = Math.atan2(z, xx), rho = Math.min(1, Math.hypot(xx, z) / Rth(th)); return o.y0 + yAt(rho, th); },
    };
  }

  function mk(THREE, geo, mat, parent) { const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; if (parent) parent.add(m); return m; }

  // falling bits (flakes / crumbs / icing sugar): position is a pure function of t
  function fallers(THREE, geo, mat, N, seed, o) {
    const mesh = new THREE.InstancedMesh(geo, mat, N); mesh.castShadow = o.shadow !== false; mesh.frustumCulled = false;
    const r = rng(seed), D = [], G = o.g || 0.7;
    for (let i = 0; i < N; i++) {
      const sp = o.spawn(r);
      D.push({ x: sp[0], z: sp[1], y0: sp[2], yg: sp[3], ts: o.t0 + r() * (o.t1 - o.t0), vx: (r() - 0.5) * 0.012, vz: (r() - 0.5) * 0.008, s: lerp(o.s0, o.s1, r()), rx: r() * 6, ry: r() * 6, rz: r() * 6, sp: (r() - 0.5) * 9 });
    }
    const ob = new THREE.Object3D();
    mesh.set = (t) => {
      for (let i = 0; i < N; i++) {
        const d = D[i], dt = t - d.ts;
        if (dt < 0) { ob.scale.set(0, 0, 0); ob.position.set(0, -1, 0); }
        else {
          const tl = Math.sqrt(2 * Math.max(0, d.y0 - d.yg) / G), k = Math.min(dt, tl);
          ob.position.set(d.x + d.vx * k, d.y0 - 0.5 * G * k * k, d.z + d.vz * k);
          ob.rotation.set(d.rx + d.sp * k, d.ry + d.sp * 0.6 * k, d.rz);
          if (o.flat) ob.scale.set(d.s * 1.5, d.s * 0.35, d.s); else ob.scale.set(d.s, d.s * 0.8, d.s);
        }
        ob.updateMatrix(); mesh.setMatrixAt(i, ob.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    };
    return mesh;
  }

  // ---------- croissant ----------
  function buildCroissant(THREE) {
    const Ra = 0.05, TH = 3.7, Rm = 0.028, NS = 70, NA = 40, nz = mkNoise(7);
    const P = (s, a) => {
      const th = (s - 0.5) * TH, sa = Math.sin(a), ca = Math.cos(a);
      const env = Math.pow(Math.max(Math.sin(PI * (0.012 + 0.976 * s)), 0), 0.6);
      const k = s * 7 + 0.18 * ca, fr = k - Math.floor(k);
      const bulge = 0.88 + 0.12 * Math.pow(Math.sin(PI * fr), 0.55);
      const nse = 1 + 0.08 * (nz.f(s * 8 + ca * 1.3, sa * 1.3 + 4, 3) - 0.5) * 2;
      const rr = Rm * env * bulge * nse, ry = rr * 0.86;
      const ex = ca * rr, ey = sa * (sa < 0 ? 0.72 : 1) * ry, yb = 0.72 * Rm * 0.86 * env * 0.88;
      const sT = Math.sin(th), cT = Math.cos(th);
      return [Ra * sT + ex * sT, yb + ey, Ra * (cT - 1) + ex * cT, k];
    };
    const st = shellTex(THREE), crumb = crumbTex(THREE);
    const shellMat = new THREE.MeshPhysicalMaterial({ map: st.map, bumpMap: st.bump, bumpScale: 2.2, roughness: 0.5, clearcoat: 0.28, clearcoatRoughness: 0.32 });
    const capMat = new THREE.MeshStandardMaterial({ map: crumb, bumpMap: crumb, bumpScale: 1.6, roughness: 0.85, side: THREE.DoubleSide });
    function half(sign) {
      const s0 = sign < 0 ? 0 : 0.5, pos = [], uv = [];
      for (let j = 0; j <= NS; j++) for (let i = 0; i <= NA; i++) { const a = TAU * i / NA, p = P(s0 + 0.5 * j / NS, a); pos.push(p[0], p[1], p[2]); uv.push(i / NA, p[3]); }
      const g = buildGrid(THREE, pos, uv, NA, NS, false); weldSeam(g, NA, NS);
      const root = new THREE.Group(); mk(THREE, g, shellMat, root);
      // cap
      const jr = sign < 0 ? NS : 0, ring = [], cpos = [], cuv = [], cn = [];
      let cx = 0, cy = 0, cz = 0;
      for (let i = 0; i <= NA; i++) { const o = (jr * (NA + 1) + i) * 3; ring.push([pos[o], pos[o + 1], pos[o + 2]]); }
      for (let i = 0; i < NA; i++) { cx += ring[i][0]; cy += ring[i][1]; cz += ring[i][2]; }
      cpos.push(cx / NA, cy / NA, cz / NA); cuv.push(0.5, 0.5);
      for (let i = 0; i <= NA; i++) { const a = TAU * i / NA; cpos.push(...ring[i]); cuv.push(0.5 + 0.5 * Math.cos(a) * 0.985, 0.5 + 0.5 * Math.sin(a) * 0.985); }
      const idx = [];
      for (let i = 0; i < NA; i++) sign > 0 ? idx.push(0, i + 1, i + 2) : idx.push(0, i + 2, i + 1);
      const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.Float32BufferAttribute(cpos, 3)); cg.setAttribute('uv', new THREE.Float32BufferAttribute(cuv, 2)); cg.setIndex(idx);
      for (let i = 0; i <= NA + 1; i++) cn.push(-sign, 0, 0);
      cg.setAttribute('normal', new THREE.Float32BufferAttribute(cn, 3));
      mk(THREE, cg, capMat, root);
      return root;
    }
    const left = half(-1), right = half(1);
    return { left, right };
  }

  // ---------- muffin ----------
  function buildMuffin(THREE) {
    const caseH = 0.045, g = new THREE.Group(), nz = mkNoise(21);
    const paperMat = new THREE.MeshStandardMaterial({ color: '#86a99b', roughness: 0.85, side: THREE.DoubleSide });
    const paperHalf = (th0, th1) => {
      const NT = 96, NY = 12, pos = [], uv = [];
      for (let j = 0; j <= NY; j++) for (let i = 0; i <= NT; i++) {
        const yf = j / NY, th = lerp(th0, th1, i / NT);
        let r = lerp(0.03, 0.0425, Math.pow(yf, 0.9)) * (1 + 0.055 * Math.cos(24 * th + PI) + 0.012 * (nz.f(th * 2, yf * 3, 2) - 0.5));
        if (yf > 0.92) r += (yf - 0.92) * 0.012;
        pos.push(r * Math.cos(th), yf * caseH + PLATE_Y * 0, r * Math.sin(th)); uv.push(i / NT, yf);
      }
      return buildGrid(THREE, pos, uv, NT, NY, false);
    };
    const dOpt = { seed: 55, R: 0.0485, H: 0.034, y0: caseH - 0.001, nth: 72, nr: 26, lump: 0.1, bump: 0.003, p: 2.4, q: 0.55 };
    const domeR = makeDome(THREE, Object.assign({}, dOpt, { th0: -PI / 2, th1: PI / 2 }));
    const domeL = makeDome(THREE, Object.assign({}, dOpt, { th0: PI / 2, th1: 3 * PI / 2 }));
    const topTex = muffinTopTex(THREE, { seed: 61, lo: '#d09a4c', hi: '#8f5322', cracks: 9, crack: 'rgba(236,205,140,0.95)', sugar: 1400, fleck: 'rgba(250,240,214,0.9)' });
    const topMat = new THREE.MeshStandardMaterial({ map: topTex, bumpMap: topTex, bumpScale: 2.4, roughness: 0.78 });
    // outline of the cut face in (z, y)
    const rb = 0.03 * 0.945, rc = 0.0425 * 0.945, outline = [[-rb, 0], [rb, 0], [rc, caseH]];
    const rimAt = (th) => dOpt.y0 + domeR.yAt(1, th);
    for (let k = 0; k <= 20; k++) { const rho = 1 - k / 20; outline.push([rho * domeR.Rth(PI / 2), dOpt.y0 + domeR.yAt(rho, PI / 2)]); }
    for (let k = 0; k <= 20; k++) { const rho = k / 20; outline.push([-rho * domeR.Rth(-PI / 2), dOpt.y0 + domeR.yAt(rho, -PI / 2)]); }
    outline.push([-rc, caseH]);
    const capTex = marmaladeCapTex(THREE, outline.slice(3, outline.length - 1));
    const capMat = new THREE.MeshStandardMaterial({ map: capTex, bumpMap: capTex, bumpScale: 1.2, roughness: 0.8, side: THREE.DoubleSide });
    const capGeo = (dir) => {
      const sh = new THREE.Shape(outline.map((p) => new THREE.Vector2(dir > 0 ? p[0] : -p[0], p[1])));
      const sg = new THREE.ShapeGeometry(sh, 6); sg.rotateY(dir > 0 ? -PI / 2 : PI / 2);
      const pp = sg.attributes.position, uvs = sg.attributes.uv;
      for (let i = 0; i < pp.count; i++) uvs.setXY(i, (pp.getZ(i) + 0.05) / 0.1, pp.getY(i) / 0.1);
      return sg;
    };
    function half(dir, geoPaper, dome) {
      const grp = new THREE.Group();
      mk(THREE, geoPaper, paperMat, grp); mk(THREE, dome.geo, topMat, grp); mk(THREE, capGeo(dir), capMat, grp);
      return grp;
    }
    const right = half(1, paperHalf(-PI / 2, PI / 2), domeR), left = half(-1, paperHalf(PI / 2, 3 * PI / 2), domeL);
    return { left, right, rimAt };
  }

  function buildCup(THREE, M) {
    const g = new THREE.Group();
    const cupPts = [[0, 0.002], [0.02, 0.0], [0.026, 0.005], [0.035, 0.028], [0.041, 0.05], [0.0418, 0.0515], [0.0405, 0.052], [0.04, 0.0505], [0.034, 0.03], [0.0, 0.007]].map((p) => new THREE.Vector2(p[0], p[1] + 0.006));
    mk(THREE, new THREE.LatheGeometry(cupPts, 48), new THREE.MeshStandardMaterial({ color: '#f1f4f3', roughness: 0.2, side: THREE.DoubleSide }), g);
    const saucer = [[0, 0.0], [0.04, 0.0], [0.05, 0.003], [0.064, 0.011], [0.066, 0.0125], [0.0645, 0.0128], [0.062, 0.0105], [0.048, 0.0055], [0.03, 0.0045], [0, 0.0045]].map((p) => new THREE.Vector2(p[0], p[1]));
    mk(THREE, new THREE.LatheGeometry(saucer, 48), new THREE.MeshStandardMaterial({ color: '#f1f4f3', roughness: 0.2 }), g);
    const tea = new THREE.Mesh(new THREE.CircleGeometry(0.0375, 40), new THREE.MeshStandardMaterial({ color: '#6f6a35', roughness: 0.08 })); tea.rotation.x = -PI / 2; tea.position.y = 0.0475; tea.receiveShadow = true; g.add(tea);
    const h = mk(THREE, new THREE.TorusGeometry(0.0155, 0.0036, 10, 24, PI * 1.25), new THREE.MeshStandardMaterial({ color: '#f1f4f3', roughness: 0.2 }), g); h.position.set(0.0405, 0.036, 0); h.rotation.z = -PI * 0.62;
    return g;
  }

  // ---------- friand ----------
  function buildFriand(THREE) {
    const g = new THREE.Group(), SX = 1.55;
    const tinPts = [[0.0, 0.0], [0.0215, 0.0], [0.0232, 0.002], [0.0258, 0.011], [0.0268, 0.0125], [0.0262, 0.013], [0.0252, 0.0117], [0.0226, 0.004], [0.0, 0.004]].map((p) => new THREE.Vector2(p[0], p[1]));
    const tin = mk(THREE, new THREE.LatheGeometry(tinPts, 64), new THREE.MeshStandardMaterial({ color: '#b4c0c3', roughness: 0.4, metalness: 0.35, side: THREE.DoubleSide }), g); tin.scale.set(SX, 1, 1);
    const dome = makeDome(THREE, { seed: 88, R: 0.0262, H: 0.02, y0: 0.0115, nth: 80, nr: 30, th0: 0, th1: TAU, scaleX: SX, lump: 0.05, bump: 0.0012, p: 2.6, q: 0.5 });
    const topTex = muffinTopTex(THREE, { seed: 97, lo: '#c58a3f', hi: '#7c431a', cracks: 4, crack: 'rgba(214,172,104,0.85)', sugar: 700, fleck: 'rgba(240,222,180,0.8)' });
    const body = mk(THREE, dome.geo, new THREE.MeshStandardMaterial({ map: topTex, bumpMap: topTex, bumpScale: 2, roughness: 0.75 }), g);
    // cake filling visible between tin and dome rim
    // almond slices
    const ag = new THREE.SphereGeometry(1, 18, 8), ap = ag.attributes.position, ac = [];
    for (let i = 0; i < ap.count; i++) {
      const x = ap.getX(i), z = ap.getZ(i);
      ap.setZ(i, z * (1 - 0.32 * x)); ap.setX(i, x < 0 ? x * 1.08 : x * 0.9);
      const d = Math.hypot(x, z), c = lerp(0.95, 0.62, sstep(0.45, 1, d)); ac.push(0.93 * c, 0.78 * c, 0.52 * c);
    }
    ag.setAttribute('color', new THREE.Float32BufferAttribute(ac, 3));
    const N = 44, am = new THREE.InstancedMesh(ag, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7 }), N); am.castShadow = am.receiveShadow = true;
    const r = rng(404), ob = new THREE.Object3D(), keep = [];
    let tries = 0;
    while (keep.length < N && tries++ < 600) {
      const a = r() * TAU, rr = Math.sqrt(r()) * 0.92, x = Math.cos(a) * rr * 0.0262 * SX, z = Math.sin(a) * rr * 0.0262;
      if (keep.some((k) => Math.hypot((k[0] - x) / SX, k[1] - z) < 0.0065)) continue;
      keep.push([x, z]);
    }
    keep.forEach((k, i) => {
      const y = dome.hAt(k[0], k[1]);
      ob.position.set(k[0], y + 0.0011, k[1]);
      ob.rotation.set((r() - 0.5) * 0.9, r() * TAU, (r() - 0.5) * 0.9);
      if (r() < 0.22) ob.rotation.x += (r() < 0.5 ? 1 : -1) * 0.8;
      const s = 0.0058 + r() * 0.003; ob.scale.set(s, 0.0008, s * (0.55 + r() * 0.12));
      ob.updateMatrix(); am.setMatrixAt(i, ob.matrix);
    });
    am.count = keep.length; g.add(am);
    // icing sugar dust overlay
    const sug = new THREE.Mesh(dome.geo, new THREE.MeshStandardMaterial({ map: sugarTex(THREE), transparent: true, roughness: 1, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    sug.receiveShadow = true; g.add(sug);
    return { g, dome, sug, SX };
  }

  // ---------- module ----------
  window.SCENES.food = {
    dur: 9,
    marks: { croissant: [0, 3.2], muffin: [3.2, 6.2], friand: [6.2, 9] },
    build(THREE, ctx) {
      const group = new THREE.Group();
      const white = new THREE.MeshStandardMaterial({ color: '#d9dfde', roughness: 0.25 });

      // counter + fluted teal wall
      const ct = slateTex(THREE); ct.repeat.set(3, 3);
      const counter = new THREE.Mesh(new THREE.BoxGeometry(2, 0.06, 1.4), new THREE.MeshStandardMaterial({ map: ct, roughness: 0.6 }));
      counter.position.set(0, -0.03, 0.35); counter.receiveShadow = true; group.add(counter);
      const wg = new THREE.PlaneGeometry(2, 0.9, 520, 1), wp = wg.attributes.position;
      for (let i = 0; i < wp.count; i++) { const f = ((wp.getX(i) + 1) * 130) % 1; wp.setZ(i, 0.007 * (f < 0.5 ? f * 2 : 2 - f * 2)); }
      wg.computeVertexNormals();
      const wall = new THREE.Mesh(wg, new THREE.MeshStandardMaterial({ color: '#1a4a42', roughness: 0.7 })); wall.position.set(0, 0.4, -0.28); wall.receiveShadow = true; wall.castShadow = false; group.add(wall);

      // CROISSANT
      const itemC = new THREE.Group(); group.add(itemC);
      const plateC = makePlate(THREE, white, 1); itemC.add(plateC);
      const cr = buildCroissant(THREE), crRoot = new THREE.Group(); crRoot.add(cr.left, cr.right); crRoot.position.z = 0.018; itemC.add(crRoot);
      const flakeMat = new THREE.MeshStandardMaterial({ color: '#c88a3c', roughness: 0.6 });
      const flakes = fallers(THREE, new THREE.BoxGeometry(1, 1, 1), flakeMat, 70, 5, {
        t0: 1.05, t1: 2.6, s0: 0.0018, s1: 0.0048, flat: true, g: 0.55,
        spawn: (r) => { const x = (r() - 0.5) * 0.15, z = (r() - 0.3) * 0.1; return [x, PLATE_Y + 0.03 + r() * 0.05, z, PLATE_Y + 0.0005]; },
      });
      itemC.add(flakes);

      // MUFFIN
      const itemM = new THREE.Group(); group.add(itemM);
      const plateM = makePlate(THREE, white, 0.78); itemM.add(plateM);
      const mf = buildMuffin(THREE), mfRoot = new THREE.Group(); mfRoot.add(mf.left, mf.right); mfRoot.position.y = PLATE_Y * 0.78 * 1.1; itemM.add(mfRoot);
      const cupG = buildCup(THREE, white); cupG.position.set(0.118, 0, -0.088); itemM.add(cupG);
      const crumbs = fallers(THREE, new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color: '#c99a55', roughness: 0.9 }), 60, 9, {
        t0: 1.5, t1: 2.7, s0: 0.0007, s1: 0.0019, g: 0.5,
        spawn: (r) => { const x = (r() - 0.5) * 0.06, z = (r() - 0.5) * 0.07; return [x, 0.03 + r() * 0.05, z, PLATE_Y * 0.78 * 1.1 + 0.0008]; },
      });
      itemM.add(crumbs);

      // FRIAND
      const itemF = new THREE.Group(); group.add(itemF);
      const plateF = makePlate(THREE, white, 1); itemF.add(plateF);
      const fr = buildFriand(THREE), frRoot = new THREE.Group(); frRoot.add(fr.g); itemF.add(frRoot);
      const sugarP = fallers(THREE, new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color: '#f6fafa', roughness: 0.9 }), 190, 13, {
        t0: 0.95, t1: 2.0, s0: 0.0005, s1: 0.0011, g: 0.45, shadow: false,
        spawn: (r) => { const a = r() * TAU, rr = Math.sqrt(r()) * 0.85, x = Math.cos(a) * rr * 0.0262 * fr.SX, z = Math.sin(a) * rr * 0.0262; return [x, 0.13 + r() * 0.04, z, fr.dome.hAt(x, z) + 0.0006]; },
      });
      frRoot.add(sugarP); // friand root sits on the plate; coordinates are local to it

      // lights (static, local coords)
      const hemi = new THREE.HemisphereLight('#dbe9ef', '#1c2a2a', 0.95);
      const key = new THREE.DirectionalLight('#fff2e0', 2.4); key.position.set(-0.32, 0.5, 0.3);
      key.castShadow = true; key.shadow.mapSize.set(2048, 2048); const sc = key.shadow.camera; sc.left = -0.3; sc.right = 0.3; sc.top = 0.3; sc.bottom = -0.3; sc.near = 0.1; sc.far = 1.4; key.shadow.bias = -0.0004; key.shadow.normalBias = 0.0012; key.shadow.radius = 3;
      const rim = new THREE.DirectionalLight('#a9ded4', 1.7); rim.position.set(0.3, 0.35, -0.5); rim.castShadow = true; rim.shadow.mapSize.set(1024, 1024); const rc = rim.shadow.camera; rc.left = -0.3; rc.right = 0.3; rc.top = 0.3; rc.bottom = -0.3; rc.near = 0.1; rc.far = 1.4; rim.shadow.bias = -0.0005;
      const fill = new THREE.DirectionalLight('#e6f0f4', 1.1); fill.position.set(0.4, 0.25, 0.6);

      const cam = (az, el, d, look, fov) => { const a = az * PI / 180, e = el * PI / 180; return { pos: [look[0] + d * Math.sin(a) * Math.cos(e), look[1] + d * Math.sin(e), look[2] + d * Math.cos(a) * Math.cos(e)], look, fov }; };

      function setT(t) {
        const inC = t < 3.2, inM = t >= 3.2 && t < 6.2, inF = t >= 6.2;
        itemC.visible = inC; itemM.visible = inM; itemF.visible = inF;
        if (inC) {
          const sl = eo(seg(t, 0, 0.85));
          itemC.position.set(lerp(-0.36, 0, sl), 0, 0); plateC.rotation.y = -0.5 * (1 - sl);
          // croissant lands
          const dp = seg(t, 0.6, 1.1), drop = (1 - dp * dp) * 0.13 * (t < 1.1 ? 1 : 0);
          const ls = seg(t, 1.1, 1.55), squash = Math.sin(ls * PI) * (1 - ls) * 0.09;
          crRoot.position.y = PLATE_Y + (t < 0.6 ? 0.13 : drop);
          crRoot.visible = t > 0.55; crRoot.scale.set(1 + squash * 0.5, 1 - squash, 1 + squash * 0.5);
          crRoot.rotation.y = lerp(-0.6, 0, eo(seg(t, 0.6, 1.1)));
          const pa = eio(seg(t, 1.6, 2.85));
          cr.left.position.set(-0.018 * pa, 0, 0.008 * pa); cr.left.rotation.y = -0.45 * pa; cr.left.rotation.z = 0.0;
          cr.right.position.set(0.02 * pa, 0, -0.006 * pa); cr.right.rotation.y = 0.7 * pa;
          flakes.set(t);
          const push = eio(seg(t, 2.35, 3.2));
          return cam(lerp(20, 44, eio(t / 3.2)), lerp(36, 30, eio(t / 3.2)), lerp(0.46, 0.4, eio(t / 3.2)) - 0.05 * push, [lerp(0, -0.004, push), 0.02, 0.0], 34);
        }
        if (inM) {
          const u = t - 3.2, sl = eo(seg(u, 0, 0.85)), sc2 = eo(seg(u, 0.15, 1.0));
          itemM.position.set(lerp(0.4, 0, sl), 0, 0); plateM.rotation.y = 0.5 * (1 - sl);
          cupG.position.x = 0.118 + 0.3 * (1 - sc2); cupG.rotation.y = 0.6 * (1 - sc2);
          const pa = eio(seg(u, 1.45, 2.65));
          mf.left.position.set(-0.016 * pa, 0, 0.004 * pa); mf.left.rotation.y = -0.4 * pa;
          mf.right.position.set(0.018 * pa, 0, -0.004 * pa); mf.right.rotation.y = 0.95 * pa;
          mfRoot.rotation.y = 0.12 * (1 - sl);
          crumbs.set(u);
          const push = eio(seg(u, 2.35, 3.0));
          return cam(lerp(52, 24, eio(u / 3.0)), lerp(26, 30, eio(u / 3)), lerp(0.46, 0.42, eio(u / 3)) - 0.08 * push, [lerp(0.02, 0.0, push), 0.032, -0.01], 36);
        }
        const u = Math.min(t - 6.2, 2.8), sl = eo(seg(u, 0, 0.8));
        itemF.position.set(lerp(-0.36, 0, sl), 0, 0); plateF.rotation.y = -0.4 * (1 - sl);
        const dp = seg(u, 0.45, 0.9), land = seg(u, 0.9, 1.3);
        frRoot.position.y = PLATE_Y + (u < 0.9 ? (1 - dp * dp) * 0.05 * (u > 0.45 ? 1 : 0) + (u <= 0.45 ? 0.05 : 0) : 0);
        const sq = Math.sin(land * PI) * (1 - land) * 0.08; frRoot.scale.set(1 + sq * 0.4, 1 - sq, 1 + sq * 0.4);
        fr.sug.material.opacity = eio(seg(u, 1.0, 2.1));
        sugarP.set(u);
        const push = eio(seg(u, 1.9, 2.8)), orb = eio(u / 2.8);
        const base = cam(lerp(14, -26, orb), lerp(40, 36, orb), lerp(0.25, 0.2, orb), [0, 0.02, 0], 36);
        const mac = cam(lerp(-26, -40, push), lerp(36, 24, push), 0.085, [0.004, 0.03, 0], 30);
        return { pos: [lerp(base.pos[0], mac.pos[0], push), lerp(base.pos[1], mac.pos[1], push), lerp(base.pos[2], mac.pos[2], push)], look: [lerp(base.look[0], mac.look[0], push), lerp(base.look[1], mac.look[1], push), lerp(base.look[2], mac.look[2], push)], fov: lerp(36, 30, push) };
      }
      return { group, lights: [hemi, key, key.target, rim, rim.target, fill], bg: '#10201f', fog: null, setT };
    },
  };
})();
