// Scene 4: the jukebox. Procedural three.js only. 7 s. Frame-pure: everything is a function of t.
// 0-1.5 s camera push-in | 1.5-2.4 s finger presses a selector button | 2.4-4.2 s arm lifts a disc to the platter
// 4.2-5 s disc lands and spins up | 5-7 s hold, slow orbit, bulbs chase, equalizer bars on the front panel.
// Palette: navy #0B1233, chrome #EEF2F7, pink #FF3E8A, aqua #4DE3FF. No orange, no cream, no yellow.
(function () {
  const C = window.C;
  const PINK = '#FF3E8A', AQUA = '#4DE3FF', NAVY = '#0B1233', CHROME = '#EEF2F7';

  // 12 equalizer values 0..1: smooth pseudo-random, quiet before 4.2 s, loud after. Exposed for the raea overlay too.
  function eq(t) {
    const out = [];
    const loud = C.eio(C.seg(t, 4.0, 4.9));
    const idle = 0.05 + 0.04 * Math.sin(t * 2.0);
    for (let i = 0; i < 12; i++) {
      const a = Math.sin(t * (5.3 + i * 0.71) + i * 1.9) * 0.5 + 0.5;
      const b = Math.sin(t * (9.1 + i * 0.37) + i * 0.6) * 0.5 + 0.5;
      const body = 0.18 + 0.82 * (0.62 * a + 0.38 * b);
      const shape = 0.55 + 0.45 * Math.sin((i / 11) * Math.PI);          // bass and treble a little lower than mids
      out.push(Math.max(0, Math.min(1, idle + loud * body * shape)));
    }
    return out;
  }
  window.EQ = eq;

  function glowTex(THREE, color, size = 128) {
    const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d');
    const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gr.addColorStop(0, color); gr.addColorStop(0.25, color + '88'); gr.addColorStop(1, color + '00');
    g.fillStyle = gr; g.fillRect(0, 0, size, size);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  // equirect studio for chrome: navy room, white softboxes, a pink strip and an aqua strip
  function envTex(THREE) {
    const W = 1024, H = 512, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#2a3a8a'); bg.addColorStop(0.5, '#10184a'); bg.addColorStop(1, '#05081c');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    const box = (x, y, w, h, col, a) => { g.globalAlpha = a; g.fillStyle = col; g.fillRect(x, y, w, h); g.globalAlpha = 1; };
    box(60, 90, 150, 200, '#ffffff', 1); box(380, 40, 260, 70, '#ffffff', 1); box(820, 100, 120, 220, '#ffffff', 0.95);
    box(250, 150, 36, 260, PINK, 1); box(690, 130, 40, 280, PINK, 1); box(540, 170, 30, 230, AQUA, 1); box(960, 140, 30, 230, AQUA, 1);
    box(0, 300, W, 40, '#6a7bd0', 0.5);
    const t = new THREE.CanvasTexture(c); t.mapping = THREE.EquirectangularReflectionMapping; t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  function backdropTex(THREE) {
    const s = 512, c = document.createElement('canvas'); c.width = c.height = s; const g = c.getContext('2d');
    const gr = g.createRadialGradient(s / 2, s * 0.55, 10, s / 2, s * 0.55, s * 0.72);
    gr.addColorStop(0, '#162070'); gr.addColorStop(0.45, '#0b1244'); gr.addColorStop(1, '#04061a');
    g.fillStyle = gr; g.fillRect(0, 0, s, s);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  function windowTex(THREE) {                       // lit back wall of the record chamber
    const w = 256, h = 512, c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5a2a9a'); gr.addColorStop(0.45, '#d9357f'); gr.addColorStop(1, '#ff7ab0');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const rg = g.createRadialGradient(w / 2, h * 0.55, 5, w / 2, h * 0.55, w * 0.9); rg.addColorStop(0, 'rgba(255,255,255,0.55)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = rg; g.fillRect(0, 0, w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  function discTex(THREE) {                         // vinyl face: dark grooves, two pale sheen wedges (so the spin is visible), pink label
    const s = 512, c = document.createElement('canvas'); c.width = c.height = s; const g = c.getContext('2d'), m = s / 2;
    g.fillStyle = '#0a0a12'; g.fillRect(0, 0, s, s);
    for (let r = 0.36; r < 0.98; r += 0.012) { g.strokeStyle = `rgba(150,160,210,${0.05 + 0.05 * ((r * 97) % 1)})`; g.lineWidth = 1; g.beginPath(); g.arc(m, m, r * m, 0, 7); g.stroke(); }
    for (const a0 of [0.3, 0.3 + Math.PI]) {
      const gr = g.createRadialGradient(m, m, m * 0.3, m, m, m);
      gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(235,242,255,0.38)'); gr.addColorStop(1, 'rgba(255,255,255,0.12)');
      g.fillStyle = gr; g.beginPath(); g.moveTo(m, m); g.arc(m, m, m * 0.98, a0, a0 + 0.42); g.closePath(); g.fill();
    }
    g.fillStyle = PINK; g.beginPath(); g.arc(m, m, m * 0.34, 0, 7); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(m, m, m * 0.30, 0, 7); g.lineWidth = 3; g.strokeStyle = '#ffffff'; g.beginPath(); g.arc(m, m, m * 0.30, 0, 7); g.stroke();
    g.fillStyle = '#0B1233'; g.beginPath(); g.arc(m, m, m * 0.035, 0, 7); g.fill();
    g.fillStyle = '#ffffff'; g.fillRect(m - 3, m * 0.5, 6, m * 0.16);          // small tick on the label: shows rotation
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  }

  window.SCENES.jukebox = {
    dur: 7,
    build(THREE) {
      const group = new THREE.Group();
      const env = envTex(THREE);
      const chrome = new THREE.MeshPhysicalMaterial({ color: CHROME, metalness: 1, roughness: 0.14, envMap: env, envMapIntensity: 1.5, clearcoat: 0.6, clearcoatRoughness: 0.1 });
      const body = new THREE.MeshPhysicalMaterial({ color: '#18205e', metalness: 0.2, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.12, envMap: env, envMapIntensity: 0.9 });
      const dark = new THREE.MeshStandardMaterial({ color: '#05081c', roughness: 0.5, metalness: 0.3 });
      const emis = (col, k = 1) => new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k) });

      // ---------------- backdrop + floor
      const back = new THREE.Mesh(new THREE.PlaneGeometry(12, 14), new THREE.MeshBasicMaterial({ map: backdropTex(THREE), toneMapped: false })); back.position.set(0, 3, -3.2); group.add(back);
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshStandardMaterial({ color: '#060a26', roughness: 0.55, metalness: 0.4, envMap: env, envMapIntensity: 0.15 }));
      floor.rotation.x = -Math.PI / 2; group.add(floor);
      const floorGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(THREE, PINK, 256), blending: THREE.AdditiveBlending, transparent: true, opacity: 0.55, depthWrite: false }));
      floorGlow.scale.set(3.4, 1.1, 1); floorGlow.position.set(0, 0.03, 0.5); group.add(floorGlow);

      // ---------------- cabinet: arched body with a window hole, extruded; front face at z = +0.25
      const HW = 0.55, CY = 1.10, R = HW, DEP = 0.5;                // cabinet half-width, arch centre y, arch radius, depth
      const WR = 0.40;                                              // window arch radius, window bottom
      const WB = 0.90;
      const archShape = (r, yb, cy) => { const s = new THREE.Shape(); s.moveTo(-r, yb); s.lineTo(r, yb); s.lineTo(r, cy); s.absarc(0, cy, r, 0, Math.PI, false); s.lineTo(-r, yb); return s; };
      const bodyShape = archShape(R, 0.10, CY);
      const hole = new THREE.Path(); hole.moveTo(-WR, WB); hole.lineTo(WR, WB); hole.lineTo(WR, CY); hole.absarc(0, CY, WR, 0, Math.PI, false); hole.lineTo(-WR, WB);
      bodyShape.holes.push(hole);
      const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, { depth: DEP, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 4, curveSegments: 48 });
      bodyGeo.translate(0, 0, -DEP / 2);
      const cab = new THREE.Mesh(bodyGeo, body); group.add(cab);
      const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.11, 0.66), chrome); plinth.position.set(0, 0.055, 0); group.add(plinth);
      const kick = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.03, 0.58), dark); kick.position.set(0, 0.125, 0); group.add(kick);

      // chrome rings: outer trim, window frame
      const ringShape = (ro, ri, yb, cy) => { const s = archShape(ro, yb, cy); const h = new THREE.Path(); h.moveTo(-ri, yb); h.lineTo(ri, yb); h.lineTo(ri, cy); h.absarc(0, cy, ri, 0, Math.PI, false); h.lineTo(-ri, yb); s.holes.push(h); return s; };
      const frame = (ro, ri, yb, z, d) => { const m = new THREE.Mesh(new THREE.ExtrudeGeometry(ringShape(ro, ri, yb, CY), { depth: d, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 3, curveSegments: 48 }), chrome); m.position.z = z; group.add(m); return m; };
      frame(R + 0.012, R - 0.026, 0.10, 0.245, 0.03);               // outer trim
      frame(WR + 0.034, WR - 0.002, WB - 0.034, 0.245, 0.03);       // window frame
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.466, 0.011, 16, 80, Math.PI), chrome); band.position.set(0, CY, 0.262); group.add(band);   // chrome torus band round the arch
      for (const sx of [-1, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, CY - 0.62, 20), chrome); p.position.set(sx * 0.466, (CY + 0.62) / 2, 0.262); group.add(p); }
      // pink neon tube hugging the window frame
      const neonPts = []; for (let i = 0; i <= 60; i++) { const a = Math.PI * i / 60; neonPts.push(new THREE.Vector3(Math.cos(a) * (WR + 0.06), CY + Math.sin(a) * (WR + 0.06), 0.262)); }
      const neon = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(neonPts), 80, 0.006, 8), emis(PINK, 1.2)); group.add(neon);

      // ---------------- record chamber: lit back wall, rack of edge-on records, platter, glass
      const wall = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.66), new THREE.MeshBasicMaterial({ map: windowTex(THREE) })); wall.position.set(0, 1.2, -0.2); group.add(wall);
      const chamberLight = new THREE.PointLight('#ff6aa8', 2.2, 1.6, 2); chamberLight.position.set(0, 1.15, 0.1); group.add(chamberLight);
      const vinyl = discTex(THREE);
      const vinylMat = [new THREE.MeshStandardMaterial({ color: '#0a0a12', roughness: 0.35, metalness: 0.4 }), new THREE.MeshStandardMaterial({ map: vinyl, roughness: 0.3, metalness: 0.35, envMap: env, envMapIntensity: 0.6 }), new THREE.MeshStandardMaterial({ map: vinyl, roughness: 0.3, metalness: 0.35 })];
      const discGeo = (r) => { const g = new THREE.CylinderGeometry(r, r, 0.006, 64); g.rotateX(Math.PI / 2); return g; };       // axis along z, caps face +z
      const RACK_N = 10, RACK_Y = 1.37, RACK_Z = -0.12, PICK = 7;
      const rackX = (i) => -0.225 + i * 0.05;
      const rack = [];
      for (let i = 0; i < RACK_N; i++) {
        const d = new THREE.Mesh(discGeo(0.105), vinylMat); d.rotation.y = Math.PI / 2; d.position.set(rackX(i), RACK_Y, RACK_Z); group.add(d); rack.push(d);
        if (i === PICK) d.visible = false;                                               // the animated disc replaces this one
      }
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.012, 0.14), chrome); rail.position.set(0, RACK_Y - 0.115, RACK_Z); group.add(rail);
      const rail2 = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.012, 0.14), chrome); rail2.position.set(0, RACK_Y + 0.11, RACK_Z); group.add(rail2);
      // platter (front-facing turntable), spindle, ring
      const PLAT = new THREE.Vector3(0, 1.065, 0.03);
      const platter = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.02, 64), new THREE.MeshBasicMaterial({ color: '#080c28' })); platter.rotation.x = Math.PI / 2; platter.position.set(PLAT.x, PLAT.y, PLAT.z - 0.02); group.add(platter);
      const pring = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.012, 14, 64), chrome); pring.position.set(PLAT.x, PLAT.y, PLAT.z - 0.008); group.add(pring);
      const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.05, 16), chrome); spindle.rotation.x = Math.PI / 2; spindle.position.set(PLAT.x, PLAT.y, PLAT.z + 0.012); group.add(spindle);
      // the picked disc (animated)
      const disc = new THREE.Group(); const dm = new THREE.Mesh(discGeo(0.165), vinylMat); disc.add(dm); group.add(disc);
      // pick arm: chrome rod from a shoulder pivot to a gripper at the disc
      const SHOULDER = new THREE.Vector3(0.36, 1.16, 0.0);
      const arm = new THREE.Group(); const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 14), chrome); arm.add(rod);
      const grip = new THREE.Mesh(new THREE.SphereGeometry(0.026, 18, 14), chrome); arm.add(grip);
      const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.03, 18, 14), chrome); shoulder.position.copy(SHOULDER); group.add(shoulder); group.add(arm);
      const up = new THREE.Vector3(0, 1, 0), tmpV = new THREE.Vector3();
      const placeArm = (tip) => { tmpV.copy(tip).sub(SHOULDER); const L = tmpV.length(); rod.scale.set(1, L, 1); rod.position.copy(SHOULDER).add(tip).multiplyScalar(0.5); rod.quaternion.setFromUnitVectors(up, tmpV.normalize()); grip.position.copy(tip); };
      // glass over the window + a soft streak
      const glassShape = archShape(WR, WB, CY);
      const glass = new THREE.Mesh(new THREE.ShapeGeometry(glassShape, 48), new THREE.MeshPhysicalMaterial({ color: '#cfe3ff', transparent: true, opacity: 0.08, roughness: 0.04, metalness: 0, envMap: env, envMapIntensity: 1.5, depthWrite: false })); glass.position.z = 0.23; glass.userData.noInk = true; group.add(glass);

      // ---------------- bulbs: up the left side, round the arch, down the right side, chasing
      const bulbPath = [];
      for (let y = 0.66; y < CY; y += 0.07) bulbPath.push([-0.50, y]);
      for (let i = 0; i <= 16; i++) { const a = Math.PI - (Math.PI * i / 16); bulbPath.push([Math.cos(a) * 0.50, CY + Math.sin(a) * 0.50]); }
      for (let y = CY - 0.07; y >= 0.66; y -= 0.07) bulbPath.push([0.50, y]);
      const glowPink = glowTex(THREE, PINK), glowAqua = glowTex(THREE, AQUA), glowWhite = glowTex(THREE, '#ffffff');
      const bulbs = bulbPath.map((p, i) => {
        const kind = i % 3; const col = [PINK, '#ffffff', AQUA][kind];
        const m = new THREE.Mesh(new THREE.SphereGeometry(0.02, 16, 12), new THREE.MeshBasicMaterial({ color: col }));
        m.position.set(p[0], p[1], 0.27); group.add(m);
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: [glowPink, glowWhite, glowAqua][kind], blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 }));
        s.scale.set(0.16, 0.16, 1); s.position.set(p[0], p[1], 0.285); group.add(s);
        return { m, s, col: new THREE.Color(col) };
      });

      // ---------------- selector panel: chrome plate, 2 rows x 8 buttons
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.80, 0.22, 0.02), chrome); plate.position.set(0, 0.76, 0.262); group.add(plate);
      const inset = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.18, 0.012), dark); inset.position.set(0, 0.76, 0.272); group.add(inset);
      const BTN = [], BX = (c) => -0.2975 + c * 0.085, BY = [0.805, 0.715];
      for (let r = 0; r < 2; r++) for (let c = 0; c < 8; c++) {
        const mat = new THREE.MeshStandardMaterial({ color: '#dfe6f5', roughness: 0.25, metalness: 0.5, emissive: new THREE.Color(PINK), emissiveIntensity: 0 });
        const b = new THREE.Mesh(new THREE.CylinderGeometry(0.027, 0.03, 0.026, 28), mat); b.rotation.x = Math.PI / 2; b.position.set(BX(c), BY[r], 0.292); group.add(b);
        BTN.push({ b, mat, r, c });
      }
      const target = BTN.find((o) => o.r === 0 && o.c === 2);
      const TB = target.b.position.clone();
      // finger: chrome stylus with a pink tip, comes in from lower right
      const finger = new THREE.Group();
      const fb = new THREE.Mesh(new THREE.CapsuleGeometry(0.026, 0.55, 8, 20), new THREE.MeshPhysicalMaterial({ color: '#f3f6ff', metalness: 0.6, roughness: 0.2, envMap: env, envMapIntensity: 1 })); fb.position.y = 0.27; finger.add(fb);
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 12), emis(PINK, 1)); finger.add(tip);
      group.add(finger);
      const fdir = new THREE.Vector3(0.55, -0.35, 0.8).normalize();         // stylus axis: from the hand toward the button
      finger.quaternion.setFromUnitVectors(up, fdir);   // local +y is the shaft; it trails back toward the viewer's right/top
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.03, 0.036, 40), new THREE.MeshBasicMaterial({ color: PINK, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })); ring.position.set(TB.x, TB.y, 0.312); group.add(ring);
      const btnGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowPink, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 })); btnGlow.scale.set(0.34, 0.34, 1); btnGlow.position.set(TB.x, TB.y, 0.33); group.add(btnGlow);

      // ---------------- front lower panel: two speaker grilles + 12 equalizer bars
      const lower = new THREE.Mesh(new THREE.BoxGeometry(0.90, 0.36, 0.014), dark); lower.position.set(0, 0.33, 0.262); group.add(lower);
      const lframe = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.40, 0.012), chrome); lframe.position.set(0, 0.33, 0.255); group.add(lframe);
      for (const sx of [-1, 1]) {
        const cx = sx * 0.335, cy = 0.33;
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.013, 14, 48), chrome); rim.position.set(cx, cy, 0.275); group.add(rim);
        const cone = new THREE.Mesh(new THREE.CircleGeometry(0.128, 48), new THREE.MeshStandardMaterial({ color: '#0a0f33', roughness: 0.6, metalness: 0.4 })); cone.position.set(cx, cy, 0.272); group.add(cone);
        for (let k = 1; k <= 4; k++) { const t = new THREE.Mesh(new THREE.TorusGeometry(k * 0.028, 0.0035, 8, 40), chrome); t.position.set(cx, cy, 0.276); group.add(t); }
        const glowD = new THREE.Mesh(new THREE.CircleGeometry(0.02, 20), emis(PINK, 1)); glowD.position.set(cx, cy, 0.277); group.add(glowD);
      }
      const BARS = []; const BAR_MAX = 0.28;
      for (let i = 0; i < 12; i++) {
        const mat = new THREE.MeshBasicMaterial({ color: PINK });
        const m = new THREE.Mesh(new THREE.BoxGeometry(0.026, 1, 0.012), mat); m.position.set(-0.2 + i * 0.0364 + 0.0, 0.2, 0.275); group.add(m);
        const cap = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.01, 0.014), emis('#ffffff', 1)); group.add(cap);
        const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowPink, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.0 })); halo.scale.set(0.14, 0.14, 1); group.add(halo);
        BARS.push({ m, cap, halo, mat, x: -0.2 + i * 0.0364 });
      }
      const baseLine = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.006, 0.013), emis(AQUA, 0.9)); baseLine.position.set(0, 0.19, 0.276); group.add(baseLine);

      // ---------------- lights (physically based units)
      const key = new THREE.DirectionalLight('#ffffff', 2.4); key.position.set(0.8, 2.6, 3.2); key.target.position.set(0, 1.0, 0);
      const fill = new THREE.HemisphereLight('#8fa6ff', '#10133a', 0.9);
      const pinkRim = new THREE.PointLight(PINK, 9, 6, 2); pinkRim.position.set(-1.5, 1.3, 0.2);
      const aquaRim = new THREE.PointLight(AQUA, 7, 6, 2); aquaRim.position.set(1.6, 1.4, -0.6);
      const front = new THREE.PointLight('#ffffff', 3.0, 7, 2); front.position.set(0, 1.6, 2.6);

      const setT = (t) => {
        // ---- bulbs chase
        const N = bulbs.length;
        bulbs.forEach((b, i) => {
          const ph = ((i / N) - t * 0.65) % 1; const w = ((ph + 1) % 1);
          const head = Math.max(0, 1 - Math.min(w, 1 - w) * 7);            // a bright head with a tail, running round the loop
          const base = 0.28 + 0.12 * Math.sin(t * 3 + i);
          const v = Math.min(1, base * (t < 0.2 ? C.seg(t, 0, 0.2) : 1) + head);
          b.m.material.color.copy(b.col).multiplyScalar(0.35 + 0.9 * v); b.s.material.opacity = 0.15 + 0.85 * v; b.s.scale.setScalar(0.10 + 0.12 * v);
        });
        // ---- finger and button
        const approach = C.eo(C.seg(t, 1.5, 1.9)), press = C.eio(C.seg(t, 1.92, 2.04)), release = C.eio(C.seg(t, 2.1, 2.4));
        const near = TB.clone().add(new THREE.Vector3(0, 0, 0.018));                  // tip rests just off the button face
        const far = near.clone().add(fdir.clone().multiplyScalar(0.95));              // start well out of the frame, lower right toward the viewer
        let amt = approach * (1 - release);                                           // 0 far .. 1 touching
        const pr = press * (1 - C.eio(C.seg(t, 2.04, 2.2)));                           // press depth 0..1..0
        const tipPos = far.clone().lerp(near, amt); tipPos.addScaledVector(fdir, -0.0).z -= 0.0; tipPos.z -= 0.016 * pr;
        finger.position.copy(tipPos); finger.visible = t > 1.45 && t < 2.45;
        target.b.position.z = 0.292 - 0.016 * pr;
        const lit = C.eo(C.seg(t, 2.0, 2.15));
        target.mat.emissiveIntensity = 2.2 * lit; target.mat.color.set(lit > 0.01 ? '#ff9cc0' : '#dfe6f5');
        btnGlow.material.opacity = lit * (0.85 + 0.15 * Math.sin(t * 8)); ring.visible = t > 2.0 && t < 2.8;
        const rr = C.seg(t, 2.02, 2.7); ring.scale.setScalar(1 + 5 * C.eo(rr)); ring.material.opacity = 0.9 * (1 - rr) * (rr > 0 ? 1 : 0);
        BTN.forEach((o) => { if (o !== target) o.mat.emissiveIntensity = 0.0; });
        // flash through the bulbs when the song is chosen
        const flash = Math.exp(-Math.max(0, t - 2.05) * 5) * (t >= 2.05 ? 1 : 0);
        bulbs.forEach((b, i) => { if (flash > 0.02) b.s.material.opacity = Math.min(1, b.s.material.opacity + flash); });
        chamberLight.intensity = 2.2 + 3 * flash + 1.2 * C.eio(C.seg(t, 4.2, 5));

        // ---- the disc and the arm
        const pStart = new THREE.Vector3(rackX(PICK), RACK_Y, RACK_Z);
        const pOut = new THREE.Vector3(rackX(PICK), RACK_Y + 0.02, 0.06);              // slid forward out of the rack
        const pOver = new THREE.Vector3(0.0, PLAT.y + 0.16, 0.12);                      // above the platter, nearer the glass
        const pPlat = new THREE.Vector3(PLAT.x, PLAT.y, PLAT.z + 0.0125);
        const rest = new THREE.Vector3(0.33, 1.30, 0.02);
        let pos = pStart.clone(), rotY = Math.PI / 2, scl = 0.64, tipArm = rest.clone(), armOn = false;
        if (t < 2.4) { pos.copy(pStart); rotY = Math.PI / 2; scl = 0.64; }
        else if (t < 2.85) { const k = C.eio(C.seg(t, 2.4, 2.85)); tipArm = rest.clone().lerp(pStart.clone().add(new THREE.Vector3(0, 0.1, 0.03)), k); armOn = true; pos.copy(pStart); }
        else if (t < 3.25) { const k = C.eio(C.seg(t, 2.85, 3.25)); pos = pStart.clone().lerp(pOut, k); tipArm = pos.clone().add(new THREE.Vector3(0, 0.1, 0.03)); armOn = true; scl = 0.64; }
        else if (t < 3.95) {
          const k = C.eio(C.seg(t, 3.25, 3.95)); pos = pOut.clone().lerp(pOver, k); pos.y += 0.10 * Math.sin(Math.PI * k);
          rotY = Math.PI / 2 * (1 - k); scl = C.lerp(0.64, 1, k); tipArm = pos.clone().add(new THREE.Vector3(0.02, 0.09 * scl + 0.06 * (1 - k), 0.0)); armOn = true;
        }
        else if (t < 4.25) {
          const k = C.eob(C.seg(t, 3.95, 4.25), 1.1); pos = pOver.clone().lerp(pPlat, k); rotY = 0; scl = 1; tipArm = pos.clone().add(new THREE.Vector3(0.02, 0.16, 0.0)); armOn = true;
        }
        else { pos.copy(pPlat); rotY = 0; scl = 1; const k = C.eio(C.seg(t, 4.25, 4.95)); tipArm = pPlat.clone().add(new THREE.Vector3(0.02, 0.16, 0)).lerp(rest, k); armOn = k < 1; }
        // tiny settle bounce when it lands
        if (t >= 4.2 && t < 4.7) pos.z += 0.012 * Math.exp(-(t - 4.2) * 9) * Math.cos((t - 4.2) * 28);
        disc.position.copy(pos); disc.rotation.set(0, rotY, 0); disc.scale.setScalar(scl);
        const spin = t < 4.2 ? 0 : (() => { const u = t - 4.2; const ramp = Math.min(u, 0.8); return -(0.5 * ramp * ramp / 0.8 * 7.0 + Math.max(0, u - 0.8) * 7.0) * 1.0; })();
        dm.rotation.z = 0; dm.rotation.y = 0;                                           // cylinder axis is z: spin about it via the mesh's own local axis
        dm.rotation.set(0, 0, spin);
        arm.visible = armOn; shoulder.visible = true; if (armOn) placeArm(tipArm); else placeArm(rest);
        arm.visible = true;

        // ---- equalizer bars
        const e = eq(t);
        BARS.forEach((b, i) => {
          const h = 0.012 + BAR_MAX * e[i]; b.m.scale.y = h; b.m.position.y = 0.19 + h / 2;
          const hot = e[i]; b.mat.color.set(PINK).lerp(new THREE.Color('#ffffff'), Math.max(0, hot - 0.65) * 1.8);
          b.cap.position.set(b.x, 0.19 + h + 0.006, 0.276); b.halo.position.set(b.x, 0.19 + h * 0.6, 0.29); b.halo.material.opacity = 0.55 * e[i]; b.halo.scale.set(0.12, 0.1 + 0.4 * e[i], 1);
        });

        // ---- camera
        const push = C.eio(C.seg(t, 0, 1.5));
        let pos3, look, fov = 34;
        const wide = { p: [0.0, 1.05, 5.8], l: [0, 0.9, 0] }, mid = { p: [0.0, 1.0, 4.2], l: [0, 0.86, 0.1] };
        if (t < 1.5) { pos3 = wide.p.map((v, i) => C.lerp(v, mid.p[i], push)); look = wide.l.map((v, i) => C.lerp(v, mid.l[i], push)); }
        else if (t < 2.4) { const k = C.eio(C.seg(t, 1.5, 2.4)); pos3 = [C.lerp(mid.p[0], 0.05, k), mid.p[1], C.lerp(mid.p[2], 3.95, k)]; look = [C.lerp(mid.l[0], -0.03, k), 0.84, 0.1]; }
        else {
          const k = C.eio(C.seg(t, 2.4, 3.9)); const orb = C.seg(t, 4.6, 7.0);
          const ang = Math.sin(orb * Math.PI) * 0.0 + (orb - 0.0) * 0.30 - 0.04;             // slow orbit
          const dist = C.lerp(3.95, 3.85, C.eio(C.seg(t, 2.4, 4.4))) - 0.15 * C.seg(t, 5, 7);
          const ly = C.lerp(0.84, 0.88, k);
          pos3 = [Math.sin(ang) * dist, C.lerp(1.0, 1.1, k), Math.cos(ang) * dist]; look = [0, ly, 0.08];
        }
        return { pos: pos3, look, fov, near: 0.05, far: 60 };
      };
      return { group, lights: [key, key.target, fill, pinkRim, aquaRim, front], bg: NAVY, fog: null, setT };
    },
  };
})();
