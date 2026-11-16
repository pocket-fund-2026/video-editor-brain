// GOCHUJANG NOODLE BOWL - 2D editorial flat-lay. setT is a pure function of t.
(function () {
  const C = { x: 540, y: 950 };
  const f1 = (n) => n.toFixed(1);
  const R = K.rng(7331);
  const rr = (a, b) => a + (b - a) * R();
  function smooth(pts) {
    let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
      d += `Q${f1(pts[i][0])} ${f1(pts[i][1])} ${f1(mx)} ${f1(my)}`;
    }
    const l = pts[pts.length - 1]; return d + `L${f1(l[0])} ${f1(l[1])}`;
  }
  const BASE = ['#b3260f', '#c4341a', '#a31f0e', '#8e1a0c', '#d1451f', '#c02c14', '#7f180c'];
  // ---- pile strands (3 tiers)
  const tiers = [[], [], []];
  [26, 22, 16].forEach((n, ti) => {
    for (let s = 0; s < n; s++) {
      let a = rr(0, 6.28), rad = Math.sqrt(R()) * 275, x = C.x + Math.cos(rr(0, 6.28)) * rad, y = C.y + 10 + Math.sin(rr(0, 6.28)) * rad * 0.95;
      let cv = 0; const pts = [[x, y]]; const steps = Math.floor(rr(20, 32));
      for (let k = 0; k < steps; k++) {
        cv = cv * 0.78 + rr(-0.42, 0.42); a += cv;
        const dx = x - C.x, dy = y - (C.y + 10), d = Math.hypot(dx, dy);
        if (d > 292) { const toC = Math.atan2(-dy, -dx); let diff = toC - a; diff = Math.atan2(Math.sin(diff), Math.cos(diff)); a += diff * 0.45; }
        x += Math.cos(a) * 17; y += Math.sin(a) * 17; pts.push([x, y]);
      }
      tiers[ti].push({ d: smooth(pts), w: rr(15, 24), c: BASE[Math.floor(R() * BASE.length)], off: rr(0, 120), hl: R() < 0.8, gl: R() < 0.6 });
    }
  });
  // ---- garnish
  const seeds = [], rings = [];
  for (let i = 0; i < 95; i++) { const a = rr(0, 6.28), r = Math.sqrt(R()) * 275; seeds.push({ x: C.x + Math.cos(a) * r, y: C.y + 10 + Math.sin(a) * r * 0.95, rot: rr(0, 180), dark: R() < 0.3, d: 0.05 + R() * 0.85, s: rr(0.8, 1.25) }); }
  for (let i = 0; i < 26; i++) { const a = rr(0, 6.28), r = Math.sqrt(R()) * 255; rings.push({ x: C.x + Math.cos(a) * r, y: C.y + 10 + Math.sin(a) * r * 0.95, rot: rr(0, 180), d: 0.05 + R() * 0.8, s: rr(0.8, 1.2), rx: rr(15, 20) }); }
  // ---- lifted bundle
  const D = { x: 600, y: 1020 }, U = { x: 560, y: 760 };
  const bund = [];
  for (let i = 0; i < 10; i++) bund.push({ phi: rr(0, 6.28) , k: rr(-1.8, 1.8), lenL: rr(120, 190), lenH: rr(150, 330), off: (i - 4.5) * 15 + rr(-10, 10), w: rr(16, 22), c: BASE[Math.floor(R() * BASE.length)], ph: rr(0, 6.28), sw: rr(0.7, 1.3) });
  const bseeds = []; for (let i = 0; i < 9; i++) bseeds.push({ b: Math.floor(R() * 10), u: rr(0.2, 0.9), dark: R() < 0.3 });
  const steamR = []; for (let i = 0; i < 12; i++) steamR.push({ x: rr(380, 700), ph: rr(0, 6.28), w: rr(0.8, 1.3) });
  const sauceDrips = []; for (let i = 0; i < 7; i++) sauceDrips.push({ a: rr(0.3, 2.8), l: rr(15, 45), w: rr(5, 11) });

  const lerp = K.lerp, seg = K.seg, eio = K.eio;
  function liftAt(t) { return Math.max(0, eio(seg(t, 2.0, 3.05)) - eio(seg(t, 3.3, 3.95))); }
  function tipAt(t) {
    const rest = { x: 700, y: 1150 };
    const p1 = eio(seg(t, 1.4, 2.0)), p2 = eio(seg(t, 3.95, 4.7)), L = liftAt(t);
    const bx = lerp(lerp(rest.x, D.x, p1), rest.x, p2), by = lerp(lerp(rest.y, D.y, p1), rest.y, p2);
    return { x: lerp(bx, U.x, L), y: lerp(by, U.y, L), L, hold: Math.max(p1 * (1 - p2), 0) };
  }
  function shadowVec(t) { const a = 0.9 * eio(seg(t, 4.7, 5.4)); const bx = 0.62, by = 0.78; return [bx * Math.cos(a) - by * Math.sin(a), bx * Math.sin(a) + by * Math.cos(a)]; }

  function dropState(d, t) {
    const x = (t - d) / 0.5; if (x <= 0) return null;
    if (x >= 1) return { dy: 0, o: 1, sc: 1, rot: 0, h: 0 };
    const f = x / 0.62; let dy;
    if (f < 1) dy = -800 * (1 - f * f); else { const b = (x - 0.62) / 0.38; dy = -16 * Math.sin(Math.PI * b) * (1 - b); }
    return { dy, o: Math.min(1, x * 6), sc: 1 + 0.25 * (1 - Math.min(1, x)), rot: (1 - Math.min(1, x)) * 110, h: -dy };
  }

  function bundlePaths(t, L, scaleExtra) {
    const out = []; const s = 1 + 0.34 * L, P = tipAt(t);
    bund.forEach((b, i) => {
      const h = K.clamp(L * 1.25 - 0.25 * (i / 10)); const he = eio(h);
      const pts = [];
      for (let k = 0; k <= 12; k++) {
        const u = k / 12;
        const a = b.phi + b.k * u, r = b.lenL * u;
        const lx = D.x + Math.cos(a) * r, ly = D.y + Math.sin(a) * r;
        const sway = Math.sin(t * 3.2 * b.sw + b.ph + u * 2) * 16 * u * u + Math.sin(u * 4.2 + b.ph) * 26 * u + Math.sin(u * 9 + b.ph * 2) * 7 * u;
        const hx = P.x + b.off * (0.15 + 1.5 * u * u) * s + sway * (0.4 + 0.6 * L), hy = P.y + 8 + u * b.lenH * s;
        const px = lerp(lx + (P.x - D.x) * (1 - u) * 0 + (P.x - lx) * 0, hx, he), py = lerp(ly, hy, he);
        pts.push([px, py]);
      }
      out.push({ d: smooth(pts), w: b.w * (1 + 0.18 * L), c: b.c, pts, i });
    });
    return out;
  }

  window.SCENE = {
    dur: 5.4,
    setT(t, stage) {
      const sv = shadowVec(t), hlx = -sv[0] * 4, hly = -sv[1] * 4;
      const push = 1 + 0.05 * (t / 5.4);
      const e = K.eob(seg(t, 0, 0.9), 1.6), bdy = (1 - e) * 340, bsc = 0.93 + 0.07 * Math.min(1.05, e);
      const settle = K.eo(seg(t, 0, 0.9));
      const shOff = lerp(80, 34, settle), shBlurOp = lerp(0.2, 0.42, settle);
      const lightRot = 40 * eio(seg(t, 4.7, 5.4));
      const L = liftAt(t), tip = tipAt(t);
      let s = '';
      s += `<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg"><defs>${K.defs()}
<linearGradient id="rimg" gradientTransform="rotate(${lightRot} .5 .5)" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C9DBCA"/><stop offset=".5" stop-color="#A6C2A9"/><stop offset="1" stop-color="#7C9A82"/></linearGradient>
<linearGradient id="wallg" gradientTransform="rotate(${lightRot} .5 .5)" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7B9F83"/><stop offset=".55" stop-color="#A3C2A8"/><stop offset="1" stop-color="#CFE2D0"/></linearGradient>
<radialGradient id="vig" cx=".5" cy=".5" r=".5"><stop offset=".62" stop-color="#1c0504" stop-opacity="0"/><stop offset="1" stop-color="#1c0504" stop-opacity=".55"/></radialGradient>
<radialGradient id="pilelight" cx=".35" cy=".3" r=".7"><stop offset="0" stop-color="#ffd9b0" stop-opacity=".22"/><stop offset="1" stop-color="#ffd9b0" stop-opacity="0"/></radialGradient>
<linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9AE76"/><stop offset="1" stop-color="#A9764A"/></linearGradient>
<radialGradient id="pool" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#6b1a0e"/><stop offset="1" stop-color="#220705"/></radialGradient>
<clipPath id="inner"><circle cx="${C.x}" cy="${C.y}" r="352"/></clipPath></defs>`;
      s += K.concrete(t);
      s += `<g transform="translate(540 960) scale(${push.toFixed(4)}) translate(-540 -960)">`;
      // bowl shadow
      s += `<g filter="url(#blur30)" opacity="${shBlurOp.toFixed(2)}"><circle cx="${f1(C.x + sv[0] * shOff * 1.2)}" cy="${f1(C.y + bdy + sv[1] * shOff * 1.2)}" r="${f1(392 * bsc)}" fill="#14161a"/></g>`;
      s += `<g filter="url(#blur14)" opacity="0.4"><circle cx="${f1(C.x + sv[0] * 10)}" cy="${f1(C.y + bdy + sv[1] * 10)}" r="${f1(394 * bsc)}" fill="#14161a"/></g>`;
      // bowl group
      s += `<g transform="translate(${C.x} ${f1(C.y + bdy)}) scale(${bsc.toFixed(4)}) translate(${-C.x} ${-C.y})">`;
      s += `<circle cx="${C.x}" cy="${C.y}" r="392" fill="url(#rimg)"/>`;
      s += `<circle cx="${C.x}" cy="${C.y}" r="388" fill="none" stroke="#EAF3EA" stroke-opacity=".55" stroke-width="3"/>`;
      s += `<path d="M${C.x - 330} ${C.y - 200} A 385 385 0 0 1 ${C.x - 150} ${C.y - 355}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="9" stroke-linecap="round" filter="url(#blur6)" transform="rotate(${lightRot} ${C.x} ${C.y})"/>`;
      s += `<circle cx="${C.x}" cy="${C.y}" r="356" fill="#7E9E84" opacity=".5"/>`;
      s += `<circle cx="${C.x}" cy="${C.y}" r="352" fill="url(#wallg)"/>`;
      // inner shadow from rim
      s += `<g clip-path="url(#inner)"><circle cx="${f1(C.x + sv[0] * 22)}" cy="${f1(C.y + sv[1] * 22)}" r="372" fill="none" stroke="#1d2b21" stroke-opacity=".32" stroke-width="40" filter="url(#blur14)"/>`;
      // floor
      s += `<circle cx="${C.x}" cy="${C.y + 8}" r="318" fill="#7F9E85"/><circle cx="${C.x}" cy="${C.y + 8}" r="318" fill="none" stroke="#3b5442" stroke-opacity=".35" stroke-width="10" filter="url(#blur6)"/>`;
      // sauce pool at lower edge
      s += `<path d="M${C.x - 230} ${C.y + 215} Q${C.x - 150} ${C.y + 150} ${C.x - 20} ${C.y + 190} Q${C.x + 120} ${C.y + 150} ${C.x + 240} ${C.y + 205} Q${C.x + 230} ${C.y + 300} ${C.x + 60} ${C.y + 318} Q${C.x - 150} ${C.y + 320} ${C.x - 230} ${C.y + 215}Z" fill="url(#pool)"/>`;
      s += `<path d="M${C.x - 170} ${C.y + 262} Q${C.x - 60} ${C.y + 232} ${C.x + 60} ${C.y + 262}" stroke="#ffb9a0" stroke-opacity=".55" stroke-width="7" fill="none" stroke-linecap="round" filter="url(#blur6)"/>`;
      s += `<ellipse cx="${C.x + 130}" cy="${C.y + 238}" rx="26" ry="6" fill="#ffd0b8" opacity=".5" transform="rotate(-8 ${C.x + 130} ${C.y + 238})"/>`;
      sauceDrips.forEach((d) => { const a = d.a + 0.0, x0 = C.x + Math.cos(a) * 325, y0 = C.y + 8 + Math.sin(a) * 325; s += `<path d="M${f1(x0)} ${f1(y0)} L${f1(x0 - Math.cos(a) * d.l)} ${f1(y0 - Math.sin(a) * d.l)}" stroke="#4a110a" stroke-width="${d.w}" stroke-linecap="round" opacity=".85"/>`; });
      s += `<circle cx="${C.x}" cy="${C.y + 10}" r="318" fill="#4a1209"/><circle cx="${C.x - 30}" cy="${C.y - 10}" r="250" fill="#6b1a0e" filter="url(#blur30)"/>`;
      // pile tiers
      tiers.forEach((tier, ti) => {
        s += `<g filter="url(#blur6)" opacity=".5" transform="translate(${f1(sv[0] * 9)} ${f1(sv[1] * 9)})">`;
        tier.forEach((n) => { s += `<path d="${n.d}" stroke="#1a0503" stroke-width="${n.w + 2}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`; });
        s += `</g>`;
        tier.forEach((n) => {
          s += `<path d="${n.d}" stroke="#4a0f07" stroke-width="${n.w + 4}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
          s += `<path d="${n.d}" stroke="${n.c}" stroke-width="${n.w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
          if (n.hl) s += `<path d="${n.d}" stroke="#E9A56A" stroke-opacity="${0.45 + ti * 0.15}" stroke-width="${f1(n.w * 0.32)}" fill="none" stroke-linecap="round" stroke-dasharray="46 24 90 30" stroke-dashoffset="${f1(n.off)}" transform="translate(${f1(hlx)} ${f1(hly)})"/>`;
          if (n.gl) s += `<path d="${n.d}" stroke="#FFF1E2" stroke-opacity=".6" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-dasharray="14 70 22 50" stroke-dashoffset="${f1(n.off * 1.7)}" transform="translate(${f1(hlx * 1.4)} ${f1(hly * 1.8)})"/>`;
        });
      });
      s += `<circle cx="${C.x}" cy="${C.y + 8}" r="345" fill="url(#vig)"/><circle cx="${C.x - 70}" cy="${C.y - 70}" r="330" fill="url(#pilelight)"/>`;
      s += `</g>`;
      // garnish (clipped region not required)
      const gl = [];
      rings.forEach((g) => {
        const st = dropState(g.d, t); if (!st) return;
        const rx = g.rx * g.s * st.sc, ry = rx * 0.72;
        s += `<g transform="translate(${f1(g.x)} ${f1(g.y + st.dy)}) rotate(${f1(g.rot + st.rot)})" opacity="${st.o.toFixed(2)}">
<ellipse cx="${f1(sv[0] * (4 + st.h * 0.05))}" cy="${f1(sv[1] * (4 + st.h * 0.05))}" rx="${f1(rx)}" ry="${f1(ry)}" fill="#1a0503" opacity=".45" filter="url(#blur6)"/>
<ellipse rx="${f1(rx)}" ry="${f1(ry)}" fill="#A9CB7C" stroke="#4C7C34" stroke-width="3.4"/><ellipse rx="${f1(rx * 0.62)}" ry="${f1(ry * 0.58)}" fill="#8f2a14" fill-opacity=".6" stroke="#DCEBB6" stroke-width="2.4"/><path d="M${f1(-rx * 0.7)} ${f1(-ry * 0.3)} Q0 ${f1(-ry * 0.95)} ${f1(rx * 0.6)} ${f1(-ry * 0.4)}" stroke="#F2F8DA" stroke-opacity=".7" stroke-width="2" fill="none" stroke-linecap="round"/></g>`;
      });
      // bundle shadow + bundle
      const bp = bundlePaths(t, L);
      const sx = sv[0] * (14 + 95 * L), sy = sv[1] * (14 + 95 * L);
      s += `<g filter="url(#blur14)" opacity="${(0.28 + 0.14 * L).toFixed(2)}" transform="translate(${f1(sx)} ${f1(sy)})">`;
      bp.forEach((b) => { s += `<path d="${b.d}" stroke="#12090a" stroke-width="${f1(b.w + 4)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`; });
      s += `</g>`;
      bp.forEach((b) => {
        s += `<path d="${b.d}" stroke="#4a0f07" stroke-width="${f1(b.w + 4)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
        s += `<path d="${b.d}" stroke="${b.c}" stroke-width="${f1(b.w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
        s += `<path d="${b.d}" stroke="#EDAE72" stroke-opacity=".6" stroke-width="${f1(b.w * 0.32)}" fill="none" stroke-linecap="round" stroke-dasharray="50 22 80 26" transform="translate(${f1(hlx)} ${f1(hly)})"/>`;
        s += `<path d="${b.d}" stroke="#FFF1E2" stroke-opacity=".6" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-dasharray="16 60 26 44" stroke-dashoffset="${f1(-t * 30 * L)}" transform="translate(${f1(hlx * 1.4)} ${f1(hly * 1.8)})"/>`;
      });
      bseeds.forEach((q) => { const pt = bp[q.b].pts[Math.floor(q.u * 12)]; s += `<ellipse cx="${f1(pt[0])}" cy="${f1(pt[1])}" rx="5.5" ry="3.2" fill="${q.dark ? '#2e211a' : '#F1E6C9'}" transform="rotate(${f1(q.u * 200)} ${f1(pt[0])} ${f1(pt[1])})"/>`; });
      // glints on strand ends
      bp.forEach((b, i) => { if (L > 0.3 && i % 3 === 0) { const p = b.pts[10], g = 0.5 + 0.5 * Math.sin(t * 5 + i); s += `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="${f1(2 + 3 * g)}" fill="#fff" opacity="${(0.5 * g * L).toFixed(2)}"/>`; } });
      // seeds
      seeds.forEach((g) => {
        const st = dropState(g.d, t); if (!st) return;
        s += `<g transform="translate(${f1(g.x)} ${f1(g.y + st.dy)}) rotate(${f1(g.rot + st.rot)}) scale(${(g.s * st.sc).toFixed(2)})" opacity="${st.o.toFixed(2)}"><ellipse cx="${f1(sv[0] * (2 + st.h * 0.04))}" cy="${f1(sv[1] * (2 + st.h * 0.04))}" rx="6" ry="3.4" fill="#1a0503" opacity=".5"/><ellipse rx="6" ry="3.4" fill="${g.dark ? '#2e211a' : '#F1E6C9'}"/><ellipse cx="-1.5" cy="-1" rx="2.6" ry="1.1" fill="${g.dark ? '#6a5645' : '#ffffff'}" opacity=".7"/></g>`;
      });
      s += `</g>`; // end bowl group
      // chopsticks
      const rest = { x: 1000, y: 1300 }, hand = { x: lerp(rest.x, 1010, L), y: lerp(rest.y, 1180, L) };
      const dx = hand.x - tip.x, dy = hand.y - tip.y, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len, px = -uy, py = ux;
      const gapT = lerp(17, 6, Math.max(tip.hold * (1 - eio(seg(t, 3.95, 4.7))), 0)), gapH = 28;
      const sticks = [-1, 1].map((j) => {
        const T = [tip.x + px * j * gapT, tip.y + py * j * gapT], H = [hand.x + px * j * gapH, hand.y + py * j * gapH];
        const q = (u, w) => { const x = lerp(T[0], H[0], u), y = lerp(T[1], H[1], u); return [x + px * w, y + py * w]; };
        return { T, H, q };
      });
      const lift = 1 + 1.2 * L, shx = sv[0] * 14 * lift, shy = sv[1] * 14 * lift;
      s += `<g filter="url(#blur6)" opacity=".38" transform="translate(${f1(shx)} ${f1(shy)})">`;
      sticks.forEach((k) => { const a = k.q(0, -6), b = k.q(0, 6), c = k.q(1, 11), d = k.q(1, -11); s += `<polygon points="${a} ${b} ${c} ${d}" fill="#100808"/>`; });
      s += `</g>`;
      sticks.forEach((k) => {
        const poly = (u0, u1, w0a, w0b, w1a, w1b, fill) => { const wt = (u, side) => 5.5 + 5.5 * u; const a = k.q(u0, -wt(u0) * w0a), b = k.q(u0, wt(u0) * w0b), c = k.q(u1, wt(u1) * w1b), d = k.q(u1, -wt(u1) * w1a); return `<polygon points="${a} ${b} ${c} ${d}" fill="${fill}"/>`; };
        s += poly(0, 1, 1, 1, 1, 1, 'url(#wood)');
        s += poly(0, 1, 0.1, 0.8, 0.1, 0.8, '#E7C494');
        s += poly(0, 1, -0.3, 1, -0.3, 1, '#9A6A3E').replace('<polygon', '<polygon opacity=".0"');
        s += poly(0.82, 1, 1, 1, 1, 1, '#4F3322');
        s += poly(0.78, 0.82, 1, 1, 1, 1, '#2f1f16');
        s += poly(0, 0.1, 1, 1, 1, 1, '#7B4A25').replace('<polygon', '<polygon opacity=".55"');
      });
      // steam
      s += `<g filter="url(#blur14)" style="mix-blend-mode:normal">`;
      steamR.forEach((w, i) => {
        const b = 0.6 + i * 0.5, a = (t - b) / 2.6; if (a <= 0 || a >= 1) return;
        const pts = []; for (let k = 0; k < 7; k++) { const y = 860 - a * 330 - k * 52, x = w.x + Math.sin(k * 0.95 + w.ph + a * 3.2) * (26 + 44 * a) + a * 24 * w.w; pts.push([x, y]); }
        s += `<path d="${smooth(pts)}" stroke="#F4F5F7" stroke-width="${f1(22 + 30 * a)}" fill="none" stroke-linecap="round" opacity="${(0.4 * Math.pow(Math.sin(Math.PI * a), 1.2)).toFixed(3)}"/>`;
      });
      s += `</g></g>`;
      s += `<rect width="1080" height="1920" filter="url(#grain)" opacity=".35"/></svg>`;
      stage.innerHTML = s;
    },
  };
})();
