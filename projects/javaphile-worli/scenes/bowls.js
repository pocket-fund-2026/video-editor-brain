// Scene: BOWLS. Three dishes drop in one after another and the camera travels along them: grain bowl (0.3 s), vegan chia bowl (2.2 s), tartine (4.0 s). Squash-and-settle on each landing.
window.SCENES.bowls = { dur: 2.4,
  build(THREE) {
    const { clamp, seg, lerp, eo, eio, rng } = window.C, F = window.FC, group = new THREE.Group(), R = rng(23), M = (o) => F.std(THREE, o);
    const TW = (window.TIMING && window.TIMING.bowls) || {}; const LT = Object.assign({ a: -0.2, b: 99, c: 0.8 }, TW);
    const table = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), M({ color: '#d5d9e6', roughness: 0.85 })); table.rotation.x = -Math.PI / 2; table.receiveShadow = true; group.add(table);
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(4, 2), M({ color: '#2c43a8', roughness: 0.9 })); wall.position.set(0, 0.9, -0.9); group.add(wall);
    const ceramic = M({ color: '#f1f4fa', roughness: 0.2 }), ZS = [0.17, 0, -0.17], dishes = [];
    const spot = (g, x, z) => { g.position.set(x, 0, z); group.add(g); return g; };
    const bowl = (r, h) => F.mk(THREE, F.lathe(THREE, [[0, 0], [r * 0.45, 0], [r * 0.52, 0.004], [r * 0.85, h * 0.45], [r * 1.0, h], [r * 1.01, h + 0.002], [r * 0.98, h + 0.002], [r * 0.95, h - 0.002], [r * 0.8, h * 0.45], [r * 0.4, 0.008], [0, 0.007]], 80), ceramic, null);
    const sph = (rad, c, rough) => [new THREE.SphereGeometry(rad, 14, 10), M({ color: c, roughness: rough === undefined ? 0.5 : rough })];
    const place = (g, geo, mat, x, y, z, sx, sy, sz, ry) => { const m = F.mk(THREE, geo, mat, g, [x, y, z]); m.scale.set(sx || 1, sy || 1, sz || 1); m.rotation.y = ry || 0; return m; };
    // ---------- 1) grain bowl: quinoa bed + chickpeas, cucumber, tomato, avocado, cabbage, feta, olives, lemon ----------
    { const g = new THREE.Group(); g.add(bowl(0.088, 0.058));
      const bed = F.mk(THREE, new THREE.SphereGeometry(0.083, 40, 20, 0, 6.283, 0, 1.2), M({ map: F.tex(THREE, F.speck(256, 256, '#e4cf9c', ['#fff4d0', '#c9a867', '#ad8a4a'], 2200, 0.8, 2.6, 9), [3, 3]), roughness: 0.95 }), g, [0, 0.008, 0]); bed.scale.set(1, 0.34, 1);
      const [cg, cm] = sph(0.0068, '#d8a95c', 0.7), [tg] = sph(0.0135, '#d93a2b'), tm = M({ color: '#d93a2b', roughness: 0.25 }), [og, om] = sph(0.0085, '#2a2a3a', 0.3);
      for (let i = 0; i < 26; i++) { const a = 0.2 + R() * 1.4, r = 0.018 + R() * 0.05; place(g, cg, cm, Math.cos(a) * r, 0.0345 + R() * 0.004, Math.sin(a) * r, 1, 0.9, 1); }
      const cuc = new THREE.CylinderGeometry(0.0175, 0.0175, 0.0032, 28), cm1 = M({ color: '#8fbe62', roughness: 0.35 }), cin = new THREE.CylinderGeometry(0.0125, 0.0125, 0.0036, 20), cm2 = M({ color: '#d6e8a8', roughness: 0.3 });
      for (let i = 0; i < 7; i++) { const a = 2.0 + i * 0.16, r = 0.042 + 0.006 * (i % 2); const c = place(g, cuc, cm1, Math.cos(a) * r, 0.040 + i * 0.0016, Math.sin(a) * r); c.rotation.set(0.5 + 0.1 * i, 0, 0.1 * i); const c2 = F.mk(THREE, cin, cm2, c); c2.position.y = 0.0004; }
      for (let i = 0; i < 4; i++) { const a = 3.4 + i * 0.45, r = 0.04 + 0.01 * (i % 2); const h = place(g, new THREE.SphereGeometry(0.0135, 20, 12, 0, 6.283, 0, 1.57), tm, Math.cos(a) * r, 0.040, Math.sin(a) * r); h.rotation.set(0.3, i, 0); const seed = F.mk(THREE, new THREE.CircleGeometry(0.0128, 18), M({ color: '#f1a58c', roughness: 0.5 }), h); seed.rotation.x = Math.PI / 2; seed.position.y = 0.0004; seed.userData.flat = 1; }
      const av = M({ color: '#9cc13a', roughness: 0.4 }), avs = M({ color: '#3f5a1c', roughness: 0.6 });
      for (let i = 0; i < 5; i++) { const a = 5.0 + i * 0.12, r = 0.04 + i * 0.002; const c = place(g, new THREE.TorusGeometry(0.015, 0.0048, 8, 16, 2.3), av, Math.cos(a) * r, 0.042 + i * 0.0014, Math.sin(a) * r); c.rotation.set(1.2, 0, -a + 0.6 + i * 0.05); F.mk(THREE, new THREE.TorusGeometry(0.015, 0.0012, 6, 16, 2.3), avs, c, [0, 0, 0]).scale.set(1.08, 1.08, 1); }
      const cab = M({ color: '#7a2c78', roughness: 0.35 });
      for (let i = 0; i < 16; i++) { const a = 0.9 + R() * 0.8, r = 0.015 + R() * 0.045; const pts = [0, 1, 2, 3].map((k) => new THREE.Vector3(k * 0.006, 0.006 * Math.sin(k * 1.4 + i), 0.003 * Math.sin(k * 2 + i))); const t = F.mk(THREE, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.0013, 5), cab, g, [Math.cos(a) * r, 0.038, Math.sin(a) * r]); t.rotation.y = R() * 6; }
      const fe = M({ color: '#f7f6f0', roughness: 0.7 }); for (let i = 0; i < 5; i++) { const a = 4.4 + i * 0.38, r = 0.026 + 0.01 * (i % 2); const f = place(g, F.roundedBox(THREE, 0.014, 0.013, 0.014, 0.002, [3, 3, 3]), fe, Math.cos(a) * r, 0.04, Math.sin(a) * r); f.rotation.y = i; }
      for (let i = 0; i < 4; i++) place(g, og, om, Math.cos(1.9 + i * 0.35) * 0.03, 0.040, Math.sin(1.9 + i * 0.35) * 0.03, 1, 0.8, 1);
      const parsley = M({ color: '#3c9a38', roughness: 0.55 }); for (let i = 0; i < 12; i++) { const a = R() * 6.283, r = R() * 0.05; const l = place(g, new THREE.SphereGeometry(0.006, 8, 6), parsley, Math.cos(a) * r, 0.045 + R() * 0.004, Math.sin(a) * r, 1.6, 0.18, 1.1, R() * 6); }
      const lemon = new THREE.Group(); const half = F.mk(THREE, new THREE.SphereGeometry(0.02, 24, 12, 0, 6.283, 0, 1.57), M({ color: '#f3d63a', roughness: 0.4 }), lemon); half.scale.set(1, 0.7, 1.35);
      const flesh = F.mk(THREE, new THREE.CircleGeometry(0.0195, 24), M({ color: '#fbec86', roughness: 0.35 }), lemon); flesh.rotation.x = -Math.PI / 2; flesh.position.y = 0.0006; flesh.scale.set(1, 1.35, 1);
      lemon.position.set(-0.05, 0.062, 0.03); lemon.rotation.set(0, 0.7, 0.35); g.add(lemon);
      spot(g, 0, ZS[0]); dishes.push({ g, t0: LT.a, H: 0.3 }); }
    // ---------- 3) tartine: board, sourdough, avocado, radish, microgreens, seeds, chilli ----------
    { const g = new THREE.Group();
      const board = F.mk(THREE, F.roundedBox(THREE, 0.2, 0.016, 0.15, 0.006, [10, 3, 8]), M({ map: F.tex(THREE, F.speck(256, 256, '#c79a5e', ['#a7773d', '#dcb57c', '#9a6a33'], 1300, 0.8, 3, 6), [1, 1]), roughness: 0.75 }), g, [0, 0.008, 0]);
      const crust = M({ color: '#b9772c', roughness: 0.8 }), crumb = M({ map: F.tex(THREE, F.speck(256, 256, '#efd9a8', ['#d9bb83', '#f8ebc8', '#c9a468'], 900, 1, 4, 7)), roughness: 0.9 });
      const sl = new THREE.Mesh(F.roundedBox(THREE, 0.14, 0.02, 0.1, 0.01, [14, 4, 10], 0.003), [crust, crust, crumb, crust, crust, crust]); sl.castShadow = sl.receiveShadow = true; sl.position.set(0, 0.026, 0); sl.rotation.y = 0.08; g.add(sl);
      const av = F.mk(THREE, new THREE.SphereGeometry(0.06, 36, 14, 0, 6.283, 0, 1.0), M({ map: F.tex(THREE, F.speck(256, 256, '#a8cb4a', ['#8aaf34', '#c5dd72', '#d4e68e'], 1500, 1, 4, 8)), roughness: 0.45 }), g, [0, 0.032, 0]); av.scale.set(1.0, 0.16, 0.7); av.rotation.y = 0.08;
      const rad = M({ color: '#e8f0d8', roughness: 0.3 }), radR = M({ color: '#d12e6a', roughness: 0.3 });
      for (let i = 0; i < 7; i++) { const x = -0.045 + i * 0.015, z = 0.012 * Math.sin(i * 1.7); const d = place(g, new THREE.CylinderGeometry(0.0125, 0.0125, 0.0022, 24), rad, x, 0.0415 + i * 0.0006, z); d.rotation.set(0.35, 0.2 * i, 0.15 * Math.sin(i)); const ring = F.mk(THREE, new THREE.TorusGeometry(0.0123, 0.0013, 6, 24), radR, d); ring.rotation.x = Math.PI / 2; ring.position.y = 0.0006; }
      const mg = M({ color: '#2f9c3e', roughness: 0.45 }); for (let i = 0; i < 18; i++) { const x = -0.05 + R() * 0.1, z = -0.025 + R() * 0.05; const st = F.mk(THREE, new THREE.CylinderGeometry(0.0004, 0.0004, 0.012, 4), mg, g, [x, 0.047, z]); st.rotation.set((R() - 0.5), 0, (R() - 0.5)); const lf = F.mk(THREE, new THREE.SphereGeometry(0.004, 8, 6), mg, st, [0, 0.006, 0]); lf.scale.set(1.3, 0.3, 1.0); }
      const se = M({ color: '#f3ecd8', roughness: 0.5 }), sg = new THREE.SphereGeometry(0.0013, 5, 4); for (let i = 0; i < 40; i++) place(g, sg, se, -0.055 + R() * 0.11, 0.040 + R() * 0.004, -0.03 + R() * 0.06, 1.4, 0.8, 0.9);
      const ch = M({ color: '#d1281a', roughness: 0.5 }); for (let i = 0; i < 14; i++) place(g, sg, ch, -0.05 + R() * 0.1, 0.041, -0.03 + R() * 0.06, 1.2, 0.6, 1.2);
      const oil = M({ color: '#d8c140', roughness: 0.05, transparent: true, opacity: 0.8 }); for (let i = 0; i < 5; i++) place(g, new THREE.SphereGeometry(0.003, 10, 8), oil, -0.04 + i * 0.02, 0.0405, 0.025 * Math.sin(i * 2.3), 1.3, 0.35, 1.0);
      const lem = new THREE.Group(); F.mk(THREE, new THREE.CylinderGeometry(0.02, 0.02, 0.004, 28), M({ color: '#f6d94a', roughness: 0.35 }), lem); lem.position.set(0.082, 0.020, 0.03); lem.rotation.set(0.12, 0.3, 0.1); g.add(lem);
      spot(g, 0, ZS[2]); dishes.push({ g, t0: LT.c, H: 0.3 }); }
    const key = new THREE.SpotLight('#fbfcff', 12, 0, 0.7, 0.7, 2); key.position.set(-0.6, 1.0, 0.55); key.target.position.set(0, 0.0, 0); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.002;
    const rim = new THREE.DirectionalLight('#9db6ff', 1.6); rim.position.set(0.7, 0.6, -0.7); const hemi = new THREE.HemisphereLight('#c8d4ff', '#4a5a9a', 0.75);
    function setT(t) {
      dishes.forEach((d, i) => { const dr = F.drop(t, d.t0, d.H, 0.5); d.g.visible = dr.vis; d.g.position.y = dr.y; d.g.scale.set(dr.sx, dr.sy, dr.sx); d.g.rotation.y = (i - 1) * 0.5 + (dr.vis ? (1 - Math.min(1, (t - d.t0) / 0.7)) * 0.8 : 0); });
      // one steady, slowly drifting high camera holds both dishes in frame: no pans, no cuts
      const az = lerp(-0.3, 0.2, eio(seg(t, 0, 2.4))), el = 1.1, dist = 1.18, look = [0, 0.03, 0];
      return { pos: [look[0] + dist * Math.sin(az) * Math.cos(el), look[1] + dist * Math.sin(el), look[2] + dist * Math.cos(az) * Math.cos(el)], look, fov: 34 };
    }
    return { group, lights: [key, rim, hemi], bg: '#2c43a8', fog: null, setT };
  } };
