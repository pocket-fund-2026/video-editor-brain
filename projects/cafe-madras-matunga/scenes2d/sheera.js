// Scene 5, Cafe Madras: PINEAPPLE SHEERA (2D editorial illustration, side-on low three-quarter view, HTML/SVG, pure function of t).
// Timeline (dur 5.3 s): 0-1 plate settles + steam; 1.0-1.7 steel spoon glides in; 1.7-2.25 spoon lines up and bites; 2.2-2.55 scoop cut face opens in the mound;
// 2.5-3.3 spoon lifts a hill of sheera, ghee shine sweeps across it (2.7-3.35); 3.3-3.95 spoon leaves; 3.3-3.78 pineapple chunk drops on the mound top,
// bounces twice and settles (3.78-4.2); cardamom dust drifts from 3.2; 4.3-5.3 stillness (steam + slow push-in only). NO pouring anywhere. No letters.
(() => {
const { clamp, seg, lerp, eo, eio, eob, rng } = K;
const F = (n) => (Math.round(n * 10) / 10);
const DUR = 5.3;

// ---------------- geometry ----------------
const PX = 540, PY = 1010;                       // plate centre
const DOME = 'M270,1005 C270,830 390,722 540,722 C690,722 810,830 810,1005 A270,80 0 0 1 270,1005 Z';
const CAV = { x: 702, y: 858, rx: 104, ry: 84, rot: -22 };   // the scoop cut (right shoulder of the mound)
const REST = { x: 500, y: 686 };                              // where the dropped pineapple chunk settles

// canvas hit test so grains stay inside the dome
const _cv = document.createElement('canvas').getContext('2d'), _P = new Path2D(DOME);
const inDome = (x, y) => _cv.isPointInPath(_P, x, y);

// ---------------- static builds (once) ----------------
const GOLD = ['#B8741E', '#D4902A', '#E8AB38', '#F4C24E', '#FAD36C', '#FFE393', '#FFF0B8'];
function grains(n, seed, x0, y0, x1, y1, test, palette, lightFn, scale = 1) {
  const r = rng(seed); let back = '', front = '', k = 0, guard = 0;
  while (k < n && guard++ < n * 30) {
    const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0);
    if (!test(x, y)) continue; k++;
    const lf = lightFn(x, y), rx = (2.2 + r() * 3.4) * scale, ry = rx * (0.55 + r() * 0.35), rot = F(r() * 180);
    const idx = Math.max(0, Math.min(palette.length - 1, Math.round(3 + lf * 5 + (r() - 0.5) * 3.2)));
    back += `<ellipse cx="${F(x + 1.3)}" cy="${F(y + 1.6)}" rx="${F(rx)}" ry="${F(ry)}" fill="#7C4510" opacity=".45" transform="rotate(${rot} ${F(x)} ${F(y)})"/>`;
    front += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(rx)}" ry="${F(ry)}" fill="${palette[idx]}" opacity="${F(0.78 + r() * 0.22)}" transform="rotate(${rot} ${F(x)} ${F(y)})"/>`;
  }
  return back + front;
}
const moundLight = (x, y) => Math.max(-0.7, Math.min(0.7, (540 - x) * 0.0016 + (880 - y) * 0.0017));
const MOUND_GRAINS = grains(1500, 31, 268, 720, 812, 1088, inDome, GOLD, moundLight);

// ghee sheen on the mound: glossy slivers + pin specular points
function sheen() {
  const r = rng(77); let s = '';
  for (let i = 0; i < 16; i++) {
    const x = 330 + r() * 330, y = 760 + r() * 240; if (!inDome(x, y)) { i--; continue; }
    s += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(14 + r() * 34)}" ry="${F(3 + r() * 6)}" fill="#FFF4C8" opacity="${F(0.28 + r() * 0.3)}" transform="rotate(${F(-40 + r() * 80)} ${F(x)} ${F(y)})" filter="url(#sh3)"/>`;
  }
  for (let i = 0; i < 46; i++) {
    const x = 300 + r() * 420, y = 740 + r() * 300; if (!inDome(x, y)) { i--; continue; }
    s += `<circle cx="${F(x)}" cy="${F(y)}" r="${F(1.2 + r() * 2)}" fill="#FFFBE6" opacity="${F(0.5 + r() * 0.4)}"/>`;
  }
  return s;
}
const SHEEN = sheen();

// cardamom flecks + a few cashews/raisins/pineapple pieces placed on the mound
function flecks() {
  const r = rng(5); let s = '';
  for (let i = 0; i < 38; i++) {
    const x = 290 + r() * 500, y = 740 + r() * 330; if (!inDome(x, y)) { i--; continue; }
    s += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(1.4 + r() * 1.5)}" ry="${F(0.9 + r() * 0.8)}" fill="${r() < 0.7 ? '#46461F' : '#6B6B2C'}" opacity=".85" transform="rotate(${F(r() * 180)} ${F(x)} ${F(y)})"/>`;
  }
  return s;
}
const FLECKS = flecks();
const cashew = (x, y, rot, s = 1) => `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><path d="M-22,4 C-20,-14 6,-20 22,-6 C24,-2 20,0 16,-2 C4,-8 -8,-2 -14,10 C-18,14 -23,10 -22,4Z" fill="url(#cashG)" stroke="#B88F52" stroke-width="1.6" stroke-linejoin="round"/><path d="M-12,-4 C-2,-12 10,-10 16,-6" fill="none" stroke="#FFF6DA" stroke-width="2" opacity=".7" stroke-linecap="round"/></g>`;
const raisin = (x, y, rot, s = 1) => `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><ellipse cx="2" cy="4" rx="14" ry="9" fill="#2C1018" opacity=".4"/><ellipse cx="0" cy="0" rx="14" ry="9.5" fill="url(#raisG)"/><path d="M-8,-4 C-2,-8 6,-8 10,-3" fill="none" stroke="#B88A8E" stroke-width="1.8" opacity=".55" stroke-linecap="round"/><path d="M-9,2 C-3,5 4,5 9,2" stroke="#2A0E16" stroke-width="1" opacity=".5" fill="none"/></g>`;
const PINE = 'M-50,-22 Q-44,-38 -26,-38 Q-12,-47 6,-40 Q26,-49 42,-36 Q55,-30 52,-15 L30,12 L12,38 Q6,47 0,38 L-30,6 Z';
function pineChunk(x, y, rot, s = 1, sy = 1) {
  const fib = (() => { let o = ''; for (let i = 0; i < 13; i++) { const u = i / 12, tx = lerp(-44, 48, u), bx = lerp(-2, 10, u * 0.9 + 0.05); o += `<path d="M${F(bx)},${F(30 - u * 4)} C${F(lerp(bx, tx, 0.3))},${F(8)} ${F(lerp(bx, tx, 0.75))},${F(-12)} ${F(tx)},${F(-38 + (i % 3) * 3)}" fill="none" stroke="${i % 2 ? '#E2A41C' : '#FFF4B0'}" stroke-width="${i % 2 ? 2.6 : 1.8}" opacity="${i % 2 ? 0.62 : 0.7}" stroke-linecap="round"/>`; } return o; })();
  return `<g transform="translate(${F(x)},${F(y)}) rotate(${F(rot)}) scale(${F(s)},${F(s * sy)})">
  <ellipse cx="4" cy="44" rx="46" ry="9" fill="#5A3408" opacity=".32" filter="url(#sh3)"/>
  <path d="${PINE}" fill="#D49A22" stroke="#C9921C" stroke-width="7" stroke-linejoin="round"/>
  <path d="${PINE}" fill="url(#pineFace)"/>
  <g clip-path="url(#pineClip)">${fib}
    <path d="M-30,6 L12,38" stroke="#FFF9D4" stroke-width="9" opacity=".85" stroke-linecap="round"/><path d="M30,12 L12,38" stroke="#FFF9D4" stroke-width="9" opacity=".85" stroke-linecap="round"/>
    <ellipse cx="-14" cy="-20" rx="26" ry="5" fill="#FFFFFF" opacity=".6" transform="rotate(-14 -14 -20)" filter="url(#sh3)"/>
    <ellipse cx="22" cy="-8" rx="10" ry="3" fill="#FFFFFF" opacity=".55" transform="rotate(-30 22 -8)"/>
    <circle cx="-30" cy="-6" r="2.6" fill="#FFFFFF" opacity=".8"/><circle cx="34" cy="-22" r="2.2" fill="#FFFFFF" opacity=".8"/><circle cx="4" cy="14" r="1.9" fill="#FFFFFF" opacity=".7"/>
  </g>
  <path d="M-48,-22 Q-44,-36 -26,-36 Q-12,-45 6,-38 Q26,-47 42,-34" fill="none" stroke="#B87E14" stroke-width="3" opacity=".55" stroke-linecap="round"/>
  </g>`;
}
const TOPPINGS = [
  cashew(372, 905, -28, 1.05), cashew(612, 985, 14, 1), cashew(452, 1025, -8, .95), cashew(668, 780, 40, .9),
  raisin(430, 850, 20), raisin(545, 1008, -10, .95), raisin(720, 1000, 0, 1), raisin(335, 985, 30, .9), raisin(584, 790, 0, .85),
].join('') + pineChunk(392, 948, -14, .82) + pineChunk(630, 1028, 14, .74) + pineChunk(445, 802, 20, .62);

// cut-face grains (paler, moister interior), only inside the scoop bounding box
const CUT_PAL = ['#C98B2E', '#DDA544', '#EDBE5E', '#F6D27E', '#FBE19D', '#FFEEBF', '#FFF6D8'];
const CUT_GRAINS = grains(260, 91, 580, 740, 830, 960, () => true, CUT_PAL, (x, y) => (CAV.x - x) * 0.0016 + (y - CAV.y) * 0.002, 1.1);
// scoop pile on the spoon (local coords: bowl centre = origin)
const PILE = 'M-84,-4 C-88,-54 -46,-92 2,-92 C54,-92 90,-54 92,-4 Z';
const pileTest = (() => { const c = document.createElement('canvas').getContext('2d'), p = new Path2D(PILE); return (x, y) => c.isPointInPath(p, x, y); })();
const PILE_GRAINS = grains(210, 63, -90, -94, 94, 0, pileTest, GOLD, (x, y) => (-x) * 0.004 + (-50 - y) * -0.004 + 0.1);

// cardamom dust particles
const DUST = (() => { const r = rng(101), a = []; for (let i = 0; i < 38; i++) a.push({ ts: 3.15 + r() * 0.9, life: 1.5 + r() * 1.2, x: 560 + r() * 200, y: 700 + r() * 90, vx: -26 + r() * -26, vy: -34 - r() * 40, sw: 5 + r() * 12, ph: r() * 6.28, s: 1.3 + r() * 2.2, c: r() < 0.55 ? '#5E6A2E' : (r() < 0.5 ? '#C8CE86' : '#EADFB0') }); return a; })();

// ---------------- motion helpers ----------------
function pathAt(w, t) {
  const n = w.length;
  if (t <= w[0][0]) return w[0].slice(1);
  if (t >= w[n - 1][0]) return w[n - 1].slice(1);
  let i = 0; while (w[i + 1][0] <= t) i++;
  const t0 = w[i][0], t1 = w[i + 1][0], h = t1 - t0, s = (t - t0) / h;
  const h00 = 2 * s ** 3 - 3 * s ** 2 + 1, h10 = s ** 3 - 2 * s ** 2 + s, h01 = -2 * s ** 3 + 3 * s ** 2, h11 = s ** 3 - s ** 2;
  const tan = (j, c) => { if (j === 0 || j === n - 1) return 0; if (w[j][c] === w[j - 1][c] || w[j][c] === w[j + 1][c]) return 0; return (w[j + 1][c] - w[j - 1][c]) / (w[j + 1][0] - w[j - 1][0]); };
  const out = [];
  for (let c = 1; c <= 3; c++) out.push(h00 * w[i][c] + h10 * h * tan(i, c) + h01 * w[i + 1][c] + h11 * h * tan(i + 1, c));
  return out;
}
// spoon bowl centre (x, y) and rotation (deg, negative = handle up)
const SPOON = [[0, 1500, 560, -22], [1.0, 1500, 560, -22], [1.7, 836, 930, -14], [2.05, 776, 918, -3], [2.28, 700, 884, 7],
  [2.7, 690, 790, -13], [3.15, 692, 662, -10], [3.4, 704, 650, -10], [3.95, 1500, 470, -22]];

const defs = `${K.defs()}${K.steelDefs()}
<filter id="sh3"><feGaussianBlur stdDeviation="2.6"/></filter><filter id="blur16"><feGaussianBlur stdDeviation="16"/></filter><filter id="blurW" filterUnits="userSpaceOnUse" x="-100" y="-100" width="1300" height="2100"><feGaussianBlur stdDeviation="15"/></filter><filter id="blur9"><feGaussianBlur stdDeviation="9"/></filter>
<linearGradient id="plateG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#EEF2F3"/><stop offset=".45" stop-color="#BFC8CC"/><stop offset="1" stop-color="#8A959B"/></linearGradient>
<linearGradient id="sideG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9BA5AB"/><stop offset=".5" stop-color="#6D777D"/><stop offset="1" stop-color="#4F595F"/></linearGradient>
<radialGradient id="wellG" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#D6DDE0"/><stop offset="1" stop-color="#9FAAB0"/></radialGradient>
<radialGradient id="moundG" cx="36%" cy="26%" r="85%"><stop offset="0" stop-color="#FFD768"/><stop offset=".55" stop-color="#EBA83A"/><stop offset="1" stop-color="#C47A22"/></radialGradient>
<radialGradient id="moundShade" cx="34%" cy="26%" r="82%"><stop offset="0" stop-color="#FFF0B0" stop-opacity=".26"/><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#3A1A00" stop-opacity=".5"/></radialGradient>
<linearGradient id="moundFloor" x1="0" y1="0" x2="0" y2="1"><stop offset=".62" stop-color="#2A1200" stop-opacity="0"/><stop offset="1" stop-color="#2A1200" stop-opacity=".45"/></linearGradient>
<radialGradient id="cutG" cx="68%" cy="78%" r="85%"><stop offset="0" stop-color="#FFF0C0"/><stop offset=".55" stop-color="#F0C466"/><stop offset="1" stop-color="#B2701F"/></radialGradient>
<radialGradient id="cutShade" cx="30%" cy="20%" r="85%"><stop offset="0" stop-color="#4A2400" stop-opacity=".78"/><stop offset=".5" stop-color="#4A2400" stop-opacity=".18"/><stop offset="1" stop-color="#4A2400" stop-opacity="0"/></radialGradient>
<linearGradient id="pineG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF1A6"/><stop offset="1" stop-color="#EBBB3C"/></linearGradient>
<linearGradient id="cashG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FBEFCB"/><stop offset="1" stop-color="#E2C384"/></linearGradient>
<radialGradient id="raisG" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#7A4452"/><stop offset="1" stop-color="#2E1018"/></radialGradient>
<linearGradient id="spoonG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3F6F7"/><stop offset=".5" stop-color="#B3BDC2"/><stop offset="1" stop-color="#6F7A80"/></linearGradient>
<linearGradient id="handleG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EFF3F4"/><stop offset=".5" stop-color="#AEB8BD"/><stop offset="1" stop-color="#707B81"/></linearGradient>
<linearGradient id="pileG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F6C862"/><stop offset="1" stop-color="#C9812A"/></linearGradient>
<linearGradient id="gheeBand" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFF8D8" stop-opacity="0"/><stop offset=".5" stop-color="#FFFBE8" stop-opacity=".85"/><stop offset="1" stop-color="#FFF8D8" stop-opacity="0"/></linearGradient>
<linearGradient id="tumG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6F7A80"/><stop offset=".35" stop-color="#E2E8EA"/><stop offset="1" stop-color="#7C878D"/></linearGradient>
<radialGradient id="vig" cx="50%" cy="48%" r="75%"><stop offset=".55" stop-color="#0E241E" stop-opacity="0"/><stop offset="1" stop-color="#0E241E" stop-opacity=".55"/></radialGradient>
<linearGradient id="pineFace" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="#FFEF74"/><stop offset=".6" stop-color="#FFD93F"/><stop offset="1" stop-color="#F6C02A"/></linearGradient><clipPath id="pineClip"><path d="${PINE}"/></clipPath><clipPath id="domeClip"><path d="${DOME}"/></clipPath><clipPath id="pileClip"><path d="${PILE}"/></clipPath>`;

// steam wisp (vertical S-curve), p = 0..1 life
function wisp(x, y, h, sway, ph, t, op, w) {
  const a = Math.sin(t * 1.2 + ph) * sway, b = Math.sin(t * 1.2 + ph + 2) * sway;
  return `<path d="M${F(x)},${F(y)} C${F(x + a)},${F(y - h * 0.33)} ${F(x + b)},${F(y - h * 0.66)} ${F(x + a * 0.6)},${F(y - h)}" fill="none" stroke="#FFF8EA" stroke-width="${w}" stroke-linecap="round" opacity="${F(Math.min(1, op * 1.6) * 100) / 100}" filter="url(#blurW)"/>`;
}

window.SCENE = { dur: DUR, setT(t, stage) {
  // ---- camera: slow push-in about the plate
  const cam = 1.04 + 0.1 * eio(t / DUR);
  // ---- spoon
  const [sx, sy, sr] = pathAt(SPOON, t), spoonOn = t > 0.9 && t < 4.0;
  const cavK = eo(seg(t, 2.2, 2.6));
  const pileK = eob(seg(t, 2.12, 2.5), 1.2);
  // ---- pineapple drop
  let ph = null;
  if (t >= 3.3) {
    let x, y, rot, sq = 1;
    if (t < 3.78) { const u = (t - 3.3) / 0.48; y = lerp(-90, REST.y, u * u); x = lerp(452, REST.x, u); rot = lerp(-48, 6, eio(u)); }
    else {
      const d = t - 3.78; x = REST.x;
      let h = 0;
      if (d < 0.24) { const u = d / 0.24; h = 30 * 4 * u * (1 - u); } else if (d < 0.38) { const u = (d - 0.24) / 0.14; h = 8 * 4 * u * (1 - u); }
      y = REST.y - h; rot = 6 + 7 * Math.sin(d * 24) * Math.exp(-d * 6.5);
      if (d < 0.06) sq = 1 - 0.1 * Math.sin(Math.PI * d / 0.06); else if (d > 0.24 && d < 0.3) sq = 1 - 0.05 * Math.sin(Math.PI * (d - 0.24) / 0.06);
    }
    ph = { x, y, rot, sq };
  }
  const landed = t >= 3.78 ? Math.min(1, (t - 3.78) / 0.1) : 0;
  const sparkle = seg(t, 3.95, 4.15) * (1 - seg(t, 4.15, 4.5));

  // ---- steam: ambient wisps off the mound + hot breath from the cut face while it is open
  let steam = '';
  const amb = eo(seg(t, 0.2, 1.4));
  for (let i = 0; i < 5; i++) {
    const p = ((t * 0.17 + i * 0.21) % 1), x0 = 392 + i * 66 + Math.sin(i * 2.3) * 18, y0 = 730 - p * 240;
    steam += wisp(x0, y0, 220, 42 + i * 4, i * 1.7, t, Math.sin(Math.PI * p) * 0.28 * amb, 46 + (i % 2) * 14);
  }
  const cut = seg(t, 2.35, 2.8) * (1 - seg(t, 3.5, 4.1));
  for (let i = 0; i < 3; i++) {
    const p = ((t * 0.3 + i * 0.33) % 1);
    steam += wisp(690 + (i - 1) * 40, 800 - p * 260, 200, 40, i * 2.1 + 1, t, Math.sin(Math.PI * p) * 0.34 * cut, 44);
  }

  // ---- dust
  let dust = '';
  for (const d of DUST) {
    const u = t - d.ts; if (u < 0 || u > d.life) continue;
    const a = Math.sin(Math.PI * u / d.life) * 0.85;
    dust += `<circle cx="${F(d.x + d.vx * u + Math.sin(u * 3 + d.ph) * d.sw)}" cy="${F(d.y + d.vy * u)}" r="${F(d.s)}" fill="${d.c}" opacity="${F(a * 100) / 100}"/>`;
  }

  // ---- mound (masked by the scoop cut so the silhouette really loses a hill)
  const cavE = (k) => `<ellipse cx="${CAV.x}" cy="${CAV.y}" rx="${F(CAV.rx * k)}" ry="${F(CAV.ry * k)}" transform="rotate(${CAV.rot} ${CAV.x} ${CAV.y})"`;
  const mask = `<mask id="mm" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920"><rect width="1080" height="1920" fill="#fff"/>${cavK > 0 ? cavE(cavK) + ' fill="#000"/>' : ''}</mask>`;
  const mound = `<g mask="url(#mm)"><path d="${DOME}" fill="url(#moundG)"/>${MOUND_GRAINS}${FLECKS}${TOPPINGS}<path d="${DOME}" fill="url(#moundShade)"/><path d="${DOME}" fill="url(#moundFloor)"/>${SHEEN}</g>`;
  const cutFace = cavK > 0 ? `<g clip-path="url(#domeClip)"><clipPath id="cavClip">${cavE(cavK)}/></clipPath><g clip-path="url(#cavClip)">
    <rect x="560" y="720" width="300" height="260" fill="url(#cutG)"/>${CUT_GRAINS}<rect x="560" y="720" width="300" height="260" fill="url(#cutShade)"/>
    <ellipse cx="${CAV.x + 30}" cy="${CAV.y + 36}" rx="40" ry="12" fill="#FFF9DC" opacity=".5" transform="rotate(-20 ${CAV.x + 30} ${CAV.y + 36})" filter="url(#sh3)"/></g>
    ${cavE(cavK)} fill="none" stroke="#7A4310" stroke-width="5" opacity=".5" filter="url(#sh3)"/>${cavE(cavK * 0.985)} fill="none" stroke="#FFE9A8" stroke-width="2.4" opacity=".55" clip-path="url(#domeClip)"/></g>` : '';

  // ---- spoon (bowl, scoop pile with ghee sweep, handle)
  const sweepX = lerp(-150, 150, eio(seg(t, 2.7, 3.35))), sweepOn = seg(t, 2.7, 2.8) * (1 - seg(t, 3.3, 3.4));
  const spoon = !spoonOn ? '' : `<g transform="translate(${F(sx + 24)},${F(sy + 40)}) rotate(${F(sr)}) scale(1.5)" opacity=".28" filter="url(#blur9)"><ellipse cx="0" cy="6" rx="96" ry="34" fill="#2A1400"/></g>
  <g transform="translate(${F(sx)},${F(sy)}) rotate(${F(sr)}) scale(1.5)">
    <path d="M90,-9 C240,-16 460,-26 640,-26 C650,-26 652,-12 640,-10 C470,0 240,10 92,12Z" fill="url(#handleG)" stroke="#5E686E" stroke-width="1.5"/>
    <path d="M110,-6 C260,-12 460,-20 630,-20" fill="none" stroke="#FFFFFF" stroke-width="3" opacity=".75" stroke-linecap="round"/>
    <ellipse cx="0" cy="-2" rx="97" ry="27" fill="#5A656B"/><ellipse cx="2" cy="-3" rx="86" ry="21" fill="#8D989E"/>
    ${pileK > 0.01 ? `<g transform="scale(${F(0.7 + 0.3 * pileK)},${F(pileK)})"><path d="${PILE}" fill="url(#pileG)"/><g clip-path="url(#pileClip)">${PILE_GRAINS}<path d="${PILE}" fill="url(#moundShade)"/>
      <rect x="${F(sweepX - 28)}" y="-110" width="56" height="120" fill="url(#gheeBand)" opacity="${F(sweepOn * 100) / 100}" transform="rotate(18 ${F(sweepX)} -50)"/>
      <ellipse cx="-30" cy="-62" rx="26" ry="6" fill="#FFF4C8" opacity=".55" transform="rotate(-24 -30 -62)" filter="url(#sh3)"/></g></g>` : ''}
    <path d="M-97,-2 A97,42 0 0 0 97,-2 C70,10 -70,10 -97,-2Z" fill="url(#spoonG)"/>
    <path d="M-97,-2 A97,42 0 0 0 97,-2" fill="none" stroke="#5E686E" stroke-width="2"/>
    <path d="M-70,14 C-30,30 30,30 70,14" fill="none" stroke="#FFFFFF" stroke-width="3" opacity=".6" stroke-linecap="round"/>
  </g>`;

  const chunk = ph ? pineChunk(ph.x, ph.y, ph.rot, 1.85, ph.sq) : '';
  const impact = landed > 0 && t < 4.4 ? `<ellipse cx="${REST.x + 6}" cy="${REST.y + 34}" rx="${F(58 + 18 * (1 - landed))}" ry="14" fill="#6B3A0A" opacity="${F(0.3 * (1 - seg(t, 4.0, 4.4)) * 100) / 100}" filter="url(#sh3)"/>` : '';
  const star = sparkle > 0 ? `<g transform="translate(${REST.x + 22},${REST.y - 20}) scale(${F(sparkle)})" opacity="${F(sparkle * 100) / 100}"><path d="M0,-26 L4,-4 L26,0 L4,4 L0,26 L-4,4 L-26,0 L-4,-4Z" fill="#FFFDF0"/></g>` : '';

  // ---- out-of-focus steel tumbler behind the plate for depth
  const tumbler = `<g filter="url(#blur9)" opacity=".8"><path d="M82,610 L262,610 L240,880 L104,880Z" fill="url(#tumG)"/><ellipse cx="172" cy="610" rx="90" ry="16" fill="#C9D1D4"/><ellipse cx="172" cy="880" rx="68" ry="12" fill="#5A656B"/></g>
    <ellipse cx="190" cy="905" rx="130" ry="26" fill="#1B2A24" opacity=".25" filter="url(#blur16)"/>`;

  // ---- plate
  const plate = `<ellipse cx="${PX + 24}" cy="${PY + 92}" rx="452" ry="124" fill="#0E241E" opacity=".5" filter="url(#blur30)"/>
    <ellipse cx="${PX}" cy="${PY + 26}" rx="432" ry="137" fill="url(#sideG)"/>
    <ellipse cx="${PX}" cy="${PY}" rx="432" ry="137" fill="url(#plateG)"/><ellipse cx="${PX}" cy="${PY}" rx="432" ry="137" fill="none" stroke="#F6F9FA" stroke-width="5" opacity=".85"/>
    <ellipse cx="${PX}" cy="${PY + 6}" rx="352" ry="104" fill="url(#wellG)"/><ellipse cx="${PX}" cy="${PY + 6}" rx="352" ry="104" fill="none" stroke="#6F7A80" stroke-width="3" opacity=".7"/>
    <g fill="none" stroke="#FFFFFF" stroke-width="1.6" opacity=".16"><ellipse cx="${PX}" cy="${PY}" rx="400" ry="124"/><ellipse cx="${PX}" cy="${PY + 6}" rx="300" ry="88"/><ellipse cx="${PX}" cy="${PY + 6}" rx="220" ry="64"/></g>
    <ellipse cx="${PX}" cy="${PY + 54}" rx="318" ry="62" fill="#E2A93E" opacity=".26" filter="url(#blur9)"/>
    <ellipse cx="${PX + 6}" cy="${PY + 30}" rx="290" ry="68" fill="#2A1400" opacity=".5" filter="url(#blur14)"/>`;

  stage.innerHTML = `<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg"><defs>${defs}${mask}</defs>${K.steel(t)}
<g transform="translate(540,900) scale(${F(cam * 1000) / 1000}) translate(-540,-900)">${tumbler}${plate}${mound}${cutFace}${impact}${chunk}${star}${spoon}${steam}${dust}</g>
<rect width="1080" height="1920" fill="url(#vig)"/><rect width="1080" height="1920" filter="url(#grain)" opacity=".3"/></svg>`;
} };
})();
