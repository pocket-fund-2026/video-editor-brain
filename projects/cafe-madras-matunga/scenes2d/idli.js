// Scene 3, Cafe Madras reel: IDLI. 2D editorial illustration (SVG, pure function of t). Top-down steel thali on a brushed-steel table, slight parallax so lifted things rise on screen.
// Motion: rack focus (steam sharp -> idlis sharp), steam wisps lift all the time, a steel spoon enters, presses an idli, tears a piece off, DUNKS it in the sambar (no pour), lifts it with a slow drip + ripple rings.
// Timeline (s): 0-1.0 rack focus | 0.8-1.7 spoon enters | 1.7-2.2 press + cracks | 2.2-2.55 tear, strands | 2.55-3.3 carry | 3.3-3.55 dunk | 3.55-3.8 submerged + ripples | 3.8-4.4 lift | 4.4-5.7 hold + drip + rings.
// No letters in the scene. Keep action in y 500-1250; spoon handle leaves bottom-right (not key detail).
(() => {
const { clamp, seg, lerp, eo, eio, eob, rng } = K;
const F = (n) => Math.round(n * 10) / 10;
const RAD = Math.PI / 180;
const fract = (x) => x - Math.floor(x);

// ---------------- layout ----------------
const PLATE = { cx: 380, cy: 980, R: 270 };
const IDLI_R = 92;
const IDLIS = [
  { id: 'A', cx: 457, cy: 888, seed: 3, ph: 0.4 },
  { id: 'B', cx: 262, cy: 1001, seed: 11, ph: 1.7 },
  { id: 'C', cx: 421, cy: 1093, seed: 23, ph: 2.9 },
];
const SAMBAR = { cx: 790, cy: 700, R: 135, Ri: 104 };
const CHUTNEY = { cx: 330, cy: 585, R: 105, Ri: 80 };
const HAND = { x: 1120, y: 2060 };           // where the spoon handle is held (off screen, bottom right)
const TP = { x: 505, y: 852, r: 48 };        // tear spot on idli A
const PAR = 140;                              // parallax: screen y rises by PAR*h for a lifted object

// ---------------- helpers ----------------
function track(w, t) {                        // Hermite through [t, v] keys, flat tangents at the ends and at equal neighbours
  const n = w.length;
  if (t <= w[0][0]) return w[0][1];
  if (t >= w[n - 1][0]) return w[n - 1][1];
  let i = 0; while (w[i + 1][0] <= t) i++;
  const t0 = w[i][0], t1 = w[i + 1][0], h = t1 - t0, s = (t - t0) / h;
  const h00 = 2 * s ** 3 - 3 * s ** 2 + 1, h10 = s ** 3 - 2 * s ** 2 + s, h01 = -2 * s ** 3 + 3 * s ** 2, h11 = s ** 3 - s ** 2;
  const tan = (j) => { if (j === 0 || j === n - 1) return 0; if (w[j][1] === w[j - 1][1] || w[j][1] === w[j + 1][1]) return 0; return (w[j + 1][1] - w[j - 1][1]) / (w[j + 1][0] - w[j - 1][0]); };
  return h00 * w[i][1] + h10 * h * tan(i) + h01 * w[i + 1][1] + h11 * h * tan(i + 1);
}
const GX = [[0, 1010], [0.8, 1010], [1.6, 590], [2.0, 548], [2.2, 548], [2.55, 612], [2.9, 722], [3.3, 790], [5.7, 790]];
const GY = [[0, 1500], [0.8, 1500], [1.6, 905], [2.0, 868], [2.2, 868], [2.55, 880], [2.9, 770], [3.3, 716], [5.7, 716]];
const GH = [[0, 0.15], [0.8, 0.15], [1.45, 0.26], [1.75, 0.04], [2.0, 0.0], [2.25, 0.0], [2.55, 0.24], [2.9, 0.92], [3.2, 0.74], [3.52, 0.02], [3.8, 0.02], [4.25, 0.7], [4.55, 0.8], [5.7, 0.8]];

// ---------------- shapes with irregular outlines + pores ----------------
function blobPath(cx, cy, R, seed, n = 56, amp = 0.028) {
  const r = rng(seed * 313 + 7); const a1 = r() * 6, a2 = r() * 6, a3 = r() * 6; let d = '';
  for (let i = 0; i < n; i++) {
    const th = (i / n) * Math.PI * 2, rr = R * (1 + amp * Math.sin(3 * th + a1) + amp * 0.7 * Math.sin(5 * th + a2) + amp * 0.4 * Math.sin(8 * th + a3));
    d += (i ? 'L' : 'M') + F(cx + rr * Math.cos(th)) + ' ' + F(cy + rr * Math.sin(th));
  }
  return d + 'Z';
}
function mkPores(seed, R, n) {
  const r = rng(seed * 719 + 5), a = [];
  for (let i = 0; i < n; i++) { const th = r() * 6.283, d = Math.sqrt(r()) * R * 0.9; a.push([d * Math.cos(th), d * Math.sin(th), 1.3 + r() * 3.2, 0.25 + r() * 0.4, r() * 90]); }
  return a;
}
const PORES = {}; IDLIS.forEach((o) => { PORES[o.id] = mkPores(o.seed, IDLI_R, 90); });
const PIECE_PORES = mkPores(41, 50, 36);
const porEls = (pores, x, y, s = 1) => pores.map((p) => `<ellipse cx="${F(x + p[0] * s)}" cy="${F(y + p[1] * s)}" rx="${F(p[2] * s)}" ry="${F(p[2] * 0.7 * s)}" fill="#B9B29B" opacity="${F(p[3])}" transform="rotate(${F(p[4])} ${F(x + p[0] * s)} ${F(y + p[1] * s)})"/><ellipse cx="${F(x + p[0] * s - 0.8 * s)}" cy="${F(y + p[1] * s - 1.1 * s)}" rx="${F(p[2] * 0.5 * s)}" ry="${F(p[2] * 0.3 * s)}" fill="#fff" opacity="${F(p[3] * 1.3)}"/>`).join('');

function idliEl(o, extra = '') {
  const { cx, cy } = o, R = IDLI_R, d = blobPath(cx, cy, R, o.seed);
  return `<g>
<path d="${blobPath(cx + 16, cy + 22, R * 1.02, o.seed + 1)}" fill="#0f1417" opacity="0.4" filter="url(#blur14)"/>
<path d="${blobPath(cx + 5, cy + 8, R * 1.0, o.seed + 1)}" fill="#1a2024" opacity="0.5" filter="url(#blur6)"/>
<path d="${d}" fill="url(#idg)"/>
<path d="${d}" fill="none" stroke="#9a9078" stroke-width="3" opacity="0.4"/>
<circle cx="${cx}" cy="${cy}" r="${F(R * 0.8)}" fill="none" stroke="#ffffff" stroke-width="5" opacity="0.5" filter="url(#blur6)"/>
<circle cx="${cx}" cy="${cy}" r="${F(R * 0.46)}" fill="none" stroke="#CFC8B3" stroke-width="2" opacity="0.4"/>
${porEls(PORES[o.id], cx, cy)}
<ellipse cx="${F(cx - R * 0.3)}" cy="${F(cy - R * 0.36)}" rx="${F(R * 0.4)}" ry="${F(R * 0.26)}" fill="#fff" opacity="0.7" filter="url(#blur14)"/>
<path d="${d}" fill="url(#idshade)"/>
${extra}</g>`;
}

const notchPath = (r) => blobPath(TP.x, TP.y, r, 5, 34, 0.2);
// ---------------- plate and bowls ----------------
function plateEl() {
  const { cx, cy, R } = PLATE;
  return `<g>
<ellipse cx="${cx + 34}" cy="${cy + 46}" rx="${R + 8}" ry="${R + 4}" fill="#0b0f11" opacity="0.5" filter="url(#blur30)"/>
<ellipse cx="${cx + 12}" cy="${cy + 16}" rx="${R + 2}" ry="${R}" fill="#0b0f11" opacity="0.5" filter="url(#blur6)"/>
<circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#plrim)"/>
<circle cx="${cx}" cy="${cy}" r="${R - 6}" fill="none" stroke="#fff" stroke-width="3" opacity="0.5"/>
<circle cx="${cx}" cy="${cy}" r="${R - 34}" fill="url(#plfield)"/>
<circle cx="${cx}" cy="${cy}" r="${R - 34}" fill="none" stroke="#5c676d" stroke-width="3" opacity="0.5"/>
<circle cx="${cx}" cy="${cy}" r="${R - 38}" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.5"/>
<circle cx="${cx}" cy="${cy}" r="${R - 120}" fill="none" stroke="#fff" stroke-width="2" opacity="0.18"/>
<ellipse cx="${cx - 90}" cy="${cy - 100}" rx="150" ry="90" fill="#fff" opacity="0.22" filter="url(#blur30)" transform="rotate(-30 ${cx - 90} ${cy - 100})"/>
</g>`;
}
function katoriShell(o, liquid) {
  const { cx, cy, R, Ri } = o;
  return `<g>
<circle cx="${cx + 30}" cy="${cy + 40}" r="${R + 6}" fill="#0b0f11" opacity="0.5" filter="url(#blur30)"/>
<circle cx="${cx + 10}" cy="${cy + 14}" r="${R}" fill="#0b0f11" opacity="0.5" filter="url(#blur6)"/>
<circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#kt)"/>
<circle cx="${cx}" cy="${cy}" r="${R - 5}" fill="none" stroke="#fff" stroke-width="4" opacity="0.6"/>
<circle cx="${cx}" cy="${cy}" r="${Ri + 12}" fill="url(#ktin)"/>
<circle cx="${cx}" cy="${cy}" r="${Ri + 10}" fill="none" stroke="#f4f8fa" stroke-width="3" opacity="0.55"/>
${liquid}
<path d="M${F(cx - Ri * 0.9)} ${F(cy - Ri * 0.35)} A ${Ri} ${Ri} 0 0 1 ${F(cx - Ri * 0.2)} ${F(cy - Ri * 0.95)}" fill="none" stroke="#fff" stroke-width="5" opacity="0.5" stroke-linecap="round" filter="url(#blur6)"/>
</g>`;
}
const SAMB = (() => {
  const r = rng(77), a = [];
  for (let i = 0; i < 26; i++) { const th = r() * 6.283, d = Math.sqrt(r()) * 90, k = r(); a.push({ x: d * Math.cos(th), y: d * Math.sin(th), k, s: 0.7 + r() * 0.7, rot: r() * 360 }); }
  return a;
})();
function sambarLiquid(t) {
  const { cx, cy, Ri } = SAMBAR, rot = t * 3.2;
  let bits = '';
  SAMB.forEach((b) => {
    const x = F(b.x), y = F(b.y);
    if (b.k < 0.3) bits += `<ellipse cx="${x}" cy="${y}" rx="${F(5 * b.s)}" ry="${F(3.6 * b.s)}" fill="#E2B24C" opacity="0.9" transform="rotate(${F(b.rot)} ${x} ${y})"/>`;
    else if (b.k < 0.48) bits += `<circle cx="${x}" cy="${y}" r="${F(11 * b.s)}" fill="#C8651F"/><circle cx="${x}" cy="${y}" r="${F(7 * b.s)}" fill="#EC9440"/><circle cx="${F(b.x - 2)}" cy="${F(b.y - 2)}" r="${F(2.4 * b.s)}" fill="#F9C77F" opacity="0.8"/>`;
    else if (b.k < 0.62) bits += `<rect x="${F(b.x - 18 * b.s)}" y="${F(b.y - 5 * b.s)}" width="${F(36 * b.s)}" height="${F(10 * b.s)}" rx="${F(5 * b.s)}" fill="#B7B65A" opacity="0.95" transform="rotate(${F(b.rot)} ${x} ${y})"/><rect x="${F(b.x - 14 * b.s)}" y="${F(b.y - 3 * b.s)}" width="${F(26 * b.s)}" height="${F(3 * b.s)}" rx="1.5" fill="#D6D585" opacity="0.8" transform="rotate(${F(b.rot)} ${x} ${y})"/>`;
    else if (b.k < 0.74) bits += `<ellipse cx="${x}" cy="${y}" rx="${F(9 * b.s)}" ry="${F(6 * b.s)}" fill="#B93A22" opacity="0.92" transform="rotate(${F(b.rot)} ${x} ${y})"/>`;
    else if (b.k < 0.86) bits += `<ellipse cx="${x}" cy="${y}" rx="${F(13 * b.s)}" ry="${F(6.5 * b.s)}" fill="#3C5A1F" transform="rotate(${F(b.rot)} ${x} ${y})"/><line x1="${F(b.x - 11 * b.s)}" y1="${y}" x2="${F(b.x + 11 * b.s)}" y2="${y}" stroke="#7FA043" stroke-width="1.4" transform="rotate(${F(b.rot)} ${x} ${y})"/>`;
    else bits += `<circle cx="${x}" cy="${y}" r="${F(2.6 * b.s)}" fill="#2B1A0C"/>`;
  });
  let oil = '';
  for (let i = 0; i < 4; i++) oil += `<ellipse cx="${F(-40 + i * 17)}" cy="${F(-30 + ((i * 29) % 70))}" rx="${F(14 + (i % 3) * 8)}" ry="${F(5 + (i % 2) * 3)}" fill="none" stroke="#F3C48A" stroke-width="2" opacity="0.22" transform="rotate(${F(i * 31)})"/>`;
  return `<clipPath id="smc"><circle cx="${cx}" cy="${cy}" r="${Ri}"/></clipPath>
<circle cx="${cx}" cy="${cy}" r="${Ri}" fill="url(#smb)"/>
<g clip-path="url(#smc)"><g transform="translate(${cx} ${cy}) rotate(${F(rot)})"><g opacity="0.95">${bits}</g><g>${oil}</g></g>
<circle cx="${cx}" cy="${cy}" r="${Ri}" fill="none" stroke="#5a2509" stroke-width="16" opacity="0.5" filter="url(#blur6)"/>
<ellipse cx="${cx - 36}" cy="${cy - 44}" rx="46" ry="22" fill="#FFE6C0" opacity="0.38" filter="url(#blur6)" transform="rotate(-30 ${cx - 36} ${cy - 44})"/></g>`;
}
const CHUT = (() => {
  const r = rng(131), a = [];
  for (let i = 0; i < 18; i++) { const th = r() * 6.283, d = Math.sqrt(r()) * 62; a.push({ x: d * Math.cos(th), y: d * Math.sin(th), s: 0.7 + r() * 0.7 }); }
  return a;
})();
function chutneyLiquid() {
  const { cx, cy, Ri } = CHUTNEY;
  let bits = '';
  CHUT.forEach((b, i) => { bits += `<ellipse cx="${F(cx + b.x)}" cy="${F(cy + b.y)}" rx="${F(3.4 * b.s)}" ry="${F(2.2 * b.s)}" fill="#6F9A45" opacity="0.8" transform="rotate(${i * 37} ${F(cx + b.x)} ${F(cy + b.y)})"/>`; });
  const seeds = [[-14, -8], [8, -20], [20, 6], [-6, 14], [2, -2], [-24, 8]].map(([x, y]) => `<circle cx="${cx + x}" cy="${cy + y}" r="2.6" fill="#241B12"/>`).join('');
  return `<clipPath id="chc"><circle cx="${cx}" cy="${cy}" r="${Ri}"/></clipPath>
<circle cx="${cx}" cy="${cy}" r="${Ri}" fill="url(#chg)"/>
<g clip-path="url(#chc)">
<path d="M${cx - 60} ${cy - 10} Q${cx - 20} ${cy - 40} ${cx + 10} ${cy - 14} T${cx + 62} ${cy - 6}" fill="none" stroke="#fff" stroke-width="7" opacity="0.7" filter="url(#blur6)"/>
<path d="M${cx - 50} ${cy + 24} Q${cx - 10} ${cy + 6} ${cx + 20} ${cy + 28} T${cx + 60} ${cy + 22}" fill="none" stroke="#E4DFCB" stroke-width="6" opacity="0.8" filter="url(#blur6)"/>
${bits}${seeds}
<ellipse cx="${cx + 18}" cy="${cy - 22}" rx="16" ry="7" fill="#2F4B1B" transform="rotate(-25 ${cx + 18} ${cy - 22})"/><ellipse cx="${cx - 10}" cy="${cy + 16}" rx="14" ry="6" fill="#35541E" transform="rotate(30 ${cx - 10} ${cy + 16})"/>
<path d="M${cx - 34} ${cy - 24} q10 -14 22 -4 q-6 14 -22 4Z" fill="#B3261E"/>
<circle cx="${cx}" cy="${cy}" r="${Ri}" fill="none" stroke="#7d7a68" stroke-width="12" opacity="0.28" filter="url(#blur6)"/>
<ellipse cx="${cx - 26}" cy="${cy - 32}" rx="30" ry="14" fill="#fff" opacity="0.5" filter="url(#blur6)" transform="rotate(-30 ${cx - 26} ${cy - 32})"/></g>`;
}

// ---------------- the torn piece and the spoon ----------------
function pieceEl(x, y, sc, rot, coat, wet, drip) {
  const d = blobPath(0, 0, 50, 41, 36, 0.09);
  return `<g transform="translate(${F(x)} ${F(y)}) rotate(${F(rot)}) scale(${F(sc)})">
<path d="${d}" fill="url(#idg)"/>
<path d="${d}" fill="none" stroke="#9a9078" stroke-width="3" opacity="0.5"/>
${porEls(PIECE_PORES, 0, 0, 0.9)}
<ellipse cx="-14" cy="-16" rx="20" ry="12" fill="#fff" opacity="0.6" filter="url(#blur6)"/>
<path d="${d}" fill="url(#idshade)"/>
${coat > 0.01 ? `<path d="${d}" fill="url(#sbcoat)" opacity="${F(coat)}"/><ellipse cx="-12" cy="-14" rx="16" ry="7" fill="#FFE2B8" opacity="${F(coat * 0.6)}" filter="url(#blur6)"/><circle cx="10" cy="12" r="4" fill="#FFE2B8" opacity="${F(coat * 0.7)}"/>` : ''}
${wet > 0.01 ? `<path d="${d}" fill="#7a3510" opacity="${F(wet * 0.4)}"/>` : ''}
</g>`;
}
function spoonEl(bx, by, th, sub, coatB) {
  // local frame: bowl at origin, handle toward +x, rotated by th
  const hw = (x) => lerp(17, 26, clamp((x - 150) / 1700));
  const hp = (s) => { let top = '', bot = ''; for (let x = 130; x <= 1900; x += 220) { top += `${x === 130 ? 'M' : 'L'}${x} ${F(-hw(x) * s)}`; } for (let x = 1900; x >= 130; x -= 220) { bot += `L${x} ${F(hw(x) * s)}`; } return top + bot + 'Z'; };
  return `<g transform="translate(${F(bx)} ${F(by)}) rotate(${F(th)})">
<path d="M60 -24 C 90 -20 110 -18 140 -17 L140 17 C 110 18 90 20 60 24 Z" fill="url(#spH)"/>
<path d="${hp(1)}" fill="url(#spH)"/>
<path d="M170 -3 L1900 -2" stroke="#fff" stroke-width="4" opacity="0.55"/>
<ellipse cx="0" cy="0" rx="80" ry="55" fill="url(#spB)"/>
<ellipse cx="0" cy="0" rx="80" ry="55" fill="none" stroke="#f6fafb" stroke-width="3.5" opacity="0.8"/>
<ellipse cx="0" cy="0" rx="66" ry="42" fill="url(#spIn)"/>
<ellipse cx="0" cy="0" rx="66" ry="42" fill="none" stroke="#4a545a" stroke-width="2.5" opacity="0.6"/>
${sub > 0.01 ? `<ellipse cx="0" cy="0" rx="66" ry="42" fill="#7a3510" opacity="${F(sub * 0.6)}"/>` : ''}
${coatB > 0.01 ? `<ellipse cx="2" cy="2" rx="60" ry="37" fill="#9A4A18" opacity="${F(coatB * 0.55)}"/>` : ''}
</g>`;
}

// ---------------- steam ----------------
const WISPS = [
  { x: 440, y: 810, A: 22, ph: 0.2, L: 300 }, { x: 330, y: 900, A: 26, ph: 1.9, L: 340 }, { x: 255, y: 930, A: 20, ph: 3.1, L: 300 },
  { x: 480, y: 1040, A: 28, ph: 4.4, L: 330 }, { x: 395, y: 1020, A: 24, ph: 5.3, L: 280 }, { x: 520, y: 900, A: 18, ph: 2.6, L: 260 },
  { x: 790, y: 650, A: 18, ph: 0.9, L: 240 }, { x: 760, y: 720, A: 16, ph: 3.7, L: 220 },
];
function wispsEl(t) {
  let out = '';
  WISPS.forEach((w, wi) => {
    const pulse = 0.55 + 0.45 * Math.sin(t * 0.9 + w.ph * 2);
    const N = 12; let pts = [];
    for (let k = 0; k <= N; k++) { const s = k / N, y = w.y - w.L * s; pts.push([w.x + w.A * Math.sin(s * 5.2 - t * 1.8 + w.ph) * (0.3 + s) - 26 * s * s, y, s]); }
    for (let k = 0; k < N; k++) {
      const a = pts[k], b = pts[k + 1], s = (a[2] + b[2]) / 2;
      out += `<line x1="${F(a[0])}" y1="${F(a[1])}" x2="${F(b[0])}" y2="${F(b[1])}" stroke="#fff" stroke-width="${F(10 + 26 * s)}" stroke-linecap="round" opacity="${F(0.32 * Math.sin(Math.PI * s) * pulse)}"/>`;
    }
  });
  return `<g filter="url(#stm)">${out}</g>`;
}
function fgSteamEl(t) {
  const blobs = [[220, 1150, 0.0, 0.11], [560, 1230, 0.33, 0.13], [860, 1090, 0.66, 0.1], [330, 1010, 0.5, 0.12]];
  let out = '';
  blobs.forEach(([x, y, ph, sp], i) => {
    const u = fract(t * sp + ph), a = Math.sin(Math.PI * u);
    out += `<ellipse cx="${F(x + 70 * u * (i % 2 ? -1 : 1))}" cy="${F(y - 520 * u)}" rx="${F(90 + 160 * u)}" ry="${F(60 + 110 * u)}" fill="#fff" opacity="${F(0.2 * a)}"/>`;
  });
  return `<g filter="url(#stf)">${out}</g>`;
}

// ---------------- ripples and drops in the sambar ----------------
const RINGS = [{ t0: 3.42, x: 790, y: 718, s: 1.0 }, { t0: 3.6, x: 790, y: 716, s: 0.7 }];
const DROPS = [{ t0: 4.12, dx: -8, fall: 0.34 }, { t0: 4.62, dx: 6, fall: 0.34 }, { t0: 5.18, dx: -2, fall: 0.36 }];
function ringEl(rg, t) {
  const u = (t - rg.t0) / 1.25; if (u < 0 || u > 1) return '';
  const r = 14 + 96 * eo(u) * rg.s, a = (1 - u) * (1 - u);
  return `<ellipse cx="${rg.x}" cy="${rg.y}" rx="${F(r)}" ry="${F(r * 0.94)}" fill="none" stroke="#6b2d0c" stroke-width="${F(6 * (1 - u) + 1)}" opacity="${F(0.4 * a)}" transform="translate(2 3)"/>
<ellipse cx="${rg.x}" cy="${rg.y}" rx="${F(r)}" ry="${F(r * 0.94)}" fill="none" stroke="#F6D4A6" stroke-width="${F(5 * (1 - u) + 1)}" opacity="${F(0.85 * a)}"/>`;
}

function setT(t, stage) {
  // ---- spoon / piece state
  const gx = track(GX, t), gy = track(GY, t), h = clamp(track(GH, t), 0, 1);
  const sway = t > 4.5 ? 3 * Math.sin((t - 4.5) * 1.6) : 0;
  const sx = gx + sway, sy = gy - PAR * h;
  const th = Math.atan2(HAND.y - sy, HAND.x - sx) / RAD;
  const press = eio(seg(t, 1.72, 2.0)) * (1 - eio(seg(t, 2.2, 2.45)));
  const aS = 1 + 0.035 * press - 0.012 * Math.exp(-Math.max(0, t - 2.35) * 6) * Math.sin(Math.max(0, t - 2.35) * 30) * (t > 2.35 ? 1 : 0);
  const sub = eo(seg(t, 3.3, 3.55)) * (1 - eo(seg(t, 3.78, 4.3)));
  const coat = 0.55 * eo(seg(t, 3.5, 3.9));
  const coatBowl = 0.35 * eo(seg(t, 3.5, 3.9));

  // ---- idli A notch (bite) + piece
  const notchK = eob(seg(t, 2.12, 2.4), 1.2);
  const notchR = TP.r * notchK;
  const pieceVis = t >= 2.12;
  const kp = eob(seg(t, 2.3, 2.62), 1.15);
  const bowlX = sx - 8, bowlY = sy - 4 - 14 * h;
  const px = lerp(TP.x, bowlX, kp), py = lerp(TP.y, bowlY, kp);
  const pieceRot = lerp(-10, -34, kp) + 6 * Math.sin(t * 1.3) * h;
  const pieceSc = (1.25 + 0.1 * h) * (1 - 0.04 * sub);

  // ---- idlis
  const a = IDLIS[0];
  const cracks = (() => { const k = eo(seg(t, 1.85, 2.15)) * (1 - eo(seg(t, 2.2, 2.4))); if (k < 0.02) return ''; return `<g stroke="#8B8268" stroke-width="2.4" fill="none" opacity="${F(0.8 * k)}" stroke-linecap="round"><path d="M${TP.x - 20} ${TP.y - 28} l${F(14 * k)} ${F(30 * k)} l${F(-6 * k)} ${F(20 * k)}"/><path d="M${TP.x + 18} ${TP.y - 34} l${F(-8 * k)} ${F(26 * k)}"/><path d="M${TP.x - 34} ${TP.y + 4} l${F(30 * k)} ${F(6 * k)}"/></g>`; })();
  const strands = (() => { const u = seg(t, 2.2, 2.55) * (1 - eo(seg(t, 2.5, 2.62))); if (u < 0.02) return ''; const ex = lerp(TP.x, bowlX, kp), ey = lerp(TP.y, bowlY, kp); let s = ''; for (let i = 0; i < 4; i++) s += `<path d="M${F(TP.x - 18 + i * 10)} ${F(TP.y - 8 + i * 6)} Q${F((TP.x + ex) / 2 + i * 4)} ${F((TP.y + ey) / 2 - 8 + i * 5)} ${F(ex - 10 + i * 6)} ${F(ey - 4 + i * 4)}" fill="none" stroke="#F5F1E4" stroke-width="${F(2.4 - i * 0.3)}" opacity="${F(0.9 * u)}" stroke-linecap="round"/>`; return s; })();
  const idlisSvg = IDLIS.map((o) => {
    if (o.id !== 'A') return idliEl(o);
    const body = idliEl(o, '');
    return `<mask id="mA" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920"><rect width="1080" height="1920" fill="#fff"/>${notchR > 1 ? `<path d="${notchPath(notchR)}" fill="#000"/>` : ''}</mask>
<g transform="translate(${o.cx} ${o.cy}) scale(${F(aS * 1000) / 1000}) translate(${-o.cx} ${-o.cy})"><g mask="url(#mA)">${body}</g>${notchR > 1 ? `<path d="${notchPath(notchR + 2)}" fill="none" stroke="#B9B093" stroke-width="5" opacity="0.7" filter="url(#blur6)" clip-path="url(#cpA)"/><path d="${notchPath(notchR + 5)}" fill="none" stroke="#fff" stroke-width="4" opacity="0.6" clip-path="url(#cpA)"/>` : ''}${cracks}</g>`;
  }).join('');

  // ---- sambar surface + rings
  const smb = `${sambarLiquid(t)}<g clip-path="url(#smc)">${RINGS.map((r) => ringEl(r, t)).join('')}${DROPS.map((d) => {
    const land = d.t0 + d.fall; return ringEl({ t0: land, x: SAMBAR.cx + d.dx, y: SAMBAR.cy + 30, s: 0.55 }, t);
  }).join('')}</g>`;

  // ---- spoon shadow, spoon, piece
  const sh = `<g opacity="${F(0.34 - 0.1 * h)}" transform="translate(${F(26 + 70 * h)} ${F(34 + 90 * h)})"><g filter="url(#blur14)">${spoonEl(gx, gy, Math.atan2(HAND.y - gy, HAND.x - gx) / RAD, 0, 0).replace(/url\(#sp[A-Za-z]+\)/g, '#0b0f11').replace(/fill="#7a3510"/g, 'fill="none"')}</g></g>`;
  const spoon = spoonEl(sx, sy, th, sub, coatBowl);
  const pieceShadow = pieceVis ? `<ellipse cx="${F(lerp(TP.x, gx - 8, kp) + 22 + 40 * h)}" cy="${F(lerp(TP.y, gy - 4, kp) + 28 + 56 * h)}" rx="48" ry="42" fill="#0b0f11" opacity="${F(0.3 * kp)}" filter="url(#blur14)"/>` : '';
  const piece = pieceVis ? pieceEl(px, py, pieceSc, pieceRot, coat, sub, 0) : '';
  const dunkBlur = sub > 0.05 ? `<g filter="url(#sub)" opacity="1">${spoon}${piece}</g>` : `${spoon}${piece}`;

  // ---- drips: thread then drops falling from the piece to the surface
  let drip = '';
  const gxp = SAMBAR.cx - 6, gyp = SAMBAR.cy + 28;                  // ground impact
  const pcx = px, pcy = py + 26;                                   // underside of the piece on screen
  if (t > 3.95 && t < DROPS[0].t0 + 0.05) {
    const u = seg(t, 3.95, DROPS[0].t0), len = 8 + 44 * eio(u);
    drip += `<path d="M${F(pcx - 4)} ${F(pcy)} Q${F(pcx - 2)} ${F(pcy + len * 0.5)} ${F(pcx - 6)} ${F(pcy + len)}" stroke="#A04F1B" stroke-width="${F(5 - 2.5 * u)}" fill="none" stroke-linecap="round"/><circle cx="${F(pcx - 6)}" cy="${F(pcy + len)}" r="${F(5 + 3 * u)}" fill="#B35A20"/><circle cx="${F(pcx - 8)}" cy="${F(pcy + len - 2)}" r="2" fill="#FFE2B8"/>`;
  }
  DROPS.forEach((d, i) => {
    const u = (t - d.t0) / d.fall;
    if (i > 0 && t >= d.t0 - 0.28 && t < d.t0) {                    // bead swells under the piece
      const k = seg(t, d.t0 - 0.28, d.t0); drip += `<circle cx="${F(pcx + d.dx)}" cy="${F(pcy + 3 + 6 * k)}" r="${F(2 + 5 * k)}" fill="#B35A20"/><circle cx="${F(pcx + d.dx - 1.5)}" cy="${F(pcy + 1 + 6 * k)}" r="1.6" fill="#FFE2B8"/>`;
    }
    if (u < 0 || u > 1) return;
    const y0 = pcy + 8, y1 = gyp, y = lerp(y0, y1, u * u), stretch = 1 + 1.4 * u;
    drip += `<ellipse cx="${F(pcx + d.dx)}" cy="${F(y)}" rx="${F(6)}" ry="${F(6 * stretch)}" fill="#B35A20"/><ellipse cx="${F(pcx + d.dx - 1.8)}" cy="${F(y - 2)}" rx="1.8" ry="${F(2.6 * stretch)}" fill="#FFE2B8"/>`;
  });

  // ---- camera
  const cam = 1.06 + 0.05 * seg(t, 0, 5.7);
  const e = eio(seg(t, 0.12, 1.0));
  const bgBlur = lerp(15, 0, e), stmBlur = lerp(3, 17, e);
  const lx = 22 * t;

  const defs = `${K.defs()}${K.steelDefs()}
<filter id="bg" filterUnits="userSpaceOnUse" x="-100" y="-100" width="1280" height="2120"><feGaussianBlur stdDeviation="${F(Math.max(0.01, bgBlur))}"/></filter>
<filter id="stm" filterUnits="userSpaceOnUse" x="-100" y="-100" width="1280" height="2120"><feGaussianBlur stdDeviation="${F(Math.max(0.01, 4 + stmBlur * 0.4))}"/></filter>
<filter id="stf" filterUnits="userSpaceOnUse" x="-300" y="-300" width="1680" height="2520"><feGaussianBlur stdDeviation="${F(Math.max(0.01, 12 + stmBlur * 1.4))}"/></filter>
<filter id="sub" filterUnits="userSpaceOnUse" x="-100" y="-100" width="1280" height="2120"><feGaussianBlur stdDeviation="${F(1.4 * sub)}"/></filter>
<radialGradient id="idg" cx="0.38" cy="0.32" r="0.85"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.45" stop-color="#F7F4EB"/><stop offset="0.82" stop-color="#E5E0D0"/><stop offset="1" stop-color="#C8C1AB"/></radialGradient>
<radialGradient id="idshade" cx="0.62" cy="0.7" r="0.75"><stop offset="0.55" stop-color="#6b624a" stop-opacity="0"/><stop offset="1" stop-color="#6b624a" stop-opacity="0.32"/></radialGradient>
<radialGradient id="plrim" cx="0.38" cy="0.3" r="0.9"><stop offset="0" stop-color="#F2F6F7"/><stop offset="0.5" stop-color="#C5CED2"/><stop offset="1" stop-color="#7F8B91"/></radialGradient>
<radialGradient id="plfield" cx="0.4" cy="0.34" r="0.85"><stop offset="0" stop-color="#E4EAEC"/><stop offset="0.6" stop-color="#B5BFC4"/><stop offset="1" stop-color="#8E9AA0"/></radialGradient>
<radialGradient id="kt" cx="0.35" cy="0.28" r="0.95"><stop offset="0" stop-color="#F7FAFB"/><stop offset="0.5" stop-color="#C3CCD1"/><stop offset="1" stop-color="#76828A"/></radialGradient>
<radialGradient id="ktin" cx="0.6" cy="0.68" r="0.8"><stop offset="0" stop-color="#8f9ba1"/><stop offset="0.7" stop-color="#5f6b72"/><stop offset="1" stop-color="#3f4a50"/></radialGradient>
<radialGradient id="smb" cx="0.42" cy="0.38" r="0.8"><stop offset="0" stop-color="#D07A2C"/><stop offset="0.6" stop-color="#B25A20"/><stop offset="1" stop-color="#7C3A12"/></radialGradient>
<radialGradient id="chg" cx="0.42" cy="0.36" r="0.8"><stop offset="0" stop-color="#FBF9F1"/><stop offset="0.7" stop-color="#EEEBDC"/><stop offset="1" stop-color="#D2CEBB"/></radialGradient>
<radialGradient id="sbcoat" cx="0.4" cy="0.35" r="0.85"><stop offset="0" stop-color="#C8742A"/><stop offset="0.7" stop-color="#A9541C"/><stop offset="1" stop-color="#7C3A12"/></radialGradient>
<linearGradient id="spH" gradientUnits="userSpaceOnUse" x1="0" y1="-16" x2="0" y2="16"><stop offset="0" stop-color="#6D787E"/><stop offset="0.28" stop-color="#EEF3F5"/><stop offset="0.55" stop-color="#A9B4B9"/><stop offset="1" stop-color="#586369"/></linearGradient>
<radialGradient id="spB" gradientUnits="userSpaceOnUse" cx="-26" cy="-22" r="120" gradientTransform="rotate(${F(-th)})"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.5" stop-color="#C6CFD3"/><stop offset="1" stop-color="#6B777D"/></radialGradient>
<radialGradient id="spIn" gradientUnits="userSpaceOnUse" cx="24" cy="18" r="90" gradientTransform="rotate(${F(-th)})"><stop offset="0" stop-color="#E9EFF1"/><stop offset="0.6" stop-color="#A6B1B6"/><stop offset="1" stop-color="#5E6A70"/></radialGradient>
<radialGradient id="vig" cx="0.5" cy="0.47" r="0.75"><stop offset="0.55" stop-color="#0b1713" stop-opacity="0"/><stop offset="1" stop-color="#0b1713" stop-opacity="0.55"/></radialGradient>
<clipPath id="cpA"><path d="${blobPath(IDLIS[0].cx, IDLIS[0].cy, IDLI_R, IDLIS[0].seed)}"/></clipPath>`;

  const svg = `<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs>
<g transform="translate(540 880) scale(${F(cam * 1000) / 1000}) translate(-545 -880)">
<g filter="url(#bg)">
${K.steel(t, { base: '#3C494E' })}
${plateEl()}${idlisSvg}${katoriShell(SAMBAR, smb)}${katoriShell(CHUTNEY, chutneyLiquid())}
${wispsEl(t)}
</g>
${sh}${pieceShadow}${dunkBlur}${drip}
${fgSteamEl(t)}
</g>
<g opacity="0.07" filter="url(#blur60)"><polygon points="${F(-100 + lx)},150 ${F(160 + lx)},150 ${F(620 + lx)},1600 ${F(340 + lx)},1600" fill="#F4F6F1"/></g>
<rect width="1080" height="1920" fill="url(#vig)"/>
<rect width="1080" height="1920" filter="url(#grain)" opacity="0.38"/></svg>`;
  stage.innerHTML = svg;
}
window.SCENE = { dur: 5.7, setT };
window.__idli = { GX, GY, GH, track };
})();
