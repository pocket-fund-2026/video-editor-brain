// records.coffee by Veranda, Pali Hill reel for Bombay Cafe Map: "Window Light". raea composition (React/TS). Only the map is a rendered clip (three.js, media/clips/map.mp4);
// everything else (window-light name reveal, record-spine shelf, key tag, score meters, rank stamp, venetian-blind wipe, end card) is raea. Every caption and animation reads src/cues.ts (voice word times, L046).
// Palette: forest #0E4A33, pale pink #F7C9D4, room white #F4FAF6. No orange, no cream. Voice: Kokoro heart (L063). Name first (L051). Only facts from the cafe's bombaycafemap.com page.
import { AbsoluteFill, Composition, Img, Sequence, Video, registerRoot, staticFile, useCurrentFrame } from "raea";
import { CLIPS, TOTAL } from "./src/cues";

const FPS = 30;
const FOREST = "#0E4A33", DEEP = "#072A1D", MID = "#1D6B4B", PINK = "#F7C9D4", WHITE = "#F4FAF6", INK = "#05160F", SOFTPINK = "#FFE3E9";
const S = { map: 3.9, food: 7.7, end: 13.7 };       // scene starts (s); user chose 15-20 s so the scenes are short (L053 exception)
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const eo = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const eio = (x: number) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const eob = (x: number, o = 1.5) => { x = clamp(x); const c = o + 1; return 1 + c * Math.pow(x - 1, 3) + o * Math.pow(x - 1, 2); };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const W = (clip: string, i: number) => CLIPS[clip].words[i];
const abs = (l: number, t: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: "absolute", left: l, top: t, ...extra });
const hash = (i: number) => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };
const CSS = `
@font-face{font-family:'Bric';src:url(${staticFile("fonts/Bricolage.ttf")});font-weight:200 800}
@font-face{font-family:'DM Mono';src:url(${staticFile("fonts/DMMono-Regular.ttf")});font-weight:400}
@font-face{font-family:'DM Mono';src:url(${staticFile("fonts/DMMono-Medium.ttf")});font-weight:500}`;
const disp = (size: number, wght = 800, color = WHITE): React.CSSProperties => ({ fontFamily: "'Bric'", fontSize: size, fontWeight: wght, lineHeight: 0.9, color, letterSpacing: -size * 0.025 });
const mono = (size: number, color = PINK): React.CSSProperties => ({ fontFamily: "'DM Mono'", fontSize: size, fontWeight: 500, letterSpacing: size * 0.1, textTransform: "uppercase", color });

// ------------------------------------------------------------ scene 1: window light sweeps across, reveals the name; a shelf of record spines rises, one is pulled out for "Veranda"
const SPINE_COLORS = [PINK, WHITE, MID, DEEP, PINK, MID, WHITE, DEEP];
function Spines({ t }: { t: number }) {
  const n = 21, w = 1080 / n, vera = W("v1", 3), pull = eob(seg(t, vera.t0 - 0.05, vera.t0 + 0.45), 1.4), out = 1 - eo(seg(t, S.map - 0.35, S.map + 0.1));
  return (
    <div style={{ opacity: out }}>
      {Array.from({ length: n }).map((_, i) => {
        const h = 380 + Math.round(hash(i + 3) * 100), up = eob(seg(t, 0.25 + i * 0.045, 0.85 + i * 0.045), 1.2), pulled = i === 9 ? pull : 0;
        const col = pulled > 0.5 ? PINK : SPINE_COLORS[i % SPINE_COLORS.length], band = col === PINK || col === WHITE ? FOREST : PINK;
        return (
          <div key={i} style={abs(i * w + 2, 1760 - h, { width: w - 5, height: h + 40, background: col, borderRadius: "6px 6px 0 0", transform: `translateY(${(1 - up) * 640 - pulled * 150}px)`, boxShadow: `0 0 0 2px ${INK}`, overflow: "hidden" })}>
            <div style={abs(0, h * 0.14, { width: "100%", height: 10, background: band })} />
            <div style={abs((w - 5) / 2 - 11, h * 0.14 + 40, { width: 22, height: 22, borderRadius: 11, background: band, opacity: 0.9 })} />
            {i === 9 && <div style={abs(0, h * 0.45, { width: "100%", writingMode: "vertical-rl", textAlign: "center", ...mono(26, FOREST), opacity: pull })}>by Veranda</div>}
          </div>
        );
      })}
    </div>
  );
}
function Hook({ t }: { t: number }) {
  if (t > S.map + 0.3) return null;
  const k = 0.38 + 0.62 * eio(seg(t, 0.1, 1.9)), out = 1 - eo(seg(t, S.map - 0.35, S.map + 0.1)), x = lerp(-420, 1500, eio(seg(t, 0.1, 1.9)));
  const pali = W("v1", 4), hill = W("v1", 5), tg = eob(seg(t, pali.t0 - 0.05, pali.t0 + 0.4), 1.3), by = W("v1", 2), kb = eo(seg(t, by.t0 - 0.03, by.t0 + 0.3));
  const settle = 1 + 0.025 * seg(t, 1.9, S.map);
  return (
    <div style={{ opacity: out }}>
      <div style={abs(0, 0, { width: 1080, height: 1920, background: FOREST })} /><div style={abs(560, -120, { width: 900, height: 900, borderRadius: 450, background: MID })} />
      <div style={abs(64, 330, { clipPath: `inset(0 ${(1 - k) * 100}% 0 0)`, transform: `scale(${settle})`, transformOrigin: "0 0" })}>
        <div style={disp(250, 800, PINK)}>records</div>
        <div style={{ ...disp(250, 800, WHITE), marginTop: 10 }}>.coffee</div>
      </div>
      {/* the window light: a soft shaft with two mullion shadows crosses the wall */}
      <div style={abs(x, -200, { width: 380, height: 2300, transform: "rotate(-13deg)", background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.20), rgba(255,255,255,0))", opacity: 1 - eo(seg(t, 1.6, 2.1)) })}>
        <div style={abs(125, 0, { width: 12, height: 2300, background: "rgba(5,22,15,0.35)" })} /><div style={abs(250, 0, { width: 12, height: 2300, background: "rgba(5,22,15,0.35)" })} />
      </div>
      <div style={abs(70, 870, { opacity: kb, transform: `translateX(${(1 - kb) * -40}px)`, ...mono(38, PINK) })}>by Veranda</div>
      <div style={abs(64, 960, { opacity: Math.min(1, tg * 2), transform: `translateY(${(1 - tg) * 40}px)`, display: "flex", alignItems: "center", columnGap: 16, background: PINK, padding: "12px 28px 10px", borderRadius: 40 })}>
        <div style={{ ...disp(46, 700, FOREST), whiteSpace: "nowrap" }}>Pali Hill</div>
        <div style={{ ...mono(26, FOREST), opacity: t >= hill.t0 - 0.02 ? 1 : 0.4 }}>· Bandra</div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ scene 2: map labels, a hotel key tag swings in on "boutique hotel", street name lights word by word
function MapLabels({ t }: { t: number }) {
  if (t < S.map + 0.2 || t >= S.food + 0.1) return null;
  const a = W("v2", 2), fade = 1 - eo(seg(t, S.food - 0.45, S.food - 0.1)), inn = eo(seg(t, S.map + 0.3, S.map + 0.8)) * fade;
  const u = Math.max(0, t - (a.t0 - 0.05)), swing = t < a.t0 - 0.05 ? 0 : 16 * Math.exp(-2.4 * u) * Math.cos(8.5 * u + 0.4), drop = eob(seg(t, a.t0 - 0.05, a.t0 + 0.45), 1.1);
  const road = [5, 6, 7].map((i) => W("v2", i));
  return (
    <>
      <div style={abs(0, 1010, { width: 1000, height: 470, background: DEEP, opacity: 0.93 * inn })} />
      <div style={abs(64, 1050, { opacity: inn, ...mono(28, PINK) })}>Pali Hill · Bandra West · Mumbai</div>
      <div style={abs(64, 1110, { display: "flex", flexWrap: "wrap", columnGap: 22, opacity: inn })}>
        {["Pali", "Pathar", "Road"].map((w, i) => { const f = eo(seg(t, road[i].t0 - 0.02, road[i].t0 + 0.25)); return <div key={i} style={{ ...disp(118, 800, f > 0.5 ? WHITE : "#4B7F68"), opacity: 0.35 + 0.65 * f, whiteSpace: "nowrap" }}>{w}</div>; })}
      </div>
      <div style={abs(64, 1400, { ...mono(24, WHITE), background: INK, padding: "6px 12px 4px", opacity: inn })}>Map data: OpenStreetMap contributors</div>
      {/* hotel key tag: hangs from a hook below the app's top zone and swings like a pendulum */}
      <div style={abs(790, 240, { width: 0, height: 0, opacity: fade * Math.min(1, drop * 2), transform: `rotate(${swing}deg) scale(${0.6 + 0.4 * drop})`, transformOrigin: "0 0" })}>
        <div style={abs(-4, 0, { width: 8, height: 120, background: PINK })} />
        <div style={abs(-110, 112, { width: 220, height: 300, borderRadius: 26, background: PINK, boxShadow: `0 10px 0 ${INK}`, padding: "70px 0 0", textAlign: "center" })}>
          <div style={abs(88, 22, { width: 44, height: 44, borderRadius: 22, background: FOREST })} />
          <div style={{ ...mono(24, FOREST) }}>Inside a</div>
          <div style={{ ...disp(54, 800, FOREST), marginTop: 10 }}>boutique</div>
          <div style={{ ...disp(54, 800, FOREST), marginTop: 4 }}>hotel</div>
        </div>
      </div>
      <div style={abs(780, 230, { width: 24, height: 24, borderRadius: 12, background: PINK, opacity: fade * Math.min(1, drop * 2), boxShadow: `0 0 0 4px ${INK}` })} />
    </>
  );
}

// ------------------------------------------------------------ persistent: Bombay Cafe Map bar logo (from scene 2), cafe name tag in every scene after the hook
function BarLogo({ t }: { t: number }) {
  if (t < S.map + 0.15 || t >= S.end) return null; const k = eo(seg(t, S.map + 0.15, S.map + 0.55)) * (1 - eo(seg(t, S.end - 0.4, S.end - 0.1)));
  return <div style={abs(64, 60, { width: 470, height: 115, borderRadius: 22, background: WHITE, opacity: 0.96 * k, overflow: "hidden", boxShadow: `0 0 0 4px ${INK}` })}><Img src={staticFile("brand/bombaycafemap-lockup-horizontal.png")} style={abs(0, 0, { width: 470, height: 115, objectFit: "contain" })} /></div>;
}
function NameTag({ t }: { t: number }) {
  if (t < S.map + 0.25 || t >= S.end) return null; const k = eob(seg(t, S.map + 0.25, S.map + 0.65), 1.3) * (1 - eo(seg(t, S.end - 0.4, S.end - 0.1)));
  return (
    <div style={abs(64, 232, { opacity: k, transform: `translateX(${(1 - k) * -80}px)` })}>
      <div style={{ background: PINK, padding: "8px 24px 8px", ...disp(56, 800, FOREST), whiteSpace: "nowrap", letterSpacing: -1 }}>records.coffee</div>
    </div>
  );
}

// ------------------------------------------------------------ scene 3: three real items, each with its own motion (layers rise, cream stacks and drizzle draws, pastry splits open)
const COFFEE = "#6B3E1D", MILK = "#F0E9D6", CREAM = "#FFF8E6", CHOC = "#3B2314", HAZ = "#B98A55", HAZD = "#8A531F", CRUST = "#C4843C", CRUSTD = "#A8692C";
function Straw({ u, x, y0, d }: { u: number; x: number; y0: number; d: number }) {
  const k = eo(seg(u, d, d + 0.5));
  return <g transform={`translate(${x} ${y0 - (1 - k) * 260}) rotate(9)`} opacity={Math.min(1, k * 3)}><rect x={-9} y={0} width={18} height={470} rx={9} fill={PINK} /><rect x={-9} y={40} width={18} height={26} fill={WHITE} /><rect x={-9} y={110} width={18} height={26} fill={WHITE} /><rect x={-9} y={180} width={18} height={26} fill={WHITE} /></g>;
}
const GLASS = "M410 650 L670 650 L632 1180 Q630 1200 610 1200 L470 1200 Q450 1200 448 1180 Z";
function Latte({ u }: { u: number }) {
  const milk = 150 * eo(seg(u, 0.2, 0.65)), top = lerp(1050, 780, eo(seg(u, 0.5, 1.05))), sw = eo(seg(u, 1.0, 1.4));
  return (
    <g>
      <clipPath id="gA"><path d={GLASS} /></clipPath>
      <path d={GLASS} fill="rgba(255,255,255,0.10)" />
      <g clipPath="url(#gA)">
        <rect x={400} y={1200 - milk} width={290} height={milk} fill={MILK} />
        <rect x={400} y={top} width={290} height={Math.max(0, 1050 - top)} fill={COFFEE} opacity={milk > 140 ? 1 : 0} />
        <path d="M455 905 C 510 850, 575 960, 640 880" stroke={MILK} strokeWidth={15} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - sw} opacity={top < 900 ? 1 : 0} />
        {[0, 1, 2, 3, 4].map((i) => { const tx = [470, 560, 610, 505, 585][i], ty = [830, 850, 925, 940, 780][i], k = eob(seg(u, 0.85 + i * 0.12, 1.35 + i * 0.12), 1.5), bob = Math.sin(u * 4 + i) * 4 * seg(u, 1.4, 1.6);
          return <rect key={i} x={tx - 34} y={ty - 34 - (1 - k) * 420 + bob} width={68} height={68} rx={12} fill="rgba(255,255,255,0.5)" stroke={WHITE} strokeWidth={3} transform={`rotate(${(i * 23) % 40 - 15} ${tx} ${ty})`} />; })}
      </g>
      <path d={GLASS} fill="none" stroke={WHITE} strokeWidth={9} strokeLinejoin="round" />
      {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={[440, 462, 650, 625, 468, 640][i]} cy={[700, 880, 760, 1000, 1060, 1100][i]} r={7} fill={WHITE} opacity={0.55 * eo(seg(u, 1.4 + i * 0.07, 1.7 + i * 0.07))} />)}
      <Straw u={u} x={560} y0={560} d={1.2} />
    </g>
  );
}
const CUP = "M430 760 L650 760 L616 1160 Q612 1190 585 1190 L495 1190 Q468 1190 464 1160 Z";
function Frappe({ u }: { u: number }) {
  const fill = lerp(1190, 800, eo(seg(u, 0.05, 0.55))), dr = [0, 1, 2].map((i) => eo(seg(u, 0.95 + i * 0.12, 1.3 + i * 0.12)));
  return (
    <g>
      <clipPath id="gB"><path d={CUP} /></clipPath>
      <path d={CUP} fill="rgba(255,255,255,0.10)" />
      <g clipPath="url(#gB)"><rect x={420} y={fill} width={240} height={1200 - fill} fill={HAZ} /><rect x={420} y={fill} width={240} height={26} fill="#D2B084" /></g>
      <path d={CUP} fill="none" stroke={WHITE} strokeWidth={9} strokeLinejoin="round" />
      <Straw u={u} x={600} y0={520} d={0.45} />
      {[[540, 748, 132, 40], [540, 702, 104, 38], [540, 662, 70, 34]].map(([cx, cy, rx, ry], i) => { const k = eob(seg(u, 0.5 + i * 0.14, 0.9 + i * 0.14), 1.5); return <ellipse key={i} cx={cx} cy={cy + (1 - k) * 30} rx={rx * k} ry={ry * k} fill={CREAM} stroke={MILK} strokeWidth={4} />; })}
      {["M450 740 C 500 700, 580 790, 635 735", "M470 700 C 520 670, 570 730, 612 695", "M505 662 C 530 640, 556 676, 578 652"].map((d, i) => <path key={i} d={d} stroke={CHOC} strokeWidth={11} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - dr[i]} />)}
      {[[470, 742], [615, 738], [520, 640], [568, 646], [545, 610]].map(([cx, cy], i) => { const k = eob(seg(u, 1.1 + i * 0.1, 1.5 + i * 0.1), 1.8); return <g key={i} transform={`translate(${cx} ${cy - (1 - k) * 90}) scale(${k})`}><circle r={21} fill={HAZD} /><circle cx={-6} cy={-7} r={7} fill={HAZ} /></g>; })}
    </g>
  );
}
function Pastry({ u }: { u: number }) {
  const pop = eob(seg(u, 0, 0.4), 1.3), split = eo(seg(u, 0.45, 0.95)), body = "M280 970 Q280 840 410 840 L670 840 Q800 840 800 970 Q800 1100 670 1100 L410 1100 Q280 1100 280 970 Z";
  const stripes = Array.from({ length: 8 }).map((_, i) => 320 + i * 62);
  const half = (top: boolean) => (
    <g clipPath={`url(#pc${top ? "T" : "B"})`}><g clipPath="url(#pcBody)">
      <path d={body} fill={CRUST} />
      {stripes.map((x) => <rect key={x} x={x} y={820} width={12} height={300} fill={CRUSTD} opacity={0.75} transform={`rotate(-8 ${x} 970)`} />)}
      <ellipse cx={520} cy={top ? 880 : 1060} rx={190} ry={22} fill="#FFFFFF" opacity={top ? 0.22 : 0.1} />
    </g></g>
  );
  return (
    <g transform={`translate(540 970) scale(${0.6 + 0.4 * pop}) translate(-540 -970)`} opacity={Math.min(1, pop * 2)}>
      <clipPath id="pcBody"><path d={body} /></clipPath><clipPath id="pcT"><rect x={200} y={700} width={700} height={270} /></clipPath><clipPath id="pcB"><rect x={200} y={970} width={700} height={300} /></clipPath>
      {[925, 985].map((y, i) => <g key={y} opacity={split}><rect x={330 + i * 14} y={y - 8 + (i ? 4 : -6) * split} width={410 - i * 28} height={36} rx={12} fill={CHOC} /><rect x={345 + i * 14} y={y - 2 + (i ? 4 : -6) * split} width={300} height={7} rx={3} fill="#5A3A28" /></g>)}
      <g transform={`translate(0 ${-72 * split}) rotate(${-5 * split} 540 970)`}>{half(true)}</g>
      <g transform={`translate(0 ${64 * split}) rotate(${3 * split} 540 970)`}>{half(false)}</g>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => { const k = seg(u, 0.7 + i * 0.05, 1.5 + i * 0.05); return <circle key={i} cx={330 + i * 62 + (i % 2) * 14} cy={880 + k * 260} r={6 + (i % 3) * 2} fill={i % 2 ? CHOC : CRUST} opacity={k > 0 && k < 1 ? 1 - k : 0} />; })}
      {[0, 1].map((i) => <path key={i} d={`M${470 + i * 150} 790 C ${440 + i * 150} 750, ${500 + i * 150} 720, ${470 + i * 150} 680`} stroke={WHITE} strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.5 * eo(seg(u, 1.0, 1.3)) * (0.7 + 0.3 * Math.sin(u * 5 + i))} transform={`translate(0 ${-(u % 1) * 30})`} />)}
    </g>
  );
}
function Food({ t }: { t: number }) {
  if (t < S.food - 0.4 || t >= S.end + 0.1) return null;
  const w = (i: number) => W("v3", i), slots = [
    { s: S.food, e: w(4).t0 - 0.12, name: ["Vietnamese", "iced", "latte"], wi: [1, 2, 3], C: Latte },
    { s: w(4).t0 - 0.12, e: w(7).t0 - 0.12, name: ["Hazelnut", "frappe"], wi: [5, 6], C: Frappe },
    { s: w(7).t0 - 0.12, e: S.end + 0.5, name: ["Pain", "au", "chocolat"], wi: [8, 9, 10], C: Pastry },
  ];
  const inn = eo(seg(t, S.food - 0.1, S.food + 0.35)), out = 1 - eo(seg(t, S.end - 0.35, S.end - 0.05));
  const cur = slots.find((x) => t >= x.s && t < x.e) || slots[2], idx = slots.indexOf(cur), u = t - cur.s;
  const enter = eob(seg(u, 0, 0.45), 1.2), leave = idx < 2 ? eio(seg(t, cur.e - 0.3, cur.e)) : 0, X = (1 - enter) * 640 - leave * 640;
  const C = cur.C;
  return (
    <div style={{ opacity: inn * out }}>
      <div style={abs(0, 0, { width: 1080, height: 1920, background: FOREST })} /><div style={abs(-300, 620, { width: 1000, height: 1000, borderRadius: 500, background: MID })} />
      <svg width={1080} height={1920} style={abs(0, 0)} viewBox="0 0 1080 1920">
        <g transform={`translate(${X} 0)`}>
          <circle cx={540} cy={960} r={345} fill={PINK} /><circle cx={540} cy={960} r={300} fill={SOFTPINK} opacity={0.5} />
          <C u={u} />
        </g>
      </svg>
      <div style={abs(64, 380, { ...mono(30, PINK) })}>Must-try {`0${idx + 1}`} / 03</div>
      <div style={abs(64, 1400, { transform: `translateX(${X * 0.4}px)`, opacity: 1 - 0.0, display: "flex", columnGap: 20, background: PINK, padding: "16px 34px 14px", boxShadow: `8px 8px 0 ${INK}` })}>
        {cur.name.map((n, i) => { const f = eo(seg(t, w(cur.wi[i]).t0 - 0.02, w(cur.wi[i]).t0 + 0.25)); return <div key={n} style={{ ...disp(78, 800, FOREST), opacity: 0.35 + 0.65 * f, whiteSpace: "nowrap" }}>{n}</div>; })}
      </div>
    </div>
  );
}

// ------------------------------------------------------------ transition: a venetian blind closes and opens across the cut
function BlindWipe({ t }: { t: number }) {
  const B = [S.map, S.food, S.end];
  const b = B.find((x) => t > x - 0.32 && t < x + 0.32); if (b === undefined) return null;
  const n = 12, h = 1920 / n, u = (t - b) / 0.32;   // -1..0 closing, 0..1 opening
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const stag = (i - n / 2) * 0.02;                                   // slats close and open in a gentle ripple
        const s = eio(u < 0 ? clamp(1 + u + stag) : clamp(1 - u - stag));  // 0 -> 1 closing, 1 -> 0 opening
        return <div key={i} style={abs(0, i * h, { width: 1080, height: h + 2, background: i % 2 ? PINK : SOFTPINK, transform: `scaleY(${s})`, transformOrigin: "50% 50%", boxShadow: `0 4px 0 ${INK}` })} />;
      })}
    </>
  );
}

// ------------------------------------------------------------ scene 4: pale pink end card, large Bombay Cafe Map lockup, cafe name big, handle held 3 s
function EndCard({ t }: { t: number }) {
  if (t < S.end - 0.05) return null; const u = t - S.end;
  const k = eob(seg(u, 0.2, 0.9), 1.2), k2 = eo(seg(u, 0.8, 1.3)), drift = 1 + 0.03 * seg(u, 1.0, 7.0), kn = eob(seg(u, 0.5, 1.1), 1.3);
  const fw = [0, 4, 5, 6, 7].map((i) => W("v4", i)), kb = eob(seg(t, fw[0].t0 - 0.05, fw[0].t0 + 0.4), 1.3);
  return (
    <AbsoluteFill style={{ background: PINK }}>
      <div style={abs(100, 250, { width: 880, height: 558, borderRadius: 34, overflow: "hidden", background: WHITE, boxShadow: `0 0 0 6px ${FOREST}`, transform: `scale(${(0.86 + 0.14 * k) * drift})`, opacity: Math.min(1, k * 2) })}><Img src={staticFile("brand/bombaycafemap-lockup-stacked.png")} style={abs(0, 0, { width: 880, height: 558, objectFit: "contain" })} /></div>
      <div style={abs(100, 842, { opacity: k2 })}><div style={mono(34, FOREST)}><span style={{ color: PINK, background: FOREST, padding: "2px 10px" }}>@bombaycafemap</span> · bombaycafemap.com</div></div>
      <div style={abs(100, 950, { opacity: Math.min(1, kn * 2), transform: `translateY(${(1 - kn) * 30}px)` })}>
        <div style={disp(190, 800, FOREST)}>records</div>
        <div style={{ ...disp(190, 800, WHITE), marginTop: 6, WebkitTextStroke: `3px ${FOREST}` }}>.coffee</div>
        <div style={{ ...mono(30, FOREST), marginTop: 22 }}>by Veranda · Pali Hill, Bandra</div>
      </div>
      <div style={abs(100, 1388, { opacity: k2, ...mono(28, FOREST), border: `3px solid ${FOREST}`, padding: "8px 20px 6px", borderRadius: 40 })}>#1 of 26 cafes in Bandra for working</div>
      <div style={abs(100, 1480, { display: "flex", columnGap: 16, alignItems: "center", opacity: Math.min(1, kb * 2), transform: `translateY(${(1 - kb) * 24}px)`, background: FOREST, padding: "14px 34px 12px", borderRadius: 40 })}>
        {["Follow", "for", "the", "next", "one."].map((w, i) => { const f = eo(seg(t, fw[i].t0 - 0.02, fw[i].t0 + 0.25)); return <div key={i} style={{ ...disp(62, 800, PINK), opacity: 0.4 + 0.6 * f }}>{w}</div>; })}
      </div>
    </AbsoluteFill>
  );
}

function Clip({ name, from, to }: { name: string; from: number; to: number }) {
  const fr = (s: number) => Math.round(s * FPS);
  return <Sequence from={fr(from)} durationInFrames={fr(to - from)}><Video src={staticFile(`clips/${name}.mp4`)} style={abs(0, 0, { width: 1080, height: 1920 })} /></Sequence>;
}
function Film() {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{ background: FOREST }}>
      <style>{CSS}</style>
      <Hook t={t} /><Spines t={t} />
      <Clip name="map" from={S.map} to={S.food} />
      <MapLabels t={t} /><Food t={t} /><BarLogo t={t} /><NameTag t={t} />
      <EndCard t={t} />
      <BlindWipe t={t} />
    </AbsoluteFill>
  );
}
registerRoot(() => <Composition id="records" component={Film} width={1080} height={1920} fps={FPS} durationInFrames={Math.round(TOTAL * FPS)} />);
