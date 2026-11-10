// Scene 2 (replaces the generated picture): the real Subko / Mary Lodge entrance on Chapel Road, modelled in Three.js from the user's reference photo
// (~/Downloads/images.jpeg): green timber shopfront under a green corrugated awning, yellow SUBKO box sign, white MARY LODGE notice board,
// maroon double doors, stone steps climbing left beside a red-brick wall, mustard upper wall with a cream ornament band, parked scooters at right.
// Pure function of t. Origin: bottom-centre of the entrance opening on the building front; x right, z toward the street, y up (metres).
(function () {
window.SCENES.subko = { dur: 8, build(THREE, ctx) {
  const { clamp, seg, lerp, eio, eo, eob, rng } = window.C;
  const group = new THREE.Group();
  const M = (c, r = 0.9, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
  const box = (w, h, d, mat, x, y, z, p) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; (p || group).add(m); return m; };
  const cyl = (rt, rb, h, mat, x, y, z, p, seg = 14) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; (p || group).add(m); return m; };
  const canvasTex = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };

  const green = M('#2f6a4f', 0.75), greenDk = M('#245240', 0.8), greenLt = M('#4a8a68', 0.75), concrete = M('#a4aaa6', 1), concreteDk = M('#7c837f', 1);
  const maroon = M('#6a2b2b', 0.65), wood = M('#5a4033', 0.8), glass = M('#1d2e33', 0.15, 0.2), iron = M('#1c2224', 0.5, 0.5), white = M('#e9eeec', 0.9), grey = M('#c9d0cd', 0.9);

  // ---------- ground, pavement, road ----------
  box(60, 0.2, 40, M('#2d3436', 1), 0, -0.1, 24);
  box(40, 0.22, 5.6, M('#8f9795', 1), 0, -0.01, 3.0);               // pavement
  box(40, 0.3, 0.3, concreteDk, 0, 0.0, 5.9);                         // kerb
  for (let i = -8; i < 9; i++) box(1.4, 0.02, 0.12, M('#d7dcda'), i * 2.2, 0.02, 13);

  // ---------- main front wall (ground floor) with an opening for the doors ----------
  const FZ = -0.2;   // wall centre z (thickness 0.4)
  const lowerL = box(1.7, 3.2, 0.4, green, -0.55, 1.6, FZ);             // x -1.4..0.3 (notice board on it)
  const lowerR = box(2.9, 3.2, 0.4, green, 3.35, 1.6, FZ);       // x 1.9..4.8
  box(1.6, 0.9, 0.4, green, 1.1, 2.75, FZ);                              // lintel over the opening (x 0.3..1.9, y 2.3..3.2)
  // vertical battens on the green timber (panelling)
  for (let i = 0; i < 8; i++) box(0.04, 3.0, 0.03, greenDk, -1.3 + i * 0.22, 1.6, 0.02);
  for (let i = 0; i < 12; i++) box(0.04, 3.0, 0.03, greenDk, 2.0 + i * 0.22, 1.6, 0.02);
  // opening frame + interior backdrop (painted, lit when the doors open)
  box(0.12, 2.3, 0.5, greenLt, 0.3, 1.15, -0.2); box(0.12, 2.3, 0.5, greenLt, 1.9, 1.15, -0.2);
  const intTex = canvasTex(256, 384, (c, w, h) => { c.fillStyle = '#16282a'; c.fillRect(0, 0, w, h); c.fillStyle = '#cfd8d4'; c.fillRect(0, 40, w, 210); c.fillStyle = '#3c2f26'; c.fillRect(0, 262, w, 122);
    c.fillStyle = '#2f4a44'; for (let i = 0; i < 3; i++) c.fillRect(20, 80 + i * 56, 216, 6);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 7; j++) { c.fillStyle = (i + j) % 2 ? '#c8d3cf' : '#6f9a88'; c.fillRect(28 + j * 29, 50 + i * 56, 18, 26); }
    c.fillStyle = '#1f2f2e'; c.fillRect(0, 250, w, 56); c.fillStyle = '#b8964a'; c.fillRect(0, 246, w, 6);
    for (const x of [64, 128, 192]) { c.fillStyle = '#20272a'; c.fillRect(x - 1, 0, 2, 38); c.fillStyle = '#f2f6f4'; c.beginPath(); c.arc(x, 46, 13, 0, 7); c.fill(); } });
  const intMat = new THREE.MeshBasicMaterial({ map: intTex, color: '#000000' });
  box(1.5, 2.3, 0.02, intMat, 1.1, 1.15, -0.5).castShadow = false;
  // maroon double doors (hinged at the frame, swing inward... outward-open looks better under the awning)
  const doorL = new THREE.Group(), doorR = new THREE.Group(); doorL.position.set(0.36, 0, -0.02); doorR.position.set(1.84, 0, -0.02); group.add(doorL, doorR);
  box(0.74, 2.25, 0.07, maroon, 0.37, 1.13, 0, doorL); box(0.74, 2.25, 0.07, maroon, -0.37, 1.13, 0, doorR);
  for (const [g, s] of [[doorL, 1], [doorR, -1]]) { for (let j = 0; j < 2; j++) box(0.52, 0.8, 0.02, M('#7a3434', 0.7), s * 0.37, 0.65 + j * 1.05, 0.045, g); box(0.05, 0.16, 0.05, M('#b8964a', 0.4, 0.8), s * 0.62, 1.1, 0.07, g); }
  box(0.2, 0.12, 0.7, concreteDk, 1.1, 0.06, 0.35);                    // threshold step
  box(2.0, 0.22, 0.6, concrete, 1.1, 0.11, 0.7);                       // front step
  // ---------- left concrete wall, small green window above it, plain upper left ----------
  box(1.5, 3.0, 0.4, concrete, -2.15, 1.5, FZ);
  box(1.3, 1.3, 0.34, green, -2.15, 3.65, FZ); box(1.0, 0.95, 0.06, glass, -2.15, 3.65, 0.0);
  for (let i = -1; i <= 1; i++) box(0.04, 0.95, 0.08, greenDk, -2.15 + i * 0.33, 3.65, 0.02); box(1.0, 0.04, 0.08, greenDk, -2.15, 3.65, 0.02);
  // notice board: white panel in a green frame, MARY LODGE header, listing lines (no readable text invented)
  const boardTex = canvasTex(512, 860, (c, w, h) => { c.fillStyle = '#e9eeec'; c.fillRect(0, 0, w, h); c.fillStyle = '#26332f'; c.font = '700 54px Georgia,serif'; c.textAlign = 'center'; c.fillText('MARY LODGE', w / 2, 80);
    c.strokeStyle = '#5f6b66'; c.lineWidth = 3; c.strokeRect(14, 120, w - 28, h - 134); c.fillStyle = '#7f8b86';
    for (let i = 0; i < 17; i++) { c.fillRect(34, 160 + i * 41, 120 + ((i * 53) % 190), 7); c.fillRect(w - 110, 160 + i * 41, 60, 7); } });
  const board = box(1.35, 2.25, 0.07, new THREE.MeshStandardMaterial({ map: boardTex, roughness: 0.8 }), -0.55, 1.95, 0.07); box(1.5, 2.4, 0.06, greenDk, -0.55, 1.95, 0.03);
  // small white plaque above the opening (lines only)
  box(0.9, 0.34, 0.04, white, 1.1, 3.55, 0.03);
  // right wall extras: a second maroon door and a small dark window
  box(0.85, 2.15, 0.06, maroon, 3.1, 1.08, 0.02); box(0.95, 2.25, 0.04, greenLt, 3.1, 1.12, 0.0);
  box(0.9, 0.8, 0.05, glass, 4.2, 2.0, 0.02);

  // ---------- upper floor: white left (timber window), mustard right (cream ornament band + louvred window) ----------
  box(2.9, 3.4, 0.4, white, -1.35, 4.9, FZ);                                                    // x -2.8..0.1
  const orn = canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#d4a23a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#e8efec'; c.lineWidth = 5;
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { const cx = 64 + i * 128, cy = 130 + j * 120; c.beginPath(); c.moveTo(cx, cy - 46); c.lineTo(cx + 46, cy); c.lineTo(cx, cy + 46); c.lineTo(cx - 46, cy); c.closePath(); c.stroke(); c.beginPath(); c.arc(cx, cy, 14, 0, 7); c.stroke(); }
    c.fillStyle = '#e8efec'; c.fillRect(0, 40, w, 8); c.fillRect(0, h - 60, w, 8); });
  box(4.7, 3.4, 0.4, new THREE.MeshStandardMaterial({ map: orn, roughness: 0.85 }), 2.45, 4.9, FZ);   // x 0.1..4.8
  box(5.0, 0.18, 0.7, green, 0.9, 3.38, 0.0);                                                    // fascia over the ground floor
  // timber window (left) with dark glass + frame
  box(1.4, 1.9, 0.18, wood, -0.9, 4.95, 0.04); box(1.15, 1.6, 0.08, glass, -0.9, 4.95, 0.1); box(0.06, 1.6, 0.12, wood, -0.9, 4.95, 0.12); box(1.15, 0.06, 0.12, wood, -0.9, 5.05, 0.12);
  // louvred shutters window (right)
  box(1.5, 1.9, 0.18, wood, 3.5, 4.95, 0.04); box(1.2, 1.6, 0.06, glass, 3.5, 4.95, 0.1);
  const shutters = [];
  for (const s of [-1, 1]) { const pv = new THREE.Group(); pv.position.set(3.5 + s * 0.7, 4.95, 0.16); group.add(pv); box(0.6, 1.6, 0.05, green, -s * 0.3, 0, 0, pv); for (let k = 0; k < 8; k++) box(0.5, 0.03, 0.06, greenDk, -s * 0.3, -0.7 + k * 0.2, 0.03, pv); pv.userData.s = s; shutters.push(pv); }
  // upper timber window at the far left over the stairs
  box(1.0, 1.4, 0.2, wood, -3.9, 5.6, -0.2); box(0.8, 1.15, 0.08, glass, -3.9, 5.6, -0.1);

  // ---------- green corrugated awning over the entrance (sloping toward the street) ----------
  { const aw = new THREE.Group(); aw.position.set(0.3, 3.35, 0); aw.rotation.x = -0.2; group.add(aw);
    for (let i = 0; i < 46; i++) box(0.17, 0.05, 2.6, i % 2 ? green : greenLt, -2.8 + i * 0.17, 0.0, 1.3, aw);
    box(8.0, 0.1, 0.1, greenDk, 1.1, -0.02, 2.62, aw); box(0.1, 0.35, 2.6, greenDk, -2.9, -0.15, 1.3, aw); box(0.1, 0.35, 2.6, greenDk, 5.0, -0.15, 1.3, aw); }
  for (const x of [-2.4, 4.2]) cyl(0.07, 0.07, 3.3, wood, x, 1.65, 2.45);                                      // awning posts
  // upper roof (green tin, sloping up and back)
  { const r = new THREE.Group(); r.position.set(0.6, 6.7, 0.0); r.rotation.x = 0.28; group.add(r); for (let i = 0; i < 50; i++) box(0.17, 0.06, 2.8, i % 2 ? green : greenLt, -4.2 + i * 0.17, 0, -1.3, r); box(8.8, 0.12, 0.12, greenDk, 0.3, -0.03, 0.12, r); }
  // stairs roof
  { const r = new THREE.Group(); r.position.set(-4.0, 5.2, 0); r.rotation.z = 0.12; group.add(r); for (let i = 0; i < 16; i++) box(0.17, 0.06, 4.6, i % 2 ? green : greenLt, -1.2 + i * 0.17, 0, -2.0, r); }

  // ---------- stone steps climbing left beside a red-brick wall, iron gate, railing ----------
  for (let i = 0; i < 13; i++) box(1.5, 0.25 * (i + 1), 0.44, concrete, -3.7, 0.125 * (i + 1), 1.6 - i * 0.44);
  const brickTex = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#8a5a50'; c.fillRect(0, 0, w, h); const r = rng(5); for (let y = 0; y < 16; y++) for (let x = -1; x < 8; x++) { const bx = x * 36 + (y % 2) * 18, by = y * 16; const k = Math.floor(r() * 24); c.fillStyle = `rgb(${150 + k},${92 + k / 2},${80 + k / 2})`; c.fillRect(bx + 1.5, by + 1.5, 33, 13); } });
  brickTex.wrapS = brickTex.wrapT = THREE.RepeatWrapping; brickTex.repeat.set(3, 2);
  box(0.7, 3.8, 6.2, new THREE.MeshStandardMaterial({ map: brickTex, roughness: 1 }), -4.85, 1.9, -1.4);
  for (let i = 0; i < 14; i++) box(0.04, 1.0 + i * 0.19, 0.04, iron, -2.92, 0.9 + i * 0.12, 1.8 - i * 0.42);   // railing balusters
  box(0.06, 0.06, 6.0, iron, -2.92, 2.6, -1.2).rotation.x = -0.34;
  for (let i = 0; i < 10; i++) box(0.04, 1.4, 0.04, iron, -4.4 + i * 0.16, 0.7, 2.3); box(1.6, 0.05, 0.05, iron, -3.6, 1.4, 2.3); box(1.6, 0.05, 0.05, iron, -3.6, 0.1, 2.3);   // black gate
  box(0.3, 1.2, 0.3, concrete, -2.75, 0.6, 1.9);                                                                     // concrete pillar
  // drain pipes
  cyl(0.07, 0.07, 7.2, grey, -2.95, 3.6, 0.15); cyl(0.05, 0.05, 2.8, white, -2.2, 5.4, 0.05).rotation.z = 1.2;
  // lamp post on the far left with a signboard
  cyl(0.09, 0.09, 6.0, concreteDk, -6.2, 3.0, 2.8); box(0.55, 0.35, 0.05, white, -6.0, 3.6, 2.8);

  // ---------- SUBKO yellow box sign hanging from the awning front ----------
  const signTex = canvasTex(512, 200, (c, w, h) => { c.fillStyle = '#e8b822'; c.fillRect(0, 0, w, h); c.strokeStyle = '#2b2b24'; c.lineWidth = 6; c.strokeRect(8, 8, w - 16, h - 16);
    c.fillStyle = '#26261f'; c.font = '800 112px "Helvetica Neue",Arial,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('SUBKO', w / 2, h / 2 + 6); });
  const signG = new THREE.Group(); signG.position.set(0.85, 3.0, 2.55); group.add(signG);
  const signMesh = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.58, 0.14), [iron, iron, iron, iron, new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.55 }), iron]);
  signMesh.position.y = -0.35; signMesh.castShadow = true; signG.add(signMesh); box(0.03, 0.2, 0.03, iron, -0.55, -0.02, 0, signG); box(0.03, 0.2, 0.03, iron, 0.55, -0.02, 0, signG);

  // ---------- parked scooters ----------
  const scooter = (x, z, rot, col) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; group.add(g); const b = M(col, 0.5, 0.2);
    box(1.4, 0.3, 0.42, b, 0, 0.52, 0, g); box(0.4, 0.62, 0.42, b, 0.55, 0.9, 0, g); box(0.55, 0.1, 0.32, iron, -0.2, 0.78, 0, g); box(0.08, 0.5, 0.5, iron, 0.74, 1.05, 0, g);
    for (const sx of [-0.55, 0.62]) { const w = cyl(0.22, 0.22, 0.14, iron, sx, 0.22, 0, g, 20); w.rotation.x = Math.PI / 2; } };
  scooter(5.4, 3.6, -0.5, '#26302f'); scooter(6.4, 3.0, -0.2, '#7c8f93'); scooter(4.7, 4.6, 0.3, '#394548');
  // tree at the far right
  { const t = new THREE.Group(); t.position.set(8.2, 0, -1.8); group.add(t); cyl(0.2, 0.3, 4.2, M('#5b4a3e', 1), 0, 2.1, 0, t, 10); const r = rng(7);
    for (let i = 0; i < 22; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.9 + r() * 0.7, 12, 10), M(i % 3 ? '#3f8a52' : '#2f7345', 0.9)); s.position.set((r() - 0.5) * 3.4, 4.2 + r() * 2.2, (r() - 0.5) * 3); s.castShadow = true; t.add(s); } group.userData.tree = t; }

  // ---------- lights (all inside the group) ----------
  group.add(new THREE.HemisphereLight('#d2e3ee', '#7d8a82', 1.15));
  const fill = new THREE.DirectionalLight('#e6f0f6', 0.7); fill.position.set(2, 3, 20); fill.target.position.set(1, 2, 0); group.add(fill, fill.target);
  const sun = new THREE.DirectionalLight('#f4f7fa', 2.0); sun.position.set(-9, 16, 14); sun.target.position.set(1, 2, 0); group.add(sun, sun.target); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 12, bottom: -6, near: 1, far: 60 }); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
  

  function setT(t) {
    const a = eio(seg(t, 0, 7.6));
    const pos = [lerp(-9.5, 1.2, a), lerp(2.7, 1.9, a), lerp(12.5, 10.6, a)], look = [lerp(-1.8, 1.1, a), lerp(2.6, 2.9, a), 0], fov = lerp(52, 40, a);
    pos[0] += Math.sin(t * 0.5) * 0.1; pos[1] += Math.sin(t * 0.8 + 1) * 0.04;
    // shutters swing open, door opens, interior and lamp come on, SUBKO sign swings in and settles
    shutters.forEach((pv, i) => { const p = eob(seg(t, 1.2 + i * 0.25, 2.1 + i * 0.25), 1.3); pv.rotation.y = pv.userData.s * p * 1.5; });
    const d = eob(seg(t, 3.0, 4.1), 1.2); doorL.rotation.y = d * 1.35; doorR.rotation.y = -d * 1.35;
    const k = 0.1 + 0.9 * seg(t, 2.8, 4.3); intMat.color.setRGB(k, k, k);
    signG.rotation.z = Math.sin(t * 3.2) * 0.2 * Math.exp(-Math.max(0, t - 1.4) * 0.9) * seg(t, 1.2, 1.5);
    if (group.userData.tree) group.userData.tree.rotation.z = Math.sin(t * 0.9) * 0.008;
    return { pos, look, fov, near: 0.1, far: 120 };
  }
  return { group, lights: [], bg: '#aecbdc', fog: [40, 110], setT };
} };
})();
