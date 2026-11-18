// ALMOND CROISSANT: a croissant on a matte black plate against the white plaster wall, slow push-in; it is pulled apart, almond cream stretches in strings and snaps, flakes and sugar fall. setT is PURE.
// Timeline (dur 5.6): push-in 0-5.6 | pull apart 0.9-2.4 | cream strings stretch then snap 2.35-2.8 | flakes fall 1.0-2.4 (land on plate) | sugar dust 0.8-3.8. No pours.
(function () {
  const { clamp, seg, lerp, eo, eio, eob, rng } = K;
  const f = (n) => Math.round(n * 10) / 10;
  const INK = '#0B0B0C', MINT = '#19C9A0', WALL = '#F2F3F0';
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

  const PX = 540, PY = 1070, S = 0.98;
  const R = rng(2024);
  const falling = [];
  for (let i = 0; i < 16; i++) falling.push({ x: 540 + (R() - .5) * 560, t0: 1.0 + R() * 1.5, ly: PY - 150 + R() * 330, rot0: R() * 360, spin: (R() - .5) * 700, s: 0.7 + R() * 0.5 });
  const sugar = [];
  for (let i = 0; i < 150; i++) sugar.push({ x: 540 + (R() - .5) * 700, y0: 700 + R() * 160, t0: 0.8 + R() * 2.8, v: 120 + R() * 140, dr: (R() - .5) * 60, r: 0.9 + R() * 2.2 });
  const strands = [{ dy: -55, ts: 2.38, w: 40 }, { dy: 4, ts: 2.6, w: 48 }, { dy: 62, ts: 2.8, w: 36 }];
  const FACE = '#F8F4EA';

  function face(side, open, seed) {
    const fw = 70 * open; if (fw < 2) return '';
    const r = rng(seed); let cells = '';
    for (let i = 0; i < 46; i++) { const a = r() * Math.PI * 2, rr = Math.sqrt(r()); const cx = side * Math.abs(Math.cos(a) * rr * fw * .8), cy = -6 + Math.sin(a) * rr * 118; cells += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(5 + r() * 12)}" ry="${f(4 + r() * 9)}" fill="${r() > .5 ? '#D8C7A3' : '#E9E4D8'}" opacity="${f(.5 + r() * .4)}"/>`; }
    let lines = ''; for (let i = -3; i <= 3; i++) lines += `<path d="M${f(side * fw * .1)} ${f(-6 + i * 34 - 20)} Q${f(side * fw * .85)} ${f(-6 + i * 34)} ${f(side * fw * .1)} ${f(-6 + i * 34 + 22)}" fill="none" stroke="#A06E32" stroke-opacity=".4" stroke-width="4" stroke-linecap="round"/>`;
    return `<clipPath id="fc${seed}"><ellipse cx="0" cy="-6" rx="${f(fw)}" ry="124"/></clipPath>
<ellipse cx="0" cy="-6" rx="${f(fw + 9)}" ry="133" fill="#C4843C"/><ellipse cx="0" cy="-6" rx="${f(fw)}" ry="124" fill="#F0E9D6"/>
<g clip-path="url(#fc${seed})">${cells}${lines}<ellipse cx="${f(side * fw * .45)}" cy="-8" rx="${f(fw * .52)}" ry="52" fill="${FACE}"/><ellipse cx="${f(side * fw * .5)}" cy="-18" rx="${f(fw * .3)}" ry="20" fill="#FFFFFF" opacity=".6"/></g>`;
  }

  window.SCENE = {
    dur: 5.6,
    setT(t, stage) {
      const push = eio(t / 5.6), cam = lerp(1, 1.13, push), camY = lerp(0, -40, push);
      const open = eio(seg(t, 0.9, 2.4)); const d = 128 * open + 22 * eo(seg(t, 2.4, 5.6)), rot = 4.5 * open;
      const TL = `translate(${f(-d)} 0) rotate(${f(-rot)} -200 130)`, TR = `translate(${f(d)} 0) rotate(${f(rot)} 200 130)`;
      const body = croissant();
      const halves = `<g transform="translate(${PX} ${PY - 40}) scale(${S})">
<g clip-path="url(#clipL)" transform="${TL}">${body}</g><g clip-path="url(#clipR)" transform="${TR}">${body}</g>
<g transform="${TL}">${face(1, open, 11)}</g><g transform="${TR}">${face(-1, open, 12)}</g></g>`;
      let cream = '';
      const ax = PX - S * d + S * 6, bx = PX + S * d - S * 6, span = bx - ax;
      strands.forEach((s, i) => {
        const y = PY - 40 + S * (s.dy - 6);
        if (open < 0.3) return;
        if (t < s.ts) {
          const w = lerp(s.w, 4, Math.pow(seg(t, 1.2, s.ts), 0.9)) * S, sag = 38 * (1 - open * 0.5) + 14 * Math.sin(t * 5 + i);
          const P = (yy) => `M${f(ax)} ${f(yy)} C${f(ax + span * .33)} ${f(yy + sag)} ${f(ax + span * .66)} ${f(yy + sag)} ${f(bx)} ${f(yy)}`;
          cream += `<path d="${P(y)}" fill="none" stroke="#F8F4EA" stroke-width="${f(w)}" stroke-linecap="round"/><path d="${P(y - 3)}" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="${f(w * .3)}" stroke-linecap="round"/>`;
        } else {
          const k = eo(seg(t, s.ts, s.ts + 0.55)), len = span * 0.45 * (1 - k * 0.8), fall = 70 * k, w = 6 * S + 4;
          [[ax, 1], [bx, -1]].forEach(([x0, dir]) => {
            const x1 = x0 + dir * len;
            cream += `<path d="M${f(x0)} ${f(y)} Q${f((x0 + x1) / 2)} ${f(y + fall * .4)} ${f(x1)} ${f(y + fall)}" fill="none" stroke="#F8F4EA" stroke-width="${f(w)}" stroke-linecap="round"/><circle cx="${f(x1)}" cy="${f(y + fall)}" r="${f(w * 0.95)}" fill="#F8F4EA"/>`;
          });
        }
      });
      let fl = '';
      for (const o of falling) {
        const dt = t - o.t0; if (dt < 0) continue;
        const g = 2600, y0 = 560, tl = Math.sqrt(2 * Math.max(1, o.ly - y0) / g);
        const y = dt < tl ? y0 + 0.5 * g * dt * dt : o.ly - 14 * Math.exp(-(dt - tl) * 9) * Math.abs(Math.sin((dt - tl) * 18));
        fl += flake(o.x, y, dt < tl ? o.rot0 + o.spin * dt : o.rot0 + o.spin * tl, o.s * 1.5);
      }
      let sg = '';
      for (const p of sugar) { const dt = t - p.t0; if (dt < 0 || dt > 2.4) continue; sg += `<circle cx="${f(p.x + p.dr * dt + Math.sin(dt * 3 + p.x) * 6)}" cy="${f(p.y0 + p.v * dt)}" r="${f(p.r)}" fill="#fff" opacity="${f(0.9 * Math.min(1, dt * 4) * (1 - seg(dt, 1.7, 2.4)))}"/>`; }
      const plate = `<ellipse cx="${PX}" cy="${PY + 50}" rx="510" ry="500" fill="#000" opacity=".28" filter="url(#blur30)"/>
<circle cx="${PX}" cy="${PY}" r="500" fill="${INK}"/><circle cx="${PX}" cy="${PY}" r="466" fill="none" stroke="${MINT}" stroke-width="5"/><circle cx="${PX}" cy="${PY}" r="420" fill="none" stroke="#2A2B2E" stroke-width="4"/>
<ellipse cx="${PX - 170}" cy="${PY - 330}" rx="190" ry="50" fill="#fff" opacity=".07" transform="rotate(-30 ${PX - 170} ${PY - 330})"/>`;
      stage.innerHTML = `<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg"><defs>${K.defs()}
<filter id="plaster" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.006 0.009" numOctaves="3" seed="12"/><feColorMatrix type="matrix" values="0 0 0 0 .55  0 0 0 0 .56  0 0 0 0 .55  0 0 0 .9 -.28"/></filter>
<linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D29650"/><stop offset=".55" stop-color="#C4843C"/><stop offset="1" stop-color="#A06E32"/></linearGradient>
<clipPath id="clipL"><rect x="-700" y="-400" width="700" height="800"/></clipPath><clipPath id="clipR"><rect x="0" y="-400" width="700" height="800"/></clipPath></defs>
<g transform="translate(540 1040) scale(${f(cam * 1000) / 1000}) translate(-540 ${f(-1040 - camY)})">
${wall(t)}${plate}${halves}${cream}${fl}${sg}
</g></svg>`;
    }
  };
})();
