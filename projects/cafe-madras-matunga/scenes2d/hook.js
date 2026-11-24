// CAFE MADRAS HOOK: Mysore masala dosa on a steel plate (2D editorial flat-lay). setT is a PURE function of t (any order).
// Top 55% stays calm (raea draws the kinetic-stack title there). No letters, no pours.
// Timeline (dur 5.3): slow push-in 0-5.3 | light sweep 0.7-3.4 | crack opens 1.55-2.4 | potato lumps heave up 1.7-2.5 | steam ramps from 1.7 and keeps rising | ghee glints twinkle.
(function () {
  const { clamp, seg, lerp, eo, eio, eob, rng } = K;
  const f = (n) => (Math.round(n * 10) / 10);
  const PC = { x: 540, y: 1272 };            // plate centre
  const ANG = -24;                           // dosa axis, degrees (rises to the right)
  const RAD = Math.PI / 180, CA = Math.cos(ANG * RAD), SA = Math.sin(ANG * RAD);
  const toScreen = (x, y) => [PC.x + x * CA - y * SA, PC.y + x * SA + y * CA];   // dosa-local -> screen
  const R = rng(5150); const rr = (a, b) => a + (b - a) * R();

  function smoothClosed(p) {
    const n = p.length; const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    let m0 = mid(p[n - 1], p[0]); let d = `M${f(m0[0])} ${f(m0[1])}`;
    for (let i = 0; i < n; i++) { const c = p[i], m = mid(p[i], p[(i + 1) % n]); d += `Q${f(c[0])} ${f(c[1])} ${f(m[0])} ${f(m[1])}`; }
    return d + 'Z';
  }

  // ---------- dosa shell outline: long folded dosa, curled irregular edge
  const keyTop = [[-432, 14], [-340, -10], [-230, -46], [-100, -88], [50, -118], [190, -134], [300, -132], [356, -104], [374, -50]];
  const keyBot = [[378, 14], [370, 74], [336, 120], [236, 136], [100, 122], [-40, 96], [-175, 66], [-310, 40], [-390, 24]];
  const jit = (p) => p.map((q) => [q[0] + rr(-6, 6), q[1] + rr(-5, 5)]);
  const outline = jit(keyTop.concat(keyBot));
  const outlineD = smoothClosed(outline);
  const inner = outline.map((q) => [q[0] * 0.93, (q[1] + 6) * 0.9 - 6]);
  const innerD = smoothClosed(inner);
  const inner2 = outline.map((q) => [q[0] * 0.8, (q[1] + 6) * 0.72 - 6]);
  const inner2D = smoothClosed(inner2);

  // blotches of roasted brown / ghee, lace bubbles
  const blots = []; for (let i = 0; i < 70; i++) blots.push({ x: rr(-380, 390), y: rr(-105, 100), rx: rr(10, 46), ry: rr(6, 24), rot: rr(-40, 40), a: rr(0.12, 0.38), dark: R() < 0.6 });
  const bubbles = []; for (let i = 0; i < 160; i++) bubbles.push({ x: rr(-390, 400), y: rr(-112, 106), r: rr(1.5, 5), a: rr(0.1, 0.35) });
  const glints = []; for (let i = 0; i < 7; i++) glints.push({ x: rr(-300, 300), y: rr(-80, 70), ph: rr(0, 6.28), sp: rr(1.2, 2.4), r: rr(7, 14) });

  // ---------- crack / filling geometry
  const RIDGE = 0, CX0 = 30, HALF = 224;
  const N = 28;
  const jt = [], jb = []; for (let i = 0; i <= N; i++) { jt.push(rr(-7, 7)); jb.push(rr(-6, 6)); }
  function crackPoly(Lk, Wk) {
    if (Lk <= 0.001 || Wk <= 0.5) return null;
    const top = [], bot = [];
    for (let i = 0; i <= N; i++) {
      const u = (i / N) * 2 - 1, x = CX0 + u * HALF * Lk, env = Math.pow(Math.max(0, 1 - u * u), 0.55);
      const ja = (i % 2 ? 1 : -0.6) * Math.min(1, Wk / 24);
      top.push([x, RIDGE - Wk * 0.56 * env + jt[i] * ja]);
      bot.push([x, RIDGE + Wk * 0.44 * env + jb[i] * ja]);
    }
    return top.concat(bot.reverse());
  }
  const polyD = (p) => 'M' + p.map((q) => `${f(q[0])} ${f(q[1])}`).join('L') + 'Z';

  // filling lumps (potato masala), garnishes
  const lumps = []; for (let i = 0; i < 120; i++) lumps.push({ u: rr(-0.97, 0.97), v: rr(-0.95, 0.95), r: rr(9, 21), a: rr(0, 6.28), sq: rr(0.55, 1), shade: Math.floor(rr(0, 3)), pop: rr(0, 0.35) });
  const seeds = []; for (let i = 0; i < 38; i++) seeds.push({ u: rr(-0.95, 0.95), v: rr(-0.8, 0.8), r: rr(1.8, 3.4), k: R() });
  const bits = []; for (let i = 0; i < 18; i++) bits.push({ u: rr(-0.9, 0.9), v: rr(-0.7, 0.7), rot: rr(0, 180), k: R() });

  // ---------- steam wisps: spawn along the opening, rise and sway in screen space
  const wisps = []; for (let i = 0; i < 15; i++) wisps.push({ u: rr(-0.85, 0.85), ph: rr(0, 1), sp: rr(0.22, 0.34), sw: rr(14, 38), sp2: rr(0.8, 1.6), w: rr(12, 26), h: rr(360, 560), lo: R() < 0.3 });
  const puffs = []; for (let i = 0; i < 7; i++) puffs.push({ u: rr(-0.7, 0.7), ph: rr(0, 1), sp: rr(0.16, 0.24), r: rr(46, 84), sw: rr(10, 30) });

  // ---------- katoris (top-down steel bowls)
  const chutneyFlecks = []; for (let i = 0; i < 26; i++) { const a = rr(0, 6.28), d = Math.sqrt(R()) * 46; chutneyFlecks.push({ x: Math.cos(a) * d, y: Math.sin(a) * d, r: rr(1.4, 3.2), k: R() }); }
  const sambarBits = []; for (let i = 0; i < 30; i++) { const a = rr(0, 6.28), d = Math.sqrt(R()) * 44; sambarBits.push({ x: Math.cos(a) * d, y: Math.sin(a) * d, r: rr(2, 5), k: R(), rot: rr(0, 180) }); }

  function katori(cx, cy, kind, id) {
    let s = `<g transform="translate(${cx} ${cy}) scale(1.28) translate(${-cx} ${-cy})"><ellipse cx="${cx + 16}" cy="${cy + 24}" rx="90" ry="86" fill="#0b1512" opacity="0.4" filter="url(#blur14)"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="84" fill="url(#kRim)"/><circle cx="${cx}" cy="${cy}" r="84" fill="none" stroke="#e9eef0" stroke-opacity="0.55" stroke-width="2"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="68" fill="url(#kIn)" stroke="#5e686e" stroke-width="3"/>`;
    if (kind === 'chutney') {
      s += `<circle cx="${cx}" cy="${cy}" r="58" fill="url(#chutneyG)"/>`;
      s += `<g transform="translate(${cx} ${cy})"><path d="M-34 -12Q-8 -34 22 -22Q44 -10 30 12Q8 30 -22 20" fill="none" stroke="#ffffff" stroke-opacity="0.45" stroke-width="7" stroke-linecap="round" filter="url(#blur6)"/>`;
      chutneyFlecks.forEach((q) => { s += q.k < 0.7 ? `<circle cx="${f(q.x)}" cy="${f(q.y)}" r="${f(q.r)}" fill="#5f9033" opacity="0.8"/>` : `<circle cx="${f(q.x)}" cy="${f(q.y)}" r="${f(q.r * 0.8)}" fill="#2a1d10"/>`; });
      s += `<path d="M-20 38Q0 46 22 38" stroke="#fff" stroke-opacity="0.35" stroke-width="3" fill="none"/></g>`;
    } else {
      s += `<circle cx="${cx}" cy="${cy}" r="58" fill="url(#sambarG)"/>`;
      s += `<g transform="translate(${cx} ${cy})">`;
      sambarBits.forEach((q) => {
        if (q.k < 0.35) s += `<circle cx="${f(q.x)}" cy="${f(q.y)}" r="${f(q.r * 0.8)}" fill="#e7b43a"/>`;
        else if (q.k < 0.6) s += `<circle cx="${f(q.x)}" cy="${f(q.y)}" r="${f(q.r * 1.3)}" fill="#cf6a24"/><circle cx="${f(q.x)}" cy="${f(q.y)}" r="${f(q.r * 0.6)}" fill="#e88f46"/>`;
        else if (q.k < 0.82) s += `<ellipse cx="${f(q.x)}" cy="${f(q.y)}" rx="${f(q.r * 1.6)}" ry="${f(q.r * 0.7)}" fill="#8fae52" transform="rotate(${f(q.rot)} ${f(q.x)} ${f(q.y)})"/>`;
        else s += `<ellipse cx="${f(q.x)}" cy="${f(q.y)}" rx="${f(q.r * 1.5)}" ry="${f(q.r * 0.8)}" fill="#3f5a22" transform="rotate(${f(q.rot)} ${f(q.x)} ${f(q.y)})"/>`;
      });
      s += `<circle r="50" fill="none" stroke="#e0903f" stroke-opacity="0.45" stroke-width="5" filter="url(#blur6)"/>`;
      s += `<path d="M-30 -22Q-4 -40 26 -28" fill="none" stroke="#fff" stroke-opacity="0.35" stroke-width="5" stroke-linecap="round" filter="url(#blur6)"/></g>`;
    }
    s += `<path d="M${cx - 64} ${cy - 40}A76 76 0 0 1 ${cx + 20} ${cy - 74}" fill="none" stroke="#fff" stroke-opacity="0.65" stroke-width="5" stroke-linecap="round" filter="url(#blur6)"/></g>`;
    return s;
  }

  const frac = (x) => x - Math.floor(x);

  function setT(t, stage) {
    const push = 1 + 0.115 * eio(t / 5.3), pan = -10 * eio(t / 5.3);
    const kL = eo(seg(t, 1.55, 2.2)), kW = eob(seg(t, 1.7, 2.5), 0.9), Lk = kL, Wk = 78 * kW;
    const poly = crackPoly(Lk, Wk), polyPath = poly ? polyD(poly) : '';
    const heave = eo(seg(t, 1.8, 2.7));

    // sweep band
    const sx = lerp(-380, 1480, eio(seg(t, 0.7, 3.4)));
    const sweep = `<polygon points="${f(sx)},-100 ${f(sx + 150)},-100 ${f(sx + 150 - 640)},2100 ${f(sx - 640)},2100" fill="#ffffff" opacity="0.28" filter="url(#sb30)" style="mix-blend-mode:screen"/>
      <polygon points="${f(sx + 40)},-100 ${f(sx + 70)},-100 ${f(sx + 70 - 640)},2100 ${f(sx + 40 - 640)},2100" fill="#ffffff" opacity="0.2" filter="url(#sb14)" style="mix-blend-mode:screen"/>`;

    let defs = K.defs() + K.steelDefs() + `
<radialGradient id="plateG" cx="42%" cy="36%" r="75%"><stop offset="0" stop-color="#dfe5e8"/><stop offset="0.55" stop-color="#aab4ba"/><stop offset="1" stop-color="#6e7a81"/></radialGradient>
<radialGradient id="plateWell" cx="46%" cy="40%" r="70%"><stop offset="0" stop-color="#c3cbd0"/><stop offset="0.7" stop-color="#9aa5ab"/><stop offset="1" stop-color="#7e8a91"/></radialGradient>
<radialGradient id="kRim" cx="38%" cy="32%" r="80%"><stop offset="0" stop-color="#f4f7f8"/><stop offset="0.6" stop-color="#b8c1c6"/><stop offset="1" stop-color="#7f8a91"/></radialGradient>
<radialGradient id="kIn" cx="60%" cy="66%" r="80%"><stop offset="0" stop-color="#d2d9dc"/><stop offset="0.6" stop-color="#87929a"/><stop offset="1" stop-color="#5f6a71"/></radialGradient>
<radialGradient id="chutneyG" cx="42%" cy="38%" r="75%"><stop offset="0" stop-color="#f4f6e6"/><stop offset="0.7" stop-color="#dfe6c6"/><stop offset="1" stop-color="#b7c68f"/></radialGradient>
<radialGradient id="sambarG" cx="44%" cy="40%" r="78%"><stop offset="0" stop-color="#c8742a"/><stop offset="0.7" stop-color="#a8531a"/><stop offset="1" stop-color="#6e3010"/></radialGradient>
<linearGradient id="dosaG" x1="0" y1="-125" x2="0" y2="118" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f2c874"/><stop offset="0.5" stop-color="#e2a24a"/><stop offset="1" stop-color="#c47c2a"/></linearGradient>
<linearGradient id="dosaShade" x1="0" y1="-125" x2="0" y2="118" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff0b8" stop-opacity="0.42"/><stop offset="0.4" stop-color="#fff0b8" stop-opacity="0"/><stop offset="0.75" stop-color="#3a1604" stop-opacity="0.12"/><stop offset="1" stop-color="#3a1604" stop-opacity="0.38"/></linearGradient>
<linearGradient id="dosaEnd" x1="-420" y1="0" x2="420" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#5a2a08" stop-opacity="0.35"/><stop offset="0.18" stop-color="#5a2a08" stop-opacity="0"/><stop offset="0.82" stop-color="#5a2a08" stop-opacity="0"/><stop offset="1" stop-color="#5a2a08" stop-opacity="0.2"/></linearGradient>
<radialGradient id="potA" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#fbe48a"/><stop offset="0.55" stop-color="#eebb3c"/><stop offset="1" stop-color="#bd8420"/></radialGradient>
<radialGradient id="potB" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#f6d56c"/><stop offset="0.55" stop-color="#e0a52b"/><stop offset="1" stop-color="#a8721a"/></radialGradient>
<radialGradient id="potC" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#ffedac"/><stop offset="0.55" stop-color="#f2c850"/><stop offset="1" stop-color="#c9922a"/></radialGradient>
<filter id="dosaTex" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.028 0.05" numOctaves="4" seed="12"/><feColorMatrix type="matrix" values="0 0 0 0 0.36  0 0 0 0 0.15  0 0 0 0 0.03  2.6 0 0 0 -1.15"/></filter>
<filter id="dosaLace" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.11" numOctaves="2" seed="3"/><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 0.88  0 0 0 0 0.6  2.2 0 0 0 -1.15"/></filter>
<linearGradient id="topFade" x1="0" y1="0" x2="0" y2="1100" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#14312A" stop-opacity="0.94"/><stop offset="0.55" stop-color="#14312A" stop-opacity="0.72"/><stop offset="1" stop-color="#14312A" stop-opacity="0"/></linearGradient>
<linearGradient id="botFade" x1="0" y1="1500" x2="0" y2="1920" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0c1a15" stop-opacity="0"/><stop offset="1" stop-color="#0c1a15" stop-opacity="0.65"/></linearGradient>
<filter id="sb14" filterUnits="userSpaceOnUse" x="-300" y="-600" width="1700" height="2800"><feGaussianBlur stdDeviation="14"/></filter><filter id="sb30" filterUnits="userSpaceOnUse" x="-300" y="-600" width="1700" height="2800"><feGaussianBlur stdDeviation="30"/></filter><filter id="sb8" filterUnits="userSpaceOnUse" x="-300" y="-600" width="1700" height="2800"><feGaussianBlur stdDeviation="8"/></filter>
<clipPath id="shellClip"><path d="${outlineD}"/></clipPath>
<clipPath id="innerClip"><path d="${innerD}"/></clipPath>
${polyPath ? `<clipPath id="crackClip"><path d="${polyPath}"/></clipPath>` : ''}
<mask id="shellMask"><rect x="-600" y="-400" width="1200" height="800" fill="#fff"/>${polyPath ? `<path d="${polyPath}" fill="#000"/>` : ''}</mask>`;

    const table = K.steel(t, { base: '#7f8a90', drift: 18 });
    let body = '';
    // plate
    body += `<ellipse cx="${PC.x + 22}" cy="${PC.y + 34}" rx="352" ry="346" fill="#0b1512" opacity="0.42" filter="url(#blur30)"/>`;
    body += `<circle cx="${PC.x}" cy="${PC.y}" r="338" fill="url(#plateG)"/><circle cx="${PC.x}" cy="${PC.y}" r="338" fill="none" stroke="#f3f6f7" stroke-opacity="0.7" stroke-width="3"/>`;
    body += `<circle cx="${PC.x}" cy="${PC.y}" r="300" fill="url(#plateWell)" stroke="#7d878d" stroke-width="4"/><circle cx="${PC.x}" cy="${PC.y}" r="290" fill="none" stroke="#eaeff1" stroke-opacity="0.55" stroke-width="2"/>`;
    body += `<path d="M${PC.x - 300} ${PC.y - 70}A300 300 0 0 1 ${PC.x - 120} ${PC.y - 276}" fill="none" stroke="#fff" stroke-opacity="0.55" stroke-width="10" stroke-linecap="round" filter="url(#blur6)"/>`;
    // katoris
    body += katori(138, 1086, 'chutney') + katori(884, 1512, 'sambar');

    // dosa (local frame)
    let d = `<g transform="translate(${PC.x} ${PC.y}) rotate(${ANG})">`;
    d += `<path d="${outlineD}" transform="translate(14 30)" fill="#0b1512" opacity="0.42" filter="url(#blur14)"/>`;
    // filling + opening interior (under the shell)
    if (poly) {
      d += `<path d="${polyPath}" fill="#2a1304"/>`;
      d += `<g clip-path="url(#crackClip)">`;
      d += `<rect x="-300" y="-90" width="600" height="180" fill="#3b1a07"/>`;
      d += `<path d="M${f(CX0 - HALF * Lk)} ${f(RIDGE - Wk * 0.38)}Q${f(CX0 - 60)} ${f(RIDGE - Wk * 0.5)} ${f(CX0 + 40)} ${f(RIDGE - Wk * 0.36)}T${f(CX0 + HALF * Lk)} ${f(RIDGE - Wk * 0.34)}" fill="none" stroke="#a02f14" stroke-width="${f(Wk * 0.16)}" stroke-linecap="round" opacity="0.85" filter="url(#blur6)"/>`;
      lumps.forEach((q) => {
        const h = eo(seg(heave, q.pop, q.pop + 0.65)); if (h <= 0 || Math.abs(q.u) > Lk * 1.02) return;
        const x = CX0 + q.u * HALF * Lk, y = RIDGE + q.v * Wk * 0.28 - h * 4, r = q.r * (0.5 + 0.5 * Math.min(1, Wk / 56)) * (0.75 + 0.25 * h);
        d += `<ellipse cx="${f(x + 3)}" cy="${f(y + 5)}" rx="${f(r)}" ry="${f(r * q.sq)}" fill="#1c0b02" opacity="0.5" transform="rotate(${f(q.a * 57)} ${f(x)} ${f(y)})"/>`;
        d += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(r)}" ry="${f(r * q.sq)}" fill="url(#pot${'ABC'[q.shade]})" transform="rotate(${f(q.a * 57)} ${f(x)} ${f(y)})"/>`;
      });
      seeds.forEach((q) => {
        if (Math.abs(q.u) > Lk) return; const x = CX0 + q.u * HALF * Lk, y = RIDGE + q.v * Wk * 0.28 - 3;
        d += q.k < 0.5 ? `<circle cx="${f(x)}" cy="${f(y)}" r="${f(q.r)}" fill="#24150a"/>` : q.k < 0.8 ? `<circle cx="${f(x)}" cy="${f(y)}" r="${f(q.r * 1.3)}" fill="#6a9a36"/>` : `<circle cx="${f(x)}" cy="${f(y)}" r="${f(q.r * 1.2)}" fill="#c4361d"/>`;
      });
      bits.forEach((q) => {
        if (Math.abs(q.u) > Lk) return; const x = CX0 + q.u * HALF * Lk, y = RIDGE + q.v * Wk * 0.25 - 4;
        d += q.k < 0.5 ? `<ellipse cx="${f(x)}" cy="${f(y)}" rx="9" ry="3.2" fill="#3a5a1e" transform="rotate(${f(q.rot)} ${f(x)} ${f(y)})"/>` : `<ellipse cx="${f(x)}" cy="${f(y)}" rx="8" ry="3" fill="#efe0b0" opacity="0.8" transform="rotate(${f(q.rot)} ${f(x)} ${f(y)})"/>`;
      });
      // soft inner shadow under the shell's upper lip
      d += `<path d="${polyPath}" fill="none" stroke="#1b0a02" stroke-width="22" opacity="0.55" filter="url(#blur6)"/>`;
      d += `</g>`;
    }
    // shell
    d += `<g mask="url(#shellMask)">`;
    d += `<path d="${outlineD}" fill="#8d4a14"/>`;
    d += `<path d="${innerD}" fill="url(#dosaG)"/>`;
    d += `<g clip-path="url(#shellClip)">`;
    d += `<rect x="-440" y="-140" width="880" height="280" fill="#000" filter="url(#dosaTex)" opacity="0.9"/>`;
    d += `<rect x="-440" y="-140" width="880" height="280" fill="#000" filter="url(#dosaLace)" opacity="0.55"/>`;
    blots.forEach((q) => { d += `<ellipse cx="${f(q.x)}" cy="${f(q.y)}" rx="${f(q.rx)}" ry="${f(q.ry)}" fill="${q.dark ? '#6a3208' : '#f4c870'}" opacity="${f(q.a)}" transform="rotate(${f(q.rot)} ${f(q.x)} ${f(q.y)})" filter="url(#blur6)"/>`; });
    bubbles.forEach((q) => { d += `<circle cx="${f(q.x)}" cy="${f(q.y)}" r="${f(q.r)}" fill="#fff0c0" opacity="${f(q.a)}"/>`; });
    // red-brown chutney smear along the ridge (Mysore masala): visible at the folded lip
    d += `<path d="M-330 ${RIDGE + 14}Q-190 ${RIDGE - 6} -80 ${RIDGE + 8}T170 ${RIDGE + 2}T340 ${RIDGE + 6}" fill="none" stroke="#9c3213" stroke-width="22" stroke-linecap="round" opacity="0.5" filter="url(#blur6)"/>`;
    d += `<path d="M-300 ${RIDGE + 20}Q-160 ${RIDGE + 8} -40 ${RIDGE + 16}T200 ${RIDGE + 10}" fill="none" stroke="#7a220c" stroke-width="7" stroke-linecap="round" opacity="0.45"/>`;
    d += `<path d="${outlineD}" fill="url(#dosaShade)"/><path d="${outlineD}" fill="url(#dosaEnd)"/>`;
    // fold ridge (soft crease + highlight)
    d += `<path d="M-380 ${RIDGE + 22}Q-200 ${RIDGE - 4} 0 ${RIDGE + 2}T396 ${RIDGE + 14}" fill="none" stroke="#6a3208" stroke-width="5" opacity="0.5" filter="url(#blur6)"/>`;
    d += `<path d="M-370 ${RIDGE + 10}Q-200 ${RIDGE - 14} 0 ${RIDGE - 8}T386 ${RIDGE + 2}" fill="none" stroke="#fff3c4" stroke-width="4" opacity="0.5" filter="url(#blur6)"/>`;
    // rolled cone: fan creases from the tip, and the open rolled lip at the wide end
    [[-100, -0.5], [-60, -0.3], [-20, -0.12], [20, 0.1], [62, 0.3], [100, 0.5]].forEach((c, i) => {
      d += `<path d="M-420 ${f(18 + c[1] * 6)}Q-120 ${f(c[0] * 0.45 - 14)} 340 ${f(c[0] * 1.22)}" fill="none" stroke="${i % 2 ? '#fff0b8' : '#6a3208'}" stroke-width="${i % 2 ? 6 : 9}" opacity="${i % 2 ? 0.28 : 0.3}" filter="url(#blur6)"/>`; });
    d += `<ellipse cx="356" cy="-2" rx="40" ry="128" fill="#4a2208" opacity="0.88"/><ellipse cx="360" cy="-2" rx="30" ry="112" fill="#f0d08c" opacity="0.92"/><ellipse cx="364" cy="0" rx="20" ry="92" fill="#caa05a"/><path d="M340 -100Q380 0 340 100" fill="none" stroke="#8d5a22" stroke-width="5" opacity="0.7"/>`;
    // ghee glints
    glints.forEach((g) => { const a = Math.max(0, Math.sin(t * g.sp + g.ph)); d += `<ellipse cx="${f(g.x)}" cy="${f(g.y)}" rx="${f(g.r * (0.6 + 0.6 * a))}" ry="${f(g.r * 0.35)}" fill="#fff" opacity="${f(0.55 * a * a)}" transform="rotate(-20 ${f(g.x)} ${f(g.y)})" filter="url(#blur6)"/>`; });
    d += `</g>`;
    d += `<path d="${outlineD}" fill="none" stroke="#5a2a08" stroke-opacity="0.7" stroke-width="3"/>`;
    d += `<path d="${innerD}" fill="none" stroke="#f6d48a" stroke-opacity="0.4" stroke-width="2"/>`;
    d += `</g>`;
    // crack lip highlight and torn crumbs
    if (poly) {
      d += `<path d="${polyPath}" fill="none" stroke="#f7d68e" stroke-width="3.2" stroke-opacity="0.85" stroke-linejoin="round"/>`;
      d += `<path d="${polyPath}" fill="none" stroke="#5a2a08" stroke-width="2" stroke-opacity="0.8" transform="translate(0 2.5)"/>`;
    }
    d += `</g>`;
    body += d;

    // steam
    const amp = 0.14 + 0.86 * eo(seg(t, 1.7, 2.9));
    let steam = '';
    puffs.forEach((p) => {
      const a = frac(t * p.sp + p.ph), [sx0, sy0] = toScreen(CX0 + p.u * HALF * Math.max(0.35, Lk), RIDGE);
      const y = sy0 - a * 430 - 20, x = sx0 + Math.sin(a * 5 + p.ph * 6) * p.sw + a * 26, env = Math.sin(Math.PI * a) * Math.min(1, a * 5);
      steam += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(p.r * (0.6 + a * 1.1))}" fill="#f2f6f6" opacity="${f(0.26 * env * amp)}" filter="url(#sb30)"/>`;
    });
    wisps.forEach((w) => {
      const a = frac(t * w.sp + w.ph), [sx0, sy0] = toScreen(CX0 + w.u * HALF * Math.max(0.35, Lk), RIDGE - 6);
      const env = Math.sin(Math.PI * a) * Math.min(1, a * 6); const hh = w.h * (0.55 + 0.45 * a);
      const x0 = sx0, y0 = sy0 - a * 120, s1 = Math.sin(t * w.sp2 + w.ph * 9) * w.sw, s2 = Math.sin(t * w.sp2 * 0.8 + w.ph * 5 + 1.7) * w.sw * 1.4;
      steam += `<path d="M${f(x0)} ${f(y0)}C${f(x0 + s1)} ${f(y0 - hh * 0.3)} ${f(x0 - s2)} ${f(y0 - hh * 0.62)} ${f(x0 + s1 * 0.6 + a * 22)} ${f(y0 - hh)}" fill="none" stroke="#f6f9f9" stroke-width="${f(w.w * (0.7 + a * 0.9))}" stroke-linecap="round" opacity="${f((w.lo ? 0.3 : 0.46) * env * amp)}" filter="url(#sb8)"/>`;
    });
    steam = `<g>${steam}</g>`;
    // sambar katori faint steam
    { const a = frac(t * 0.2 + 0.3); steam += `<circle cx="${f(884 + Math.sin(t * 1.3) * 14)}" cy="${f(1470 - a * 220)}" r="${f(36 + a * 36)}" fill="#f2f6f6" opacity="${f(0.2 * Math.sin(Math.PI * a))}" filter="url(#sb30)"/>`; }

    let overlays = `<rect width="1080" height="1920" fill="url(#topFade)"/><rect width="1080" height="1920" fill="url(#botFade)"/>`;
    overlays += `<rect width="1080" height="1920" filter="url(#grain)" opacity="0.28"/>`;

    // push-in group
    const LS = 0.72, LY = 1172;   // layout fix: whole dish group scaled and lifted so the plate spans ~y 930-1415 (tag sits under it, above y 1500)
    const g = `<g transform="translate(${PC.x + pan} ${PC.y}) scale(${f(push * 1000) / 1000}) translate(${-PC.x} ${-PC.y})">${table}<g transform="translate(${PC.x} ${LY}) scale(${LS}) translate(${-PC.x} ${-PC.y})">${body}${steam}</g></g>`;
    stage.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920"><defs>${defs}</defs>${g}${sweep}${overlays}</svg>`;
  }
  window.SCENE = { dur: 5.3, setT };
})();
