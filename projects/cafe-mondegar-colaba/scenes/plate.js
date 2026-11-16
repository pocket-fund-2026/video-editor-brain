// Scene 5: the plate. White enamel Irani-cafe plate on dark slate: two toast slices, two fried eggs, a mound of kheema ghotala, steam.
// Frame-pure: everything is a function of t (seconds). Metres, y up. dur 7 s.
window.SCENES.plate = {
  dur: 7,
  build(THREE, ctx) {
    const C = window.C, { clamp, seg, lerp, eo, eio, eob, rng } = C;
    const R_PLATE = 0.15;
    const group = new THREE.Group();
    const PINK = '#FF3E8A', NAVY = '#0B1233';

    // ---------------------------------------------------------------- environment (soft studio reflections, no PMREM needed)
    function envTex() {
      const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const g = c.getContext('2d');
      const bg = g.createLinearGradient(0, 0, 0, 512); bg.addColorStop(0, '#dfe5f2'); bg.addColorStop(0.4, '#8f9ac0'); bg.addColorStop(0.55, '#1a2146'); bg.addColorStop(1, '#070b20');
      g.fillStyle = bg; g.fillRect(0, 0, 1024, 512);
      const spot = (x, y, r, col, a) => { const rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, col.replace('A', a)); rg.addColorStop(1, col.replace('A', 0)); g.fillStyle = rg; g.fillRect(0, 0, 1024, 512); };
      spot(250, 130, 190, 'rgba(255,255,255,A)', 0.95);   // big softbox upper left
      spot(250, 130, 90, 'rgba(255,255,255,A)', 1);
      spot(780, 250, 70, 'rgba(255,62,138,A)', 0.9);       // small pink strip low behind
      spot(520, 20, 300, 'rgba(255,255,255,A)', 0.7);       // overhead sheen
      const t = new THREE.CanvasTexture(c); t.mapping = THREE.EquirectangularReflectionMapping; t.colorSpace = THREE.SRGBColorSpace; return t;
    }
    const env = envTex();

    // ---------------------------------------------------------------- table: dark navy slate with veins
    function slateTex() {
      const c = document.createElement('canvas'); c.width = 1024; c.height = 1024; const g = c.getContext('2d'); const r = rng(11);
      g.fillStyle = '#0d1430'; g.fillRect(0, 0, 1024, 1024);
      for (let i = 0; i < 70; i++) { const x = r() * 1024, y = r() * 1024, rad = 60 + r() * 200; const rg = g.createRadialGradient(x, y, 0, x, y, rad); const l = r() < 0.5; rg.addColorStop(0, l ? 'rgba(40,52,100,0.18)' : 'rgba(0,0,10,0.2)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(0, 0, 1024, 1024); }
      g.lineCap = 'round';
      for (let i = 0; i < 16; i++) {
        let x = r() * 1024, y = r() * 1024, a = r() * 6.28; g.beginPath(); g.moveTo(x, y);
        for (let k = 0; k < 24; k++) { a += (r() - 0.5) * 0.7; x += Math.cos(a) * 34; y += Math.sin(a) * 34; g.lineTo(x, y); }
        g.strokeStyle = 'rgba(190,205,255,' + (0.05 + r() * 0.09) + ')'; g.lineWidth = 0.6 + r() * 1.6; g.stroke();
      }
      for (let i = 0; i < 4000; i++) { g.fillStyle = 'rgba(200,210,255,' + r() * 0.07 + ')'; g.fillRect(r() * 1024, r() * 1024, 1.5, 1.5); }
      const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
    }
    const table = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshPhysicalMaterial({ map: slateTex(), roughness: 0.55, metalness: 0.1, clearcoat: 0, envMap: env, envMapIntensity: 0.15 }));
    table.rotation.x = -Math.PI / 2; table.receiveShadow = true; group.add(table);

    // ---------------------------------------------------------------- plate: white enamel, navy rim line
    const topPts = [[0, 0.006], [0.07, 0.006], [0.105, 0.0085], [0.125, 0.014], [0.145, 0.0235], [0.1515, 0.025]];
    const topCurve = new THREE.SplineCurve(topPts.map((p) => new THREE.Vector2(p[0], p[1])));
    const profile = topCurve.getPoints(60).concat([[0.1525, 0.0235], [0.150, 0.021], [0.13, 0.011], [0.09, 0.004], [0.06, 0.0], [0.0, 0.0]].map((p) => new THREE.Vector2(p[0], p[1])));
    const plateG = new THREE.Group();
    const plate = new THREE.Mesh(new THREE.LatheGeometry(profile, 96), new THREE.MeshPhysicalMaterial({ color: '#F4F7FA', roughness: 0.22, metalness: 0, clearcoat: 0.9, clearcoatRoughness: 0.1, envMap: env, envMapIntensity: 0.55, side: THREE.DoubleSide }));
    plate.castShadow = plate.receiveShadow = true; plateG.add(plate);
    const band = topCurve.getPoints(120).filter((p) => p.x > 0.131 && p.x < 0.1385).map((p) => new THREE.Vector2(p.x, p.y + 0.0004));
    const bandM = new THREE.Mesh(new THREE.LatheGeometry(band, 96), new THREE.MeshPhysicalMaterial({ color: '#13224f', roughness: 0.3, clearcoat: 0.8, envMap: env, side: THREE.DoubleSide }));
    plateG.add(bandM); group.add(plateG);
    const surfY = (rr) => { const pts = topCurve.getPoints(200); let best = pts[0]; for (const p of pts) if (Math.abs(p.x - rr) < Math.abs(best.x - rr)) best = p; return best.y; };

    // ---------------------------------------------------------------- toast
    const BW = 0.078, BH = 0.078;
    function trace(p, w, h, tx) { // tx maps shape coords to the target space (identity for THREE.Shape)
      const r = 0.012, X = (x) => tx.x(x), Y = (y) => tx.y(y), k = (x, y) => [X(x), Y(y)];
      const m = (x, y) => p.moveTo(...k(x, y)), l = (x, y) => p.lineTo(...k(x, y)), q = (cx, cy, x, y) => p.quadraticCurveTo(...k(cx, cy), ...k(x, y)), b = (a, bb, c, d, e, f) => p.bezierCurveTo(...k(a, bb), ...k(c, d), ...k(e, f));
      m(-w / 2 + r, -h / 2); l(w / 2 - r, -h / 2); q(w / 2, -h / 2, w / 2, -h / 2 + r); l(w / 2, h * 0.08);
      b(w / 2 + 0.010, h * 0.16, w / 2 + 0.008, h / 2 - 0.004, w * 0.22, h / 2); l(-w * 0.22, h / 2);
      b(-w / 2 - 0.008, h / 2 - 0.004, -w / 2 - 0.010, h * 0.16, -w / 2, h * 0.08); l(-w / 2, -h / 2 + r); q(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    }
    const TW = BW + 0.022, TH = BH + 0.014, TX0 = -TW / 2, TY0 = -TH / 2; // bounds incl. bulge
    function toastTex(seed) {
      const S = 512, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'); const r = rng(seed);
      const tx = { x: (x) => ((x - TX0) / TW) * S, y: (y) => (1 - (y - TY0) / TH) * S };
      g.fillStyle = '#7a4a22'; g.fillRect(0, 0, S, S);
      g.save(); g.beginPath(); trace(g, BW, BH, tx); g.closePath(); g.clip();
      const gr = g.createRadialGradient(S * 0.5, S * 0.5, 10, S * 0.5, S * 0.5, S * 0.55); gr.addColorStop(0, '#e0b366'); gr.addColorStop(0.6, '#cf9a4a'); gr.addColorStop(1, '#b57a32');
      g.fillStyle = gr; g.fillRect(0, 0, S, S);
      for (let i = 0; i < 700; i++) { const a = r(); g.fillStyle = a < 0.5 ? 'rgba(120,70,20,' + (0.05 + r() * 0.12) + ')' : 'rgba(255,225,160,' + (0.05 + r() * 0.12) + ')'; g.beginPath(); g.arc(r() * S, r() * S, 1 + r() * 3.5, 0, 6.28); g.fill(); }
      g.lineJoin = 'round'; g.strokeStyle = '#8b5524'; g.lineWidth = 40; g.beginPath(); trace(g, BW, BH, tx); g.closePath(); g.stroke();
      g.strokeStyle = 'rgba(70,35,10,0.35)'; g.lineWidth = 12; g.stroke();
      g.restore();
      const t = new THREE.CanvasTexture(g.canvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
    }
    function toastMesh(seed) {
      const sh = new THREE.Shape(); trace(sh, BW, BH, { x: (x) => x, y: (y) => y }); sh.closePath();
      const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.011, bevelEnabled: true, bevelThickness: 0.0018, bevelSize: 0.0022, bevelSegments: 3, curveSegments: 18 });
      const pos = geo.attributes.position, uv = geo.attributes.uv;
      for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) - TX0) / TW, (pos.getY(i) - TY0) / TH);
      geo.rotateX(-Math.PI / 2); geo.computeBoundingBox(); geo.translate(0, -geo.boundingBox.min.y, 0); geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: toastTex(seed), roughness: 0.85, metalness: 0, envMap: env, envMapIntensity: 0.25 }));
      m.castShadow = m.receiveShadow = true; return m;
    }
    const toastA = toastMesh(3), toastB = toastMesh(8);
    group.add(toastA, toastB);

    // ---------------------------------------------------------------- fried eggs
    function eggMesh(R, seed) {
      const r = rng(seed), ph = [r() * 6.28, r() * 6.28, r() * 6.28], NR = 22, NA = 72, pos = [], col = [], idx = [];
      const outline = (a) => R * (1 + 0.15 * Math.sin(2 * a + ph[0]) + 0.10 * Math.sin(3 * a + ph[1]) + 0.05 * Math.sin(5 * a + ph[2]));
      for (let i = 0; i <= NR; i++) for (let j = 0; j < NA; j++) {
        const s = i / NR, a = (j / NA) * 6.2832, rr = s * outline(a);
        const h = 0.0013 + 0.0046 * Math.pow(Math.max(0, 1 - s * s), 0.7) + 0.0006 * Math.sin(a * 3 + s * 6 + ph[0]) * (1 - s);
        pos.push(Math.cos(a) * rr, h, Math.sin(a) * rr);
        const edge = clamp((s - 0.88) / 0.1), c = new THREE.Color('#FBFAF3').lerp(new THREE.Color('#D9B26A'), edge * 0.85); col.push(c.r, c.g, c.b);
      }
      for (let i = 0; i < NR; i++) for (let j = 0; j < NA; j++) { const a = i * NA + j, b = i * NA + ((j + 1) % NA), c = (i + 1) * NA + j, d = (i + 1) * NA + ((j + 1) % NA); idx.push(a, c, b, b, c, d); }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.setIndex(idx); geo.computeVertexNormals();
      const white = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.2, envMap: env, envMapIntensity: 0.9, side: THREE.DoubleSide }));
      const yolk = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 24), new THREE.MeshPhysicalMaterial({ color: '#F3B31A', roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.05, envMap: env, envMapIntensity: 1.4 }));
      yolk.scale.set(R * 0.40, R * 0.27, R * 0.40); yolk.position.set(R * 0.06, 0.0052, -R * 0.04);
      white.castShadow = white.receiveShadow = true; yolk.castShadow = true;
      const g = new THREE.Group(); g.add(white, yolk); g.userData = { yolk, R }; return g;
    }
    const egg1 = eggMesh(0.044, 5), egg2 = eggMesh(0.036, 9);
    group.add(egg1, egg2);

    // ---------------------------------------------------------------- kheema ghotala: instanced blobs
    const blobGeo = new THREE.IcosahedronGeometry(1, 2);
    { const p = blobGeo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = Math.sin(v.x * 3.1 + 1.3) * Math.cos(v.y * 2.7 - 0.4) + 0.6 * Math.sin(v.z * 4.3 + v.x * 1.7); v.multiplyScalar(1 + 0.22 * n); p.setXYZ(i, v.x, v.y, v.z); } blobGeo.computeVertexNormals(); }
    const N = 900, KC = { x: 0.0, z: -0.047 }, RM = 0.055;
    const blobMat = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.35, envMap: env, envMapIntensity: 0.8 });
    const blobs = new THREE.InstancedMesh(blobGeo, blobMat, N); blobs.castShadow = blobs.receiveShadow = true;
    const kr = rng(21), data = [];
    const palette = [['#7a2a14', 0.24], ['#8f3d1e', 0.16], ['#4d2616', 0.18], ['#d8b23a', 0.19], ['#ecd079', 0.12], ['#3f8a2c', 0.07]];
    const pick = () => { let a = kr(), s = 0; for (const [c, w] of palette) { s += w; if (a <= s) return c; } return palette[0][0]; };
    const baseY = 0.0075;
    for (let i = 0; i < N; i++) {
      const ang = kr() * 6.2832, u = Math.sqrt(kr()), rr = RM * u;
      const H = 0.040 * Math.pow(Math.max(0, 1 - (rr / RM) * (rr / RM)), 0.7);
      const surface = kr() < 0.7; const yy = baseY + (surface ? H : H * kr()) + 0.002;
      const col = pick(), green = col === '#3f8a2c', yellow = col === '#d8b23a' || col === '#ecd079';
      const sz = green ? 0.0036 + kr() * 0.002 : yellow ? 0.0065 + kr() * 0.0035 : 0.0052 + kr() * 0.0036;
      data.push({ x: KC.x + Math.cos(ang) * rr, y: yy, z: KC.z + Math.sin(ang) * rr, sz, col: new THREE.Color(col), rx: kr() * 6.28, ry: kr() * 6.28, rz: kr() * 6.28, sx: 0.8 + kr() * 0.6, sy: green ? 0.35 : 0.7 + kr() * 0.35, sz2: 0.8 + kr() * 0.5, from: { x: -0.025 - kr() * 0.02, y: 0.03 + kr() * 0.02, z: 0.02 } });
    }
    data.sort((a, b) => a.y - b.y); data.forEach((d, i) => { d.t0 = 3.2 + 1.35 * Math.pow(i / N, 0.9); blobs.setColorAt(i, d.col); });
    blobs.instanceColor.needsUpdate = true; group.add(blobs);
    const core = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 20), new THREE.MeshPhysicalMaterial({ color: '#6e2616', roughness: 0.4, clearcoat: 0.5, envMap: env, envMapIntensity: 0.6 }));
    core.castShadow = true; group.add(core);
    const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3();

    // ---------------------------------------------------------------- steam sprites
    const sc = document.createElement('canvas'); sc.width = sc.height = 128; { const g = sc.getContext('2d'); const rg = g.createRadialGradient(64, 64, 0, 64, 64, 64); rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(0.45, 'rgba(255,255,255,0.35)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.fillRect(0, 0, 128, 128); }
    const steamTex = new THREE.CanvasTexture(sc);
    const steam = [];
    const emitters = [{ x: 0.004, z: -0.045, y: 0.045, ph: 0 }, { x: -0.012, z: -0.04, y: 0.04, ph: 2.1 }, { x: 0.04, z: 0.058, y: 0.016, ph: 4.0 }];
    emitters.forEach((e, ei) => { for (let i = 0; i < 12; i++) { const m = new THREE.SpriteMaterial({ map: steamTex, transparent: true, depthWrite: false, opacity: 0, color: '#eef2ff' }); const s = new THREE.Sprite(m); s.userData = { e, i, n: 12 }; group.add(s); steam.push(s); } });

    // ---------------------------------------------------------------- lights
    const key = new THREE.DirectionalLight('#fff6ea', 3.6); key.position.set(-0.7, 1.4, 0.7); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048); const sh = key.shadow.camera; sh.left = -0.28; sh.right = 0.28; sh.top = 0.28; sh.bottom = -0.28; sh.near = 0.2; sh.far = 3.5; key.shadow.bias = -0.0004; key.shadow.normalBias = 0.0015; key.shadow.radius = 4;
    const rim = new THREE.DirectionalLight(PINK, 2.2); rim.position.set(0.3, 0.12, -1.4);
    const rim2 = new THREE.PointLight(PINK, 0.0, 0.9, 1.5); rim2.position.set(0.05, 0.05, -0.3);
    const fill = new THREE.HemisphereLight('#a9b6ff', '#0B1233', 0.55);
    const kick = new THREE.DirectionalLight('#cfd8ff', 0.7); kick.position.set(1.2, 0.8, 0.6);

    // ---------------------------------------------------------------- animation
    const bounce = (t, t0, h, dur) => { // fall from h to 0 with gravity, then two damped bounces; returns {y, q} where q is a squash amount on impact
      const u = t - t0; if (u < 0) return { y: h, q: 0, vis: false };
      const fall = dur; if (u < fall) { const k = u / fall; return { y: h * (1 - k * k), q: 0, vis: true }; }
      const v = u - fall; const b1 = 0.07 * h * Math.abs(Math.sin(v * 14)) * Math.exp(-v * 7);
      return { y: b1, q: Math.exp(-v * 11) * Math.cos(v * 26) * 0.5 + 0.0, vis: true };
    };
    const setEgg = (egg, t, t0, x, z, rotY, R) => {
      const b = bounce(t, t0, 0.18, 0.2); egg.visible = b.vis; if (!b.vis) return;
      const rest = surfY(Math.hypot(x, z)) + 0.0004;
      const q = b.q; egg.position.set(x, rest + b.y, z); egg.rotation.set(0, rotY, 0);
      egg.scale.set(1 + 0.22 * q, 1 - 0.45 * Math.abs(q) + 0.2 * Math.min(0, q), 1 + 0.22 * q);
      const w = Math.max(0, t - (t0 + 0.2)), yk = egg.userData.yolk; const wob = Math.sin(w * 20) * Math.exp(-w * 3.2) * 0.22; // yolk jiggle
      yk.scale.set(R * 0.40 * (1 + wob), R * 0.27 * (1 - wob * 1.2), R * 0.40 * (1 + wob)); yk.position.y = 0.0052 + 0.0012 * wob;
    };
    function setT(t) {
      // plate settles in (0-0.8)
      const pb = bounce(t, 0, 0.09, 0.34); plateG.position.y = pb.y; plateG.rotation.z = Math.sin(t * 22) * 0.012 * Math.exp(-t * 4.2);
      plateG.rotation.x = Math.cos(t * 19) * 0.01 * Math.exp(-t * 4.2);
      const py = plateG.position.y; // everything on the plate rides with the settle after it lands (plate is on the table first)
      // toast slide-in
      const a = eo(seg(t, 0.8, 1.45)), b = eo(seg(t, 1.1, 1.8));
      toastA.visible = t >= 0.8; toastB.visible = t >= 1.1;
      toastA.position.set(-0.085 - (1 - a) * 0.34, surfY(0.1) + 0.0008 + py * 0, 0.03); toastA.rotation.set(0.0, 0.32 + (1 - a) * 0.5, 0.03 * Math.sin(a * 3));
      toastB.position.set(-0.052 - (1 - b) * 0.36, surfY(0.08) + 0.0108 + py * 0, 0.058); toastB.rotation.set(0.0, -0.18 - (1 - b) * 0.45, -0.07 + 0.04 * Math.sin(b * 3));
      // eggs
      setEgg(egg1, t, 2.0, 0.046, 0.066, 0.5, 0.044); setEgg(egg2, t, 2.45, 0.082, -0.016, 2.0, 0.036);
      // kheema
      let pr = seg(t, 3.2, 4.0); core.visible = pr > 0; const cs = eob(pr, 1.2); core.position.set(KC.x, baseY + 0.001, KC.z); core.scale.set(RM * 0.82 * cs, 0.016 * cs, RM * 0.82 * cs);
      for (let i = 0; i < N; i++) {
        const d = data[i], k = seg(t, d.t0, d.t0 + 0.2), e = eo(k), s = d.sz * eob(k, 1.6);
        _p.set(lerp(d.from.x + d.x, d.x, e), lerp(d.y + d.from.y, d.y, e), lerp(d.z + d.from.z, d.z, e)); _e.set(d.rx, d.ry, d.rz); _q.setFromEuler(_e);
        _s.set(s * d.sx, Math.max(1e-5, s * d.sy), s * d.sz2); _m.compose(_p, _q, k > 0 ? _s : _s.set(1e-6, 1e-6, 1e-6)); blobs.setMatrixAt(i, _m);
      }
      blobs.instanceMatrix.needsUpdate = true;
      // steam
      const ramp = eo(seg(t, 4.3, 5.2));
      for (const s of steam) {
        const { e, i, n } = s.userData, life = 2.6, age = ((t * 0.9 - e.ph * 0.2 + i / n) % 1 + 1) % 1;
        s.position.set(e.x + 0.014 * Math.sin(age * 7 + e.ph + i * 0.3) * (0.4 + age), e.y + age * 0.17, e.z + 0.006 * Math.cos(age * 5 + e.ph));
        const sc = 0.022 + age * 0.07; s.scale.set(sc, sc, 1); s.material.opacity = 0.34 * Math.sin(Math.PI * age) * ramp * (e.y > 0.03 ? 1 : 0.6);
      }
      // camera: slow orbit, slow push-in, pitch eases down
      const u = clamp(t / 7), az = lerp(-0.24, 0.26, eio(u)), pitch = lerp(66, 54, eio(u)) * Math.PI / 180, dist = lerp(1.16, 0.98, eio(u));
      const look = [0.0, 0.012, 0.0];
      const pos = [look[0] + dist * Math.sin(az) * Math.cos(pitch), look[1] + dist * Math.sin(pitch), look[2] + dist * Math.cos(az) * Math.cos(pitch)];
      return { pos, look, fov: 31, near: 0.1, far: 8 };
    }
    return { group, lights: [key, rim, rim2, fill, kick], bg: NAVY, fog: [1.8, 4.2], setT };
  },
};
