// Boojee Cafe: AVOCADO TOAST (2D editorial, top-down, pure function of t). dur 5.6 s. No letters, no pouring.
// 0-0.9 plate settles + avocado pieces drop on the sourdough; 0.6-4.4 steel fork mashes and spreads in 4 strokes (tine ridges draw in behind it); 3.95-4.6 chilli flakes + salt land;
// 4.55-5.0 lime wedge drops and bounces; 5.0-5.6 stillness (slow push-in only).
(() => {
const { clamp, seg, lerp, eo, eio, eob, rng } = K;
const F = (n) => Math.round(n * 10) / 10;
const DUR = 5.6, CX = 540, CY = 960, PR = 410;
const BREAD = 'M -200,300 C -215,300 -225,285 -225,265 L -225,-60 C -255,-80 -270,-150 -230,-215 C -190,-275 -110,-300 0,-300 C 110,-300 190,-275 230,-215 C 270,-150 255,-80 225,-60 L 225,265 C 225,285 215,300 200,300 Z';
const BT = 'rotate(-5) scale(.9)', AVT = 'rotate(-5) scale(.8)';
const FA = -35;                                   // fork angle (deg); tine row direction R
const R = [Math.cos(FA * Math.PI / 180), Math.sin(FA * Math.PI / 180)];
const tr = (x, y) => { const a = -5 * Math.PI / 180; return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)]; };

// ---- static builds
let holes = ''; { const r = rng(12); for (let i = 0; i < 46; i++) { const x = -190 + r() * 380, y = -260 + r() * 540, rx = 5 + r() * 13, ry = rx * (0.5 + r() * 0.4);
  holes += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(rx)}" ry="${F(ry)}" fill="#C79A5A" opacity=".7" transform="rotate(${F(r() * 180)} ${F(x)} ${F(y)})"/><ellipse cx="${F(x - 1.5)}" cy="${F(y - 2)}" rx="${F(rx * 0.7)}" ry="${F(ry * 0.6)}" fill="#F4E3BB" opacity=".6"/>`; } }
const CHUNKS = [[-110, -235, 20], [85, -250, -30], [-130, -70, -10], [70, -95, 40], [-95, 95, 15], [115, 75, -25], [-45, 225, 35], [95, 235, -15]].map(([x, y, rot], i) => ({ x, y, rot, t0: 0.12 + i * 0.07 }));
// mash texture blobs (bread-local coords, centred): colour spread light/mid/dark
const BLOBS = []; { const r = rng(41); const pal = ['#8AAE35', '#9DC043', '#A5C649', '#B4CF5A', '#C3D970', '#92B53B']; for (let i = 0; i < 360; i++) { const x = -190 + r() * 380, y = -280 + r() * 560; const rx = 7 + r() * 20; BLOBS.push({ x, y, rx, ry: rx * (0.55 + r() * 0.4), rot: r() * 180, c: pal[Math.floor(r() * pal.length)], o: 0.35 + r() * 0.35 }); } }
const FLAKES = []; { const r = rng(77); let k = 0; while (FLAKES.length < 78) { const x = (r() - 0.5) * 330, y = (r() - 0.5) * 520; if ((x / 165) ** 2 + (y / 260) ** 2 > 1) continue; FLAKES.push({ x, y, td: 3.95 + r() * 0.65, a: r() * 360, w: 9 + r() * 10, c: ['#B3201A', '#C6281E', '#8F1612', '#D93A22'][Math.floor(r() * 4)], seed: r() > 0.82 }); } }
const SALT = []; { const r = rng(5); while (SALT.length < 30) { const x = (r() - 0.5) * 330, y = (r() - 0.5) * 520; if ((x / 165) ** 2 + (y / 260) ** 2 > 1) continue; SALT.push({ x, y, td: 4.1 + r() * 0.5, s: 3 + r() * 3.5, a: r() * 90 }); } }
const GRAIN = `<rect width="1080" height="1920" filter="url(#paper)" opacity=".5"/>`;

// ---- fork motion: keyframes [t, x, y, lift]; between press-drag frames lift=0
const KF = [[0.5, 560, -330, 1], [1.05, -95, -215, 1], [1.2, -95, -215, 0], [1.65, 95, -135, 0], [1.8, 95, -35, 1], [1.95, 95, -35, 0], [2.4, -95, 20, 0], [2.55, -95, 115, 1], [2.7, -95, 115, 0], [3.15, 100, 185, 0], [3.3, 100, 250, 1], [3.4, 0, 255, 0], [3.95, 0, -250, 0], [4.15, 40, -330, 1], [4.65, 650, -520, 1]];
const forkAt = (t) => { if (t <= KF[0][0]) return KF[0]; for (let i = 0; i < KF.length - 1; i++) { const a = KF[i], b = KF[i + 1]; if (t <= b[0]) { const k = eio(seg(t, a[0], b[0])); const press = a[3] === 0 && b[3] === 0; const kk = press ? seg(t, a[0], b[0]) : k; return [t, lerp(a[1], b[1], kk), lerp(a[2], b[2], kk), lerp(a[3], b[3], k)]; } } return KF[KF.length - 1]; };
const STROKES = [{ a: [-95, -215], b: [95, -135], t0: 1.2, t1: 1.65, bow: 22 }, { a: [95, -35], b: [-95, 20], t0: 1.95, t1: 2.4, bow: -20 }, { a: [-95, 115], b: [100, 185], t0: 2.7, t1: 3.15, bow: 18 }, { a: [0, 255], b: [0, -250], t0: 3.4, t1: 3.95, bow: 0 }];
const OFF = [-27, -9, 9, 27];
const ridgePath = (s, o, bow) => { const [ax, ay] = s.a, [bx, by] = s.b; const mx = (ax + bx) / 2 + bow, my = (ay + by) / 2; return `M ${F(ax + R[0] * o)},${F(ay + R[1] * o)} Q ${F(mx + R[0] * o)},${F(my + R[1] * o)} ${F(bx + R[0] * o)},${F(by + R[1] * o)}`; };

function forkSvg(x, y, lift) {
  const s = 1 + 0.07 * lift, sh = 10 + 38 * lift, so = 0.34 - 0.14 * lift;
  const body = (fill1, fill2) => `<g><path d="M -33,0 L -33,-0 Q -33,0 -33,0 Z" fill="none"/>
${OFF.map((o) => `<rect x="${o - 5}" y="0" width="10" height="150" rx="5" fill="url(#steelG)"/>`).join('')}
<path d="M -35,128 L 35,128 C 35,170 14,170 12,205 L 17,860 C 17,885 -17,885 -17,860 L -12,205 C -14,170 -35,170 -35,128 Z" fill="url(#steelG)"/>
<path d="M -3,215 L -3,850" stroke="#fff" stroke-width="3" opacity=".55"/><path d="M -28,132 L 28,132" stroke="#8D979C" stroke-width="2" opacity=".6"/></g>`;
  return `<g transform="translate(${F(x + CX + 18 * lift + 8)} ${F(y + CY + 24 * lift + 14)}) rotate(${FA}) scale(${s})" opacity="${so}" filter="url(#blur${lift > 0.5 ? 20 : 9})">${OFF.map((o) => `<rect x="${o - 5}" y="0" width="10" height="150" rx="5" fill="#000"/>`).join('')}<path d="M -35,128 L 35,128 L 12,205 L 14,860 L -14,860 L -12,205 Z" fill="#000"/></g>
<g transform="translate(${F(x + CX)} ${F(y + CY)}) rotate(${FA}) scale(${s})">${body()}</g>`;
}

window.SCENE = { dur: DUR, setT(t, stage) {
  const push = 1 + 0.1 * seg(t, 0, DUR), settle = lerp(1.07, 1, eo(seg(t, 0, 0.8)));
  // avocado reveal edge (bread-local y): follows the fork strokes
  const p = STROKES.map((s) => eio(seg(t, s.t0, s.t1)));
  const ry = p[2] > 0 ? lerp(60, 330, p[2]) : p[1] > 0 ? lerp(-70, 60, p[1]) : lerp(-330, -70, p[0]);
  const fin = p[3];
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920"><defs>${BJ.defs()}
<linearGradient id="steelG" x1="0" x2="1"><stop offset="0" stop-color="#EEF2F4"/><stop offset=".5" stop-color="#B7C0C5"/><stop offset="1" stop-color="#7F898F"/></linearGradient>
<radialGradient id="crumb" cx="45%" cy="40%" r="70%"><stop offset="0" stop-color="#EBD6A8"/><stop offset=".7" stop-color="#DDBE84"/><stop offset="1" stop-color="#B98743"/></radialGradient>
<linearGradient id="fleshG" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#EEF3A8"/><stop offset=".55" stop-color="#C9DD72"/><stop offset="1" stop-color="#8DB43C"/></linearGradient><radialGradient id="avG" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="#C2D668"/><stop offset="1" stop-color="#7FA32C"/></radialGradient>
<clipPath id="avclip"><path d="${BREAD}" transform="${AVT}"/></clipPath><clipPath id="revealClip"><rect x="-300" y="-340" width="600" height="${F(Math.max(0, ry + 340))}"/></clipPath></defs>
<g transform="translate(540 960) scale(${F(push * 1000) / 1000}) translate(-540 -960)">${BJ.table(t)}`;
  s += `<g transform="translate(540 960) scale(${F(settle * 1000) / 1000}) translate(-540 -960)">${BJ.plate(CX, CY, PR)}</g>`;
  // bread
  s += `<g transform="translate(540 960) ${BT}"><path d="${BREAD}" transform="translate(10 16)" fill="#000" opacity=".35" filter="url(#blur14)"/>
<path d="${BREAD}" fill="#6E4220" stroke="#5A3517" stroke-width="10"/><path d="${BREAD}" fill="url(#crumb)" transform="scale(.93)"/><path d="${BREAD}" fill="none" stroke="#B88246" stroke-width="12" opacity=".5" transform="scale(.93)"/>
<g clip-path="url(#avclip)" opacity="0"></g><g transform="scale(.93)">${holes}</g></g>`;
  // avocado: chunks, then mash
  const grow = seg(t, 0.95, 1.4);
  s += `<g transform="translate(540 960)"><g clip-path="url(#avclip)">`;
  // base mash revealed by fork
  s += `<g clip-path="url(#revealClip)"><g transform="${AVT}"><path d="${BREAD}" fill="url(#avG)" transform="scale(1.1)"/></g>`;
  for (const b of BLOBS) { const op = seg(ry, b.y - 25, b.y + 10); if (op <= 0) continue; s += `<ellipse cx="${F(b.x)}" cy="${F(b.y)}" rx="${F(b.rx)}" ry="${F(b.ry)}" fill="${b.c}" opacity="${F(b.o * op)}" transform="rotate(-5) rotate(${F(b.rot)} ${F(b.x)} ${F(b.y)})"/>`; }
  s += `</g>`;
  // ridges
  STROKES.forEach((st, i) => { const pr = p[i]; if (pr <= 0) return; OFF.forEach((o) => { const d = ridgePath(st, o, st.bow); s += `<path d="${d}" pathLength="1" stroke-dasharray="${F(pr * 1000) / 1000} 1.01" fill="none" stroke="#4F7218" stroke-width="7" stroke-linecap="round" opacity=".8"/><path d="${d}" pathLength="1" stroke-dasharray="${F(pr * 1000) / 1000} 1.01" transform="translate(3 3)" fill="none" stroke="#E2EFA2" stroke-width="4" stroke-linecap="round" opacity=".5"/>`; }); });
  // chunks (above mash until the fork reaches them)
  for (const c of CHUNKS) { const dropK = eob(seg(t, c.t0, c.t0 + 0.4), 1.4), op = clamp((t - c.t0) / 0.15); const m = seg(ry, c.y - 90, c.y + 20); const vis = op * (1 - 0.97 * m); if (vis <= 0.01) continue;
    const [gx, gy] = tr(c.x, c.y); const sc = lerp(1.35, 1, dropK);
    s += `<g transform="translate(${F(c.x * 0.9)} ${F(c.y * 0.9)}) rotate(${c.rot}) scale(${F(1.15 * sc * (1 + 0.5 * m) * 100) / 100} ${F(sc * (1 - 0.3 * m) * 100) / 100})" opacity="${F(vis * 100) / 100}">
<path d="M -86,24 A 90 74 0 0 1 86,24 A 100 18 0 0 0 -86,24 Z" transform="translate(6 10)" fill="#000" opacity=".28" filter="url(#blur9)"/><path d="M -86,24 A 90 74 0 0 1 86,24 A 100 18 0 0 0 -86,24 Z" fill="#2B4519"/><path d="M -74,20 A 77 61 0 0 1 74,20 A 88 16 0 0 0 -74,20 Z" fill="url(#fleshG)"/><path d="M -52,-6 Q -6,-34 44,-8" stroke="#F6FAD2" stroke-width="6" fill="none" stroke-linecap="round" opacity=".75"/></g>`; }
  s += `</g></g>`;
  // avocado edge shine (soft) once spread
  if (fin > 0) s += `<g transform="translate(540 960) ${AVT}" opacity="${F(0.5 * fin * 100) / 100}"><path d="${BREAD}" fill="none" stroke="#D6E88F" stroke-width="5" transform="scale(.97)"/></g>`;
  // chilli flakes, salt
  s += `<g transform="translate(540 960)">`;
  for (const f of FLAKES) { const u = seg(t, f.td - 0.38, f.td); if (u <= 0) continue; const land = seg(t, f.td, f.td + 0.28); const sc = lerp(2.4, 1, eo(u)) * (1 + 0.28 * Math.sin(land * Math.PI) * (1 - land)); const [fx, fy] = [f.x, f.y];
    s += `<ellipse cx="${F(fx + 2)}" cy="${F(fy + 3)}" rx="${F(f.w * 0.55)}" ry="${F(f.w * 0.3)}" fill="#000" opacity="${F(0.35 * eo(u))}" transform="rotate(${F(f.a)} ${F(fx)} ${F(fy)})"/><path d="M ${F(fx - f.w * sc * .5)},${F(fy)} Q ${F(fx)},${F(fy - f.w * sc * .5)} ${F(fx + f.w * sc * .55)},${F(fy - 1)} Q ${F(fx + f.w * sc * .2)},${F(fy + f.w * sc * .4)} ${F(fx - f.w * sc * .5)},${F(fy)} Z" fill="${f.seed ? '#EBD58A' : f.c}" opacity="${F(eo(u * 2) * 100) / 100}" transform="rotate(${F(f.a)} ${F(fx)} ${F(fy)})"/>`; }
  for (const f of SALT) { const u = seg(t, f.td - 0.3, f.td); if (u <= 0) continue; const sc = lerp(2.2, 1, eo(u)); s += `<rect x="${F(f.x - f.s * sc / 2)}" y="${F(f.y - f.s * sc / 2)}" width="${F(f.s * sc)}" height="${F(f.s * sc)}" fill="#FFFFFF" opacity="${F(0.9 * eo(u * 2) * 100) / 100}" transform="rotate(${F(f.a)} ${F(f.x)} ${F(f.y)})"/><rect x="${F(f.x - f.s * sc / 2)}" y="${F(f.y - f.s * sc / 2)}" width="${F(f.s * sc * .4)}" height="${F(f.s * sc * .4)}" fill="#DCE6EA" opacity=".9" transform="rotate(${F(f.a)} ${F(f.x)} ${F(f.y)})"/>`; }
  s += `</g>`;
  // lime wedge: drops from the camera (scale 2 -> 1), bounces once
  { const u = seg(t, 4.2, 4.6), bo = seg(t, 4.6, 5.0), sc = lerp(2.1, 1, eo(u)) + 0.07 * Math.sin(bo * Math.PI) * (1 - bo) * 2;
    if (u > 0) s += `<g transform="translate(${CX + 290} ${CY + 70}) rotate(24) scale(${F(sc * 100) / 100})" opacity="${F(Math.min(1, u * 3) * 100) / 100}">
<path d="M -92,0 A 92 92 0 0 0 92,0 Z" transform="translate(${F(10 * sc)} ${F(14 * sc)})" fill="#000" opacity=".32" filter="url(#blur9)"/>
<path d="M -92,0 A 92 92 0 0 0 92,0 Z" fill="#3F8F2E"/><path d="M -80,2 A 80 80 0 0 0 80,2 Z" fill="#EAF1B8"/><path d="M -72,3 A 72 72 0 0 0 72,3 Z" fill="#C4DC55"/>
${[-60, -36, -12, 12, 36, 60].map((a) => `<line x1="0" y1="4" x2="${F(66 * Math.sin(a * Math.PI / 180 * 1.45))}" y2="${F(66 * Math.cos(a * Math.PI / 180 * 1.45))}" stroke="#EAF1B8" stroke-width="3.5"/>`).join('')}
<ellipse cx="-24" cy="40" rx="22" ry="8" fill="#F5FAD0" opacity=".7" transform="rotate(20 -24 40)"/><rect x="-92" y="-4" width="184" height="8" rx="4" fill="#E8F0B0"/></g>`; }
  // fork
  { const [, fx, fy, fl] = forkAt(t); if (t > 0.45 && t < 4.7) s += forkSvg(fx, fy, fl); }
  s += `<rect width="1080" height="1920" filter="url(#paper)" opacity=".5"/></g></svg>`;
  stage.innerHTML = s;
} };
})();
