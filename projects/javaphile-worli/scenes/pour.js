// Scene: THE POUR. Barista counter, gooseneck kettle, pour into a white cup, then swoop to a macro top-down on the crema.
// Everything is a pure function of t (stream geometry is rewritten in place each call).
window.SCENES.pour = {
  dur: 8,
  build(THREE, ctx) {
    const C = window.C, { clamp, seg, lerp, eo, eio } = C;
    const group = new THREE.Group();
    const R = C.rng(7);

    // ---------- canvas helpers ----------
    const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
    const tex = (c, srgb = true) => { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };

    // studio-style equirect environment so glossy ceramic / metal / coffee have something to reflect
    const envTex = (() => {
      const [c, g] = cv(1024, 512);
      g.fillStyle = '#0c1718'; g.fillRect(0, 0, 1024, 512);
      g.fillStyle = '#16282a'; g.fillRect(0, 300, 1024, 212);
      const box = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
      box(90, 70, 220, 120, '#f2f7f8');   // large softbox
      box(620, 110, 46, 230, '#a9ccd1');  // strip light
      box(820, 60, 150, 90, '#7fa7ac');
      box(400, 40, 120, 40, '#dfeef0');
      const t = new THREE.CanvasTexture(c); t.mapping = THREE.EquirectangularReflectionMapping; t.colorSpace = THREE.SRGBColorSpace; return t;
    })();
    const std = (o) => { const m = new THREE.MeshStandardMaterial(Object.assign({ envMap: envTex, envMapIntensity: 0.8 }, o)); return m; };

    // slate stone
    const slateTex = (() => {
      const [c, g] = cv(512, 512); g.fillStyle = '#8d96a8'; g.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 9000; i++) { const v = 50 + R() * 40; g.fillStyle = `rgba(${v},${v + 6},${v + 9},${0.18 * R()})`; g.fillRect(R() * 512, R() * 512, 1 + R() * 3, 1 + R() * 2); }
      for (let i = 0; i < 14; i++) { g.strokeStyle = `rgba(20,28,30,${0.05 + 0.08 * R()})`; g.lineWidth = 1 + R() * 2; g.beginPath(); let x = R() * 512, y = R() * 512; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (R() - 0.3) * 120; y += (R() - 0.5) * 60; g.lineTo(x, y); } g.stroke(); }
      const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 2); return t;
    })();
    // white marble
    const marbleTex = (() => {
      const [c, g] = cv(512, 512); g.fillStyle = '#eceeed'; g.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 16; i++) {
        g.strokeStyle = `rgba(${95 + R() * 40},${105 + R() * 40},${110 + R() * 40},${0.12 + 0.3 * R()})`; g.lineWidth = 0.6 + R() * 2.6;
        g.beginPath(); let x = -20, y = R() * 512; g.moveTo(x, y);
        while (x < 540) { x += 18 + R() * 30; y += (R() - 0.5) * 55; g.lineTo(x, y); }
        g.stroke();
      }
      for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(150,160,165,${0.05 * R()})`; g.fillRect(R() * 512, R() * 512, 2, 2); }
      return tex(c);
    })();

    // crema: dark brown with tan swirl arms; texture rotated in setT
    const cremaTex = (() => {
      const N = 1024, [c, g] = cv(N, N), h = N / 2;
      g.fillStyle = '#2c160a'; g.fillRect(0, 0, N, N);
      [['#463a32', 1], ['#392c24', 0.82], ['#2e221a', 0.62], ['#22160e', 0.34]].forEach((s) => { g.fillStyle = s[0]; g.beginPath(); g.arc(h, h, h * s[1], 0, 7); g.fill(); });
      g.lineCap = 'round';
      for (let i = 0; i < 260; i++) {
        const a0 = R() * 6.283, k = 2.2 + R() * 1.6, r0 = 0.04 + R() * 0.5, len = 0.15 + R() * 0.45, w = 3 + R() * 22;
        g.strokeStyle = `rgba(${158 + R() * 18 | 0},${140 + R() * 18 | 0},${124 + R() * 16 | 0},${0.015 + R() * 0.06})`; g.lineWidth = w;
        g.beginPath();
        for (let s = 0; s <= 28; s++) { const r = (r0 + len * s / 28) * h * 0.98, a = a0 + k * (r0 + len * s / 28) * 2.2; const x = h + Math.cos(a) * r, y = h + Math.sin(a) * r; s ? g.lineTo(x, y) : g.moveTo(x, y); }
        g.stroke();
      }
      // a clean pale rosette ring, like a poured pattern
      for (let ring = 0; ring < 5; ring++) {
        g.strokeStyle = `rgba(176,158,140,${0.10 - ring * 0.012})`; g.lineWidth = 10 + ring * 4;
        g.beginPath(); for (let s = 0; s <= 200; s++) { const a = s / 200 * 6.283, r = (0.16 + ring * 0.13 + 0.025 * Math.sin(a * 6 + ring)) * h; const x = h + Math.cos(a) * r, y = h + Math.sin(a) * r; s ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); g.stroke();
      }
      for (let i = 0; i < 900; i++) { const a = R() * 6.283, r = Math.sqrt(R()) * h * 0.97; g.fillStyle = `rgba(182,166,150,${0.03 + 0.08 * R()})`; g.beginPath(); g.arc(h + Math.cos(a) * r, h + Math.sin(a) * r, 0.6 + R() * 2.4, 0, 7); g.fill(); }
      const t = tex(c); t.center.set(0.5, 0.5); return t;
    })();

    // steam wisp
    const steamTex = (() => {
      const [c, g] = cv(128, 256);
      for (let i = 0; i < 70; i++) {
        const f = i / 70, y = 256 - f * 256, x = 64 + Math.sin(f * 7 + 1) * 18 * f + (R() - 0.5) * 10, r = 12 + R() * 16 + f * 10;
        const a = 0.13 * Math.sin(f * 3.14159) + 0.02;
        [1, 0.66, 0.33].forEach((k) => { g.fillStyle = `rgba(235,244,246,${a * 0.5})`; g.beginPath(); g.arc(x, y, r * k, 0, 7); g.fill(); });
      }
      return tex(c);
    })();

    // ---------- environment ----------
    const mSlate = std({ map: slateTex, roughness: 0.62, metalness: 0.0, envMapIntensity: 0.35 });
    const counter = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 2.2), mSlate); counter.position.set(0, -0.03, 0.55); counter.receiveShadow = true; group.add(counter);
    const marble = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.022, 0.26), std({ map: marbleTex, roughness: 0.22, envMapIntensity: 0.6 }));
    marble.position.set(-0.2, 0.011, -0.12); marble.rotation.y = 0.12; marble.castShadow = marble.receiveShadow = true; group.add(marble);
    // backdrop: deep teal fluted wall
    const mWall = std({ color: '#16286a', roughness: 0.5, envMapIntensity: 0.4 });
    const wallBase = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.8, 0.04), std({ color: '#0d1a48', roughness: 0.8, envMapIntensity: 0.2 })); wallBase.position.set(0, 0.9, -0.52); wallBase.receiveShadow = true; group.add(wallBase);
    for (let i = -22; i <= 22; i++) { const f = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1.8, 14), mWall); f.position.set(i * 0.05, 0.9, -0.485); f.castShadow = f.receiveShadow = true; group.add(f); }

    // beans on the marble
    const mBean = std({ color: '#2a170d', roughness: 0.45, envMapIntensity: 0.6 });
    const beanG = new THREE.SphereGeometry(0.0085, 14, 10);
    for (let i = 0; i < 16; i++) {
      const b = new THREE.Mesh(beanG, mBean); b.scale.set(1, 0.62, 0.72);
      b.position.set(-0.3 + R() * 0.2, 0.0227 + 0.004, -0.2 + R() * 0.16); b.rotation.set(0, R() * 6.28, (R() - 0.5) * 0.4); b.castShadow = true; group.add(b);
    }

    // ---------- cup + saucer ----------
    const CUP_Y = 0.006, CUP_H = 0.075, R_OUT = 0.047;
    const ri = (y) => lerp(0.027, 0.0445, Math.pow(clamp((y - 0.011) / (CUP_H - 0.011)), 0.85)); // inner radius at height y
    const mCeramic = std({ color: '#f1f4f3', roughness: 0.1, metalness: 0.0, envMapIntensity: 1.1 });
    const cupPts = [];
    cupPts.push([0, 0], [0.024, 0], [0.027, 0.002], [0.030, 0.006]);
    for (let i = 0; i <= 14; i++) { const f = i / 14; cupPts.push([lerp(0.030, R_OUT, Math.sin(f * 1.5708)), lerp(0.006, CUP_H - 0.002, f)]); }
    cupPts.push([R_OUT, CUP_H - 0.001], [R_OUT - 0.0006, CUP_H + 0.0008], [R_OUT - 0.0017, CUP_H + 0.001], [R_OUT - 0.0025, CUP_H - 0.0004]);
    for (let i = 0; i <= 14; i++) { const y = lerp(CUP_H - 0.0006, 0.011, i / 14); cupPts.push([ri(y), y]); }
    cupPts.push([0.012, 0.0088], [0, 0.0085]);
    const cup = new THREE.Group(); cup.position.set(0, CUP_Y, 0); group.add(cup);
    const cupBody = new THREE.Mesh(new THREE.LatheGeometry(cupPts.map((p) => new THREE.Vector2(p[0], p[1])), 112), mCeramic); cupBody.castShadow = cupBody.receiveShadow = true; cup.add(cupBody);
    { // handle
      const hc = new THREE.CatmullRomCurve3([[0.043, 0.060, 0], [0.066, 0.064, 0], [0.083, 0.052, 0], [0.083, 0.036, 0], [0.066, 0.021, 0], [0.04, 0.019, 0]].map((p) => new THREE.Vector3(...p)));
      const hm = new THREE.Mesh(new THREE.TubeGeometry(hc, 40, 0.0052, 12), mCeramic); hm.scale.set(1, 1, 1.0); hm.castShadow = true; hm.rotation.y = -0.9; cup.add(hm);
    }
    const sPts = [[0, 0], [0.04, 0], [0.074, 0.008], [0.0825, 0.0135], [0.0832, 0.0158], [0.0818, 0.0166], [0.0795, 0.0152], [0.07, 0.0098], [0.045, 0.0062], [0, 0.006]];
    const saucer = new THREE.Mesh(new THREE.LatheGeometry(sPts.map((p) => new THREE.Vector2(p[0], p[1])), 112), mCeramic); saucer.castShadow = saucer.receiveShadow = true; group.add(saucer);

    // coffee surface
    const mCoffee = std({ map: cremaTex, roughness: 0.22, metalness: 0.0, envMapIntensity: 0.9 });
    const surface = new THREE.Mesh(new THREE.CircleGeometry(1, 96), mCoffee); surface.rotation.x = -Math.PI / 2; surface.receiveShadow = true; group.add(surface);
    // ripples + impact foam
    const rippleMat = () => new THREE.MeshBasicMaterial({ color: '#d8b78a', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
    const ripples = [0, 1, 2, 3].map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(0.93, 1, 64), rippleMat()); m.rotation.x = -Math.PI / 2; group.add(m); return m; });
    const foam = new THREE.Mesh(new THREE.CircleGeometry(1, 24), new THREE.MeshBasicMaterial({ color: '#b98d5d', transparent: true, opacity: 0.0, depthWrite: false })); foam.rotation.x = -Math.PI / 2; group.add(foam);

    // ---------- kettle (local origin = body base centre, spout points -x) ----------
    const kettle = new THREE.Group(); group.add(kettle);
    const mKettle = std({ color: '#16191b', roughness: 0.42, metalness: 0.65, envMapIntensity: 1.0 });
    const mBrass = std({ color: '#b08d3c', roughness: 0.3, metalness: 1.0, envMapIntensity: 1.0 });
    const kp = [[0, 0], [0.055, 0], [0.0625, 0.004], [0.066, 0.016], [0.0665, 0.05], [0.0635, 0.09], [0.0555, 0.115], [0.044, 0.13], [0.036, 0.1345], [0.034, 0.138], [0, 0.138]];
    const kBody = new THREE.Mesh(new THREE.LatheGeometry(kp.map((p) => new THREE.Vector2(...p)), 80), mKettle); kBody.castShadow = kBody.receiveShadow = true; kettle.add(kBody);
    const lid = new THREE.Mesh(new THREE.LatheGeometry([[0, 0.1375], [0.036, 0.1375], [0.03, 0.146], [0.012, 0.15], [0.011, 0.156], [0.0145, 0.159], [0.0145, 0.1665], [0.0, 0.1675]].map((p) => new THREE.Vector2(...p)), 40), mKettle); lid.castShadow = true; kettle.add(lid);
    const knob = new THREE.Mesh(new THREE.TorusGeometry(0.0125, 0.0028, 10, 32), mBrass); knob.rotation.x = Math.PI / 2; knob.position.y = 0.1565; kettle.add(knob);
    const TIP = new THREE.Vector3(-0.2, 0.186, 0);
    { const sc = new THREE.CatmullRomCurve3([[-0.05, 0.026, 0], [-0.095, 0.036, 0], [-0.135, 0.075, 0], [-0.152, 0.13, 0], [-0.16, 0.168, 0], [-0.178, 0.186, 0], [TIP.x, TIP.y, 0]].map((p) => new THREE.Vector3(...p)));
      const sp = new THREE.Mesh(new THREE.TubeGeometry(sc, 70, 0.0075, 14), mKettle); sp.castShadow = true; kettle.add(sp);
      const tipRing = new THREE.Mesh(new THREE.TorusGeometry(0.0072, 0.0016, 8, 20), mBrass); tipRing.position.copy(TIP).add(new THREE.Vector3(0.001, 0.0006, 0)); tipRing.rotation.y = Math.PI / 2 - 0.05; tipRing.rotation.x = 0; kettle.add(tipRing);
      const collar = new THREE.Mesh(new THREE.TorusGeometry(0.0085, 0.0025, 8, 20), mBrass); collar.position.set(-0.059, 0.0285, 0); collar.rotation.y = Math.PI / 2 - 0.2; kettle.add(collar);
      const hc = new THREE.CatmullRomCurve3([[0.056, 0.115, 0], [0.105, 0.128, 0], [0.13, 0.09, 0], [0.118, 0.045, 0], [0.066, 0.025, 0]].map((p) => new THREE.Vector3(...p)));
      const hm = new THREE.Mesh(new THREE.TubeGeometry(hc, 50, 0.0085, 12), mKettle); hm.castShadow = true; kettle.add(hm);
    }

    // ---------- stream (rewritten in place) ----------
    const NS = 28, NR = 12;
    const sGeo = new THREE.BufferGeometry();
    const sPos = new Float32Array((NS + 1) * NR * 3); sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    sGeo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array((NS + 1) * NR * 3), 3));
    const idx = []; for (let i = 0; i < NS; i++) for (let j = 0; j < NR; j++) { const a = i * NR + j, b = i * NR + (j + 1) % NR, c = (i + 1) * NR + j, d = (i + 1) * NR + (j + 1) % NR; idx.push(a, c, b, b, c, d); }
    sGeo.setIndex(idx);
    const mStream = std({ color: '#241108', roughness: 0.4, metalness: 0.0, envMapIntensity: 0.25 });
    const stream = new THREE.Mesh(sGeo, mStream); stream.frustumCulled = false; stream.castShadow = false; group.add(stream);

    // ---------- steam ----------
    const wisps = [];
    for (let i = 0; i < 7; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.14), new THREE.MeshBasicMaterial({ map: steamTex, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
      m.userData = { ph: i / 7 + R() * 0.08, ox: (R() - 0.5) * 0.045, oz: (R() - 0.5) * 0.045, sp: 0.16 + R() * 0.08, fl: R() * 6, noInk: true };
      group.add(m); wisps.push(m);
    }

    // ---------- lights (returned, not added to group) ----------
    const key = new THREE.SpotLight('#f3f8ff', 7.5, 0, 0.46, 0.7, 2); key.position.set(-0.55, 1.0, 0.62); key.target.position.set(0.02, 0.05, 0);
    key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.0015; key.shadow.camera.near = 0.4; key.shadow.camera.far = 3; key.shadow.radius = 4;
    const rim = new THREE.DirectionalLight('#9db6ff', 2.2); rim.position.set(0.7, 0.55, -0.8); rim.target.position.set(0, 0.08, 0);
    rim.castShadow = true; rim.shadow.mapSize.set(1024, 1024); rim.shadow.camera.left = -0.4; rim.shadow.camera.right = 0.4; rim.shadow.camera.top = 0.4; rim.shadow.camera.bottom = -0.4; rim.shadow.camera.near = 0.2; rim.shadow.camera.far = 2.5; rim.shadow.bias = -0.0005;
    const top = new THREE.SpotLight('#ffffff', 2.4, 0, 0.5, 0.9, 2); top.position.set(0.12, 0.8, 0.28); top.target.position.set(0, 0.06, 0);
    const hemi = new THREE.HemisphereLight('#9fb4e0', '#0a1415', 0.55);

    // ---------- pure pose function ----------
    const pw = (t) => t;
    const camKeys = {
      A: { p: [0.22, 0.46, 1.05], l: [0.08, 0.12, 0], fov: 33 },
      B: { p: [0.18, 0.40, 0.90], l: [0.07, 0.12, 0], fov: 32 },
      C: { p: [0.10, 0.34, 0.66], l: [0.03, 0.09, 0], fov: 29 },
    };
    const v3 = (a, b, f) => [lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f)];
    const levelAt = (t) => lerp(0.0115, 0.0625, seg(t, 1.8, 6.4));

    function setT(t) {
      // ---- kettle ----
      const appr = eio(seg(t, 0.3, 1.5)), away = eio(seg(t, 6.4, 7.8)), tilt = eio(seg(t, 0.5, 1.7));
      const th = 0.36 * tilt + 0.07 * seg(t, 1.7, 6.3) - 0.38 * eio(seg(t, 6.2, 7.2));
      const tx = 0.004 + 0.14 * (1 - appr) + 0.18 * away, ty = 0.225 + 0.05 * (1 - appr) + 0.14 * away;
      const c = Math.cos(th), s = Math.sin(th);
      kettle.rotation.z = th;
      kettle.position.set(tx - (TIP.x * c - TIP.y * s), ty - (TIP.x * s + TIP.y * c), 0);

      // ---- liquid ----
      const lv = levelAt(t), y = CUP_Y + lv;
      const rad = ri(lv) - 0.0006;
      surface.position.y = y; surface.scale.set(rad, rad, 1);
      surface.visible = t > 1.85;
      cremaTex.rotation = 0.5 * t * (1 - 0.55 * seg(t, 6.5, 10)) + 0.35 * Math.sin(t * 0.7);
      // ---- stream ----
      const head = seg(t, 1.6, 1.85), tail = seg(t, 6.3, 6.6);
      const live = head - tail > 0.01;
      stream.visible = live;
      const impact = head >= 1 && tail < 1;
      if (live) {
        const thin = 1 - 0.35 * seg(t, 5.6, 6.3);
        const x0 = tx, y0 = ty - 0.002, y1 = y + 0.0005;
        const pos = sGeo.attributes.position.array;
        for (let i = 0; i <= NS; i++) {
          const f = lerp(tail, head, i / NS); // 0 at spout, 1 at surface
          const px = x0 + 0.0018 * Math.sin(f * 15 - t * 17) * f + 0.0007 * f, pz = 0.0016 * Math.cos(f * 12 - t * 13) * f;
          const py = lerp(y0, y1, f);
          let r = lerp(0.0042, 0.0021, Math.pow(f, 0.8)) * thin * (1 + 0.1 * Math.sin(f * 36 - t * 28));
          if (i === 0 && tail === 0 && head < 1) r *= 0.5;
          if (f >= 0.999) r *= 1.0;
          for (let j = 0; j < NR; j++) { const a = j / NR * 6.2832; const k = (i * NR + j) * 3; pos[k] = px + Math.cos(a) * r; pos[k + 1] = py; pos[k + 2] = pz + Math.sin(a) * r; }
        }
        sGeo.attributes.position.needsUpdate = true; sGeo.computeVertexNormals();
      }
      // ---- ripples / foam ----
      const imx = tx + 0.0007;
      for (let i = 0; i < ripples.length; i++) {
        const m = ripples[i];
        if (!impact) { m.visible = false; continue; }
        const u = ((t * 0.9 + i / ripples.length) % 1);
        const rr = Math.max(0.0035, u * rad * 0.9);
        m.visible = true; m.position.set(imx, y + 0.0004, 0); m.scale.set(rr, rr, 1);
        m.material.opacity = 0.42 * Math.pow(1 - u, 1.4) * eo(seg(t, 1.85, 2.2)) * (1 - seg(t, 6.3, 6.8));
      }
      foam.visible = impact; foam.position.set(imx, y + 0.0006, 0); const fs = 0.0062 + 0.0012 * Math.sin(t * 22); foam.scale.set(fs, fs, 1); foam.material.opacity = 0.5 * (1 - seg(t, 6.3, 6.8));

      // ---- steam ----
      const k = seg(t, 2.0, 3.6) * (1 - seg(t, 7.4, 9.0));
      // ---- camera ----
      let pos, look, fov;
      if (t < 1.6) { const f = eio(seg(t, 0, 1.6)) * 0.55 + seg(t, 0, 1.6) * 0.45; pos = v3(camKeys.A.p, camKeys.B.p, f); look = v3(camKeys.A.l, camKeys.B.l, f); fov = lerp(camKeys.A.fov, camKeys.B.fov, f); }
      else if (t < 6.5) { const f = seg(t, 1.6, 6.5); const g = lerp(f, eio(f), 0.4); pos = v3(camKeys.B.p, camKeys.C.p, g); look = v3(camKeys.B.l, camKeys.C.l, g); fov = lerp(camKeys.B.fov, camKeys.C.fov, g); }
      else {
        const f = eio(seg(t, 6.5, 10)), f2 = eio(seg(t, 6.5, 9.6));
        const T0 = camKeys.C.l, T1 = [0, CUP_Y + 0.0625, 0.0];
        const tgt = v3(T0, T1, f2);
        const rel0 = [camKeys.C.p[0] - T0[0], camKeys.C.p[1] - T0[1], camKeys.C.p[2] - T0[2]];
        const d0 = Math.hypot(...rel0), pit0 = Math.asin(rel0[1] / d0), yaw0 = Math.atan2(rel0[0], rel0[2]);
        const d = lerp(d0, 0.5, f), pit = lerp(pit0, 1.5533, f), yaw = lerp(yaw0, 0, f);
        pos = [tgt[0] + d * Math.sin(yaw) * Math.cos(pit), tgt[1] + d * Math.sin(pit), tgt[2] + d * Math.cos(yaw) * Math.cos(pit)];
        look = tgt; fov = lerp(camKeys.C.fov, 20, f);
      }
      const dr = 1 - seg(t, 6.5, 9.4) * 0.97, dr0 = 0.5 + 0.5 * dr;
      const hx = (Math.sin(t * 1.3) + 0.6 * Math.sin(t * 2.9 + 1.0)) * 0.0035 * dr0, hy = (Math.sin(t * 1.1 + 2.0) + 0.5 * Math.sin(t * 3.3)) * 0.0028 * dr0, hz = Math.sin(t * 0.9 + 0.5) * 0.004 * dr0;
      pos = [pos[0] + hx, pos[1] + hy, pos[2] + hz]; look = [look[0] + hx * 0.4, look[1] + hy * 0.3, look[2]];

      // steam placed after camera so wisps face it (yaw-only billboard)
      const yawC = Math.atan2(pos[0], pos[2]);
      for (const w of wisps) {
        const d = w.userData, u = (t * d.sp + d.ph) % 1;
        const env = Math.sin(u * Math.PI);
        w.visible = k > 0.001;
        w.position.set(d.ox + 0.012 * Math.sin(u * 5 + d.fl) * u, y + 0.01 + u * 0.15, d.oz);
        w.rotation.y = yawC; w.rotation.z = 0.25 * Math.sin(u * 4 + d.fl);
        const sc = 0.8 + u * 1.5; w.scale.set(sc, sc, 1);
        w.material.opacity = 0.14 * env * env * k;
      }
      return { pos, look, fov };
    }

    return { group, lights: [key, rim, top, hemi], bg: '#16286a', fog: null, setT };
  },
};
