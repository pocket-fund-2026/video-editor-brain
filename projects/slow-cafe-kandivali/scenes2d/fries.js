(() => {
const { clamp, seg, lerp, eo, eio, eob, rng } = K;
const F = (n) => Math.round(n * 10) / 10;
const RAD = Math.PI / 180;

// ---------------- motion paths (Hermite through waypoints [t,x,y,theta]) ----------------
function pathAt(w, t) {
  const n = w.length;
  if (t <= w[0][0]) return w[0].slice(1);
  if (t >= w[n - 1][0]) return w[n - 1].slice(1);
  let i = 0; while (w[i + 1][0] <= t) i++;
  const t0 = w[i][0], t1 = w[i + 1][0], h = t1 - t0, s = (t - t0) / h;
  const h00 = 2 * s ** 3 - 3 * s ** 2 + 1, h10 = s ** 3 - 2 * s ** 2 + s, h01 = -2 * s ** 3 + 3 * s ** 2, h11 = s ** 3 - s ** 2;
  const tan = (j, c) => {
    if (j === 0 || j === n - 1) return 0;
    if (w[j][c] === w[j - 1][c] || w[j][c] === w[j + 1][c]) return 0;
    return (w[j + 1][c] - w[j - 1][c]) / (w[j + 1][0] - w[j - 1][0]);
  };
  const out = [];
  for (let c = 1; c <= 3; c++) out.push(h00 * w[i][c] + h10 * h * tan(i, c) + h01 * w[i + 1][c] + h11 * h * tan(i + 1, c));
  return out;
}

// ---------------- fries ----------------
const FRY_COL = [['#F4A650', '#E27C26', '#B55A1B'], ['#F09A3E', '#DA701F', '#A94E16'], ['#F6AE5C', '#E6842F', '#BC6221'], ['#EA8D36', '#D06A1B', '#9F4814']];
function mkFry(seed, L, w) {
  const r = rng(seed * 977 + 13); const hw = w / 2; const j = (a = 1) => (r() - 0.5) * 2 * a;
  const jit = [j(1), j(1), j(1.2), j(1.5)];
  const spots = [], edge = [], salt = [], herb = [];
  for (let i = 0; i < 6; i++) spots.push([j(hw - 8), -(12 + r() * (L - 26)), 2.5 + r() * 3.5, 3.5 + r() * 7, r() * 60 - 30, 0.4 + r() * 0.3]);
  for (let i = 0; i < 5; i++) { const sd = r() < 0.5 ? -1 : 1; edge.push([sd * (hw - 3.5), -r() * L, 2 + r() * 1.8, 6 + r() * 14, 0.45 + r() * 0.3]); }
  for (let i = 0; i < 11; i++) salt.push([j(hw - 5), -r() * (L - 10) - 5, 0.8 + r() * 1.0]);
  for (let i = 0; i < 3; i++) herb.push([j(hw - 6), -r() * (L - 14) - 8, 1.5 + r()]);
  return { hw, L, jit, g: Math.floor(r() * 4), spots, edge, salt, herb };
}
const rrp = (x0, y0, x1, y1, r) => `M${F(x0 + r)} ${F(y0)}L${F(x1 - r)} ${F(y0)}Q${F(x1)} ${F(y0)} ${F(x1)} ${F(y0 + r)}L${F(x1)} ${F(y1 - r)}Q${F(x1)} ${F(y1)} ${F(x1 - r)} ${F(y1)}L${F(x0 + r)} ${F(y1)}Q${F(x0)} ${F(y1)} ${F(x0)} ${F(y1 - r)}L${F(x0)} ${F(y0 + r)}Q${F(x0)} ${F(y0)} ${F(x0 + r)} ${F(y0)}Z`;
function fryEl(sp, coat) {
  const { hw, L, jit } = sp; const x0 = -hw + jit[0], x1 = hw + jit[1], y0 = -L + jit[2], y1 = jit[3];
  let s = `<path d="${rrp(x0, y0, x1, y1, 7)}" fill="#7A3110"/>`;
  s += `<path d="${rrp(x0 + 3.5, y0 + 3, x1 - 3.5, y1 - 3, 5)}" fill="url(#fg${sp.g})"/>`;
  s += `<path d="${rrp(hw * 0.32, y0 + 4, x1 - 3.5, y1 - 4, 4)}" fill="#8A3A0E" opacity="0.3"/>`;
  s += `<rect x="${F(-hw * 0.5)}" y="${F(y0 + 14)}" width="${F(hw * 0.75)}" height="${F(L - 30)}" rx="5" fill="#FAB865" opacity="0.32"/>`;
  s += `<rect x="${F(x0 + 5)}" y="${F(y0 + 10)}" width="3.6" height="${F(L - 24)}" rx="1.8" fill="#FFD48F" opacity="0.6"/>`;
  s += sp.edge.map((q) => `<ellipse cx="${F(q[0])}" cy="${F(q[1])}" rx="${F(q[2])}" ry="${F(q[3])}" fill="#5E230A" opacity="${F(q[4])}"/>`).join('');
  s += sp.spots.map((q) => `<g transform="translate(${F(q[0])} ${F(q[1])}) rotate(${F(q[4])})"><ellipse rx="${F(q[2])}" ry="${F(q[3])}" fill="#6A280A" opacity="${F(q[5])}"/><ellipse cx="-0.8" cy="-1.2" rx="${F(q[2] * 0.55)}" ry="${F(q[3] * 0.5)}" fill="#C0651F" opacity="0.5"/></g>`).join('');
  s += sp.salt.map((q) => `<circle cx="${F(q[0])}" cy="${F(q[1])}" r="${F(q[2])}" fill="#FBFAF6" opacity="0.9"/>`).join('');
  s += sp.herb.map((q) => `<ellipse cx="${F(q[0])}" cy="${F(q[1])}" rx="${F(q[2] * 1.6)}" ry="${F(q[2] * 0.7)}" fill="#5E8A3F" opacity="0.92" transform="rotate(${F(q[0] * 11)} ${F(q[0])} ${F(q[1])})"/>`).join('');
  s += `<polygon points="${F(x0 + 1)},${F(y0 + 1)} ${F(x1 - 1)},${F(y0 + 1)} ${F(x1 - 6)},${F(y0 - 12)} ${F(x0 + 6)},${F(y0 - 12)}" fill="#F9CB82" stroke="#B2601C" stroke-width="2" stroke-linejoin="round"/>`;
  s += `<polygon points="${F(x0 + 6)},${F(y0 - 1)} ${F(x1 - 6)},${F(y0 - 1)} ${F(x1 - 9)},${F(y0 - 9)} ${F(x0 + 9)},${F(y0 - 9)}" fill="#FEE6B6" opacity="0.8"/><circle cx="${F(hw * 0.3)}" cy="${F(y0 - 6)}" r="1.4" fill="#C8782A"/><circle cx="${F(-hw * 0.3)}" cy="${F(y0 - 4)}" r="1.1" fill="#C8782A"/>`;
  if (coat) s += coat;
  return s;
}

// bundle
const BUNDLE = [];
{
  const rows = [[7, -96, 32, 745, 770], [7, -84, 28, 765, 790], [8, -98, 28, 780, 805]];
  let id = 0;
  rows.forEach((rw, ri) => {
    for (let k = 0; k < rw[0]; k++) {
      const r = rng(id * 31 + 7); const off = rw[1] + k * rw[2] + (r() - 0.5) * 4;
      const lifted = ri === 2 && (k === 2 || k === 5);
      const L = lifted ? 175 : 168 + r() * 24, w = lifted ? 31 : 28 + r() * 4;
      const th = off / 110 * 3 + (r() - 0.5) * 2.4, topY = lifted ? 790 : rw[3] + r() * (rw[4] - rw[3]);
      const sp = mkFry(id + 1, L, w);
      BUNDLE.push({ sp, tipX: 540 + off - L * Math.sin(th * RAD), tipY: topY + L * Math.cos(th * RAD), th, row: ri, off, k, L, ph: r() * 6.28, lifted: lifted ? (k === 2 ? 1 : 2) : 0 });
      id++;
    }
  });
}
const FR1 = BUNDLE.find((b) => b.lifted === 1), FR2 = BUNDLE.find((b) => b.lifted === 2);

// ---------------- dips ----------------
const PINK = { id: 'P', cx: 385, cy: 1238, surf: 1244, main: '#E8A5B3', hi: '#F7D3DB', lo: '#C98096', coatG: ['#F6C6D0', '#E8A5B3', '#C9809A'], R0: 9, R1: 22, n0: 6.5, dropR: [8, 11] };
const HERB = { id: 'H', cx: 700, cy: 1250, surf: 1256, main: '#E4EACB', hi: '#FAFBEF', lo: '#A9B88A', coatG: ['#F6F8E6', '#E1E8C6', '#B6C497'], R0: 8, R1: 18, n0: 5, dropR: [5.5, 8] };
const W1 = [[0, FR1.tipX, FR1.tipY, FR1.th], [1.3, FR1.tipX, FR1.tipY, FR1.th], [1.38, FR1.tipX + 1, FR1.tipY - 9, FR1.th + 2], [1.5, FR1.tipX - 3, 880, 8], [1.62, 470, 864, 22], [1.78, 418, 1060, 17], [1.90, 393, 1296, 6], [2.0, 390, 1304, 4], [2.06, 390, 1304, 4], [2.4, 392, 1160, 2], [2.7, 374, 1040, -1], [2.9, 364, 990, -3], [3.12, 363, 986, -3], [3.2, 363, 986, -3], [3.5, 430, 860, 22], [3.72, 490, 925, 8], [3.9, FR1.tipX, FR1.tipY, FR1.th]];
const W2 = [[0, FR2.tipX, FR2.tipY, FR2.th], [2.55, FR2.tipX, FR2.tipY, FR2.th], [2.63, FR2.tipX, FR2.tipY - 9, FR2.th - 2], [2.74, 590, 880, -8], [2.86, 632, 862, -22], [3.02, 682, 1080, -12], [3.26, 702, 1300, -3], [3.42, 700, 1306, -2], [3.48, 700, 1306, -2], [3.66, 702, 1215, -1], [3.84, 701, 1130, 1], [3.92, 699, 1112, 2], [4.14, 660, 862, -22], [4.34, 610, 930, -6], [4.5, FR2.tipX, FR2.tipY, FR2.th]];
function findExit(w, surf, t0) { let below = false; for (let t = t0; t < 5; t += 0.004) { const y = pathAt(w, t)[1]; if (y > surf + 8) below = true; if (below && y < surf - 1) return t; } return 5; }
PINK.w = W1; HERB.w = W2;
PINK.tExit = findExit(W1, PINK.surf, 1.5); HERB.tExit = findExit(W2, HERB.surf, 3.0);
PINK.fade = [3.35, 3.7]; HERB.fade = [4.2, 4.45]; PINK.tb = 2.58; HERB.tb = 3.74; PINK.bulbEnd = 3.25; HERB.bulbEnd = 4.1; PINK.tDunk = 1.86; HERB.tDunk = 3.17;
function dropInfo(D) {
  const tip = pathAt(D.w, D.tb); const h = D.surf - tip[1]; const yb = D.surf - 0.55 * h; const g = 3000;
  D.h = h; D.yb = yb; D.xb = tip[0]; D.ti = D.tb + Math.sqrt(2 * (D.surf - yb) / g); D.g = g;
}
dropInfo(PINK); dropInfo(HERB);
PINK.rip = [[PINK.tDunk, 1, 0], [PINK.tDunk + 0.1, 0.8, 0], [PINK.tExit, 0.5, 0], [PINK.ti, 1, 1], [PINK.ti + 0.12, 0.8, 1], [PINK.ti + 0.25, 0.6, 1]];
HERB.rip = [[HERB.tDunk, 1, 0], [HERB.tDunk + 0.1, 0.8, 0], [HERB.tExit, 0.5, 0], [HERB.ti, 0.9, 1], [HERB.ti + 0.12, 0.7, 1]];

// ---------------- helpers ----------------
function dunkSlosh(t, D) { let s = 0; [D.tDunk, D.tExit, D.ti].forEach((t0, i) => { const a = t - t0; if (a > 0) s += (i === 2 ? 3 : 6) * Math.exp(-a * 3.2) * Math.sin(a * 17); }); return s; }
function ellipseArc(x, y, rx, ry, front) { return `M${F(x - rx)} ${F(y)}A${F(rx)} ${F(ry)} 0 0 ${front ? 0 : 1} ${F(x + rx)} ${F(y)}`; }

function ripples(D, t, light, dark) {
  let back = '', front = '';
  const irx = 98, iry = 31;
  D.rip.forEach(([t0, amp, atDrop]) => {
    const a = t - t0; if (a < 0 || a > 1.2) return;
    const x = atDrop ? D.xb : pathAt(D.w, t0 + 0.02)[0];
    const rx = 12 + 140 * (1 - Math.exp(-a * 2.6)) * amp + 8 * a, ry = rx * 0.316; const op = Math.pow(1 - a / 1.2, 1.4) * amp;
    const ring = (front2) => `<path d="${ellipseArc(x, D.surf, rx, ry, front2)}" fill="none" stroke="${light}" stroke-width="3.2" opacity="${F(op * 0.9)}"/><path d="${ellipseArc(x, D.surf + 3.5, rx, ry, front2)}" fill="none" stroke="${dark}" stroke-width="2.4" opacity="${F(op * 0.55)}"/>`;
    back += ring(false); front += ring(true);
  });
  return { back, front };
}

function splash(D, t, t0, ex) {
  const a = t - t0; if (a < 0 || a > 0.4) return '';
  const r = rng(Math.floor(t0 * 100)); let s = '';
  for (let i = 0; i < 6; i++) {
    const vx = (r() - 0.5) * 150, vy = 240 + r() * 160; const x = ex + vx * a, y = D.surf - (vy * a - 0.5 * 1800 * a * a);
    if (y > D.surf) continue; const rr = (3.8 - 2 * a / 0.4) * (0.7 + r() * 0.6);
    s += `<circle cx="${F(x)}" cy="${F(y)}" r="${F(Math.max(0.6, rr))}" fill="${D.main}"/><circle cx="${F(x - rr * 0.3)}" cy="${F(y - rr * 0.3)}" r="${F(rr * 0.3)}" fill="#fff" opacity="0.8"/>`;
  }
  return s;
}

function coatEl(D, sp, t) {
  const fade = 1 - seg(t, D.fade[0], D.fade[1]); if (fade <= 0.01) return '';
  const c = sp.hw + 3, H = D === PINK ? 58 : 52; const r = rng(D === PINK ? 5 : 9); const w = () => (r() - 0.5);
  const tY = [-H + w() * 10, -H + 12 + w() * 8, -H - 8 + w() * 6, -H + 6 + w() * 8];
  const gid = 'cg' + D.id;
  const bk = t >= D.tb ? clamp(seg(t, D.tb, D.tb + 0.1)) * (1 - seg(t, D.bulbEnd, D.bulbEnd + 0.25)) : 0;
  let s = `<g opacity="${F(fade)}"><path d="M${-c} ${F(tY[0])} C${F(-c * 0.6)} ${F(tY[0] - 7)} ${F(-c * 0.5)} ${F(tY[1] + 6)} ${F(-c * 0.2)} ${F(tY[1])} S${F(c * 0.1)} ${F(tY[2] + 2)} ${F(c * 0.45)} ${F(tY[2])} S${F(c)} ${F(tY[3] - 3)} ${c} ${F(tY[3])} L${c} -12 C${c + 1} 0 ${F(c * 0.6)} 11 ${F(c * 0.3)} 6 S${F(-c * 0.15)} 13 ${F(-c * 0.45)} 7 S${-c - 1} 2 ${-c} -12 Z" fill="url(#${gid})" stroke="${D.lo}" stroke-width="1.2" stroke-opacity="0.55"/>`;
  s += `<path d="M${F(-c + 5)} ${F(tY[0] + 14)} L${F(-c + 5)} -16" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity="0.7"/><ellipse cx="${F(-c + 6)}" cy="-5" rx="2.6" ry="2.6" fill="#fff" opacity="0.9"/><path d="M${F(c * 0.15)} ${F(tY[1] + 14)} L${F(c * 0.15)} -26" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity="0.4"/>`;
  s += `<path d="M${F(c - 4)} ${F(tY[3] + 10)} L${F(c - 4)} -12" stroke="${D.lo}" stroke-width="6" stroke-linecap="round" opacity="0.3"/>`;
  if (D === HERB) for (let i = 0; i < 9; i++) s += `<ellipse cx="${F((r() - 0.5) * 2 * (c - 5))}" cy="${F(-r() * (H - 12) - 4)}" rx="${F(1.8 + r() * 1.4)}" ry="${F(1 + r() * 0.7)}" fill="#5F8A45" transform="rotate(${F(r() * 180)})"/>`;
  if (bk > 0.01) s += `<ellipse cx="0" cy="${F(10 + 3 * bk)}" rx="${F(7 * bk + 1)}" ry="${F(10 * bk + 1)}" fill="${D.main}"/><ellipse cx="${F(-2 * bk)}" cy="${F(7 * bk + 6)}" rx="${F(1.8 * bk)}" ry="${F(3 * bk)}" fill="#fff" opacity="0.8"/>`;
  return s + '</g>';
}

function threadEls(D, t, tip) {
  let s = ''; const [tx, ty, th] = tip;
  const down = [-Math.sin(th * RAD), Math.cos(th * RAD)];
  const sx = tx + down[0] * 6, sy = ty + down[1] * 6; const surf = D.surf;
  const poly = (x0, y0, x1, y1, hw0, hw1, nMid, tag) => {
    const N = 14, L = [], R = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N; const x = lerp(x0, x1, u), y = lerp(y0, y1, u);
      const hw = nMid + (hw0 - nMid) * Math.pow(1 - u, 2.5) + (hw1 - nMid) * Math.pow(u, 3.2);
      L.push(F(x - hw) + ',' + F(y)); R.push(F(x + hw) + ',' + F(y));
    }
    const pts = L.concat(R.reverse()).join(' ');
    return `<polygon points="${pts}" fill="${D.main}"/><path d="M${F(x0 - hw0 * 0.45)} ${F(y0)} L${F(lerp(x0, x1, 0.8) - nMid * 0.4)} ${F(lerp(y0, y1, 0.8))}" stroke="#fff" stroke-width="1.8" opacity="0.75" fill="none"/><path d="M${F(x0 + hw0 * 0.5)} ${F(y0)} L${F(lerp(x0, x1, 0.8) + nMid * 0.5)} ${F(lerp(y0, y1, 0.8))}" stroke="${D.lo}" stroke-width="1.6" opacity="0.35" fill="none"/>`;
  };
  const h = surf - sy;
  if (t >= D.tExit && t < D.tb && h > 3) {
    const p = (t - D.tExit) / (D.tb - D.tExit);
    const nMid = 0.9 + (D.n0 - 0.9) * (1 - Math.pow(p, 1.4));
    s += poly(sx, sy, sx + 4 * Math.sin(t * 8), surf + 1, D.R0, D.R1, nMid, 'th');
  }
  if (t >= D.tb) {
    const q = clamp((t - D.tb) / 0.14);
    if (q < 1) {
      const lu = 0.45 * D.h * (1 - q) + 2, ll = 0.3 * D.h * (1 - q) + 1;
      s += poly(sx, sy, sx, sy + lu, D.R0, 0.3, 0.3, 'up');
      s += poly(D.xb, surf - ll, D.xb, surf + 1, 0.4, D.R1, 0.4, 'lo');
    }
    if (t < D.ti) {
      const a = t - D.tb, y = D.yb + 0.5 * D.g * a * a, v = D.g * a; const rx = D.dropR[0], ry = D.dropR[1] + clamp(v / 900) * 7;
      s += `<path d="M${F(D.xb)} ${F(y - ry * 1.9)} Q${F(D.xb + rx * 0.9)} ${F(y - ry * 0.4)} ${F(D.xb + rx)} ${F(y)} A${rx} ${F(ry)} 0 1 1 ${F(D.xb - rx)} ${F(y)} Q${F(D.xb - rx * 0.9)} ${F(y - ry * 0.4)} ${F(D.xb)} ${F(y - ry * 1.9)}Z" fill="${D.main}"/><ellipse cx="${F(D.xb - rx * 0.35)}" cy="${F(y + ry * 0.1)}" rx="${F(rx * 0.22)}" ry="${F(ry * 0.4)}" fill="#fff" opacity="0.85"/>`;
    }
  }
  return s;
}

function meniscus(D, t, tip) {
  const [tx, ty, th] = tip; if (ty <= D.surf - 1 && !(t < D.tExit + 0.05)) return '';
  const ex = tx + (ty - D.surf) * Math.tan(th * RAD); if (Math.abs(ex - D.cx) > 95) return '';
  const hwF = 17; const up = ty > D.surf ? 1 : clamp(1 - (D.surf - ty) / 18);
  const rx = hwF + 8 + 4 * (1 - up), ry = rx * 0.32;
  return `<ellipse cx="${F(ex)}" cy="${D.surf + 1}" rx="${F(rx)}" ry="${F(ry)}" fill="none" stroke="${D.hi}" stroke-width="2.6" opacity="${F(0.85 * up)}"/><path d="M${F(ex - hwF - 15)} ${D.surf + 2} Q${F(ex - hwF - 4)} ${D.surf} ${F(ex - hwF)} ${F(D.surf - 11 * up)} L${F(ex - hwF)} ${D.surf + 3}Z M${F(ex + hwF + 15)} ${D.surf + 2} Q${F(ex + hwF + 4)} ${D.surf} ${F(ex + hwF)} ${F(D.surf - 11 * up)} L${F(ex + hwF)} ${D.surf + 3}Z" fill="${D.main}" opacity="${F(up)}"/>`;
}

// ---------------- the vessels ----------------
function cupBack() {
  return `<ellipse cx="540" cy="870" rx="135" ry="24" fill="url(#cupRim)"/><ellipse cx="540" cy="873" rx="121" ry="18.5" fill="url(#cupIn)"/>`;
}
const CUP_BODY = 'M405 870A135 24 0 0 0 675 870L664 1158A124 20 0 0 1 416 1158Z';
function cupFront(t) {
  let s = `<path d="M405 870A135 24 0 0 0 675 870L661 870A121 18.5 0 0 1 419 870Z" fill="url(#cupLip)"/>`; // rim crescent drawn over fries
  s += `<path d="M405 870A135 24 0 0 0 675 870L664 1158A124 20 0 0 1 416 1158Z" fill="url(#cupBody)"/>`;
  s += `<g clip-path="url(#cupClip)"><path d="M405 876A135 24 0 0 0 675 876L675 905A135 24 0 0 1 405 905Z" fill="#4D6A55" opacity="0.28" filter="url(#blur6)"/>`;
  s += `<path d="M610 880L690 880L690 1190L585 1190Q600 1000 610 880Z" fill="#587B60" opacity="0.28" filter="url(#blur14)"/>`;
  s += `<rect x="432" y="905" width="16" height="190" rx="8" fill="#fff" opacity="0.34" filter="url(#blur6)"/><rect x="437" y="925" width="5" height="62" rx="2.5" fill="#fff" opacity="0.5"/>`;
  s += `<path d="M405 1128A135 28 0 0 0 675 1128L675 1190L405 1190Z" fill="#6E8F76" opacity="0.38"/><path d="M413 1140A128 22 0 0 0 667 1140" fill="none" stroke="#C9DECB" stroke-width="2" opacity="0.5"/>`;
  const g = seg(t, 4.45, 4.95);
  if (g > 0 && g < 1) { const x = lerp(340, 720, eio(g)); s += `<polygon points="${F(x)},860 ${F(x + 46)},860 ${F(x - 40)},1200 ${F(x - 86)},1200" fill="url(#glintG)" opacity="${F(Math.sin(g * Math.PI))}"/>`; }
  s += `</g>`;
  s += `<path d="M406 872A134 23 0 0 0 674 872" fill="none" stroke="#D6E6D7" stroke-width="2.2" opacity="0.8"/>`;
  return s;
}
function ramekin(D, dx, light, mid, dark, body, surfaceFn, t, slosh) {
  const { cx, cy } = D; const rx = 118, ry = 40, h = 64, irx = 98, iry = 31;
  const id = D.id; let s = `<g transform="translate(${F(dx)} 0)">`;
  s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#rimG${id})"/><ellipse cx="${cx}" cy="${cy + 3}" rx="${irx}" ry="${iry}" fill="${body[3]}"/>`;
  s += `<g clip-path="url(#in${id})">${surfaceFn(slosh)}</g>`;
  s += `<path d="M${cx - rx + 8} ${cy - 12}A${rx - 8} ${ry - 5} 0 0 1 ${cx - 40} ${cy - ry + 3}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.5"/>`;
  s += `<path d="M${cx - rx} ${cy}A${rx} ${ry} 0 0 0 ${cx + rx} ${cy}L${cx + rx - 18} ${cy + h}A${rx - 18} ${ry - 6} 0 0 1 ${cx - rx + 18} ${cy + h}Z" fill="url(#bodyG${id})"/>`;
  s += `<g clip-path="url(#bd${id})"><rect x="${cx - rx}" y="${cy + 2}" width="${2 * rx}" height="18" fill="${body[2]}" opacity="0.22" filter="url(#blur6)"/><rect x="${cx - rx + 12}" y="${cy + 12}" width="9" height="42" rx="4" fill="#fff" opacity="${body[4]}" filter="url(#blur6)"/><rect x="${cx - rx}" y="${cy + h - 10}" width="${2 * rx}" height="14" fill="#000" opacity="0.14"/></g>`;
  s += `</g>`;
  return s;
}

function pinkSurface(sl, t) {
  const D = PINK, cx = D.cx, cy = D.cy + 7; const s = sl;
  let o = `<ellipse cx="${cx}" cy="${cy}" rx="96" ry="29" fill="url(#pinkG)"/>`;
  o += `<ellipse cx="${cx}" cy="${cy - 22}" rx="90" ry="9" fill="#B9788A" opacity="0.28" filter="url(#blur6)"/>`;
  let d = '', d2 = '';
  for (let i = 0; i <= 60; i++) { const a = i / 60 * 3.2 * Math.PI, r = 0.13 + 0.82 * i / 60; const x = cx + s * 1.2 + 94 * r * Math.cos(a + 0.6), y = cy + 28 * r * Math.sin(a + 0.6); d += (i ? 'L' : 'M') + F(x) + ' ' + F(y); d2 += (i ? 'L' : 'M') + F(x) + ' ' + F(y + 3.5); }
  o += `<path d="${d2}" fill="none" stroke="#C57D93" stroke-width="7" stroke-linecap="round" opacity="0.42"/><path d="${d}" fill="none" stroke="#F8D9E0" stroke-width="7.5" stroke-linecap="round" opacity="0.9"/><path d="${d}" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity="0.55" transform="translate(-1 -2)"/>`;
  o += `<ellipse cx="${F(cx + s * 1.2)}" cy="${cy}" rx="14" ry="5.5" fill="#F9DEE5"/><ellipse cx="${F(cx + s * 1.2 - 3)}" cy="${cy - 2}" rx="6" ry="2" fill="#fff" opacity="0.85"/>`;
  o += `<path d="M${cx - 80} ${cy - 5}A84 24 0 0 1 ${cx - 36} ${cy - 25}" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity="0.7"/><circle cx="${cx - 90}" cy="${cy + 3}" r="2.6" fill="#fff" opacity="0.8"/>`;
  return o;
}
const HERB_FLECKS = (() => { const r = rng(77), a = []; while (a.length < 55) { const x = (r() - 0.5) * 2, y = (r() - 0.5) * 2; if (x * x + y * y < 0.85) a.push([x, y, 1.6 + r() * 2.8, r() * 180, Math.floor(r() * 3), r()]); } return a; })();
function herbSurface(sl) {
  const D = HERB, cx = D.cx, cy = D.cy + 7, s = sl; const cols = ['#5F8A45', '#7DA25A', '#3F6B3A'];
  let o = `<ellipse cx="${cx}" cy="${cy}" rx="96" ry="29" fill="url(#herbG)"/><ellipse cx="${cx}" cy="${cy - 22}" rx="90" ry="9" fill="#8A9A68" opacity="0.3" filter="url(#blur6)"/>`;
  let d = '';
  for (let i = 0; i <= 50; i++) { const a = i / 50 * 2.6 * Math.PI, r = 0.15 + 0.7 * i / 50; d += (i ? 'L' : 'M') + F(cx + s * 1.1 + 94 * r * Math.cos(a + 2)) + ' ' + F(cy + 28 * r * Math.sin(a + 2)); }
  o += `<path d="${d}" fill="none" stroke="#F8FAEA" stroke-width="7" stroke-linecap="round" opacity="0.85"/><path d="${d}" fill="none" stroke="#B9C79A" stroke-width="2" opacity="0.5" transform="translate(0 3)"/>`;
  o += HERB_FLECKS.map((q) => `<ellipse cx="${F(cx + s * 1.1 + q[0] * 88)}" cy="${F(cy + q[1] * 26)}" rx="${F(q[2])}" ry="${F(q[2] * 0.5)}" fill="${cols[q[4]]}" transform="rotate(${F(q[3])} ${F(cx + s * 1.1 + q[0] * 88)} ${F(cy + q[1] * 26)})"/>`).join('');
  o += `<path d="M${cx + 30} ${cy - 17}A84 24 0 0 1 ${cx + 76} ${cy - 3}" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.65"/><path d="M${cx - 76} ${cy - 4}A84 24 0 0 1 ${cx - 36} ${cy - 22}" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.7"/>`;
  return o;
}

// ---------------- defs ----------------
const grad = (id, stops, x2 = 1, y2 = 0) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map((c, i) => `<stop offset="${i / (stops.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const DEFS = K.defs() +
  FRY_COL.map((c, i) => grad('fg' + i, c)).join('') +
  grad('cupBody', ['#BCD3BE', '#A9C5AC', '#9AB89D', '#86A78B', '#6C8E73']).replace('x2="1"', 'x1="0.05" x2="0.98"') +
  grad('cupRim', ['#C6DBC8', '#B2CBB4', '#9AB89D']) + grad('cupLip', ['#CFE1D0', '#B7CFB9', '#8FAE94']) +
  `<linearGradient id="cupIn" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="#3B5042"/><stop offset="1" stop-color="#26332B"/></linearGradient>` +
  `<clipPath id="cupClip"><path d="${CUP_BODY}"/></clipPath>` +
  `<linearGradient id="glintG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>` +
  `<radialGradient id="pinkG" cx="0.45" cy="0.45" r="0.7"><stop offset="0" stop-color="#F3BFCA"/><stop offset="0.6" stop-color="#E8A5B3"/><stop offset="1" stop-color="#D48D9F"/></radialGradient>` +
  `<radialGradient id="herbG" cx="0.45" cy="0.45" r="0.7"><stop offset="0" stop-color="#F3F5E2"/><stop offset="0.6" stop-color="#E5EACD"/><stop offset="1" stop-color="#C5D0A6"/></radialGradient>` +
  grad('cgP', PINK.coatG) + grad('cgH', HERB.coatG) +
  grad('rimGP', ['#FFFFFF', '#ECEEF1', '#D3D7DC']) + grad('rimGH', ['#5B5953', '#454340', '#35332F']) +
  grad('bodyGP', ['#FFFFFF', '#F1F2F5', '#DCDFE4', '#BFC4CB']).replace('x2="1"', 'x1="0.05" x2="1"') + grad('bodyGH', ['#5A5853', '#403E3A', '#2F2E2C', '#1E1D1B']).replace('x2="1"', 'x1="0.05" x2="1"') +
  [PINK, HERB].map((D) => `<clipPath id="in${D.id}"><ellipse cx="${D.cx}" cy="${D.cy + 3}" rx="98" ry="31"/></clipPath><clipPath id="bd${D.id}"><path d="M${D.cx - 118} ${D.cy}A118 40 0 0 0 ${D.cx + 118} ${D.cy}L${D.cx + 100} ${D.cy + 64}A100 34 0 0 1 ${D.cx - 100} ${D.cy + 64}Z"/></clipPath>`).join('') +
  `<radialGradient id="vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stop-color="#1b1c1f" stop-opacity="0"/><stop offset="1" stop-color="#1b1c1f" stop-opacity="0.38"/></radialGradient>`;

// ---------------- frame ----------------
function dropY(t) { if (t < 0) return -1100; if (t < 0.42) return -1100 * (1 - Math.pow(t / 0.42, 2)); const u = t - 0.42; return -24 * Math.exp(-u * 6.5) * Math.abs(Math.sin(Math.PI * u / 0.22)); }
function squash(t) { const u = t - 0.42; return u > 0 ? 1 - 0.05 * Math.exp(-u * 14) : 1; }
const rampX = (t, from, to, a, b, o) => lerp(from, to, eob(seg(t, a, b), o));

function setT(t, stage) {
  const dy = dropY(t), sq = squash(t), u = t - 0.42;
  const wob = (ph) => (u > 0 ? 5 * Math.exp(-u * 4.5) * Math.sin(u * 28 + ph) : 0);
  const pX = rampX(t, -230, PINK.cx, 0.35, 0.95, 1.5), hX = rampX(t, 1310, HERB.cx, 0.5, 1.1, 1.5);
  const pdx = pX - PINK.cx, hdx = hX - HERB.cx;
  const vp = (pX - rampX(t - 0.03, -230, PINK.cx, 0.35, 0.95, 1.5)) / 0.03, vh = (hX - rampX(t - 0.03, 1310, HERB.cx, 0.5, 1.1, 1.5)) / 0.03;
  const slP = clamp(-vp * 0.02, -16, 16) + dunkSlosh(t, PINK) + 5 * Math.exp(-Math.max(0, t - 0.95) * 3) * Math.sin(t * 15) * (t > 0.95 ? 1 : 0);
  const slH = clamp(-vh * 0.02, -16, 16) + dunkSlosh(t, HERB) + 5 * Math.exp(-Math.max(0, t - 1.1) * 3) * Math.sin(t * 15) * (t > 1.1 ? 1 : 0);
  const cam = 1.45 + 0.05 * (eio(seg(t, 1.3, 2.1)) - eio(seg(t, 3.3, 4.4)));
  const lx = 18 * t;

  // fry states
  const fr = (b, W) => { const p = pathAt(W, t); return { x: p[0], y: p[1], th: p[2] + wob(b.ph) }; };
  const s1 = fr(FR1, W1), s2 = fr(FR2, W2);
  const inCup = (s) => s.y > 868 && Math.abs(s.x - 540) < 125;

  let back = '';
  const drawFry = (b, st, D) => {
    const coat = D && t >= D.tDunk + 0.1 ? coatEl(D, b.sp, t) : '';
    let clip = '';
    if (D && Math.abs(st.x - D.cx) < 100 && st.y > D.surf - 6) clip = `clip-path="url(#sc${D.id})"`;
    return `<g ${clip}><g transform="translate(${F(st.x)} ${F(st.y)}) rotate(${F(st.th)})">${fryEl(b.sp, coat)}</g></g>`;
  };
  BUNDLE.forEach((b) => {
    if (b.lifted) return;
    back += `<g transform="translate(${F(b.tipX)} ${F(b.tipY)}) rotate(${F(b.th + wob(b.ph))})">${fryEl(b.sp)}</g>`;
  });
  let frontF = '';
  [[FR1, s1, PINK], [FR2, s2, HERB]].forEach(([b, st, D]) => {
    const el = drawFry(b, st, D);
    if (inCup(st)) back += el; else frontF += el;
  });

  // shadows
  const near = clamp(1 - Math.abs(dy) / 500);
  const shadows = `<g opacity="${F(near)}"><path d="M418 1165L672 1165L930 1262L770 1300L436 1232Z" fill="#1c1e22" opacity="0.34" filter="url(#blur14)"/><ellipse cx="540" cy="1186" rx="146" ry="24" fill="#16181b" opacity="0.5" filter="url(#blur6)"/></g>` +
    `<g transform="translate(${F(pdx)} 0)"><ellipse cx="${PINK.cx + 36}" cy="${PINK.cy + 78}" rx="140" ry="32" fill="#1c1e22" opacity="0.36" filter="url(#blur14)"/><ellipse cx="${PINK.cx}" cy="${PINK.cy + 70}" rx="104" ry="24" fill="#16181b" opacity="0.5" filter="url(#blur6)"/></g>` +
    `<g transform="translate(${F(hdx)} 0)"><ellipse cx="${HERB.cx + 36}" cy="${HERB.cy + 78}" rx="140" ry="32" fill="#1c1e22" opacity="0.4" filter="url(#blur14)"/><ellipse cx="${HERB.cx}" cy="${HERB.cy + 70}" rx="104" ry="24" fill="#0f1011" opacity="0.55" filter="url(#blur6)"/></g>`;

  const cup = `<g transform="translate(0 ${F(1175 + dy)}) scale(1 ${F(sq)}) translate(0 -1175)">${cupBack()}${back}${cupFront(t)}</g>`;

  const rp = ripples(PINK, t, '#FBE3E9', '#BC7489'), rh = ripples(HERB, t, '#FFFFFF', '#8E9C6C');
  const surfP = (sl) => pinkSurface(sl) + rp.back, surfH = (sl) => herbSurface(sl) + rh.back;
  const rk1 = ramekin(PINK, pdx, 0, 0, 0, ['#fff', '#ddd', '#BFC4CB', '#8F95A0', 0.7], () => surfP(slP), t, slP);
  const rk2 = ramekin(HERB, hdx, 0, 0, 0, ['#5A5853', '#403E3A', '#1E1D1B', '#262523', 0.22], () => surfH(slH), t, slH);

  // dip effects on front
  let fx = '';
  [[PINK, s1, rp], [HERB, s2, rh]].forEach(([D, st, rr]) => {
    fx += threadEls(D, t, [st.x, st.y, st.th]) + meniscus(D, t, [st.x, st.y, st.th]);
    fx += `<g clip-path="url(#in${D.id})">${rr.front}</g>`;
    fx += splash(D, t, D.tDunk + 0.04, pathAt(D.w, D.tDunk + 0.04)[0]);
  });
  const scClips = [PINK, HERB].map((D) => `<clipPath id="sc${D.id}"><rect x="0" y="0" width="1080" height="${D.surf}"/></clipPath>`).join('');

  const light = `<g opacity="0.16" filter="url(#blur60)"><polygon points="${F(-100 + lx)},200 ${F(160 + lx)},200 ${F(620 + lx)},1500 ${F(340 + lx)},1500" fill="#F4F5F7"/></g>`;
  const svg = `<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg"><defs>${DEFS}${scClips}</defs>
${K.concrete(t)}
<g transform="translate(0 -95) translate(540 1000) scale(${F(cam * 1000) / 1000}) translate(-540 -1000)">
${shadows}${cup}${rk1}${rk2}${frontF}${fx}
</g>
${light}
<rect width="1080" height="1920" fill="url(#vig)"/>
<rect width="1080" height="1920" filter="url(#grain)" opacity="0.4"/></svg>`;
  stage.innerHTML = svg;
}
window.SCENE = { dur: 5.0, setT };
window.__dbg = { PINK, HERB, pathAt, W1, W2, FR1, FR2 };
})();
