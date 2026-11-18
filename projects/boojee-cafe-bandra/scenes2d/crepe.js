// Boojee Cafe: CREPES (2D editorial, top-down, pure function of t). dur 5.6 s. No letters, no pouring.
// 0-0.6 plate settles, crepe lays flat; 0.7-1.5 fold in half (right half flips over); 1.8-2.5 fold into a quarter; 2.6-3.2 glide to plate centre;
// 3.5-4.4 strawberry slices, blueberries, mint land; 4.1-5.0 sieve dusts powdered sugar; 5.0-5.6 stillness (slow push-in only).
(() => {
const { clamp, seg, lerp, eo, eio, eob, rng } = K;
const F = (n) => Math.round(n * 10) / 10;
const DUR = 5.6, CX = 540, CY = 960, PR = 410, RC = 330;
const SPOTS = []; { const r = rng(21); for (let i = 0; i < 120; i++) { const a = r() * 6.283, d = Math.sqrt(r()) * (RC - 18); SPOTS.push({ x: Math.cos(a) * d, y: Math.sin(a) * d, rx: 6 + r() * 14, ry: 4 + r() * 9, rot: r() * 180, o: 0.14 + r() * 0.2, c: r() > 0.5 ? '#C98B3A' : '#B87430' }); } }
const LACE = []; { const r = rng(9); for (let i = 0; i < 70; i++) { const a = r() * 6.283, d = Math.sqrt(r()) * (RC - 30); LACE.push({ x: Math.cos(a) * d, y: Math.sin(a) * d, r: 3 + r() * 8 }); } }
const crepeBody = (under = false) => `<circle r="${RC}" fill="${under ? '#E4BF76' : '#EBC983'}"/><circle r="${RC - 6}" fill="url(#crepeG)" opacity="${under ? 0.5 : 1}"/>
${under ? '' : SPOTS.map((p) => `<ellipse cx="${F(p.x)}" cy="${F(p.y)}" rx="${F(p.rx)}" ry="${F(p.ry)}" fill="${p.c}" opacity="${F(p.o * 100) / 100}" transform="rotate(${F(p.rot)} ${F(p.x)} ${F(p.y)})"/>`).join('')}
${under ? SPOTS.slice(0, 40).map((p) => `<ellipse cx="${F(p.x)}" cy="${F(p.y)}" rx="${F(p.rx * 0.8)}" ry="${F(p.ry * 0.8)}" fill="#D4A55A" opacity=".25" transform="rotate(${F(p.rot)} ${F(p.x)} ${F(p.y)})"/>`).join('') : LACE.map((p) => `<circle cx="${F(p.x)}" cy="${F(p.y)}" r="${F(p.r)}" fill="#F6DEA6" opacity=".45"/>`).join('')}
<circle r="${RC - 3}" fill="none" stroke="#B2762F" stroke-width="7" opacity=".55"/>`;
// fold state -> svg inside a group centred on the crepe centre. f1: half fold progress (0..1); f2: quarter fold progress (0..1)
function crepeFolded(f1, f2) {
  const sx = Math.cos(Math.PI * f1), under = sx < 0, lift1 = Math.sin(Math.PI * f1);
  const halves = (extra = '') => `<g clip-path="url(#left)"><g>${crepeBody(false)}</g></g>
<g transform="scale(1 1)"><g clip-path="url(#right)" transform="translate(0 0) scale(${F(sx * 1000) / 1000} 1)">${under ? crepeBody(true) : crepeBody(false)}</g></g>`;
  const shadowFold = `<g clip-path="url(#right)" transform="translate(${F(8 * lift1 + 2)} ${F(14 * lift1 + 2)}) scale(${F(sx * 1000) / 1000} 1)" opacity="${F(0.3 * (0.4 + lift1) * 100) / 100}" filter="url(#blur14)"><circle r="${RC}" fill="#000"/></g>`;
  const sy = Math.cos(Math.PI * f2), under2 = sy < 0, lift2 = Math.sin(Math.PI * f2);
  // after fold 1 the right half lies mirrored on the left half; the whole stack is the left half-disc. Fold 2 flips its top half down.
  const stack = `${shadowFold}${halves()}`;
  if (f2 <= 0) return stack;
  return `<g clip-path="url(#bottom)">${stack}</g>
<g clip-path="url(#top)" transform="scale(1 ${F(sy * 1000) / 1000})" >${under2 ? `<g>${stack}</g><g clip-path="url(#circL)"><rect x="-400" y="-400" width="800" height="800" fill="#D9AE63" opacity=".35"/></g>` : stack}</g>
<g clip-path="url(#top)" transform="translate(${F(6 * lift2)} ${F(12 * lift2)}) scale(1 ${F(sy * 1000) / 1000})" opacity="${F(0.25 * lift2 * 100) / 100}" filter="url(#blur14)"><g clip-path="url(#circL)"><rect x="-400" y="-400" width="800" height="800" fill="#000"/></g></g>`;
}
const BERRIES = [[60, -120, 3.55], [130, -60, 3.7], [50, 10, 3.85], [-20, -40, 4.0], [95, 45, 4.15], [10, -105, 3.95]];
const STRAW = [[90, -85, 3.5, -20], [30, -28, 3.65, 15], [118, -8, 3.8, 40]];
const SUGAR = []; { const r = rng(3); while (SUGAR.length < 560) { const x = -190 + r() * 380, y = -190 + r() * 380; const inW = x <= 165 && y >= -165 && Math.hypot(x - 165, y + 165) < 330; if (!(inW || r() < 0.06)) continue; SUGAR.push({ x, y, td: 4.15 + r() * 0.85, s: 1.2 + r() * 3.2 }); } }

window.SCENE = { dur: DUR, setT(t, stage) {
  const push = 1 + 0.1 * seg(t, 0, DUR), settle = lerp(1.07, 1, eo(seg(t, 0, 0.8)));
  const f1 = eio(seg(t, 0.7, 1.5)), f2 = eio(seg(t, 1.8, 2.5));
  const mv = eio(seg(t, 2.6, 3.2));                       // glide quarter to plate centre
  const drop = eob(seg(t, 0, 0.6), 1.1), cs = lerp(1.1, 1, drop);
  // quarter wedge sits in x[-RC,0], y[0,RC]; centre it: shift (+RC/2*.., ) -> bbox centre (-165, 165) goes to (0,0)
  const ox = lerp(0, 165, mv) + 0, oy = lerp(0, -165, mv);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920"><defs>${BJ.defs()}
<radialGradient id="crepeG" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="#F3D894"/><stop offset=".75" stop-color="#E7C078"/><stop offset="1" stop-color="#D5A55A"/></radialGradient>
<linearGradient id="steelG" x1="0" x2="1"><stop offset="0" stop-color="#EEF2F4"/><stop offset=".5" stop-color="#B7C0C5"/><stop offset="1" stop-color="#7F898F"/></linearGradient>
<clipPath id="circL"><path d="M 0,-330 A 330 330 0 0 0 0,330 Z"/></clipPath><clipPath id="left"><rect x="-400" y="-400" width="400" height="800"/></clipPath><clipPath id="right"><rect x="0" y="-400" width="400" height="800"/></clipPath>
<clipPath id="top"><rect x="-400" y="-400" width="800" height="400"/></clipPath><clipPath id="bottom"><rect x="-400" y="0" width="800" height="400"/></clipPath></defs>
<g transform="translate(540 960) scale(${F(push * 1000) / 1000}) translate(-540 -960)">${BJ.table(t, { x: -200, y: 1600, rot: -14 })}`;
  s += `<g transform="translate(540 960) scale(${F(settle * 1000) / 1000}) translate(-540 -960)">${BJ.plate(CX, CY, PR)}</g>`;
  const big = lerp(1, 1.3, mv);
  s += `<g transform="translate(${CX} ${CY}) scale(${F(big * 1000) / 1000}) translate(${F(ox)} ${F(oy)}) scale(${F(cs * 1000) / 1000})"><path d="M 0,0 L -330,0 A 330 330 0 0 0 0,330 Z" transform="translate(10 16)" fill="#000" opacity="${F(0.4 * f2 * 100) / 100}" filter="url(#blur14)"/>${crepeFolded(f1, f2)}<g opacity="${F(0.7 * mv * 100) / 100}"><path d="M 0,2 L 0,330 M -330,0 L 0,0" stroke="#F8E2AE" stroke-width="5" fill="none"/></g></g>`;
  // berries + strawberries land on the wedge (positions relative to plate centre, wedge now centred)
  s += `<g transform="translate(${CX} ${CY}) scale(${F(big * 1000) / 1000})">`;
  const place = (x, y, tt, body, sc = 1) => { const u = seg(t, tt - 0.32, tt), land = seg(t, tt, tt + 0.3); if (u <= 0) return ''; const k = lerp(2.3, 1, eo(u)) * (1 + 0.14 * Math.sin(land * Math.PI) * (1 - land)) * sc; return `<g transform="translate(${x} ${y})"><ellipse cx="${F(6 * k)}" cy="${F(9 * k)}" rx="${F(24 * k)}" ry="${F(15 * k)}" fill="#000" opacity="${F(0.3 * eo(u) * 100) / 100}" filter="url(#blur6)"/><g transform="scale(${F(k * 100) / 100})" opacity="${F(Math.min(1, u * 2.5) * 100) / 100}">${body}</g></g>`; };
  const strawB = (rot) => `<g transform="rotate(${rot})"><path d="M 0,-34 C 34,-40 44,-6 20,26 C 8,42 -8,42 -20,26 C -44,-6 -34,-40 0,-34 Z" fill="#D12A3B"/><path d="M 0,-26 C 26,-30 34,-4 14,20 C 6,32 -6,32 -14,20 C -34,-4 -26,-30 0,-26 Z" fill="#EA5C66"/><path d="M 0,-18 C 12,-18 16,-2 8,14 C 4,20 -4,20 -8,14 C -16,-2 -12,-18 0,-18 Z" fill="#F7B6B8"/><path d="M 0,-10 L 0,16 M -8,-4 L -10,12 M 8,-4 L 10,12" stroke="#FFE3E0" stroke-width="2.5" opacity=".7"/><path d="M -22,-30 L 22,-30" stroke="#fff" stroke-width="4" opacity=".25" stroke-linecap="round"/></g>`;
  const blueB = `<circle r="21" fill="#26325E"/><circle r="21" fill="url(#blueG)"/><circle cx="-7" cy="-8" r="6" fill="#8FA2E0" opacity=".5"/><path d="M -5,-1 L 0,-6 L 5,-1 L 3,5 L -3,5 Z" fill="#141B3C" opacity=".85"/>`;
  s = s.replace('</defs>', '<radialGradient id="blueG" cx="38%" cy="35%" r="70%"><stop offset="0" stop-color="#5A6FC0"/><stop offset="1" stop-color="#1A2250"/></radialGradient></defs>');
  STRAW.forEach(([x, y, tt, rot]) => { s += place(x, y, tt, strawB(rot), 1.05); });
  BERRIES.forEach(([x, y, tt]) => { s += place(x, y, tt, blueB, 1.0); });
  s += place(70, -50, 4.3, `<g transform="rotate(25)"><path d="M 0,-34 C 22,-26 26,10 0,40 C -26,10 -22,-26 0,-34 Z" fill="#2E8F4A"/><path d="M 0,-30 L 0,34" stroke="#A9E0B0" stroke-width="3"/><path d="M 0,-14 L 12,-22 M 0,2 L 14,-8 M 0,-14 L -12,-22 M 0,2 L -14,-8" stroke="#A9E0B0" stroke-width="2" opacity=".7"/></g>`, 1.0);
  // sugar (dusting): particles land, density grows
  for (const p of SUGAR) { const u = seg(t, p.td - 0.2, p.td); if (u <= 0) continue; const x = p.x + 165 * 0 + 0; s += `<circle cx="${F(p.x)}" cy="${F(p.y)}" r="${F(p.s * (1.7 - 0.7 * eo(u)))}" fill="#FFFFFF" opacity="${F((0.35 + 0.55 * eo(u)) * 100) / 100}"/>`; }
  // dust cloud under the sieve
  { const k = seg(t, 4.0, 4.3) * (1 - seg(t, 4.9, 5.3)); if (k > 0) s += `<ellipse cx="${F(50 + 40 * Math.sin(t * 9))}" cy="-50" rx="190" ry="150" fill="#fff" opacity="${F(0.22 * k * 100) / 100}" filter="url(#blur30)"/>`; }
  // sieve: mesh disc with rim and handle, shakes side to side above the wedge
  { const a = seg(t, 3.9, 4.25) * (1 - seg(t, 4.95, 5.35)); if (a > 0) { const sx = 60 + 36 * Math.sin((t - 4.1) * 11) * seg(t, 4.1, 4.3), sy = -60 + lerp(-230, 0, eo(seg(t, 3.9, 4.25))) + lerp(0, -230, eo(seg(t, 4.95, 5.35))); const sc = 0.9;
    s += `<g transform="translate(${F(sx)} ${F(sy)}) scale(${sc})" opacity="${F(Math.min(1, a * 2) * 100) / 100}"><circle cx="30" cy="48" r="140" fill="#000" opacity=".22" filter="url(#blur20)"/>
<rect x="130" y="-12" width="380" height="26" rx="13" transform="rotate(-18 130 0)" fill="url(#steelG)"/><circle r="130" fill="#C9D1D5"/><circle r="122" fill="#6F787E"/><circle r="116" fill="#D8DEE1" opacity=".55"/>
<g opacity=".5" stroke="#8C979D" stroke-width="2">${Array.from({ length: 17 }, (_, i) => `<line x1="${-112 + i * 14}" y1="-112" x2="${-112 + i * 14}" y2="112"/><line x1="-112" y1="${-112 + i * 14}" x2="112" y2="${-112 + i * 14}"/>`).join('')}</g>
<circle r="130" fill="none" stroke="#F1F4F5" stroke-width="7"/><path d="M -80,-60 A 100 100 0 0 1 20,-100" stroke="#fff" stroke-width="8" fill="none" opacity=".6" stroke-linecap="round"/></g>`; } }
  s += `</g><rect width="1080" height="1920" filter="url(#paper)" opacity=".5"/></g></svg>`;
  stage.innerHTML = s;
} };
})();
