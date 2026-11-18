// BOOJEE HOOK: the name is spray-stencilled onto a white wall, a marker line carries the staff's meaning of the word, a small almond croissant sits below. setT is PURE.
// Timeline (dur 5.4): spray sweep 0-1.3 | mint under-spray 0.25-1.5 | drips 1.2-3.4 | marker write-on 2.3-4.0, underline 4.0-4.6 | croissant pops 2.9-3.8 | slow push-in throughout.
(function () {
  const { clamp, seg, lerp, eo, eio, eob, rng } = K;
  const f = (n) => Math.round(n * 10) / 10;
  const INK = '#0B0B0C', MINT = '#19C9A0', WALL = '#F2F3F0';
  const X0 = 190, TW = 700, BASE = 640, BASE2 = 1060, FS = 440;   // title: x start, text length, baseline, font size
  const NC = 26, ROWS = [300, 380, 460, 540, 620, 710, 790, 870, 950, 1030, 1090];
  // spray blobs: reveal time follows x (left to right) with jitter
  const R = rng(77);
  const blobs = [];
  for (let r = 0; r < ROWS.length; r++) for (let i = 0; i < NC; i++) {
    const x = X0 - 10 + i * ((TW + 20) / (NC - 1));
    blobs.push({ x: x + (R() - .5) * 18, y: ROWS[r] + (R() - .5) * 26, t: ((x - X0) / TW) * 0.9 + (R() - .5) * 0.12 + (ROWS[r] > 700 ? 0.8 : 0), r: 92 + R() * 36 });
  }
  const dots = [];
  for (let i = 0; i < 520; i++) dots.push({ x: X0 - 50 + R() * (TW + 100), y: 240 + R() * 890, t: 0, r: 0.8 + R() * 2.6, o: 0.25 + R() * 0.55 });
  dots.forEach((d) => { d.t = ((d.x - X0) / TW) * 0.9 + R() * 0.12 + (d.y > 710 ? 0.8 : 0); });
  const drips = [{ x: 262, t0: 1.9, L: 80, w: 12 }, { x: 600, t0: 2.2, L: 55, w: 10, c: MINT }, { x: 530, t0: 2.0, L: 95, w: 13 }, { x: 780, t0: 2.5, L: 65, w: 11 }];

  // ---- croissant illustration (flat editorial, food colours), local coords centred (0,0), ~980 wide
  const GOLD = '#D29650', MID = '#C4843C', DARK = '#A06E32', DEEP = '#8A531F', SHAD = '#6B3E1D', CREAM = '#F0E9D6', FLAKE = '#D8C7A3';
  function lobe(cx, cy, rx, ry, rot, k) {
    const sx = k.s || 1;
    let stripes = '';
    for (let i = -2; i <= 2; i++) {
      const x = i * rx * 0.42;
      stripes += `<path d="M${f(x)} ${f(-ry * 0.96)} Q${f(x * 0.55 + rx * 0.12)} 0 ${f(x * 0.9)} ${f(ry * 0.96)}" fill="none" stroke="${SHAD}" stroke-opacity=".42" stroke-width="${f(rx * 0.045 + 3)}" stroke-linecap="round"/>
<path d="M${f(x + rx * 0.1)} ${f(-ry * 0.9)} Q${f(x * 0.55 + rx * 0.22)} 0 ${f(x * 0.9 + rx * 0.1)} ${f(ry * 0.9)}" fill="none" stroke="#E2B26A" stroke-opacity=".55" stroke-width="${f(rx * 0.035 + 2)}" stroke-linecap="round"/>`;
    }
    return `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${rot})"><ellipse rx="${rx}" ry="${ry}" fill="url(#cg)"/><clipPath id="${k.id}"><ellipse rx="${rx}" ry="${ry}"/></clipPath><g clip-path="url(#${k.id})">${stripes}<ellipse cx="${-rx * 0.1}" cy="${-ry * 0.55}" rx="${rx * 0.8}" ry="${ry * 0.28}" fill="#E8BE7C" opacity=".45"/><ellipse cx="0" cy="${ry * 0.72}" rx="${rx}" ry="${ry * 0.5}" fill="${SHAD}" opacity=".28"/></g></g>`;
  }
  function flake(x, y, rot, s) { return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${s})"><path d="M-24 0 Q-8 -15 24 -3 Q10 14 -24 0Z" fill="${FLAKE}" stroke="#B98A55" stroke-width="2.2"/><path d="M-14 0 Q2 -5 14 -2" fill="none" stroke="#B98A55" stroke-width="1.6" opacity=".7"/></g>`; }
  function croissant() {
    const L = [[-180, 20, 125, 112, -16, 'a'], [-320, 66, 98, 86, -34, 'b'], [-422, 126, 68, 46, -54, 'c']];
    let s = '';
    s += lobe(-422, 126, 68, 46, -54, { id: 'ck3' }); s += lobe(422, 126, 68, 46, 54, { id: 'ck4' });
    s += lobe(-320, 66, 98, 86, -34, { id: 'ck5' }); s += lobe(320, 66, 98, 86, 34, { id: 'ck6' });
    s += lobe(-180, 20, 125, 112, -16, { id: 'ck7' }); s += lobe(180, 20, 125, 112, 16, { id: 'ck8' });
    s += lobe(0, -6, 152, 140, 0, { id: 'ck9' });
    const Fr = rng(31); let fl = '';
    for (let i = 0; i < 16; i++) { const a = lerp(-2.7, -0.45, i / 15) + (Fr() - .5) * .15; const rx = 350 * Math.cos(a), ry = 120 * Math.sin(a) - 20; fl += flake(rx + (Fr() - .5) * 30, ry + (Fr() - .5) * 20 + 40 * Math.abs(Math.cos(a)), (Fr() - .5) * 120, 0.9 + Fr() * .35); }
    return s + fl;
  }

  function wall(t) {
    const dx = 14 * t;
    return `<rect width="1080" height="1920" fill="${WALL}"/>
<rect width="1080" height="1920" filter="url(#plaster)" opacity=".32"/>
<g filter="url(#blur60)" opacity=".5"><polygon points="${-200 + dx},-100 ${240 + dx},-100 ${960 + dx},2100 ${520 + dx},2100" fill="#FFFFFF"/><polygon points="${520 + dx},-100 ${700 + dx},-100 ${1420 + dx},2100 ${1200 + dx},2100" fill="#C9CBC8"/></g>
<rect width="1080" height="1920" filter="url(#grain)" opacity=".28"/>`;
  }

  window.SCENE = {
    dur: 5.4,
    setT(t, stage) {
      const cam = lerp(1, 1.045, eio(t / 5.4));
      // spray mask
      let mc = '', mc2 = '';
      for (const b of blobs) {
        const k = eo(seg(t, b.t, b.t + 0.22)); if (k <= 0) continue;
        mc += `<circle cx="${f(b.x)}" cy="${f(b.y)}" r="${f(b.r * k)}" fill="#fff"/>`;
        const k2 = eo(seg(t, b.t + 0.22, b.t + 0.5)); if (k2 > 0) mc2 += `<circle cx="${f(b.x)}" cy="${f(b.y)}" r="${f(b.r * k2)}" fill="#fff"/>`;
      }
      // overspray speckles + travelling mist head
      let sp = '';
      for (const d of dots) { const k = seg(t, d.t, d.t + 0.1); if (k > 0) sp += `<circle cx="${f(d.x)}" cy="${f(d.y)}" r="${f(d.r)}" fill="${INK}" opacity="${f(d.o * k)}"/>`; }
      const l2 = t > 0.85, headK = l2 ? seg(t, 0.85, 1.75) : seg(t, 0, 0.9), hx = X0 + TW * headK + 10, hy = (l2 ? 880 : 470) + Math.sin(t * 17) * 150 * (t < 1.75 ? 1 : 0);
      const mist = t < 2.1 ? `<g filter="url(#mistblur)" opacity="${f(0.34 * (1 - seg(t, 1.75, 2.1)))}"><circle cx="${f(hx)}" cy="${f(hy)}" r="105" fill="${INK}"/><circle cx="${f(hx - 80)}" cy="${f(hy + 90 * Math.sin(t * 9))}" r="70" fill="${INK}"/></g>` : '';
      // drips
      let dr = '';
      for (const d of drips) {
        const k = eio(seg(t, d.t0, d.t0 + 1.9)); if (k <= 0) continue; const len = d.L * k, c = d.c || INK, w = d.w;
        dr += `<path d="M${d.x} ${BASE2 - 40} L${d.x + Math.sin(d.x) * 3} ${f(BASE2 + len)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" fill="none"/><circle cx="${f(d.x + Math.sin(d.x) * 3)}" cy="${f(BASE2 + len)}" r="${f(w * 0.85)}" fill="${c}"/>`;
      }
      // marker line
      const mk = seg(t, 2.6, 4.1), mw = 800 * eio(mk);
      const ul = seg(t, 4.1, 4.7);
      const marker = `<clipPath id="mkc"><rect x="60" y="1150" width="${f(mw + 24)}" height="100"/></clipPath>
<text x="84" y="1210" font-family="DMM" font-size="34" font-weight="500" fill="${INK}" clip-path="url(#mkc)" letter-spacing="1">Staff say: luxury, humble beginnings</text>
<path d="M84 1236 C 240 1226 420 1246 600 1232 S 860 1240 960 1230" fill="none" stroke="${MINT}" stroke-width="10" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${f(1 - eio(ul))}"/>`;
      // small croissant
      const ck = eob(seg(t, 3.0, 3.9), 1.4), bob = Math.sin(t * 2.2) * 5;
      const sm = 0.7;
      const small = false ? `<g transform="translate(540 ${f(1390 + bob + (1 - ck) * 120)}) scale(${f(sm * ck)}) rotate(${f((1 - ck) * -14)})" opacity="${f(clamp(ck * 1.6))}">
<ellipse cx="0" cy="215" rx="470" ry="46" fill="${INK}" opacity=".16" filter="url(#blur14)"/>${croissant()}</g>` : '';
      stage.innerHTML = `<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg"><defs>${K.defs()}
<filter id="plaster" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.006 0.009" numOctaves="3" seed="12"/><feColorMatrix type="matrix" values="0 0 0 0 .55  0 0 0 0 .56  0 0 0 0 .55  0 0 0 .9 -.28"/></filter>
<filter id="rough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4"/></filter>
<filter id="mistblur" filterUnits="userSpaceOnUse" x="-200" y="-200" width="1480" height="2300"><feGaussianBlur stdDeviation="30"/></filter>
<filter id="mblur" filterUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920"><feGaussianBlur stdDeviation="7"/></filter>
<linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${GOLD}"/><stop offset=".55" stop-color="${MID}"/><stop offset="1" stop-color="${DARK}"/></linearGradient>
<mask id="sm" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920"><rect width="1080" height="1920" fill="#000"/><g filter="url(#mblur)">${mc}</g></mask>
<mask id="sm2" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920"><rect width="1080" height="1920" fill="#000"/><g filter="url(#mblur)">${mc2}</g></mask>
</defs>
<g transform="translate(540 960) scale(${f(cam * 1000) / 1000}) translate(-540 -960)">
${wall(t)}
<g mask="url(#sm)" filter="url(#rough)"><text x="${X0}" y="${BASE}" font-family="BSS" font-weight="900" font-size="${FS}" textLength="${TW}" lengthAdjust="spacing" fill="${INK}">BOO</text><text x="${X0}" y="${BASE2}" font-family="BSS" font-weight="900" font-size="${FS}" textLength="${TW}" lengthAdjust="spacing" fill="${INK}">JEE</text></g>
${sp}${mist}${dr}${marker}${small}
</g></svg>`;
    }
  };
})();
