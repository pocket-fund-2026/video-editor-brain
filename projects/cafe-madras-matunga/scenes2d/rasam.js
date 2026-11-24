// Cafe Madras scene 4: RASAM VADA. Top-down 2D editorial illustration, pure function of t. No pours. 5.7 s.
// Timeline: 0.45-1.7 steel spoon glides in along its handle axis; 1.7-2.15 it lowers and presses the vada edge (dent, rasam wells up through the hole, 4 ripple rings at 2.2);
// 2.3-3.1 stillness (1 s); 3.1-3.6 spoon slips under the cracked piece; 3.6-4.5 the piece is lifted away; 4.5-5.7 hold with steam, leaf drifting on the ripples.
(() => {
const { clamp, seg, lerp, eo, eio, eob, rng } = K;
const F = (n) => Math.round(n * 10) / 10;
const RAD = Math.PI / 180;
const DUR = 5.7, CX = 540, CY = 860;
const R_OUT = 158, R_IN = 46, A0 = -24, A1 = 26, R_LIQ = 300;
const pt = (r, a) => [CX + r * Math.cos(a * RAD), CY + r * Math.sin(a * RAD)];
const sector = (rIn, rOut, a0, a1) => {
  const p1 = pt(rOut, a0), p2 = pt(rOut, a1), p3 = pt(rIn, a1), p4 = pt(rIn, a0), L = a1 - a0 > 180 ? 1 : 0;
  return `M${F(p1[0])} ${F(p1[1])}A${rOut} ${rOut} 0 ${L} 1 ${F(p2[0])} ${F(p2[1])}L${F(p3[0])} ${F(p3[1])}A${rIn} ${rIn} 0 ${L} 0 ${F(p4[0])} ${F(p4[1])}Z`;
};
const PIECE = sector(R_IN, R_OUT, A0, A1), MAIN = sector(R_IN, R_OUT, A1, A0 + 360);
const inPiece = (a) => { a = ((a % 360) + 360) % 360; const lo = (A0 + 360) % 360; return a >= lo || a <= A1; };

// ---------------- static scatter (seeded, so setT stays pure) ----------------
const r1 = rng(41);
const bumps = [], pits = [], pepper = [], greens = [];
for (let i = 0; i < 230; i++) { const a = r1() * 360, r = R_IN + 8 + r1() * (R_OUT - R_IN - 14); bumps.push({ a, r, s: 2 + r1() * 6, l: r1() < 0.55 }); }
for (let i = 0; i < 90; i++) { const a = r1() * 360, r = R_IN + 6 + r1() * (R_OUT - R_IN - 10); pits.push({ a, r, s: 1.3 + r1() * 2.6, rot: r1() * 180 }); }
for (let i = 0; i < 20; i++) { const a = r1() * 360, r = R_IN + 12 + r1() * (R_OUT - R_IN - 22); pepper.push({ a, r, s: 1.6 + r1() * 1.4 }); }
for (let i = 0; i < 11; i++) { const a = r1() * 360, r = R_IN + 14 + r1() * (R_OUT - R_IN - 26); greens.push({ a, r, rot: r1() * 180 }); }
const r2 = rng(77);
const seeds = [], cori = [], leaves = [], tom = [], sheen = [];
for (let i = 0; i < 46; i++) { const a = r2() * 360, r = 172 + r2() * 118; seeds.push({ x: CX + r * Math.cos(a * RAD), y: CY + r * Math.sin(a * RAD), s: 2.8 + r2() * 2.6 }); }
for (let i = 0; i < 38; i++) { const a = r2() * 360, r = 172 + r2() * 118; cori.push({ x: CX + r * Math.cos(a * RAD), y: CY + r * Math.sin(a * RAD), rot: r2() * 180, w: 4 + r2() * 5, h: 2 + r2() * 2.5, k: r2() }); }
for (let i = 0; i < 9; i++) { const a = r2() * 360, r = 175 + r2() * 110; tom.push({ x: CX + r * Math.cos(a * RAD), y: CY + r * Math.sin(a * RAD), s: 8 + r2() * 12, rot: r2() * 180 }); }
for (let i = 0; i < 6; i++) { const a = r2() * 360, r = 170 + r2() * 110; sheen.push({ x: CX + r * Math.cos(a * RAD), y: CY + r * Math.sin(a * RAD), rx: 24 + r2() * 38, ry: 8 + r2() * 12, rot: r2() * 180, ph: r2() * 6 }); }
const LEAVES = [{ x: 420, y: 1055, rot: -35, s: 1.0 }, { x: 665, y: 1085, rot: 70, s: 0.85 }, { x: 395, y: 740, rot: 160, s: 0.9 }];
const RIPPLES = [[2.2, 1], [2.36, 0.85], [2.52, 0.7], [2.68, 0.55], [3.25, 0.5], [3.42, 0.4]];
const RP_SPEED = 150, RP_R0 = 168;
const ripR = (t, ts) => RP_R0 + (t - ts) * RP_SPEED;
// radial push of floating bits by the ripple rings
function push(x, y, t) {
  const dx = x - CX, dy = y - CY, d = Math.hypot(dx, dy) || 1; let g = 0;
  for (const [ts, a] of RIPPLES) { const R = ripR(t, ts), u = (t - ts) / 1.7; if (u < 0 || u > 1) continue; g += Math.exp(-(((d - R) / 24) ** 2)) * (1 - u) * 13 * a; }
  return [x + (dx / d) * g, y + (dy / d) * g];
}

// ---------------- spoon path ----------------
const SP_ANG = 30, T_TUCK = [660, 872];
function spoon(t) {
  let x, y, h, ang = SP_ANG;
  const a = eio(seg(t, 0.45, 1.7)), b = eio(seg(t, 1.7, 2.15)), c = eio(seg(t, 3.1, 3.6)), d = eio(seg(t, 3.6, 4.5));
  x = lerp(1420, 830, a); y = lerp(1240, 905, a); h = lerp(1.25, 1.1, a);
  x = lerp(x, 790, b); y = lerp(y, 876, b); h = lerp(h, 1.0, b);
  const press = eo(seg(t, 1.95, 2.25)) * (1 - eo(seg(t, 2.9, 3.4))); x -= 7 * press;
  x = lerp(x, T_TUCK[0], c); y = lerp(y, T_TUCK[1], c);
  x = lerp(x, 786, d); y = lerp(y, 770, d); h = lerp(h, 1.2, d); ang = lerp(SP_ANG, 21, d);
  const fl = seg(t, 4.5, 5.7); x += 3 * Math.sin(fl * 5) * fl; y += 2.5 * Math.cos(fl * 4.2) * fl;
  return { x, y, h, ang };
}

// ---------------- pieces ----------------
function vadaParts(clipId, filterOn) {
  const base = `<radialGradient id="vg${clipId}" gradientUnits="userSpaceOnUse" cx="${CX - 14}" cy="${CY - 18}" r="${R_OUT + 8}"><stop offset="0.22" stop-color="#A9631A"/><stop offset="0.42" stop-color="#E7AC47"/><stop offset="0.72" stop-color="#E2A23B"/><stop offset="0.93" stop-color="#A96418"/><stop offset="1" stop-color="#8E5314"/></radialGradient>`;
  return base;
}
function vadaBody(part) { // part: 'main' | 'piece'
  const want = part === 'piece';
  const ok = (a) => inPiece(a) === want;
  const path = want ? PIECE : MAIN;
  let s = `<g clip-path="url(#clip-${part})"><path d="${path}" fill="url(#vg)"/>`;
  // soft light from the top-left, shade bottom-right
  s += `<path d="${path}" fill="url(#vlight)"/>`;
  for (const b of bumps) if (ok(b.a)) { const [x, y] = pt(b.r, b.a); s += `<circle cx="${F(x + 1.6)}" cy="${F(y + 2.2)}" r="${F(b.s)}" fill="#8A5114" opacity="0.38"/><circle cx="${F(x)}" cy="${F(y)}" r="${F(b.s)}" fill="${b.l ? '#F6CC77' : '#D0922F'}" opacity="${b.l ? 0.55 : 0.5}"/>`; }
  for (const p of pits) if (ok(p.a)) { const [x, y] = pt(p.r, p.a); s += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(p.s * 1.5)}" ry="${F(p.s)}" transform="rotate(${F(p.rot)} ${F(x)} ${F(y)})" fill="#6E3E10" opacity="0.62"/>`; }
  for (const p of pepper) if (ok(p.a)) { const [x, y] = pt(p.r, p.a); s += `<circle cx="${F(x)}" cy="${F(y)}" r="${F(p.s)}" fill="#25160A" opacity="0.85"/>`; }
  for (const g of greens) if (ok(g.a)) { const [x, y] = pt(g.r, g.a); s += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="5.5" ry="2.4" transform="rotate(${F(g.rot)} ${F(x)} ${F(y)})" fill="#5E8F3A" opacity="0.8"/>`; }
  // inner and outer rim: crisp fried edge
  s += `<path d="${path}" fill="none" stroke="#7B450F" stroke-width="7" opacity="0.55"/><path d="${path}" fill="none" stroke="#F8D888" stroke-width="2.2" opacity="0.5" transform="translate(-2 -2)"/>`;
  s += `</g>`;
  return s;
}
function crumbEdges(gap) { // exposed soft crumb along the crack; gap grows after the press
  const e = (a, side) => { const [x0, y0] = pt(R_IN + 1, a), [x1, y1] = pt(R_OUT - 1, a); return `<line x1="${F(x0)}" y1="${F(y0)}" x2="${F(x1)}" y2="${F(y1)}" stroke="#F4DBA0" stroke-width="${F(3 + gap * 5)}" stroke-linecap="round" opacity="${F(0.2 + 0.8 * gap)}"/>`; };
  let s = e(A0) + e(A1);
  for (let i = 0; i < 16; i++) { const a = i % 2 ? A1 : A0, r = R_IN + 8 + (i * 7.3) % (R_OUT - R_IN - 16), [x, y] = pt(r, a); s += `<circle cx="${F(x)}" cy="${F(y)}" r="${F(1.3 + (i % 3) * 0.7)}" fill="#C8963F" opacity="${F(0.7 * gap)}"/>`; }
  return s;
}

function leaf(x, y, rot, sc, id) {
  return `<g transform="translate(${F(x)} ${F(y)}) rotate(${F(rot)}) scale(${F(sc)})"><path d="M0,-36C21,-30 27,-4 16,18C10,30 3,36 0,42C-3,36 -10,30 -16,18C-27,-4 -21,-30 0,-36Z" fill="#000" opacity="0.28" transform="translate(4 6)"/><path d="M0,-36C21,-30 27,-4 16,18C10,30 3,36 0,42C-3,36 -10,30 -16,18C-27,-4 -21,-30 0,-36Z" fill="url(#leafg)"/><path d="M0,-33V40M0,-14L-11,-24M0,-14L11,-24M0,4L-13,-6M0,4L13,-6M0,20L-8,12M0,20L8,12" stroke="#B5D18A" stroke-width="1.6" fill="none" opacity="0.7"/></g>`;
}

function spoonSvg(sp, sh) {
  const { x, y, h, ang } = sp, o = 14 * h;
  const shape = (extra = '') => `<ellipse cx="0" cy="0" rx="128" ry="88" ${extra}/><path d="M96,-26L650,-32Q676,-32 676,0Q676,32 650,32L96,26Z" ${extra}/>`;
  let s = `<g transform="translate(${F(x + o * 0.9)} ${F(y + o * 1.35)}) rotate(${F(ang)}) scale(${F(h)})" filter="url(#blur14)" opacity="${F(0.34 + 0.06 * h)}">${shape('fill="#0A1B16"')}</g>`;
  s += `<g transform="translate(${F(x)} ${F(y)}) rotate(${F(ang)}) scale(${F(h)})">`;
  s += `<path d="M96,-26L650,-32Q676,-32 676,0Q676,32 650,32L96,26Z" fill="url(#steelH)"/><ellipse cx="0" cy="0" rx="128" ry="88" fill="url(#steelH)"/>`;
  s += `<ellipse cx="0" cy="0" rx="128" ry="88" fill="none" stroke="#F1F5F6" stroke-width="3" opacity="0.8" transform="translate(-1 -1)"/>`;
  s += `<ellipse cx="4" cy="2" rx="108" ry="68" fill="url(#steelBowl)"/><ellipse cx="4" cy="2" rx="108" ry="68" fill="none" stroke="#5E686E" stroke-width="2" opacity="0.7"/>`;
  s += `<path d="M120,-8L640,-12" stroke="#F7FAFA" stroke-width="3" opacity="0.65" stroke-linecap="round"/><path d="M130,12L630,14" stroke="#58636A" stroke-width="3" opacity="0.4" stroke-linecap="round"/>`;
  s += `<ellipse cx="672" cy="0" rx="3" ry="12" fill="#6A757B" opacity="0.5"/>`;
  s += `</g>`;
  return s;
}

function steam(t, boost) {
  let s = '';
  for (let i = 0; i < 8; i++) {
    const u = (((t * 0.28 + i / 8) % 1) + 1) % 1, ph = i * 2.3;
    const x = CX - 150 + (i % 4) * 100 + 40 * Math.sin(ph + t * 0.8), y = CY - 10 - u * 330 + (i % 2) * 30;
    const a = Math.sin(Math.PI * u) * (0.2 + 0.26 * boost);
    s += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(34 + u * 60)}" ry="${F(26 + u * 46)}" fill="#F4F6F1" opacity="${F(a)}" filter="url(#steamb)"/>`;
  }
  return s;
}

function render(t) {
  const sp = spoon(t);
  const dent = eo(seg(t, 1.95, 2.25)) * (1 - eo(seg(t, 3.2, 3.7)) * 0.7);
  const well = eo(seg(t, 2.1, 2.55)) * (1 - 0.45 * eo(seg(t, 3.0, 3.6)));
  const gap = eo(seg(t, 2.3, 2.9));
  const lift = eo(seg(t, 3.2, 3.6)) * 0.035;
  const holeR = R_IN + 13 * well;
  const cam = 1.06 + 0.1 * (t / DUR);

  // piece transform: rides on the spoon after it is tucked under
  const cT = eio(seg(t, 3.6, 4.5)), pS = 1 + lift;
  const pieceTx = (() => {
    const hs = sp.h, ang = sp.ang - SP_ANG;
    if (t < 3.1) return `translate(${F(gap * 3)} ${F(gap * 0.4)})`;
    const k = seg(t, 3.6, 4.6) > 0 ? 1 : 0;
    return `translate(${F(sp.x)} ${F(sp.y)}) rotate(${F(ang)}) scale(${F(hs * pS)}) translate(${-T_TUCK[0]} ${-T_TUCK[1]})` ;
  })();
  const pieceShadow = `<g transform="${pieceTx}"><path d="${PIECE}" fill="#000" opacity="${F(0.16 + 0.3 * eo(seg(t, 3.3, 4.5)))}" filter="url(#blur6)" transform="translate(${F(6 + 16 * cT)} ${F(8 + 22 * cT)})"/></g>`;

  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920"><defs>${K.defs()}${K.steelDefs()}`;
  s += `<radialGradient id="rasam" gradientUnits="userSpaceOnUse" cx="${CX - 20}" cy="${CY - 24}" r="${R_LIQ}"><stop offset="0" stop-color="#C45F26"/><stop offset="0.55" stop-color="#A9461B"/><stop offset="0.9" stop-color="#7C3114"/><stop offset="1" stop-color="#5A220C"/></radialGradient>`;
  s += `<radialGradient id="holeg" gradientUnits="userSpaceOnUse" cx="${CX}" cy="${CY}" r="${holeR}"><stop offset="0" stop-color="#D8733A"/><stop offset="0.6" stop-color="#B45221"/><stop offset="1" stop-color="#3E1708"/></radialGradient>`;
  s += `<radialGradient id="bowlOut" gradientUnits="userSpaceOnUse" cx="${CX - 60}" cy="${CY - 70}" r="470"><stop offset="0" stop-color="#E4E9EB"/><stop offset="0.7" stop-color="#A3ADB2"/><stop offset="1" stop-color="#6B767C"/></radialGradient>`;
  s += `<linearGradient id="rimHi" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.45" stop-color="#C9D1D5"/><stop offset="1" stop-color="#6D777D"/></linearGradient>`;
  s += `<linearGradient id="wallg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#BCC5C9"/><stop offset="0.5" stop-color="#8B969C"/><stop offset="1" stop-color="#3F494E"/></linearGradient>`;
  s += `<linearGradient id="steelH" x1="0" y1="-1" x2="0" y2="1"><stop offset="0" stop-color="#F2F6F7"/><stop offset="0.5" stop-color="#B8C1C6"/><stop offset="1" stop-color="#7C878D"/></linearGradient>`;
  s += `<radialGradient id="steelBowl" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stop-color="#C9D1D5"/><stop offset="0.7" stop-color="#8E999F"/><stop offset="1" stop-color="#626D73"/></radialGradient>`;
  s += `<radialGradient id="vg" gradientUnits="userSpaceOnUse" cx="${CX - 14}" cy="${CY - 18}" r="${R_OUT + 8}"><stop offset="0.22" stop-color="#A9631A"/><stop offset="0.42" stop-color="#DE9A34"/><stop offset="0.72" stop-color="#D58F2C"/><stop offset="0.93" stop-color="#A96418"/><stop offset="1" stop-color="#8E5314"/></radialGradient>`;
  s += `<linearGradient id="vlight" gradientUnits="userSpaceOnUse" x1="${CX - 120}" y1="${CY - 130}" x2="${CX + 120}" y2="${CY + 130}"><stop offset="0" stop-color="#FFF1C0" stop-opacity="0.34"/><stop offset="0.5" stop-color="#FFF1C0" stop-opacity="0"/><stop offset="1" stop-color="#4A2406" stop-opacity="0.34"/></linearGradient>`;
  s += `<linearGradient id="leafg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5C9B38"/><stop offset="1" stop-color="#2A5A1E"/></linearGradient>`;
  s += `<clipPath id="clip-main"><path d="${MAIN}"/></clipPath><clipPath id="clip-piece"><path d="${PIECE}"/></clipPath>`;
  s += `<clipPath id="liq"><circle cx="${CX}" cy="${CY}" r="${R_LIQ}"/></clipPath><clipPath id="bowlclip"><circle cx="${CX}" cy="${CY}" r="388"/></clipPath>`;
  s += `<filter id="steamb" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="22"/></filter><filter id="rough" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="12" xChannelSelector="R" yChannelSelector="G"/></filter>`;
  s += `</defs>`;

  s += K.steel(t, { base: '#8E989E' });
  s += `<g transform="translate(${CX} ${CY}) scale(${F(cam * 1000) / 1000}) translate(${-CX} ${-CY})">`;

  // ---- bowl
  s += `<circle cx="${CX + 26}" cy="${CY + 44}" r="392" fill="#0A1B16" opacity="0.55" filter="url(#blur30)"/>`;
  s += `<circle cx="${CX + 10}" cy="${CY + 16}" r="388" fill="#2A3338" opacity="0.5" filter="url(#blur14)"/>`;
  s += `<circle cx="${CX}" cy="${CY}" r="385" fill="url(#bowlOut)"/>`;
  s += `<g clip-path="url(#bowlclip)"><rect x="140" y="440" width="800" height="840" filter="url(#brush)" opacity="0.35"/></g>`;
  s += `<circle cx="${CX}" cy="${CY}" r="372" fill="none" stroke="url(#rimHi)" stroke-width="10" opacity="0.95"/>`;
  s += `<circle cx="${CX}" cy="${CY}" r="352" fill="none" stroke="#5B666C" stroke-width="3" opacity="0.5"/>`;
  s += `<circle cx="${CX}" cy="${CY}" r="342" fill="url(#wallg)"/>`;
  s += `<circle cx="${CX}" cy="${CY}" r="328" fill="none" stroke="#E8EDEF" stroke-width="3" opacity="0.35" transform="translate(-3 -3)"/>`;
  // ---- rasam (thin, translucent: the steel shows as a lighter meniscus ring)
  s += `<circle cx="${CX}" cy="${CY}" r="${R_LIQ + 6}" fill="#E9B079" opacity="0.5"/>`;
  s += `<circle cx="${CX}" cy="${CY}" r="${R_LIQ}" fill="url(#rasam)"/>`;
  s += `<g clip-path="url(#liq)">`;
  for (const m of tom) { const [x, y] = push(m.x, m.y, t); s += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(m.s)}" ry="${F(m.s * 0.6)}" transform="rotate(${F(m.rot)} ${F(x)} ${F(y)})" fill="#6A260F" opacity="0.42"/>`; }
  for (const c of sheen) { const [x, y] = push(c.x, c.y, t); s += `<ellipse cx="${F(x + 8 * Math.sin(t * 0.6 + c.ph))}" cy="${F(y)}" rx="${F(c.rx)}" ry="${F(c.ry)}" transform="rotate(${F(c.rot)} ${F(x)} ${F(y)})" fill="#F3CC8E" opacity="${F(0.2 + 0.08 * Math.sin(t * 0.9 + c.ph))}" filter="url(#blur6)"/>`; }
  // window-light reflection on the liquid
  s += `<path d="M${CX - 250},${CY - 150}A280 280 0 0 1 ${CX - 90},${CY - 262}" fill="none" stroke="#FFE8C8" stroke-width="12" stroke-linecap="round" opacity="0.28" filter="url(#blur6)"/>`;
  for (const m of cori) { const [x, y] = push(m.x, m.y, t); s += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(m.w)}" ry="${F(m.h)}" transform="rotate(${F(m.rot)} ${F(x)} ${F(y)})" fill="${m.k < 0.5 ? '#5C9437' : '#3F7228'}" opacity="0.9"/>`; }
  for (const m of seeds) { const [x, y] = push(m.x, m.y, t); s += `<circle cx="${F(x + 1)}" cy="${F(y + 1.6)}" r="${F(m.s)}" fill="#000" opacity="0.28"/><circle cx="${F(x)}" cy="${F(y)}" r="${F(m.s)}" fill="#1B0F07"/><circle cx="${F(x - m.s * 0.3)}" cy="${F(y - m.s * 0.3)}" r="${F(m.s * 0.28)}" fill="#E6D6C0" opacity="0.7"/>`; }
  for (const l of LEAVES) { const [x, y] = push(l.x, l.y, t); s += leaf(x, y, l.rot + 5 * Math.sin(t * 0.7 + l.x), l.s); }
  // the leaf that drifts out on the ripples
  { const dr = seg(t, 2.0, 5.7), bx = 440 + 70 * eio(dr) + 8 * Math.sin(t * 0.9), by = 1020 - 40 * eio(dr) + 6 * Math.cos(t * 0.7);
    const [x, y] = push(bx, by, t); s += leaf(x, y, -20 + 70 * eio(dr) + 6 * Math.sin(t * 1.3), 1.05); }
  s += `</g>`;

  // ---- vada shadow and rasam glaze around it
  s += `<g transform="translate(10 15)" filter="url(#blur14)"><path d="${MAIN}" fill="#2A0E04" opacity="0.6"/><path d="${PIECE}" fill="#2A0E04" opacity="${F(0.6 * (1 - eo(seg(t, 3.3, 3.7))))}"/></g>`;
  s += `<g filter="url(#blur6)" fill="none" stroke="#E69B58" stroke-width="12" opacity="0.5"><path d="${MAIN}"/><path d="${PIECE}" opacity="${F(1 - eo(seg(t, 3.3, 3.7)))}"/></g>`;
  // hole: darker rasam welling up
  s += `<circle cx="${CX}" cy="${CY}" r="${F(holeR)}" fill="url(#holeg)"/>`;
  s += `<circle cx="${CX - 4}" cy="${CY - 4}" r="${F(holeR * 0.62)}" fill="#EC9550" opacity="${F(0.55 * well)}" filter="url(#blur6)"/>`;
  s += `<circle cx="${CX}" cy="${CY}" r="${F(holeR * 0.9)}" fill="none" stroke="#FFE9C9" stroke-width="3" opacity="${F(0.5 * well)}"/>`;

  // ---- ripple rings across the surface
  s += `<g clip-path="url(#liq)">`;
  for (const [ts, a] of RIPPLES) { const u = (t - ts) / 1.7; if (u < 0 || u > 1) continue; const R = ripR(t, ts), op = (1 - u) * (1 - u) * 0.8 * a;
    s += `<circle cx="${CX}" cy="${CY}" r="${F(R + 5)}" fill="none" stroke="#3A1306" stroke-width="5" opacity="${F(op * 0.45)}"/><circle cx="${CX}" cy="${CY}" r="${F(R)}" fill="none" stroke="#FFE3C0" stroke-width="${F(4.5 - 2 * u)}" opacity="${F(op)}"/>`; }
  s += `</g>`;

  // ---- vada (main body, dent with the press)
  const ds = 1 - 0.03 * dent;
  s += `<g filter="url(#rough)"><g transform="translate(${CX} ${CY}) scale(${F(ds * 1000) / 1000}) translate(${-CX} ${-CY})">`;
  s += vadaBody('main');
  s += `<ellipse cx="${CX + 156}" cy="${CY + 10}" rx="72" ry="58" fill="#3A1A06" opacity="${F(0.2 * dent)}" filter="url(#blur14)" clip-path="url(#clip-main)"/>`;
  s += `</g></g>`;

  // ---- spoon (under the piece)
  s += spoonSvg(sp);

  // ---- the cracked piece (sits on the spoon once it is tucked under)
  s += pieceShadow;
  s += `<g transform="${pieceTx}"><g filter="url(#rough)"><g transform="translate(${CX} ${CY}) scale(${F(ds * 1000) / 1000}) translate(${-CX} ${-CY})">${vadaBody('piece')}</g></g>${crumbEdges(gap)}</g>`;
  // rasam clinging on the lifted piece edge
  if (t > 3.8) s += `<g transform="${pieceTx}"><path d="${PIECE}" fill="none" stroke="#B84E1E" stroke-width="6" opacity="${F(0.35 * eo(seg(t, 3.8, 4.4)))}" filter="url(#blur6)"/></g>`;

  // ---- steam over everything (soft, top-down haze)
  s += steam(t, 0.4 + 0.6 * eo(seg(t, 2.0, 3.0)));
  s += `</g>`;
  // vignette and grain
  s += `<rect width="1080" height="1920" fill="url(#vig)"/>`;
  s += `<rect width="1080" height="1920" filter="url(#grain)" opacity="0.28"/></svg>`;
  return s;
}

window.SCENE = { dur: DUR, setT(t, stage) {
  let html = render(t);
  html = html.replace('</defs>', `<radialGradient id="vig" cx="0.5" cy="0.45" r="0.75"><stop offset="0.55" stop-color="#0A1B16" stop-opacity="0"/><stop offset="1" stop-color="#0A1B16" stop-opacity="0.5"/></radialGradient></defs>`);
  stage.innerHTML = html;
} };
})();
