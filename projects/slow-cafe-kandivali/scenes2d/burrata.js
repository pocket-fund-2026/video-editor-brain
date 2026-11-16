// Tomato confit bread with burrata - 2D editorial illustration. setT is pure in t.
(function () {
const f = (n) => Math.round(n * 10) / 10;
function blob(pts) {
  const n = pts.length; let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`;
  }
  return d + 'Z';
}
function ring(cx, cy, rx, ry, n, jit, R, rot = 0) {
  const pts = [];
  for (let i = 0; i < n; i++) { const a = rot + i / n * Math.PI * 2, k = 1 + (R() - 0.5) * jit; pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
  return blob(pts);
}
function bread(cx, cy, w, h, R) {
  const pts = [], n = 16;
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    const e = 0.42, x = Math.sign(c) * Math.pow(Math.abs(c), e), y = Math.sign(s) * Math.pow(Math.abs(s), e);
    let xx = x * w / 2, yy = y * h / 2;
    if (s < -0.2) xx *= 1.07; // muffin top overhang
    pts.push([cx + xx * (1 + (R() - 0.5) * 0.03), cy + yy * (1 + (R() - 0.5) * 0.04)]);
  }
  return blob(pts);
}
// ---------- static layout ----------
const R = K.rng(4711);
const PL = { cx: 520, cy: 1135, rx: 445, ry: 165 };
const slices = [
  { cx: 345, cy: 1120, w: 380, h: 220, rot: -4, id: 'sA', seed: 11 },
  { cx: 690, cy: 1135, w: 380, h: 220, rot: 5, id: 'sB', seed: 23 },
];
const TOM_POS = [];
function layTomatoes() {
  const rr = K.rng(99);
  const spots = [
    // slice A
    [225, 1125, 54], [300, 1075, 56], [395, 1060, 52], [455, 1125, 48], [270, 1180, 50], [360, 1155, 56], [215, 1058, 40], [440, 1190, 44],
    // slice B
    [600, 1085, 52], [690, 1070, 56], [775, 1100, 52], [820, 1165, 46], [640, 1170, 54], [730, 1185, 52], [585, 1200, 40], [790, 1050, 38],
  ];
  spots.forEach(([x, y, r], i) => {
    TOM_POS.push({ x: x + (rr() - 0.5) * 8, y: y + (rr() - 0.5) * 8, rx: r * (1 + rr() * 0.12), ry: r * (0.7 + rr() * 0.08), rot: (rr() - 0.5) * 50, g: i % 3, path: null, seed: i + 1, wr: rr() });
  });
}
layTomatoes();
const GARLIC = [[250, 1145, 20], [415, 1105, -30], [655, 1125, 15], [770, 1145, -25], [330, 1212, 35]];
const BASIL = [ // x,y,len,rot, front(draw after burrata)
  [262, 1090, 92, -150, 0], [455, 1075, 84, -35, 0], [610, 1060, 90, 160, 0], [760, 1070, 96, 25, 0], [345, 1218, 90, 200, 1], [560, 1230, 86, 12, 1], [715, 1228, 94, -165, 1], [835, 1115, 80, -20, 0],
];
const LAMPS = [[112, 400], [272, 520], [432, 360], [592, 600], [742, 450]];
const BUR = { x: 520, base: 1092, rx: 122, ry: 108 };

function lampOn(i, t) { // 0..1 with flicker
  const t0 = 0.1 + i * 0.25, k = (t - t0) / 0.22;
  if (k <= 0) return 0; if (k >= 1) return 1;
  const pat = [0.9, 0.12, 0.7, 0.2, 0.95, 0.5, 1];
  const x = k * (pat.length - 1), a = Math.floor(x); return pat[a] + (pat[Math.min(a + 1, pat.length - 1)] - pat[a]) * (x - a);
}
function sway(i, t) { return (1.6 + i * 0.15) * Math.sin(t * 1.25 + i * 1.7) + 0.6 * Math.sin(t * 2.3 + i * 0.8); }

const DEFS = `
<radialGradient id="gTom0" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#E5503A"/><stop offset=".45" stop-color="#BB2A20"/><stop offset="1" stop-color="#63100F"/></radialGradient>
<radialGradient id="gTom1" cx=".4" cy=".3" r=".85"><stop offset="0" stop-color="#D93E2E"/><stop offset=".5" stop-color="#A9211B"/><stop offset="1" stop-color="#560E0E"/></radialGradient>
<radialGradient id="gTom2" cx=".36" cy=".32" r=".85"><stop offset="0" stop-color="#E8603F"/><stop offset=".5" stop-color="#C0301F"/><stop offset="1" stop-color="#6E1410"/></radialGradient>
<radialGradient id="gMilk" cx=".36" cy=".3" r=".85"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#FBF6E8"/><stop offset="1" stop-color="#E2D6BC"/></radialGradient>
<radialGradient id="gMilkSh" cx=".4" cy=".35" r=".75"><stop offset=".6" stop-color="#C9B88E" stop-opacity="0"/><stop offset="1" stop-color="#B9A57A" stop-opacity=".55"/></radialGradient>
<linearGradient id="gCrumb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#EFCB8A"/><stop offset=".6" stop-color="#DDAB62"/><stop offset="1" stop-color="#C58C48"/></linearGradient>
<linearGradient id="gPlate" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#BDD3BF"/><stop offset=".5" stop-color="#9AB89D"/><stop offset="1" stop-color="#7FA084"/></linearGradient>
<linearGradient id="gWell" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#86A68B"/><stop offset=".45" stop-color="#9DBBA0"/><stop offset="1" stop-color="#B2CCB4"/></linearGradient>
<linearGradient id="gMug" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B6CFB8"/><stop offset=".45" stop-color="#9AB89D"/><stop offset="1" stop-color="#6F9174"/></linearGradient>
<linearGradient id="gSteel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3F5F7"/><stop offset=".5" stop-color="#C5CAD0"/><stop offset="1" stop-color="#8E959D"/></linearGradient>
<linearGradient id="gLeaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6FB056"/><stop offset="1" stop-color="#2F6B34"/></linearGradient>
<linearGradient id="gCone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF8E6" stop-opacity=".30"/><stop offset="1" stop-color="#FFF8E6" stop-opacity="0"/></linearGradient>
<radialGradient id="gHalo"><stop offset="0" stop-color="#FFFBEF" stop-opacity=".95"/><stop offset=".25" stop-color="#FFF6DC" stop-opacity=".45"/><stop offset="1" stop-color="#FFF3D4" stop-opacity="0"/></radialGradient>
<radialGradient id="gGlobeOn" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#FFFCF2"/><stop offset="1" stop-color="#F3EEDD"/></radialGradient>
<radialGradient id="gGlobeOff" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#D9DCE0"/><stop offset=".6" stop-color="#A9AEB5"/><stop offset="1" stop-color="#7A7F87"/></radialGradient>
<radialGradient id="gGlint"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<filter id="blur3"><feGaussianBlur stdDeviation="3"/></filter>`;

function lamps(t) {
  let cones = '', glows = '', bodies = '', sum = 0;
  LAMPS.forEach(([x, cy], i) => {
    const on = lampOn(i, t); sum += on; const a = sway(i, t);
    cones += `<g transform="rotate(${f(a)} ${x} 0)"><polygon points="${x - 50},${cy + 20} ${x + 50},${cy + 20} ${x + 250},${cy + 820} ${x - 250},${cy + 820}" fill="url(#gCone)" opacity="${f(on * 0.9) }"/></g>`;
    glows += `<g transform="rotate(${f(a)} ${x} 0)"><circle cx="${x}" cy="${cy}" r="${f(200 * (0.5 + 0.5 * on))}" fill="url(#gHalo)" opacity="${f(on * 0.85)}"/></g>`;
    bodies += `<g transform="rotate(${f(a)} ${x} 0)">
<line x1="${x}" y1="-10" x2="${x}" y2="${cy - 96}" stroke="#1B1B1A" stroke-width="3.2"/>
<circle cx="${x}" cy="${cy}" r="58" fill="url(#gGlobeOff)"/>
<ellipse cx="${x - 20}" cy="${cy - 22}" rx="16" ry="9" fill="#fff" opacity="${f(0.35 * (1 - on))}" transform="rotate(-30 ${x - 20} ${cy - 22})"/>
<circle cx="${x}" cy="${cy}" r="58" fill="url(#gGlobeOn)" opacity="${f(on)}"/>
<ellipse cx="${x - 22}" cy="${cy - 24}" rx="14" ry="8" fill="#fff" opacity=".55" transform="rotate(-35 ${x - 22} ${cy - 24})"/>
<path d="M${x - 24},${cy - 50} L${x - 17},${cy - 82} Q${x},${cy - 90} ${x + 17},${cy - 82} L${x + 24},${cy - 50}Z" fill="#161615"/>
<path d="M${x - 14},${cy - 80} Q${x - 4},${cy - 86} ${x - 2},${cy - 60}" stroke="#4a4a48" stroke-width="2.5" fill="none"/>
<rect x="${x - 27}" y="${cy - 56}" width="54" height="7" rx="3" fill="#B8924A"/><rect x="${x - 27}" y="${cy - 56}" width="54" height="2.5" rx="1.2" fill="#E5C98A"/>
</g>`;
  });
  return { cones, glows, bodies, avg: sum / 5 };
}

function plateAndMug() {
  const { cx, cy, rx, ry } = PL;
  let s = '';
  // mug behind right
  const mx = 858, mb = 1045, mt = 872;
  s += `<g>
<ellipse cx="${mx + 26}" cy="${mb + 6}" rx="115" ry="26" fill="#1c1d20" opacity=".35" filter="url(#blur14)"/>
<path d="M${mx - 78},${mt} L${mx - 70},${mb - 4} Q${mx},${mb + 26} ${mx + 70},${mb - 4} L${mx + 78},${mt}Z" fill="url(#gMug)"/>
<path d="M${mx + 58},${mt + 24} C${mx + 134},${mt + 14} ${mx + 140},${mt + 112} ${mx + 66},${mt + 124}" fill="none" stroke="#86A98B" stroke-width="20" stroke-linecap="round"/>
<path d="M${mx + 58},${mt + 24} C${mx + 134},${mt + 14} ${mx + 140},${mt + 112} ${mx + 66},${mt + 124}" fill="none" stroke="#C0D6C2" stroke-width="4" stroke-linecap="round" transform="translate(-3,-3)" opacity=".7"/>
<ellipse cx="${mx}" cy="${mt}" rx="78" ry="21" fill="#B9D0BB"/><ellipse cx="${mx}" cy="${mt + 2}" rx="66" ry="16" fill="#3a2a22"/>
<ellipse cx="${mx - 4}" cy="${mt + 4}" rx="58" ry="12" fill="#5a3d2e"/><ellipse cx="${mx - 18}" cy="${mt + 1}" rx="22" ry="4" fill="#8a6850" opacity=".7"/>
<path d="M${mx - 62},${mt + 28} Q${mx - 60},${mt + 90} ${mx - 52},${mb - 14}" stroke="#fff" stroke-opacity=".4" stroke-width="7" fill="none" stroke-linecap="round"/>
</g>`;
  // plate
  s += `<ellipse cx="${cx + 42}" cy="${cy + 70}" rx="${rx + 20}" ry="${ry + 8}" fill="#1b1c1f" opacity=".5" filter="url(#blur30)"/>
<ellipse cx="${cx + 14}" cy="${cy + 40}" rx="${rx - 4}" ry="${ry - 2}" fill="#16181a" opacity=".35" filter="url(#blur14)"/>
<ellipse cx="${cx}" cy="${cy + 26}" rx="${rx}" ry="${ry}" fill="#6B8A70"/>
<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#gPlate)"/>
<ellipse cx="${cx}" cy="${cy}" rx="${rx - 6}" ry="${ry - 6}" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="3"/>
<ellipse cx="${cx}" cy="${cy + 8}" rx="${rx * 0.76}" ry="${ry * 0.74}" fill="url(#gWell)"/>
<path d="M${cx - rx * 0.76},${cy + 8} A${rx * 0.76},${ry * 0.74} 0 0 1 ${cx + rx * 0.4},${cy + 8 - ry * 0.62}" fill="none" stroke="#5F7F65" stroke-opacity=".55" stroke-width="9" stroke-linecap="round" filter="url(#blur6)"/>
<path d="M${cx - rx + 40},${cy + 18} Q${cx - rx + 50},${cy - ry * 0.7} ${cx - 120},${cy - ry + 14}" stroke="#fff" stroke-opacity=".5" stroke-width="7" fill="none" stroke-linecap="round" filter="url(#blur3)"/>`;
  return s;
}

function slice(sl) {
  const r = K.rng(sl.seed * 131);
  const body = bread(0, 0, sl.w, sl.h, r);
  let pores = '', chars = '';
  for (let i = 0; i < 70; i++) {
    const px = (r() - 0.5) * sl.w * 0.86, py = (r() - 0.5) * sl.h * 0.8, pr = 3 + r() * 9;
    pores += `<ellipse cx="${f(px)}" cy="${f(py)}" rx="${f(pr * 1.2)}" ry="${f(pr * 0.8)}" fill="#A5702F" opacity="${f(0.35 + r() * 0.3)}" transform="rotate(${f(r() * 180)} ${f(px)} ${f(py)})"/><ellipse cx="${f(px - 1)}" cy="${f(py - 1.5)}" rx="${f(pr * 0.8)}" ry="${f(pr * 0.45)}" fill="#F6DDA6" opacity=".6" transform="rotate(${f(r() * 180)} ${f(px)} ${f(py)})"/>`;
  }
  for (let i = 0; i < 5; i++) { const x0 = -sl.w * 0.42 + i * sl.w * 0.2; chars += `<path d="M${f(x0)},${-sl.h * 0.5} L${f(x0 + 70)},${sl.h * 0.5}" stroke="#4B2A12" stroke-width="${f(14 + r() * 8)}" stroke-linecap="round" opacity="${f(0.28 + r() * 0.2)}"/>`; }
  return `<g transform="translate(${sl.cx},${sl.cy}) rotate(${sl.rot})">
<path d="${body}" transform="translate(10,16) scale(1.02)" fill="#18110C" opacity=".4" filter="url(#blur14)"/>
<path d="${body}" transform="translate(0,34)" fill="#4A2812"/>
<path d="${body}" transform="translate(0,22)" fill="#6B3C1B"/>
<path d="${body}" transform="translate(0,10)" fill="#7E4B22"/>
<path d="${body}" fill="#74431F"/>
<clipPath id="${sl.id}c"><path d="${body}" transform="scale(0.955)"/></clipPath>
<path d="${body}" transform="scale(0.955)" fill="url(#gCrumb)"/>
<g clip-path="url(#${sl.id}c)">${chars}${pores}
<path d="${body}" transform="scale(0.955)" fill="none" stroke="#7A4720" stroke-width="30" opacity=".35" filter="url(#blur14)"/>
<ellipse cx="${-sl.w * 0.16}" cy="${-sl.h * 0.25}" rx="${sl.w * 0.22}" ry="${sl.h * 0.14}" fill="#FFF0C4" opacity=".4" filter="url(#blur14)"/></g>
<path d="${body}" transform="scale(0.955)" fill="none" stroke="#5E3416" stroke-width="3" opacity=".6"/>
<path d="${body}" fill="none" stroke="#9A6430" stroke-width="2" opacity=".5" transform="translate(-2,-3)"/>
</g>`;
}

function tomato(T) {
  const r = K.rng(T.seed * 977);
  const p = ring(0, 0, T.rx, T.ry, 11, 0.16, r, r() * 6);
  const pi = ring(0, 0, T.rx * 0.62, T.ry * 0.6, 8, 0.2, r, r() * 6);
  let wr = '';
  for (let i = 0; i < 4; i++) { const a = r() * 6.28, d = 0.35 + r() * 0.4; wr += `<path d="M${f(Math.cos(a) * T.rx * d)},${f(Math.sin(a) * T.ry * d)} q${f((r() - 0.5) * 24)},${f((r() - 0.5) * 16)} ${f((r() - 0.5) * 30)},${f((r() - 0.5) * 20)}" stroke="#5B0F10" stroke-width="2.2" fill="none" opacity=".55" stroke-linecap="round"/>`; }
  let seeds = '';
  for (let i = 0; i < 4; i++) seeds += `<ellipse cx="${f((r() - 0.5) * T.rx * 0.6)}" cy="${f((r() - 0.5) * T.ry * 0.5)}" rx="3" ry="1.8" fill="#EBC672" opacity=".75" transform="rotate(${f(r() * 180)} 0 0)"/>`;
  return `<g transform="translate(${f(T.x)},${f(T.y)}) rotate(${f(T.rot)})">
<path d="${p}" fill="url(#gTom${T.g})"/>
<path d="${p}" fill="none" stroke="#3E0A0B" stroke-width="5" opacity=".55" stroke-linejoin="round"/>
<path d="${p}" fill="none" stroke="#C9452F" stroke-width="1.5" opacity=".6" transform="scale(.9)"/>
<path d="${pi}" fill="#C23224" opacity=".55" transform="translate(-3,-2)"/>${seeds}${wr}
<ellipse cx="${f(-T.rx * 0.3)}" cy="${f(-T.ry * 0.4)}" rx="${f(T.rx * 0.2)}" ry="${f(T.ry * 0.1)}" fill="#fff" opacity=".45" transform="rotate(-18 ${f(-T.rx * 0.3)} ${f(-T.ry * 0.4)})"/>
<ellipse cx="${f(T.rx * 0.22)}" cy="${f(T.ry * 0.35)}" rx="${f(T.rx * 0.1)}" ry="${f(T.ry * 0.05)}" fill="#FFB9A0" opacity=".55"/>
</g>`;
}
function garlic(x, y, a) {
  return `<g transform="translate(${x},${y}) rotate(${a})"><path d="M-22,2 C-20,-18 8,-22 24,-4 C30,4 22,14 6,14 C-10,15 -23,12 -22,2Z" fill="#F3E6C2"/><path d="M-22,2 C-20,-18 8,-22 24,-4" stroke="#C99A52" stroke-width="3" fill="none" opacity=".7"/><path d="M-14,8 C0,12 14,10 22,2 C14,14 -8,16 -14,8Z" fill="#CDB07A" opacity=".7"/><ellipse cx="-6" cy="-9" rx="9" ry="3" fill="#fff" opacity=".7" transform="rotate(-15 -6 -9)"/></g>`;
}
function basil(x, y, len, rot) {
  const h = len * 0.55;
  return `<g transform="translate(${x},${y}) rotate(${rot})"><path d="M${-len / 2},0 C${-len / 4},${-h} ${len / 4},${-h * 1.05} ${len / 2},0 C${len / 4},${h * 0.9} ${-len / 4},${h} ${-len / 2},0Z" fill="#183E22" opacity=".35" transform="translate(5,8)"/>
<path d="M${-len / 2},0 C${-len / 4},${-h} ${len / 4},${-h * 1.05} ${len / 2},0 C${len / 4},${h * 0.9} ${-len / 4},${h} ${-len / 2},0Z" fill="url(#gLeaf)"/>
<path d="M${-len / 2},0 C${-len / 4},${-h * 0.2} ${len / 4},${-h * 0.2} ${len / 2},0 C${len / 4},${h * 0.9} ${-len / 4},${h} ${-len / 2},0Z" fill="#1F5A2A" opacity=".35"/>
<path d="M${-len / 2 + 4},0 Q0,${-3} ${len / 2 - 6},0" stroke="#A9D98F" stroke-width="2.6" fill="none"/>
<path d="M${-len * 0.1},-1 q${len * 0.08},${-h * 0.4} ${len * 0.22},${-h * 0.62} M${len * 0.1},-1 q${len * 0.06},${h * 0.3} ${len * 0.15},${h * 0.5} M${-len * 0.18},1 q${len * 0.05},${h * 0.3} ${len * 0.12},${h * 0.5}" stroke="#A9D98F" stroke-width="1.6" fill="none" opacity=".7"/>
<ellipse cx="${-len * 0.12}" cy="${-h * 0.4}" rx="${len * 0.12}" ry="3" fill="#fff" opacity=".35" transform="rotate(-15)"/></g>`;
}

function oilSheen() {
  const r = K.rng(555); let s = '';
  for (let i = 0; i < 14; i++) { const x = 220 + r() * 640, y = 1130 + r() * 110, w = 14 + r() * 28; s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(w)}" ry="${f(w * 0.4)}" fill="#EBC14A" opacity="${f(0.22 + r() * 0.15)}"/><ellipse cx="${f(x - w * 0.3)}" cy="${f(y - 2)}" rx="${f(w * 0.3)}" ry="2" fill="#fff" opacity=".5"/>`; }
  return s;
}

// burrata ball (local coords: base at y=0, centre (0,-ry))
function ballShape(knot = true) {
  const { rx, ry } = BUR, cy = -ry;
  const K1 = knot ? `<path d="M-40,${cy - ry + 24} C-50,${cy - ry - 22} -14,${cy - ry - 44} 6,${cy - ry - 62} C14,${cy - ry - 74} 36,${cy - ry - 66} 30,${cy - ry - 46} C26,${cy - ry - 30} 42,${cy - ry - 16} 44,${cy - ry + 26}Z" fill="url(#gMilk)"/>
<path d="M-40,${cy - ry + 24} C-50,${cy - ry - 22} -14,${cy - ry - 44} 6,${cy - ry - 62} C14,${cy - ry - 74} 36,${cy - ry - 66} 30,${cy - ry - 46} C26,${cy - ry - 30} 42,${cy - ry - 16} 44,${cy - ry + 26}Z" fill="url(#gMilkSh)"/>
<path d="M-26,${cy - ry + 14} q22,-30 38,-48 M-14,${cy - ry + 20} q26,-26 44,-52 M-4,${cy - ry + 24} q20,-16 36,-34" stroke="#CFC2A3" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>
<path d="M-10,${cy - ry - 36} q12,-8 24,-2" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".9"/>` : '';
  return `<g>
${K1}
<ellipse cx="0" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#gMilk)"/>
<ellipse cx="0" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#gMilkSh)"/>
<path d="M-52,${cy - ry + 12} Q0,${cy - ry - 10} 56,${cy - ry + 14} Q20,${cy - ry + 34} -52,${cy - ry + 12}Z" fill="#EFE5CC" opacity=".8"/>
<path d="M-70,${cy + 40} Q-20,${cy + 82} 60,${cy + 66}" stroke="#D5C6A2" stroke-width="10" fill="none" stroke-linecap="round" opacity=".35" filter="url(#blur6)"/>
<ellipse cx="${-rx * 0.38}" cy="${cy - ry * 0.4}" rx="30" ry="15" fill="#fff" opacity=".85" transform="rotate(-30 ${-rx * 0.38} ${cy - ry * 0.4})"/>
<ellipse cx="${-rx * 0.5}" cy="${cy - ry * 0.12}" rx="8" ry="4" fill="#fff" opacity=".7" transform="rotate(-50 ${-rx * 0.5} ${cy - ry * 0.12})"/>
</g>`;
}

const STRANDS = [
  ['M-14,-70 C-40,-60 -80,-36 -128,6', 34], ['M14,-70 C44,-60 88,-34 134,10', 36], ['M-2,-62 C-6,-34 -2,-6 -4,34', 34],
];
function stracciatella(t, bx, base) {
  const p0 = K.eo(K.seg(t, 2.98, 3.7));
  if (p0 <= 0) return '';
  let s = `<g transform="translate(${bx},${base})">`;
  // pool
  const pp = K.eo(K.seg(t, 3.2, 4.5));
  s += `<g opacity="${f(Math.min(1, pp * 1.5))}"><ellipse cx="6" cy="22" rx="${f(40 + 130 * pp)}" ry="${f(8 + 24 * pp)}" fill="#E3D6B8"/><ellipse cx="0" cy="18" rx="${f(36 + 124 * pp)}" ry="${f(8 + 22 * pp)}" fill="#FFFAEC"/><ellipse cx="-${f(20 * pp)}" cy="${f(14 - 3 * pp)}" rx="${f(18 + 40 * pp)}" ry="${f(3 + 6 * pp)}" fill="#fff" opacity=".8"/></g>`;
  // mound in the gap
  const m = p0;
  s += `<ellipse cx="3" cy="-96" rx="${f(18 + 52 * m)}" ry="${f(30 + 78 * m)}" fill="#E6DAC0"/><ellipse cx="0" cy="-100" rx="${f(16 + 48 * m)}" ry="${f(30 + 76 * m)}" fill="#FFFBEF"/>
<ellipse cx="-12" cy="${f(-130 - 6 * m)}" rx="${f(8 + 20 * m)}" ry="${f(6 + 14 * m)}" fill="#fff" opacity=".9"/>`;
  STRANDS.forEach(([d, w], i) => {
    const p = K.eo(K.seg(t, 3.0 + i * 0.07, 3.85 + i * 0.12));
    if (p <= 0.01) return;
    const dash = `stroke-dasharray="1" stroke-dashoffset="${f(1 - p)}" pathLength="1"`;
    s += `<path d="${d}" ${dash} fill="none" stroke="#E3D6B9" stroke-width="${w + 4}" stroke-linecap="round" transform="translate(3,5)"/>
<path d="${d}" ${dash} fill="none" stroke="#FFFAEC" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  });
  // oil drops
  const od = K.eo(K.seg(t, 3.45, 3.95));
  if (od > 0) {
    [[-60, -14, 9], [40, -26, 7], [88, 4, 8], [-120, 6, 6], [8, 14, 9], [-26, 24, 6], [130, -12, 6]].forEach(([x, y, r], i) => {
      const o = od * (0.85 - i * 0.04);
      s += `<ellipse cx="${x}" cy="${y}" rx="${r * 1.3}" ry="${r * 0.85}" fill="#EAB93C" opacity="${f(0.5 * o)}"/><ellipse cx="${x - r * 0.35}" cy="${y - r * 0.3}" rx="${r * 0.4}" ry="${r * 0.22}" fill="#fff" opacity="${f(o)}"/>`;
    });
  }
  // final glints
  const g = Math.sin(Math.PI * K.seg(t, 4.55, 5.2));
  if (g > 0) {
    const gx = -18, gy = -140, sz = 34 * g;
    s += `<g opacity="${f(g)}"><circle cx="${gx}" cy="${gy}" r="${f(22 * g)}" fill="url(#gGlint)"/><path d="M${gx - sz},${gy} L${gx},${gy - sz * 0.14} L${gx + sz},${gy} L${gx},${gy + sz * 0.14}Z M${gx},${gy - sz} L${gx + sz * 0.14},${gy} L${gx},${gy + sz} L${gx - sz * 0.14},${gy}Z" fill="#fff"/></g>`;
  }
  return s + '</g>';
}

function burrata(t) {
  const { x, base } = BUR;
  const drop = K.seg(t, 1.7, 2.02);
  if (t < 1.62) return { back: '', front: '' };
  const fall = (1 - drop * drop) * 240; // above rest
  const op = K.seg(t, 1.62, 1.75);
  // squash after landing
  const sq = t > 2.02 ? Math.exp(-(t - 2.02) * 6.5) * Math.sin((t - 2.02) * 24) : 0;
  const squash = t > 2.02 ? Math.max(0, Math.exp(-(t - 2.02) * 7) * Math.cos((t - 2.02) * 22)) : 0;
  const sx = 1 + 0.17 * squash + (t < 2.02 ? 0 : 0) - 0.03 * sq * 0, sy = 1 - 0.17 * squash + (drop < 1 ? 0.04 * drop : 0);
  const sh = K.eo(K.seg(t, 1.7, 2.02));
  let s = `<g opacity="${f(op)}">`;
  // contact shadow
  s += `<ellipse cx="${x + 40}" cy="${base + 6}" rx="${f(120 + 40 * (sh))}" ry="${f(26 * (0.5 + sh * 0.5))}" fill="#2a1409" opacity="${f(0.2 + 0.35 * sh)}" filter="url(#blur14)"/>`;
  const cutP = K.eio(K.seg(t, 2.95, 3.65));
  const seam = K.seg(t, 2.72, 2.95);
  if (t < 2.95) {
    s += `<g transform="translate(${x},${base - fall}) scale(${f(sx * 1000) / 1000},${f(sy * 1000) / 1000})">${ballShape()}`;
    if (seam > 0) s += `<path d="M2,${-BUR.ry * 2 - 8 + seam * 0} L-2,${f(-BUR.ry * 2 + seam * BUR.ry * 1.9)}" stroke="#BFB08A" stroke-width="4" stroke-linecap="round" fill="none" opacity="${f(0.9)}"/>`;
    s += `</g>`;
  } else {
    const d = 70 * cutP, a = 7 * cutP, sink = 1 - 0.07 * cutP;
    const half = (side) => `<g transform="translate(${x + side * d},${base}) rotate(${f(side * a)} ${side * 40} 0) scale(${f(1 + 0.04 * cutP)},${f(sink)})">
<clipPath id="bh${side > 0 ? 'R' : 'L'}"><rect x="${side > 0 ? 0 : -200}" y="-400" width="200" height="440"/></clipPath>
<g clip-path="url(#bh${side > 0 ? 'R' : 'L'})">${ballShape(false)}
<clipPath id="fc${side > 0 ? 'R' : 'L'}"><ellipse cx="0" cy="${-BUR.ry}" rx="${BUR.rx}" ry="${BUR.ry}"/></clipPath>
<g clip-path="url(#fc${side > 0 ? 'R' : 'L'})"><rect x="${side > 0 ? 0 : -16}" y="-300" width="16" height="300" fill="#FFFCF0"/><rect x="${side > 0 ? 0 : -3}" y="-300" width="3" height="300" fill="#E9DCBC"/></g></g></g>`;
    s += half(-1) + half(1);
  }
  s += `</g>`;
  const strac = t >= 2.98 ? stracciatella(t, x, base - 4) : '';
  return { back: s, front: strac };
}

function knife(t) {
  // tip position over time
  let tx, ty, ang = -8;
  if (t < 2.45 || t > 3.7) return '';
  if (t < 2.7) { const k = K.eo(K.seg(t, 2.45, 2.7)); tx = K.lerp(1250, 700, k); ty = K.lerp(1040, 1034, k); }
  else if (t < 2.95) { const k = K.eio(K.seg(t, 2.7, 2.95)); tx = K.lerp(700, 560, k); ty = K.lerp(1034, 1096, k); ang = -8 + 3 * k; }
  else { const k = K.eio(K.seg(t, 3.05, 3.6)); tx = K.lerp(560, 1250, k); ty = K.lerp(1096, 1060, k); ang = -5 - 3 * k; }
  return `<g transform="translate(${f(tx)},${f(ty)}) rotate(${f(ang)})">
<path d="M0,0 C80,-4 220,-26 340,-28 L340,34 C230,32 80,14 0,0Z" transform="translate(16,26)" fill="#15110E" opacity=".35" filter="url(#blur14)"/>
<path d="M0,0 C80,-6 220,-28 340,-30 L340,32 C240,30 90,12 0,0Z" fill="url(#gSteel)"/>
<path d="M4,0 C80,-6 220,-28 340,-30 L340,-22 C220,-20 80,-2 4,0Z" fill="#fff" opacity=".7"/>
<path d="M14,3 C90,10 230,26 336,29" stroke="#6C737B" stroke-width="2" fill="none" opacity=".7"/>
<rect x="338" y="-33" width="26" height="68" rx="4" fill="#B8924A"/><rect x="338" y="-33" width="26" height="8" rx="3" fill="#E5C98A"/>
<path d="M364,-24 L560,-20 Q580,-18 580,2 Q580,22 560,24 L364,28Z" fill="#2F2E2C"/>
<path d="M370,-20 L556,-16" stroke="#6b6a66" stroke-width="3" opacity=".7"/>
<circle cx="410" cy="2" r="5" fill="#B8924A"/><circle cx="480" cy="1" r="5" fill="#B8924A"/><circle cx="410" cy="1" r="2" fill="#E5C98A"/>
</g>`;
}


// ===== v2 overrides (later declarations win) =====
TOM_POS.length = 0;
(function () {
  const rr = K.rng(321);
  const spots = [
    [235,1120,62],[310,1068,48],[385,1055,58],[455,1115,40],[270,1185,44],[350,1150,66],[210,1050,30],[430,1190,36],[300,1130,26],[402,1100,30],
    [600,1085,46],[690,1065,60],[775,1095,44],[825,1160,38],[645,1165,64],[735,1180,50],[585,1205,30],[790,1050,30],[700,1122,26],[762,1138,26],
  ];
  spots.forEach(([x, y, r], i) => TOM_POS.push({ x: x + (rr() - 0.5) * 8, y: y + (rr() - 0.5) * 6, rx: r * (0.95 + rr() * 0.15), ry: r * (0.74 + rr() * 0.1), rot: (rr() - 0.5) * 60, g: i % 3, seed: i + 7 }));
})();
function tomato(T) {
  const r = K.rng(T.seed * 977);
  const p = ring(0, 0, T.rx, T.ry, 13, 0.2, r, r() * 6);
  const pi = ring(0, 0, T.rx * 0.66, T.ry * 0.6, 9, 0.28, r, r() * 6);
  const sz = T.rx / 50;
  let wr = '', pulp = '', lite = '';
  for (let i = 0; i < 8; i++) { const a = r() * 6.28, d = 0.25 + r() * 0.6, x = Math.cos(a) * T.rx * d, y = Math.sin(a) * T.ry * d; wr += `<path d="M${f(x)},${f(y)} q${f((r() - 0.5) * 30 * sz)},${f((r() - 0.5) * 14 * sz)} ${f((r() - 0.5) * 36 * sz)},${f((r() - 0.5) * 16 * sz)}" stroke="#4A0C0C" stroke-width="${f(1.6 + sz)}" fill="none" opacity=".6" stroke-linecap="round"/>`; if (i < 4) lite += `<path d="M${f(x + 2)},${f(y + 3)} q${f((r() - 0.5) * 20 * sz)},${f((r() - 0.5) * 8 * sz)} ${f((r() - 0.5) * 26 * sz)},${f((r() - 0.5) * 10 * sz)}" stroke="#E8704A" stroke-width="1.4" fill="none" opacity=".45" stroke-linecap="round"/>`; }
  for (let i = 0; i < 5; i++) { const x = (r() - 0.5) * T.rx * 0.8, y = (r() - 0.5) * T.ry * 0.7; pulp += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(4 * sz + 1)}" ry="${f(2.6 * sz + 1)}" fill="#E9A24E" opacity=".5" transform="rotate(${f(r() * 180)} ${f(x)} ${f(y)})"/><ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(2.6 * sz + 1)}" ry="${f(1.4 * sz + 0.6)}" fill="#F2D98E" opacity=".9" transform="rotate(${f(r() * 180)} ${f(x)} ${f(y)})"/>`; }
  const hx = -T.rx * 0.3, hy = -T.ry * 0.38;
  return `<g transform="translate(${f(T.x)},${f(T.y)}) rotate(${f(T.rot)})">
<path d="${p}" fill="#2B0A08"/>
<path d="${p}" fill="url(#gTom${T.g})" transform="scale(.97)"/>
<path d="${p}" fill="none" stroke="#2A0907" stroke-width="${f(6 + sz * 2)}" opacity=".55" stroke-linejoin="round"/>
<path d="${p}" fill="none" stroke="#7A2514" stroke-width="2" opacity=".6" transform="scale(.86)"/>
<path d="${pi}" fill="#D4502F" opacity=".5" transform="translate(-2,-1)"/>${lite}${pulp}${wr}
<path d="M${f(hx - T.rx * 0.2)},${f(hy + 3)} q${f(T.rx * 0.25)},${f(-T.ry * 0.25)} ${f(T.rx * 0.5)},${f(-1)}" stroke="#fff" stroke-width="${f(2.4 + sz)}" fill="none" opacity=".5" stroke-linecap="round"/>
<path d="M${f(T.rx * 0.1)},${f(T.ry * 0.38)} q${f(T.rx * 0.18)},${f(T.ry * 0.1)} ${f(T.rx * 0.34)},${f(-T.ry * 0.04)}" stroke="#FFC9A8" stroke-width="${f(1.6 + sz * 0.6)}" fill="none" opacity=".45" stroke-linecap="round"/>
</g>`;
}
function basil(x, y, len, rot) {
  const r = K.rng(Math.floor(x * 7 + y)), h = len * 0.5, pts = [];
  const N = 6;
  for (let i = 0; i <= N; i++) { const u = i / N, nt = (i === 2 || i === 4) && r() > 0.2 ? 0.45 : 1; pts.push([-len / 2 + u * len, -h * Math.pow(Math.sin(Math.PI * u), 0.7) * nt * (0.9 + r() * 0.2)]); }
  for (let i = N - 1; i >= 1; i--) { const u = i / N, nt = i === 3 ? 0.5 : 1; pts.push([-len / 2 + u * len, h * 0.95 * Math.pow(Math.sin(Math.PI * u), 0.7) * nt * (0.9 + r() * 0.2)]); }
  const d = blob(pts);
  return `<g transform="translate(${x},${y}) rotate(${rot})"><path d="${d}" fill="#0F2A14" opacity=".4" transform="translate(5,8)"/>
<path d="${d}" fill="url(#gLeafD)"/><path d="${d}" fill="none" stroke="#6B5A1E" stroke-width="2" opacity=".5"/>
<path d="${d}" fill="#17401F" opacity=".35" transform="translate(0,6) scale(.9)"/>
<path d="M${-len / 2 + 4},0 Q0,${-3} ${len / 2 - 8},0" stroke="#8DBF72" stroke-width="2.4" fill="none"/>
<path d="M${-len * 0.12},-1 q${len * 0.08},${-h * 0.4} ${len * 0.2},${-h * 0.55} M${len * 0.08},-1 q${len * 0.06},${h * 0.3} ${len * 0.14},${h * 0.5}" stroke="#8DBF72" stroke-width="1.5" fill="none" opacity=".6"/>
<ellipse cx="${-len * 0.14}" cy="${-h * 0.35}" rx="${len * 0.1}" ry="2.6" fill="#fff" opacity=".28" transform="rotate(-15)"/></g>`;
}
DEFS_EXTRA = `<linearGradient id="gLeafD" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4C8040"/><stop offset="1" stop-color="#1E4A27"/></linearGradient>
<radialGradient id="gCream" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#FBF3DE"/><stop offset="1" stop-color="#E0D1AC"/></radialGradient>
<radialGradient id="gHalfM" cx=".3" cy=".28" r=".95"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#FBF6E8"/><stop offset="1" stop-color="#E0D4B8"/></radialGradient>
<linearGradient id="gFace" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFDF4"/><stop offset="1" stop-color="#F0E5C9"/></linearGradient>`;

function halfPath(side) {
  const { rx, ry } = BUR, cy = -ry, pts = [];
  for (let k = 0; k <= 8; k++) { const a = -Math.PI / 2 - 0.14 - k * (Math.PI - 0.28) / 8; pts.push([side * -rx * Math.cos(a) * -1 * -1, cy + ry * Math.sin(a)]); }
  // pts x: cos(a) negative on left side; for side=-1 keep, side=+1 mirror
  const arc = pts.map(([x, y]) => [side > 0 ? -x : x, y]);
  const cut = [[side * 4, cy + ry * 0.7], [side * 9, cy], [side * 4, cy - ry * 0.7]];
  return blob(arc.concat(cut).map(([x, y]) => [x, y]));
}
function knotShape() {
  const { ry } = BUR, cy = -ry;
  return `<g><path d="M-40,${cy - ry + 24} C-50,${cy - ry - 22} -14,${cy - ry - 44} 6,${cy - ry - 62} C14,${cy - ry - 74} 36,${cy - ry - 66} 30,${cy - ry - 46} C26,${cy - ry - 30} 42,${cy - ry - 16} 44,${cy - ry + 26}Z" fill="url(#gMilk)"/>
<path d="M-26,${cy - ry + 14} q22,-30 38,-48 M-14,${cy - ry + 20} q26,-26 44,-52 M-4,${cy - ry + 24} q20,-16 36,-34" stroke="#CFC2A3" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>
<path d="M-10,${cy - ry - 36} q12,-8 24,-2" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".9"/></g>`;
}
function halfShape(side, cutP) {
  const { rx, ry } = BUR, cy = -ry, d = halfPath(side), id = side > 0 ? 'R' : 'L';
  let fibres = '';
  for (let i = 0; i < 5; i++) fibres += `<path d="M${side * -2},${cy - ry * 0.7 + i * ry * 0.34} q${side * -6},${ry * 0.16} ${side * -1},${ry * 0.3}" stroke="#E1D3B1" stroke-width="1.6" fill="none" opacity=".8" stroke-linecap="round"/>`;
  return `<g>${side < 0 ? knotShape() : ''}
<path d="${d}" fill="url(#gHalfM)"/>
<clipPath id="hc${id}"><path d="${d}"/></clipPath>
<g clip-path="url(#hc${id})"><ellipse cx="0" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#gMilkSh)"/>
<path d="M${side * -rx * 0.7},${cy + ry * 0.6} Q${side * -rx * 0.2},${cy + ry * 1.0} ${side * 8},${cy + ry * 0.9}" stroke="#D5C6A2" stroke-width="12" fill="none" opacity=".4" filter="url(#blur6)"/></g>
<ellipse cx="${side * -rx * 0.34}" cy="${cy - ry * 0.4}" rx="26" ry="13" fill="#fff" opacity=".85" transform="rotate(${side * 30} ${side * -rx * 0.34} ${cy - ry * 0.4})"/>
<ellipse cx="${side * 3}" cy="${cy}" rx="11" ry="${ry * 0.78}" fill="url(#gFace)" stroke="#E3D6B6" stroke-width="1.6"/>${fibres}</g>`;
}
const BLOBS = [ // final x, y(relative to base), r, delay
  [0, -18, 52, 0], [-34, -28, 30, 0.05], [32, -30, 28, 0.08], [-90, -2, 38, 0.1], [92, 0, 40, 0.12], [6, 26, 44, 0.16], [-142, 14, 28, 0.2], [150, 16, 30, 0.24], [-44, 34, 30, 0.22], [56, 38, 32, 0.26], [-196, 20, 14, 0.34], [200, 24, 16, 0.36],
];
function stracciatella(t, bx, base) {
  if (t < 3.0) return '';
  let s = `<g transform="translate(${bx},${base})">`;
  BLOBS.forEach(([x, y, r, dl], i) => {
    const p = K.eo(K.seg(t, 3.0 + dl, 3.9 + dl + 0.2));
    if (p <= 0.01) return;
    const rr = K.rng(i * 53 + 5), cx = K.lerp(0, x, p), cy = K.lerp(-40, y, p), sc = 0.3 + 0.7 * p;
    const path = ring(0, 0, r * 1.4, r * 0.72, 10, 0.18, rr, rr() * 6);
    s += `<g transform="translate(${f(cx)},${f(cy)}) scale(${f(sc)})"><path d="${path}" fill="#3A1B0E" opacity=".28" transform="translate(7,9)"/><path d="${path}" fill="url(#gCream)"/><path d="${path}" fill="none" stroke="#D8C9A4" stroke-width="2" opacity=".7"/><ellipse cx="${f(-r * 0.35)}" cy="${f(-r * 0.3)}" rx="${f(r * 0.34)}" ry="${f(r * 0.17)}" fill="#fff" opacity=".9" transform="rotate(-20 ${f(-r * 0.35)} ${f(-r * 0.3)})"/></g>`;
  });
  const od = K.eo(K.seg(t, 3.5, 4.0));
  if (od > 0) [[-110, 38, 8], [118, 44, 7], [-60, 64, 6], [30, 70, 8], [172, 40, 6], [-180, 46, 6], [80, 66, 5]].forEach(([x, y, r], i) => {
    s += `<ellipse cx="${x}" cy="${y}" rx="${r * 1.4}" ry="${r * 0.85}" fill="#EAB93C" opacity="${f(0.5 * od)}"/><ellipse cx="${x - r * 0.35}" cy="${y - r * 0.3}" rx="${r * 0.45}" ry="${r * 0.22}" fill="#fff" opacity="${f(od)}"/>`;
  });
  const g = Math.sin(Math.PI * K.seg(t, 4.55, 5.2));
  if (g > 0) { const gx = -30, gy = -78, sz = 32 * g; s += `<g opacity="${f(g)}"><circle cx="${gx}" cy="${gy}" r="${f(20 * g)}" fill="url(#gGlint)"/><path d="M${gx - sz},${gy} L${gx},${gy - sz * 0.14} L${gx + sz},${gy} L${gx},${gy + sz * 0.14}Z M${gx},${gy - sz} L${gx + sz * 0.14},${gy} L${gx},${gy + sz} L${gx - sz * 0.14},${gy}Z" fill="#fff"/></g>`; }
  return s + '</g>';
}
function knifeTip(t) {
  const A = [0.788, 0.616];
  if (t < 2.45 || t > 3.4) return null;
  if (t < 2.7) { const k = K.eo(K.seg(t, 2.45, 2.7)); return [K.lerp(560 + 700 * A[0], 560, k), K.lerp(905 + 700 * A[1], 905, k)]; }
  if (t < 2.97) { const k = K.eio(K.seg(t, 2.7, 2.95)); return [K.lerp(560, 548, k), K.lerp(905, 1075, k)]; }
  const k = Math.pow(K.seg(t, 2.99, 3.38), 2); return [548 + 800 * A[0] * k, 1075 + 800 * A[1] * k];
}
function knife(t) {
  const tp = knifeTip(t); if (!tp) return '';
  return `<g transform="translate(${f(tp[0])},${f(tp[1])}) rotate(38)">
<path d="M0,0 C80,-4 220,-26 340,-28 L340,34 C230,32 80,14 0,0Z" transform="translate(-14,22)" fill="#15110E" opacity=".35" filter="url(#blur14)"/>
<path d="M0,0 C80,-6 220,-28 340,-30 L340,32 C240,30 90,12 0,0Z" fill="url(#gSteel)"/>
<path d="M4,0 C80,-6 220,-28 340,-30 L340,-22 C220,-20 80,-2 4,0Z" fill="#fff" opacity=".7"/>
<path d="M14,3 C90,10 230,26 336,29" stroke="#6C737B" stroke-width="2" fill="none" opacity=".7"/>
<rect x="338" y="-33" width="26" height="68" rx="4" fill="#B8924A"/><rect x="338" y="-33" width="26" height="8" rx="3" fill="#E5C98A"/>
<path d="M364,-24 L520,-20 Q540,-18 540,2 Q540,22 520,24 L364,28Z" fill="#2F2E2C"/>
<path d="M370,-20 L516,-16" stroke="#6b6a66" stroke-width="3" opacity=".7"/>
<circle cx="410" cy="2" r="5" fill="#B8924A"/><circle cx="470" cy="1" r="5" fill="#B8924A"/></g>`;
}
function burrata(t) {
  const { x, base } = BUR;
  if (t < 1.62) return { back: '', front: '' };
  const drop = K.seg(t, 1.7, 2.02), fall = (1 - drop * drop) * 240, op = K.seg(t, 1.62, 1.75);
  const squash = t > 2.02 ? Math.max(0, Math.exp(-(t - 2.02) * 7) * Math.cos((t - 2.02) * 22)) : 0;
  const sx = 1 + 0.17 * squash, sy = 1 - 0.17 * squash + (drop < 1 ? 0.04 * drop : 0), sh = K.eo(K.seg(t, 1.7, 2.02));
  let s = `<g opacity="${f(op)}"><ellipse cx="${x + 40}" cy="${base + 6}" rx="${f(120 + 40 * sh)}" ry="${f(26 * (0.5 + sh * 0.5))}" fill="#2a1409" opacity="${f(0.2 + 0.35 * sh)}" filter="url(#blur14)"/>`;
  const cutP = K.eio(K.seg(t, 3.0, 3.65));
  const tp = knifeTip(t);
  if (t < 2.97) {
    s += `<g transform="translate(${x},${base - fall}) scale(${f(sx * 1000) / 1000},${f(sy * 1000) / 1000})">${ballShape()}`;
    if (t >= 2.7) { const bot = Math.min(-8, (tp ? tp[1] : 1075) - base); s += `<path d="M1,${-BUR.ry * 2 + 4} L-1,${f(bot)}" stroke="#B5A27A" stroke-width="3.2" stroke-linecap="round" fill="none" opacity=".9"/><path d="M3.5,${-BUR.ry * 2 + 6} L1.5,${f(bot)}" stroke="#fff" stroke-width="1.5" fill="none" opacity=".7"/>`; }
    s += `</g>`;
  } else {
    const d = 4 + 44 * cutP, sink = 1 - 0.05 * cutP;
    const half = (side) => `<g transform="translate(${f(x + side * d)},${base}) rotate(${f(-side * -2.5 * cutP)} ${side * -40} 0) scale(1,${f(sink)})">${halfShape(side, cutP)}</g>`;
    s += half(-1) + half(1);
  }
  s += '</g>';
  return { back: s, front: stracciatella(t, x, base - 4) };
}

window.SCENE = {
  dur: 5.4,
  setT(t, stage) {
    const L = lamps(t);
    const push = 1 + 0.012 * K.seg(t, 0, 3.6) + 0.04 * K.eio(K.seg(t, 3.6, 5.4));
    const bright = 0.34 * (1 - L.avg);
    // scene dim overlay shrinks as lamps come on
    const B = burrata(t);
    let soft = '', hard = '';
    // tomatoes shadows group
    let tshadow = '';
    TOM_POS.forEach((T) => { tshadow += `<ellipse cx="${f(T.x + 14)}" cy="${f(T.y + 16)}" rx="${f(T.rx * 1.02)}" ry="${f(T.ry * 0.95)}" fill="#2a0b08"/>`; });
    const sorted = TOM_POS.slice().sort((a, b) => a.y - b.y);
    const backT = sorted.filter((T) => T.y < BUR.base - 20).map(tomato).join('');
    const frontT = sorted.filter((T) => T.y >= BUR.base - 20).map(tomato).join('');
    const garl = GARLIC.map(([x, y, a]) => garlic(x, y, a)).join('');
    const leavesB = BASIL.filter((b) => !b[4]).map((b) => basil(b[0], b[1], b[2], b[3])).join('');
    const leavesF = BASIL.filter((b) => b[4]).map((b) => basil(b[0], b[1], b[2], b[3])).join('');
    const svg = `<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg"><defs>${K.defs()}${DEFS}${DEFS_EXTRA}</defs>
<g transform="translate(540 1050) scale(${f(push * 1000) / 1000}) translate(-540 -1050)">
${K.concrete(t)}
<g filter="url(#blur30)" opacity="0.55">${L.cones}</g>
${plateAndMug()}
${slices.map(slice).join('')}
<g opacity=".4" filter="url(#blur14)">${tshadow}</g>
${oilSheen()}
${backT}${garl}${leavesB}
${B.back}
${frontT}${leavesF}
${B.front}
${knife(t)}
<rect x="-100" y="-100" width="1300" height="2200" fill="#14161B" opacity="${f(bright)}"/>
${L.glows}
${L.bodies}
<rect width="1080" height="1920" fill="none"/>
</g>
<rect width="1080" height="1920" filter="url(#grain)" opacity="0.35"/>
<radialGradient id="vig" cx=".5" cy=".55" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient><rect width="1080" height="1920" fill="url(#vig)"/>
</svg>`;
    stage.innerHTML = svg;
  },
};
})();
