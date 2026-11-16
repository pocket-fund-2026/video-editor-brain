// Shared helpers for the 2D illustrated food scenes (HTML + SVG, Chromium-rendered). Every scene page defines window.SCENE = { dur, setT(t) } where setT is a PURE function of t (any order);
// the page host (scenes2d/_template.html) calls setT, then sets window.ready = true. Palette = the cafe's own: charcoal #2F2E2C, concrete #7C8088, cool white #F4F5F7, dusty pink #E8A5B3, sage #9AB89D. Food keeps natural colours.
window.K = {
  clamp: (x) => Math.max(0, Math.min(1, x)),
  seg(t, a, b) { return Math.max(0, Math.min(1, (t - a) / (b - a))); },
  lerp: (a, b, k) => a + (b - a) * k,
  eo: (x) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3),
  eio(x) { x = Math.max(0, Math.min(1, x)); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; },
  eob(x, o = 1.5) { x = Math.max(0, Math.min(1, x)); const c = o + 1; return 1 + c * Math.pow(x - 1, 3) + o * Math.pow(x - 1, 2); },
  rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; },
  // SVG <defs> shared by all scenes: grain, soft blur, drop shadows. Put the returned string inside your <svg><defs>.
  defs() {
    return `<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n"/><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 -0.12"/></filter>
<filter id="blur6"><feGaussianBlur stdDeviation="6"/></filter><filter id="blur14"><feGaussianBlur stdDeviation="14"/></filter><filter id="blur30"><feGaussianBlur stdDeviation="30"/></filter><filter id="blur60"><feGaussianBlur stdDeviation="60"/></filter>
<filter id="softshadow" x="-30%" y="-30%" width="160%" height="170%"><feGaussianBlur stdDeviation="14"/></filter>`;
  },
  // The shared concrete counter, 1080x1920: mid-grey concrete with fine grain, soft diagonal window light that drifts slowly with t (seconds). Returns SVG markup (to place first inside your <svg viewBox="0 0 1080 1920">).
  concrete(t, opts = {}) {
    const dx = (opts.drift ?? 18) * t, base = opts.base ?? '#80848B';
    return `<rect width="1080" height="1920" fill="${base}"/>
<g filter="url(#blur60)" opacity="0.55"><polygon points="${-200 + dx},-100 ${220 + dx},-100 ${940 + dx},2100 ${520 + dx},2100" fill="#A9ADB3"/><polygon points="${420 + dx},-100 ${640 + dx},-100 ${1360 + dx},2100 ${1140 + dx},2100" fill="#6C7077"/></g>
<g filter="url(#blur30)" opacity="0.28"><polygon points="${-100 + dx * 1.2},300 1300,${520 + dx * 0.4} 1300,${700 + dx * 0.4} ${-100 + dx * 1.2},480" fill="#3A3C40"/></g>
<rect width="1080" height="1920" filter="url(#grain)" opacity="0.5"/>`;
  },
};
