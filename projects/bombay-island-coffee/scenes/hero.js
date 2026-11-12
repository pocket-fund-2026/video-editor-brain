// Scene: HERO. A glass of Tiramisu Cold Brew builds layer by layer (cutaway side view), then the camera pulls back to the brew bar.
// All beats are the voice word times: layers = "Tiramisu", ice = "Cold", foam + cocoa = "Brew", bar reveal = "Island".
// Local time t = film time - 22.6. Units: cm. Food keeps its natural colour; the light is cool white.
(function () {
window.SCENES.hero = { dur: 4.9, build(THREE, ctx) {
  const { clamp, seg, lerp, eio, eo, eob, rng } = window.C;
  const T0 = 22.6, TM = window.TIMING.cues, PI = Math.PI, R = rng(5);
  const CUE = { layers: TM.layers - T0, ice: TM.ice - T0, foam: TM.foam - T0, bar: TM.bar - T0 };
  const group = new THREE.Group();
  const std = (c, r = 0.6, m = 0, ex) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: r, metalness: m }, ex || {}));
  const mesh = (g, m, parent, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); (parent || group).add(o); return o; };
  const GX = -9;                                                     // glass x

  // lights
  group.add(new THREE.HemisphereLight('#f4f7f6', '#2a2626', 0.7));
  const key = new THREE.SpotLight('#ffffff', 5200, 0, 0.5, 0.6, 1.6); key.position.set(30, 60, 50); key.target.position.set(GX, 6, 0); group.add(key, key.target);
  const rim = new THREE.PointLight('#2fd8bd', 1500, 300); rim.position.set(-30, 18, -22); group.add(rim);

  // counter + back wall + pendant lamps
  const counter = mesh(new THREE.BoxGeometry(160, 6, 60), std('#3F3A3A', 0.35, 0.1), group, 0, -3, -6);
  mesh(new THREE.BoxGeometry(160, 1.2, 1.2), std('#108474', 0.4), group, 0, 0.1, 24.5);        // teal edge strip
  mesh(new THREE.PlaneGeometry(220, 120), std('#2a2626', 0.95), group, 0, 40, -30);
  [-4, 15, 34].forEach((x) => { mesh(new THREE.SphereGeometry(2.3, 24, 16), new THREE.MeshBasicMaterial({ color: '#2fd8bd' }), group, x, 46, -22); mesh(new THREE.CylinderGeometry(0.12, 0.12, 40, 6), std('#7d8587', 0.5, 0.8), group, x, 68, -22); });

  // brew bar: three V60 brewers on glass servers
  const steamTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); for (let r = 60; r > 4; r -= 4) { x.fillStyle = 'rgba(235,242,240,' + (0.014 + 0.003 * (60 - r) / 4).toFixed(3) + ')'; x.beginPath(); x.arc(64, 64, r, 0, 6.283); x.fill(); } return new THREE.CanvasTexture(c); })();
  const steam = [];
  [5, 16, 27].forEach((x, bi) => {
    const g = new THREE.Group(); g.position.set(x, 0, -14); group.add(g);
    mesh(new THREE.CylinderGeometry(4.2, 3.2, 9, 36, 1, true), new THREE.MeshPhysicalMaterial({ color: '#dff3f0', roughness: 0.05, transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false }), g, 0, 4.5, 0);
    mesh(new THREE.CylinderGeometry(3.0, 3.0, 4.4, 30), std('#2a1409', 0.3), g, 0, 2.2, 0);                         // brewed coffee in the server
    mesh(new THREE.CylinderGeometry(7.4, 2.4, 8.5, 40, 1, true), Object.assign(std('#f4f7f6', 0.28), { side: THREE.DoubleSide }), g, 0, 13.2, 0);   // V60 cone
    mesh(new THREE.TorusGeometry(7.5, 0.6, 12, 40), std('#f4f7f6', 0.3), g, 0, 17.4, 0).rotation.x = PI / 2;
    for (let i = 0; i < 4; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamTex, transparent: true, opacity: 0, depthWrite: false })); s.userData = { x, ph: i / 4 + bi * 0.21 }; group.add(s); steam.push(s); }
  });

  // the glass
  const glassMat = new THREE.MeshPhysicalMaterial({ color: '#e8f6f3', roughness: 0.03, transmission: 0, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false });
  const gGroup = new THREE.Group(); gGroup.position.set(GX, 0, 0); group.add(gGroup);
  const prof = [[0, 0], [3.6, 0], [4.1, 0.5], [4.6, 15], [4.5, 15.3]].map((p) => new THREE.Vector2(p[0], p[1]));
  mesh(new THREE.LatheGeometry(prof, 56), glassMat, gGroup);
  mesh(new THREE.CylinderGeometry(3.7, 3.7, 0.5, 40), std('#cfe6e2', 0.2, 0, { transparent: true, opacity: 0.5 }), gGroup, 0, 0.25, 0);
  // layers: coffee (dark), ice, cream foam, cocoa dust
  const coffee = mesh(new THREE.CylinderGeometry(1, 1, 1, 48), std('#2a1409', 0.18, 0, { transparent: true, opacity: 0.96 }), gGroup, 0, 0, 0);
  const foam = mesh(new THREE.CylinderGeometry(1, 1, 1, 48), std('#eadfca', 0.75), gGroup, 0, 0, 0);
  const dome = mesh(new THREE.SphereGeometry(1, 40, 14, 0, Math.PI * 2, 0, Math.PI / 2), std('#eadfca', 0.75), gGroup, 0, 0, 0);
  const cocoa = mesh(new THREE.CylinderGeometry(4.3, 4.3, 0.18, 48), std('#4b2a15', 0.95), gGroup, 0, 0, 0);
  const cocoaDome = mesh(new THREE.SphereGeometry(1, 40, 14, 0, Math.PI * 2, 0, Math.PI / 3), std('#4b2a15', 0.95, 0, { transparent: true, opacity: 0 }), gGroup, 0, 0, 0);
  const radAt = (y) => 3.6 + (4.6 - 3.6) * clamp((y - 0.5) / 14.5) - 0.12;
  const ice = Array.from({ length: 5 }, (_, i) => { const m = mesh(new THREE.BoxGeometry(2.6, 2.6, 2.6), new THREE.MeshPhysicalMaterial({ color: '#e6f4f8', roughness: 0.08, transparent: true, opacity: 0.55 }), gGroup, 0, 30, 0); m.userData = { x: (R() - 0.5) * 3.4, z: (R() - 0.5) * 3, rx: R() * 3, rz: R() * 3, d: i * 0.07 }; return m; });
  const NP = 70, pg = new THREE.BufferGeometry(), pp = new Float32Array(NP * 3), pr = Array.from({ length: NP }, () => ({ x: (R() - 0.5) * 6, z: (R() - 0.5) * 6, d: R() * 0.45 }));
  pg.setAttribute('position', new THREE.BufferAttribute(pp, 3)); const dust = new THREE.Points(pg, new THREE.PointsMaterial({ color: '#4b2a15', size: 0.32, transparent: true, opacity: 0 })); gGroup.add(dust);

  const COFFEE_TOP = 7.4, FOAM_TOP = 12.2;
  let state = {};
  function setT(t) {
    const fill = eio(seg(t, CUE.layers, CUE.ice)), cy = COFFEE_TOP * fill;
    coffee.visible = cy > 0.01; coffee.scale.set(radAt(cy / 2 + 0.5), Math.max(0.001, cy), radAt(cy / 2 + 0.5)); coffee.position.y = cy / 2 + 0.5;
    const ik = (i) => eob(seg(t, CUE.ice + ice[i].userData.d, CUE.ice + ice[i].userData.d + 0.45), 1.2);
    ice.forEach((m, i) => { const k = ik(i); m.visible = t >= CUE.ice; const rest = COFFEE_TOP + 1.2 + (i % 2) * 0.5 + (t > CUE.foam ? 0 : 0); m.position.set(m.userData.x, lerp(24, rest, k), m.userData.z); m.rotation.set(m.userData.rx + (1 - k) * 3, (1 - k) * 2, m.userData.rz); });
    const fk = eo(seg(t, CUE.foam, CUE.foam + 0.8)), top = lerp(COFFEE_TOP + 0.5, FOAM_TOP, fk);
    foam.visible = fk > 0.01; foam.scale.set(radAt(top) , Math.max(0.001, top - (COFFEE_TOP - 1.2)), radAt(top)); foam.position.y = (top + COFFEE_TOP - 1.2) / 2;
    ice.forEach((m) => { if (t > CUE.foam) m.position.y += 0; });
    dome.visible = fk > 0.01; dome.position.y = top; dome.scale.set(radAt(top), 0.9 * fk, radAt(top));
    cocoa.visible = t >= CUE.foam + 0.55; cocoa.position.y = top + 0.9 * fk * 0.98; cocoa.scale.set(0.001, 0.001, 0.001);
    cocoa.visible = false; cocoaDome.visible = t >= CUE.foam + 0.55; cocoaDome.position.y = top + 0.04; cocoaDome.scale.set(radAt(top) * 1.015, 0.9 * fk * 1.015, radAt(top) * 1.015); cocoaDome.material.opacity = 0.9 * eo(seg(t, CUE.foam + 0.55, CUE.foam + 1.1));
    const dk = seg(t, CUE.foam, CUE.foam + 0.9); dust.material.opacity = dk > 0 && dk < 1 ? 0.95 : 0;
    for (let i = 0; i < NP; i++) { const f = clamp((dk - pr[i].d) / 0.55); pp[i * 3] = pr[i].x; pp[i * 3 + 1] = lerp(26, top + 0.2, f); pp[i * 3 + 2] = pr[i].z; } pg.attributes.position.needsUpdate = true;
    // steam over the V60s once the bar is revealed
    steam.forEach((s) => { const f = (t * 0.4 + s.userData.ph) % 1, on = clamp((t - CUE.bar) / 0.6); s.position.set(s.userData.x + Math.sin(f * 6 + s.userData.ph * 9) * 1.2, 20 + f * 16, -14); s.scale.set(5 + f * 9, 5 + f * 9, 1); s.material.opacity = on * Math.sin(f * PI) * 0.65; });
    // camera: slow push-in on the glass, then the pull-back that reveals the brew bar
    const pb = eio(seg(t, CUE.bar, CUE.bar + 0.95)), push = eio(seg(t, 0, CUE.bar));
    const pos = [lerp(lerp(GX + 10, GX + 5, push), 14, pb), lerp(lerp(10, 8.5, push), 17, pb), lerp(lerp(52, 41, push), 116, pb)];
    const look = [lerp(GX, 5, pb), lerp(7, 12, pb), 0];
    state = { t, layerH: cy, iceDown: ice.map((m, i) => ik(i)), foamK: fk, barK: pb };
    return { pos, look, fov: 34, near: 2, far: 600 };
  }
  return { group, lights: [], bg: '#2a2626', fog: null, setT, CUE, state: () => state };
} };
})();
