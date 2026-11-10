// Scene: FRENCH TOAST. Three brioche slices drop onto a plate, then four toppings take turns: tiramisu, raspberry cream cheese, blueberry, banana chocolate.
// Every topping is real 3D geometry (berries made of drupelets, cream quenelles, cocoa dust, compote). Pure function of t.
window.SCENES.toast = { dur: 3.3,
  build(THREE) {
    const { clamp, seg, lerp, eo, eio, eob, rng } = window.C, F = window.FC, group = new THREE.Group(), R = rng(11), M = (o) => F.std(THREE, o);
    const TW = (window.TIMING && window.TIMING.toast) || {};
    const W = Object.assign({ tir: [0.95, 1.1], rasp: [1.4, 1.85], blue: [1.95, 3.0], ban: [20, 21] }, TW);
    // ---- surfaces ----
    const table = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), M({ color: '#d5d9e6', roughness: 0.85 })); table.rotation.x = -Math.PI / 2; table.receiveShadow = true; group.add(table);
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(14, 5), M({ color: '#2c43a8', roughness: 0.9 })); wall.position.set(0, 2.2, -0.55); group.add(wall);
    const plate = F.mk(THREE, F.lathe(THREE, [[0, 0], [0.09, 0], [0.12, 0.004], [0.152, 0.016], [0.158, 0.019], [0.155, 0.02], [0.14, 0.012], [0.1, 0.009], [0, 0.0085]], 96), M({ color: '#f4f6fa', roughness: 0.18 }), group);
    // ---- brioche slices ----
    const topTex = (() => { const [c, g] = F.cv(512, 512), N = 512; g.fillStyle = '#d99a3a'; g.fillRect(0, 0, N, N);
      for (let i = 0; i < 160; i++) { const x = R() * N, y = R() * N, r = 20 + R() * 70, dark = R() < 0.55; for (let k = 4; k >= 1; k--) { g.fillStyle = dark ? 'rgba(150,80,22,0.14)' : 'rgba(246,205,120,0.13)'; g.beginPath(); g.arc(x, y, r * k / 4, 0, 7); g.fill(); } }
      for (let i = 0; i < 700; i++) { g.fillStyle = 'rgba(120,64,18,' + (0.1 + 0.25 * R()) + ')'; g.beginPath(); g.arc(R() * N, R() * N, 1 + R() * 3, 0, 7); g.fill(); }
      g.strokeStyle = 'rgba(112,58,14,0.55)'; g.lineWidth = 7; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(40, 110 + k * 120); g.bezierCurveTo(180, 90 + k * 120, 340, 130 + k * 120, 470, 100 + k * 120); g.stroke(); }
      g.strokeStyle = 'rgba(120,60,14,0.10)'; for (let k = 0; k < 9; k++) { g.lineWidth = 12 + k * 6; g.strokeRect(0, 0, N, N); } return F.tex(THREE, c); })();
    const sideTex = F.tex(THREE, F.speck(256, 256, '#e9c27a', ['#c98a38', '#f3dca0', '#b87a2e'], 900, 1, 3.5, 5));
    const mTop = M({ map: topTex, roughness: 0.55 }), mSide = M({ map: sideTex, roughness: 0.8 });
    const slices = [], SH = 0.036;
    for (let i = 0; i < 3; i++) { const g = new THREE.Group(); const m = new THREE.Mesh(F.roundedBox(THREE, 0.15, SH, 0.15, 0.016, [20, 6, 20], 0.007), [mSide, mSide, mTop, mTop, mSide, mSide]); m.castShadow = m.receiveShadow = true; g.add(m);
      g.userData = { y: 0.0195 + SH / 2 + i * (SH - 0.002), rot: [0.07, -0.05, 0.03][i], ox: [0.002, -0.004, 0.003][i], oz: [0, 0.004, -0.003][i] }; group.add(g); slices.push(g); }
    const topY = 0.0195 + SH + 2 * (SH - 0.002) + 0.006;      // top surface of the stack
    const dock = new THREE.Group(); dock.position.set(0, topY, 0); group.add(dock);
    const tops = {}; const T = (k) => (tops[k] = new THREE.Group(), dock.add(tops[k]), tops[k]);
    const cream = M({ color: '#f6f1e6', roughness: 0.32 }), gloss = (c, r) => M({ color: c, roughness: r === undefined ? 0.2 : r });
    // --- tiramisu: mascarpone quenelles, cocoa dust, espresso drizzle, ladyfinger shard
    { const g = T('tir');
      const dust = F.tex(THREE, (() => { const [c, x] = F.cv(256, 256); for (let i = 0; i < 2600; i++) { const a = R() * 6.283, r = Math.sqrt(R()) * 124; x.fillStyle = 'rgba(58,32,18,' + (0.15 + 0.7 * R()) + ')'; x.beginPath(); x.arc(128 + Math.cos(a) * r, 128 + Math.sin(a) * r, 0.8 + R() * 2.3, 0, 7); x.fill(); } return c; })());
      const dm = new THREE.Mesh(new THREE.CircleGeometry(0.07, 48), new THREE.MeshBasicMaterial({ map: dust, transparent: true, depthWrite: false })); dm.rotation.x = -Math.PI / 2; dm.position.y = 0.0015; dm.userData.noInk = false; g.add(dm);
      [[-0.022, 0.012, 0.3], [0.024, -0.012, -0.5]].forEach(([x, z, r]) => { const q = F.mk(THREE, new THREE.SphereGeometry(0.03, 32, 20), cream, g, [x, 0.017, z]); q.scale.set(1.25, 0.8, 0.8); q.rotation.y = r; const sw = F.mk(THREE, new THREE.SphereGeometry(0.014, 20, 14), cream, g, [x + 0.012 * Math.cos(r), 0.034, z + 0.012 * Math.sin(r)]); sw.scale.set(1, 0.6, 0.9); });
      const dc = new THREE.Mesh(new THREE.SphereGeometry(0.03, 24, 14, 0, 6.283, 0, 1.0), new THREE.MeshStandardMaterial({ map: dust, roughness: 0.95, transparent: true })); dc.scale.set(1.26, 0.8, 0.81); dc.position.set(-0.022, 0.017, 0.012); g.add(dc);
      const dr = []; for (let i = 0; i <= 26; i++) dr.push(new THREE.Vector3(-0.06 + i * 0.0046, 0.0035 + 0.0003 * Math.sin(i), 0.026 * Math.sin(i * 0.9) * (0.5 + 0.5 * Math.cos(i * 0.31))));
      F.mk(THREE, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(dr), 80, 0.0021, 8), gloss('#3a1f12', 0.15), g);
      const lf = F.mk(THREE, F.roundedBox(THREE, 0.07, 0.014, 0.022, 0.005, [8, 3, 4], 0.002), M({ map: sideTex, roughness: 0.9 }), g, [0.012, 0.016, -0.04]); lf.rotation.set(0.0, 0.5, 0.35);
    }
    // --- raspberry cream cheese
    const berry = (R0, col, nd) => { const g = new THREE.Group(), dm = new THREE.SphereGeometry(R0 * 0.34, 8, 6), mt = gloss(col, 0.35);
      for (let i = 0; i < nd; i++) { const k = (i + 0.5) / nd, ph = Math.acos(1 - 1.65 * k), th = i * 2.39996; const d = F.mk(THREE, dm, mt, g, [Math.sin(ph) * Math.cos(th) * R0 * 0.8, Math.cos(ph) * R0 * 0.92, Math.sin(ph) * Math.sin(th) * R0 * 0.8]); d.castShadow = false; }
      return g; };
    { const g = T('rasp');
      const dol = F.mk(THREE, new THREE.SphereGeometry(0.034, 36, 22), gloss('#fbf7f0', 0.28), g, [0, 0.016, 0.0]); dol.scale.set(1.2, 0.62, 1.0);
      [[-0.038, 0.012, 0.8], [0.034, 0.03, 1.1], [0.008, -0.036, 0.9], [-0.01, 0.034, 1.0], [0.05, -0.012, 0.85], [-0.05, -0.026, 0.9]].forEach(([x, z, s], i) => { const b = berry(0.0125 * s, '#c3173f', 34); b.position.set(x, 0.011 + (i < 2 ? 0.012 : 0), z); b.rotation.y = i; b.rotation.x = 0.4 * Math.sin(i * 3); g.add(b); });
      const dr = []; for (let i = 0; i <= 24; i++) dr.push(new THREE.Vector3(-0.065 + i * 0.0054, 0.004, 0.05 * Math.sin(i * 0.75) * 0.5 - 0.03));
      F.mk(THREE, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(dr), 80, 0.0024, 8), gloss('#a50f32', 0.12), g);
      const sug = F.tex(THREE, (() => { const [c, x] = F.cv(256, 256); for (let i = 0; i < 1500; i++) { const a = R() * 6.283, r = Math.sqrt(R()) * 124; x.fillStyle = 'rgba(255,255,255,' + (0.3 + 0.6 * R()) + ')'; x.beginPath(); x.arc(128 + Math.cos(a) * r, 128 + Math.sin(a) * r, 0.8 + R() * 1.6, 0, 7); x.fill(); } return c; })());
      const sm = new THREE.Mesh(new THREE.CircleGeometry(0.068, 40), new THREE.MeshBasicMaterial({ map: sug, transparent: true, depthWrite: false })); sm.rotation.x = -Math.PI / 2; sm.position.y = 0.002; g.add(sm);
    }
    // --- blueberry compote
    { const g = T('blue');
      const pool = F.mk(THREE, new THREE.CylinderGeometry(0.056, 0.058, 0.006, 40), gloss('#2b2668', 0.1), g, [0, 0.003, 0]); pool.scale.set(1, 1, 0.84);
      const bm = gloss('#34408f', 0.42), crown = gloss('#1b2150', 0.6), bg = new THREE.SphereGeometry(0.0115, 24, 16), cg = new THREE.CylinderGeometry(0.0034, 0.0034, 0.0018, 7);
      for (let i = 0; i < 19; i++) { const a = R() * 6.283, r = 0.048 * Math.sqrt(R()), s = 0.8 + 0.4 * R(), stack = R() < 0.3 && r < 0.035; const b = F.mk(THREE, bg, bm, g, [Math.cos(a) * r, 0.0105 * s + (stack ? 0.0095 : 0), Math.sin(a) * r * 0.86]); b.scale.setScalar(s); const c = F.mk(THREE, cg, crown, b); c.position.y = 0.0105; c.scale.setScalar(1 / s); b.rotation.set(R() * 2, R() * 6, R() * 2); }
      const dol = F.mk(THREE, new THREE.SphereGeometry(0.02, 28, 18), cream, g, [0.03, 0.017, -0.02]); dol.scale.set(1.0, 0.6, 0.9);
      for (let i = 0; i < 5; i++) { const lf = F.mk(THREE, new THREE.SphereGeometry(0.01, 12, 8), gloss('#3b8a3a', 0.5), g, [0.03 + i * 0.002, 0.03 + i * 0.002, -0.02 + i * 0.002]); lf.scale.set(1.8, 0.18, 0.9); lf.rotation.y = i * 1.3 + 0.4; if (i > 0) lf.visible = false; }
    }
    // --- banana chocolate
    { const g = T('ban');
      const bm = gloss('#f2cf3c', 0.5), rim = gloss('#c99a2a', 0.6);
      for (let i = 0; i < 9; i++) { const a = i * 0.72, r = 0.012 + 0.026 * (i % 3) , c = F.mk(THREE, new THREE.CylinderGeometry(0.0175, 0.0175, 0.0065, 28), bm, g, [Math.cos(a) * r + 0.004 * (i % 2), 0.004 + 0.0065 * Math.floor(i / 3), Math.sin(a) * r]); c.rotation.set(0.3 * Math.sin(i * 2), i, 0.25 * Math.cos(i)); F.mk(THREE, new THREE.TorusGeometry(0.0172, 0.0016, 6, 28), rim, c).rotation.x = Math.PI / 2; c.children[0].position.y = 0.0033; }
      const dr = []; for (let i = 0; i <= 40; i++) dr.push(new THREE.Vector3(-0.07 + i * 0.0035, 0.024 + 0.002 * Math.sin(i), 0.045 * Math.sin(i * 0.8) * Math.cos(i * 0.17)));
      F.mk(THREE, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(dr), 120, 0.0018, 8), gloss('#2b160d', 0.1), g);
      const pool = F.mk(THREE, new THREE.CylinderGeometry(0.02, 0.022, 0.004, 28), gloss('#2b160d', 0.1), g, [-0.045, 0.0025, 0.035]);
    }
    // ---- lights ----
    const key = new THREE.SpotLight('#fbfcff', 11, 0, 0.55, 0.7, 2); key.position.set(-0.55, 0.9, 0.5); key.target.position.set(0, 0.06, 0); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.002;
    const rim = new THREE.DirectionalLight('#9db6ff', 1.6); rim.position.set(0.6, 0.5, -0.7); const hemi = new THREE.HemisphereLight('#c8d4ff', '#4a5a9a', 0.75);
    const LAND = [];
    // slices ease down and settle softly (decelerating landing, tiny settle) so the close-up never jolts
    const soft = (t, t0, H, fall) => { const u = t - t0; if (u < 0) return { y: 1e3, sx: 1, sy: 1, vis: false }; if (u < fall) { const k = u / fall; return { y: H * Math.pow(1 - k, 3), sx: 1, sy: 1, vis: true }; } const v = u - fall, a = Math.exp(-v * 8); return { y: 0.004 * a * Math.abs(Math.sin(v * 16)), sx: 1 + 0.02 * a, sy: 1 - 0.03 * a, vis: true }; };
    function setT(t) {
      const ld = [];
      slices.forEach((s, i) => { const d = soft(t, -0.3 + i * 0.2, 0.16 + 0.03 * i, 0.4); s.visible = d.vis; const u = s.userData; s.position.set(u.ox, u.y + d.y, u.oz); s.rotation.y = u.rot * (d.vis ? 1 : 0) + (1 - Math.min(1, (t + 0.3 - i * 0.2) / 0.4)) * 0.5 * (i % 2 ? 1 : -1); s.scale.set(d.sx, d.sy, d.sx); });
      const list = ['tir', 'rasp', 'blue', 'ban'];
      list.forEach((k) => { const w = W[k]; F.pop(tops[k], t, w[0], w[1]); });
      // the topping stack keeps its own table of landings for the film clock: LAND = [slice landings, topping pops]
      const az = lerp(-0.5, 0.7, eio(seg(t, 0, 3.3))), el = lerp(0.62, 0.9, eio(seg(t, 0, 1.2))) - 0.2 * seg(t, 2.7, 3.3), dist = lerp(0.9, 0.66, eio(seg(t, 0.4, 1.4))) + 0.2 * seg(t, 2.7, 3.3) - 0.02 * Math.sin(t * 1.0);
      const look = [0, 0.065, 0];
      const pos = [look[0] + dist * Math.sin(az) * Math.cos(el), look[1] + dist * Math.sin(el), look[2] + dist * Math.cos(az) * Math.cos(el)];
      return { pos, look, fov: 34 };
    }
    return { group, lights: [key, rim, hemi], bg: '#2c43a8', fog: null, setT, wall };
  } };
