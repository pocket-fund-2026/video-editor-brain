// Scene: ROAST. A coffee roaster drum seen through its glass face; the beans tumble and turn from green to brown, driven by the voice cues
// (TIMING.cues.roast = the word "roasts": browning + curve start; TIMING.cues.crack = the word "coffee": first-crack pop + camera shake).
// Local time t = film time - 10.0. Units: cm. The HTML overlay (roast curve, dial, menu card) reads api.u(t) / api.p(t) from this module.
(function () {
window.SCENES.roast = { dur: 5.0, build(THREE, ctx) {
  const { clamp, seg, lerp, eio, eo, rng } = window.C;
  const T0 = 10.0, TM = window.TIMING.cues;
  const CUE = { roast: TM.roast - T0, crack: TM.crack - T0, menu: TM.menu - T0 };
  const PI = Math.PI, group = new THREE.Group(), R = rng(21);
  const std = (c, r = 0.6, m = 0, ex) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: r, metalness: m }, ex || {}));
  const mesh = (g, m, parent, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); (parent || group).add(o); return o; };

  // wall with a graph grid (the "roast log" paper behind the machine), floor
  const gc = document.createElement('canvas'); gc.width = gc.height = 512; { const x = gc.getContext('2d'); x.fillStyle = '#3F3A3A'; x.fillRect(0, 0, 512, 512); x.strokeStyle = '#4c4646'; x.lineWidth = 2;
    for (let i = 0; i <= 512; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 512); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(512, i); x.stroke(); }
    x.strokeStyle = '#5a5353'; x.lineWidth = 3; for (let i = 0; i <= 512; i += 128) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 512); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(512, i); x.stroke(); } }
  const gt = new THREE.CanvasTexture(gc); gt.wrapS = gt.wrapT = THREE.RepeatWrapping; gt.repeat.set(5, 6); gt.colorSpace = THREE.SRGBColorSpace;
  mesh(new THREE.PlaneGeometry(420, 480), new THREE.MeshStandardMaterial({ map: gt, roughness: 1 }), group, 0, 20, -46);
  const floor = mesh(new THREE.PlaneGeometry(600, 300), std('#2a2626', 0.8), group, 0, -66, 60); floor.rotation.x = -PI / 2;

  group.add(new THREE.HemisphereLight('#f4f7f6', '#2a2626', 0.9));
  const key = new THREE.DirectionalLight('#ffffff', 2.2); key.position.set(60, 90, 140); group.add(key);
  const rim = new THREE.PointLight('#2fd8bd', 2600, 400); rim.position.set(-90, 30, 40); group.add(rim);
  // machine body, front plate, flange, glass, drum back, hopper
  const steel = std('#aab2b4', 0.32, 0.85), dark = std('#242020', 0.7, 0.2), steelD = std('#7d8587', 0.4, 0.8);
  mesh(new THREE.BoxGeometry(116, 120, 54), dark, group, 0, -8, -24);
  mesh(new THREE.BoxGeometry(124, 14, 60), steelD, group, 0, -72, -22);                       // base plinth
  const plate = mesh(new THREE.CylinderGeometry(46, 46, 4, 72), steelD, group, 0, 0, 5); plate.rotation.x = PI / 2;
  const flange = mesh(new THREE.TorusGeometry(35, 3.2, 20, 80), steel, group, 0, 0, 8);
  const back = mesh(new THREE.CylinderGeometry(33, 33, 2, 64), std('#6b7274', 0.5, 0.7), group, 0, 0, -16); back.rotation.x = PI / 2;
  const shell = mesh(new THREE.CylinderGeometry(33, 33, 26, 64, 1, true), Object.assign(std('#8d9597', 0.45, 0.8), { side: THREE.BackSide }), group, 0, 0, -3); shell.rotation.x = PI / 2;
  for (let i = 0; i < 4; i++) { const pd = mesh(new THREE.BoxGeometry(2, 14, 24), steelD, group, 0, 0, -3); pd.userData.k = i; pd.position.set(Math.cos(i * PI / 2) * 22, Math.sin(i * PI / 2) * 22, -3); pd.rotation.z = i * PI / 2; }   // paddles (re-posed per frame)
  const paddles = group.children.filter((o) => o.userData && o.userData.k !== undefined);
  const glass = mesh(new THREE.CircleGeometry(33, 64), new THREE.MeshPhysicalMaterial({ color: '#dff3f0', roughness: 0.05, metalness: 0, transparent: true, opacity: 0.16, depthWrite: false }), group, 0, 0, 9.4);
  const hop = mesh(new THREE.CylinderGeometry(22, 8, 30, 40, 1, true), Object.assign(std('#b4bcbe', 0.35, 0.8), { side: THREE.DoubleSide }), group, 0, 66, -6);
  mesh(new THREE.CylinderGeometry(9, 9, 12, 32), steelD, group, 0, 46, -6);
  mesh(new THREE.SphereGeometry(2.6, 20, 14), std('#2fd8bd', 0.4), group, 46, -40, 11);       // roaster power lamp (signal teal)
  mesh(new THREE.BoxGeometry(8, 8, 3), steelD, group, -46, -40, 11);

  // beans: instanced, tumbling in the lower bed; colour follows the roast progress
  const NB = 190, bg = new THREE.SphereGeometry(1, 14, 10); bg.scale(1, 0.62, 0.72);
  const bm = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.55 }), beans = new THREE.InstancedMesh(bg, bm, NB);
  const cg = new THREE.BoxGeometry(1.7, 0.13, 0.3), cm = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.8 }), creases = new THREE.InstancedMesh(cg, cm, NB);
  group.add(beans, creases);
  const bean = Array.from({ length: NB }, (_, i) => ({ r: 6 + 22 * Math.sqrt(R()), a: PI * (1.08 + 0.84 * R()), z: -12 + 20 * R(), s: 3.1 + 0.7 * R(), ph: R() * 6.28, sp: 0.5 + R() * 0.9 }));
  const GREEN = new THREE.Color('#7d8c4e'), LIGHT = new THREE.Color('#a77a45'), DARK = new THREE.Color('#37200f'), tmp = new THREE.Color();
  const roastCol = (p, i) => { const k = p < 0.5 ? p * 2 : 1; tmp.copy(GREEN).lerp(LIGHT, k); if (p > 0.5) tmp.lerp(DARK, (p - 0.5) * 2); const j = 0.92 + 0.16 * ((i * 37) % 11) / 11; return tmp.multiplyScalar(j); };
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), ps = new THREE.Vector3(), lm = new THREE.Matrix4().makeTranslation(0, 0.6, 0), cmx = new THREE.Matrix4(), c2 = new THREE.Color();

  // smoke from the drum (stacked translucent discs, no gradient)
  const sc2 = document.createElement('canvas'); sc2.width = sc2.height = 128; { const x = sc2.getContext('2d'); for (let r = 60; r > 4; r -= 4) { x.fillStyle = 'rgba(235,242,240,' + (0.012 + 0.003 * (60 - r) / 4).toFixed(3) + ')'; x.beginPath(); x.arc(64, 64, r, 0, 6.283); x.fill(); } }
  const smTex = new THREE.CanvasTexture(sc2), smoke = Array.from({ length: 16 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smTex, transparent: true, opacity: 0, depthWrite: false })); s.userData.ph = i / 16; s.userData.ox = (R() - 0.5) * 30; group.add(s); return s; });

  // roast curve shape (shared with the overlay): u = 0..1 from the "roasts" word to the "Vineet" word
  const u = (t) => clamp((t - CUE.roast) / (CUE.menu - CUE.roast));
  const heat = (uu) => 0.14 + 0.78 * (1 - Math.exp(-2.7 * uu)) - 0.2 * Math.exp(-15 * uu);
  const p = (t) => clamp((t - CUE.roast) / 2.5);

  function setT(t) {
    const prog = p(t), spin = t * 1.15, crackK = clamp(1 - (t - CUE.crack) / 0.3) * (t >= CUE.crack ? 1 : 0);
    const tilt = 0.42 * Math.sin(spin * 0.9 + 0.5), pulse = 1 + 0.14 * crackK;
    for (let i = 0; i < NB; i++) { const b = bean[i], a = b.a + tilt + 0.07 * Math.sin(t * 2.4 + b.ph) + (b.r > 20 ? 0.05 * Math.sin(spin * 2 + i) : 0), rr = b.r + 0.9 * Math.sin(t * 3 + b.ph);
      ps.set(rr * Math.cos(a), rr * Math.sin(a), b.z + 1.2 * Math.sin(t * 2 + b.ph)); e.set(t * b.sp + b.ph, t * b.sp * 0.6, b.ph * 2); q.setFromEuler(e); const s = b.s * pulse; sc.set(s, s, s);
      m4.compose(ps, q, sc); beans.setMatrixAt(i, m4); beans.setColorAt(i, roastCol(prog, i));
      cmx.multiplyMatrices(m4, lm); creases.setMatrixAt(i, cmx); creases.setColorAt(i, c2.copy(roastCol(prog, i)).multiplyScalar(0.5)); }
    beans.instanceMatrix.needsUpdate = true; creases.instanceMatrix.needsUpdate = true; beans.instanceColor.needsUpdate = true; creases.instanceColor.needsUpdate = true;
    paddles.forEach((o) => { const k = o.userData.k, a = spin + k * PI / 2; o.position.set(Math.cos(a) * 25, Math.sin(a) * 25, -3); o.rotation.z = a + PI / 2; });
    smoke.forEach((s) => { const f = (t * 0.35 + s.userData.ph) % 1, amt = clamp((t - CUE.roast) / 1.0) * (0.55 + 0.45 * clamp((t - CUE.crack) / 0.5)); s.position.set(s.userData.ox * (0.5 + f), 38 + f * 70, 14); s.scale.set(18 + f * 34, 18 + f * 34, 1); s.material.opacity = amt * Math.sin(f * PI) * 0.7; });
    // camera: slow push-in, 3/4 view; shake at first crack; pans away as the menu card arrives
    const push = eio(seg(t, 0, 3.4)), shake = crackK * 1.1 * Math.sin(t * 90), out = eio(seg(t, CUE.menu, CUE.menu + 0.6));
    const pos = [lerp(34, 26, push) + shake, lerp(14, 8, push) + shake * 0.6 - out * 20, lerp(270, 236, push) + out * 30], look = [0, -30 - out * 10, 0];
    return { pos, look, fov: 34, near: 5, far: 900 };
  }
  return { group, lights: [], bg: '#2a2626', fog: null, setT, api: { u, p, heat, CUE } };
} };
})();
