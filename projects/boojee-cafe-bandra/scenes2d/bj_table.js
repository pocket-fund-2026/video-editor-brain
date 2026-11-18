// Shared table + plate for the Boojee 2D food scenes (top-down, 1080x1920). Chalk plaster table, black ceramic plate, mint tea-towel stripe. Pure functions of t.
window.BJ = {
  defs() {
    return K.defs() + `<filter id="plaster" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.007 0.011" numOctaves="4" seed="3"/><feColorMatrix type="matrix" values="0 0 0 0 .42  0 0 0 0 .43  0 0 0 0 .41  0 0 0 .95 -.36"/></filter>
<filter id="paper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="8"/><feColorMatrix type="matrix" values="0 0 0 0 .1  0 0 0 0 .1  0 0 0 0 .1  0 0 0 .35 -.08"/></filter>
<filter id="blur3"><feGaussianBlur stdDeviation="3"/></filter><filter id="blur9"><feGaussianBlur stdDeviation="9"/></filter><filter id="blur20"><feGaussianBlur stdDeviation="20"/></filter>
<radialGradient id="plateG" cx="42%" cy="38%" r="75%"><stop offset="0" stop-color="#26262A"/><stop offset="1" stop-color="#0B0B0C"/></radialGradient>`;
  },
  table(t, towel = { x: -120, y: 270, rot: -14 }) {
    const dx = 14 * t;
    return `<rect width="1080" height="1920" fill="#F2F3F0"/>
<rect width="1080" height="1920" filter="url(#plaster)" opacity=".55"/>
<g filter="url(#blur60)" opacity=".7"><polygon points="${-200 + dx},-100 ${180 + dx},-100 ${900 + dx},2100 ${520 + dx},2100" fill="#FFFFFF"/><polygon points="${520 + dx},-100 ${700 + dx},-100 ${1420 + dx},2100 ${1240 + dx},2100" fill="#C4C8C4"/></g>
<g transform="translate(${towel.x} ${towel.y}) rotate(${towel.rot})"><rect x="0" y="10" width="1500" height="170" fill="#000" opacity=".16" filter="url(#blur14)"/><rect width="1500" height="170" fill="#19C9A0"/><rect y="22" width="1500" height="9" fill="#0B0B0C"/><rect y="139" width="1500" height="9" fill="#0B0B0C"/><rect width="1500" height="170" filter="url(#paper)" opacity=".6"/></g>
<rect width="1080" height="1920" filter="url(#grain)" opacity=".18"/>`;
  },
  plate(cx, cy, r) {
    return `<ellipse cx="${cx + 16}" cy="${cy + 30}" rx="${r}" ry="${r}" fill="#000" opacity=".3" filter="url(#blur30)"/>
<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#plateG)"/><circle cx="${cx}" cy="${cy}" r="${r - 5}" fill="none" stroke="#3A3A3E" stroke-width="3" opacity=".8"/>
<circle cx="${cx}" cy="${cy}" r="${r * 0.84}" fill="none" stroke="#000" stroke-width="10" opacity=".55"/><circle cx="${cx}" cy="${cy}" r="${r * 0.84 + 7}" fill="none" stroke="#4A4A50" stroke-width="2" opacity=".5"/>
<path d="M ${cx - r * 0.78},${cy - r * 0.34} A ${r * 0.86} ${r * 0.86} 0 0 1 ${cx - r * 0.2},${cy - r * 0.84}" fill="none" stroke="#fff" stroke-width="14" opacity=".1" stroke-linecap="round" filter="url(#blur6)"/>`;
  },
};
