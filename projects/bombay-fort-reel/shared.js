window.FortMap = (function () {
  let D = null;
  const c01 = (x) => Math.max(0, Math.min(1, x));
  function load(kit) {
    if (D) return D;
    const raw = kit.json('map.json');
    const unpack = (p) => { const a = []; for (let i = 0; i < p.length; i += 2) a.push([p[i], p[i + 1]]); return a; };
    D = { B: [], R: [], G: [], bch: raw.bch };
    raw.b.forEach((o) => {
      const pts = unpack(o.p); let cx = 0, cy = 0;
      pts.forEach((q) => { cx += q[0]; cy += q[1]; });
      D.B.push({ pts, h: o.h, cx: cx / pts.length, cy: cy / pts.length });
    });
    raw.r.forEach((o) => D.R.push({ pts: unpack(o.p), w: o.w }));
    raw.g.forEach((o) => D.G.push({ pts: unpack(o.p) }));
    let best = 1e9;
    D.B.forEach((b, i) => { const d = Math.hypot(b.cx, b.cy); if (d < best) { best = d; D.bri = i; } });
    return D;
  }
  let C = null;
  function loadCity(kit) {
    if (C) return C;
    const raw = kit.json('mumbai.json');
    const un = (p) => { const a = []; for (let i = 0; i < p.length; i += 2) a.push([p[i], p[i + 1]]); return a; };
    C = { rings: raw.rings.map(un), roads: raw.roads.map(un), foot: raw.foot.map(un) };
    return C;
  }
  function project(cam, x, y, h) {
    const a = cam.rot, dx = x - cam.fx, dy = y - cam.fy;
    const rx = dx * Math.cos(a) - dy * Math.sin(a), ry = dx * Math.sin(a) + dy * Math.cos(a);
    return [cam.W / 2 + rx * cam.s, cam.H / 2 + ry * cam.s * cam.k - (h || 0) * cam.s * cam.hk, ry];
  }
  function draw(ctx, cam, o) {
    o = o || {};
    const rise = o.rise == null ? 1 : o.rise, hi = o.hi || 0, ra = o.roads == null ? 1 : o.roads;
    ctx.clearRect(0, 0, cam.W, cam.H);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (o.city && C) {
      const trace = (pts) => { ctx.beginPath(); pts.forEach((q, i) => { const p = project(cam, q[0], q[1], 0); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); };
      C.rings.forEach((r) => { trace(r); ctx.closePath(); ctx.fillStyle = 'rgb(31,46,54)'; ctx.fill(); ctx.lineWidth = 3.2; ctx.strokeStyle = 'rgba(232,176,74,0.9)'; ctx.stroke(); });
      const ma = o.mid || 0;
      if (ma > 0.01) {
        C.foot.forEach((f) => { trace(f); ctx.closePath(); ctx.fillStyle = 'rgba(232,176,74,' + 0.2 * ma + ')'; ctx.fill(); });
        C.roads.forEach((r) => { trace(r); ctx.lineWidth = 1.3; ctx.strokeStyle = 'rgba(232,176,74,' + 0.5 * ma + ')'; ctx.stroke(); });
      }
    }
    if (o.hl && o.hl.a > 0.005) {
      const hp = project(cam, 0, 0, 0), rr = Math.max(80, Math.min(300, o.hl.r * cam.s));
      ctx.save(); ctx.translate(hp[0], hp[1]); ctx.scale(1, cam.k);
      const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, rr);
      gr.addColorStop(0, 'rgba(232,176,74,' + 0.62 * o.hl.a + ')'); gr.addColorStop(0.55, 'rgba(232,176,74,' + 0.22 * o.hl.a + ')'); gr.addColorStop(1, 'rgba(232,176,74,0)');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, rr, 0, 7); ctx.fill();
      ctx.setLineDash([10, 10]); ctx.lineDashOffset = -(o.hl.t || 0) * 24; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(238,243,244,' + 0.85 * o.hl.a + ')';
      ctx.beginPath(); ctx.arc(0, 0, rr * 0.62, 0, 7); ctx.stroke(); ctx.restore();
    }
    D.G.forEach((g) => {
      ctx.beginPath();
      g.pts.forEach((q, i) => { const p = project(cam, q[0], q[1], 0); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
      ctx.closePath(); ctx.fillStyle = 'rgba(95,208,219,0.07)'; ctx.fill();
    });
    D.R.forEach((r) => {
      ctx.beginPath();
      r.pts.forEach((q, i) => { const p = project(cam, q[0], q[1], 0); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
      ctx.lineWidth = Math.max(1.4, r.w * cam.s * 0.42);
      ctx.strokeStyle = 'rgba(232,176,74,' + (0.5 * ra) + ')'; ctx.stroke();
    });
    const order = D.B.map((b, i) => ({ i, d: project(cam, b.cx, b.cy, 0)[2] })).sort((a, b) => a.d - b.d);
    order.forEach((e) => {
      const b = D.B[e.i], isB = e.i === D.bri;
      const dist = Math.hypot(b.cx, b.cy);
      const g = c01(rise * 1.9 - dist / 380); const gg = g * g * (3 - 2 * g);
      if (gg <= 0.001) return;
      const hh = b.h * gg * (isB ? 1.35 : 1);
      const n = b.pts.length;
      for (let k = 0; k < n; k++) {
        const A = b.pts[k], B = b.pts[(k + 1) % n];
        const a0 = project(cam, A[0], A[1], 0), b0 = project(cam, B[0], B[1], 0);
        const a1 = project(cam, A[0], A[1], hh), b1 = project(cam, B[0], B[1], hh);
        const nx = Math.atan2(B[1] - A[1], B[0] - A[0]) + cam.rot;
        const lit = 0.5 + 0.5 * Math.sin(nx);
        ctx.beginPath(); ctx.moveTo(a0[0], a0[1]); ctx.lineTo(b0[0], b0[1]); ctx.lineTo(b1[0], b1[1]); ctx.lineTo(a1[0], a1[1]); ctx.closePath();
        const base = isB ? [150, 112, 40] : [32, 46, 54];
        const m = isB ? 1 : 1 + lit * 1.1;
        ctx.fillStyle = 'rgb(' + Math.round(base[0] * m) + ',' + Math.round(base[1] * m) + ',' + Math.round(base[2] * m) + ')'; ctx.fill();
      }
      ctx.beginPath();
      b.pts.forEach((q, k) => { const p = project(cam, q[0], q[1], hh); k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
      ctx.closePath();
      ctx.fillStyle = isB ? 'rgb(232,176,74)' : 'rgb(62,86,98)'; ctx.fill();
      ctx.lineWidth = isB ? 2.5 : 1.2; ctx.strokeStyle = isB ? 'rgba(238,243,244,0.9)' : 'rgba(232,176,74,0.38)'; ctx.stroke();
    });
    if (o.pins) o.pins.forEach((pn) => {
      const p = project(cam, pn.x, pn.y, 0); const t = pn.t || 0;
      for (let k = 0; k < 2; k++) {
        const ph = ((t * 0.5 + k * 0.5) % 1), rr = pn.fixed ? (10 + ph * 70) * Math.max(1, cam.s / 1.6) : (14 + ph * 70) * (cam.s / 1.6);
        ctx.beginPath(); ctx.ellipse(p[0], p[1], rr, rr * cam.k, 0, 0, 7);
        ctx.strokeStyle = 'rgba(232,176,74,' + (0.7 * (1 - ph) * (pn.a == null ? 1 : pn.a)) + ')'; ctx.lineWidth = 3; ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(p[0], p[1] - 4, 11 * (pn.a == null ? 1 : pn.a), 0, 7);
      ctx.fillStyle = pn.color || 'rgb(232,176,74)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgb(11,16,19)'; ctx.stroke();
    });
  }
  return { load, loadCity, project, draw, get data() { return D; } };
})();
window.Logo = {
  svg(p, size) {
    return '<svg viewBox="0 0 512 512" width="' + size + '" height="' + size + '"><defs>' +
      '<linearGradient id="' + p + 'g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2216"/><stop offset="1" stop-color="#22120b"/></linearGradient>' +
      '<linearGradient id="' + p + 'p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#efe0c8"/></linearGradient></defs>' +
      '<rect width="512" height="512" rx="114" fill="url(#' + p + 'g)"/>' +
      '<path d="M340 232c34 4 56 26 56 60s-27 60-64 60" fill="none" stroke="url(#' + p + 'p)" stroke-width="26" stroke-linecap="round"/>' +
      '<path d="M136 210h208l-24 168a40 40 0 0 1-40 34h-80a40 40 0 0 1-40-34z" fill="url(#' + p + 'p)"/>' +
      '<path d="M136 210h208l-9 62H145z" fill="#b5651d"/>' +
      '<g class="' + p + 'st" fill="none" stroke="url(#' + p + 'p)" stroke-width="21" stroke-linecap="round" opacity="0.92">' +
      '<path pathLength="1" d="M205 186c-18-20 18-32 0-52s18-32 0-52"/><path pathLength="1" d="M275 186c-18-20 18-32 0-52s18-32 0-52"/></g></svg>';
  },
  steam(root, p, t) {
    root.querySelectorAll('.' + p + 'st path').forEach((e, i) => {
      e.setAttribute('stroke-dasharray', '0.62 1.2');
      e.setAttribute('stroke-dashoffset', String(0.55 - ((t * 0.5 + i * 0.35) % 1.5)));
    });
  },
};
