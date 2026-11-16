// Slow Cafe reel for Bombay Cafe Map: "Take It Slow". raea composition (React/TS). The 3D scenes (hook toast, map, burrata, noodles, fries) are three.js renders in media/clips;
// all type, tags, the no-rush ring, logo marks and the end card are raea. Every caption and animation reads src/cues.ts (voice word times, L046). No pours anywhere (L059).
// Palette = the cafe's own scheme: charcoal (logo disc), concrete, cool white (logo ring), dusty pink (team shirts), sage (mugs). No orange, no cream.
import { AbsoluteFill, Composition, Img, Sequence, Video, registerRoot, staticFile, useCurrentFrame } from "raea";
import { CLIPS, TOTAL } from "./src/cues";

const FPS = 30;
const CHAR = "#2F2E2C", CONC = "#7C8088", WHITE = "#F4F5F7", PINK = "#E8A5B3", SAGE = "#9AB89D", CHARL = "#3A3937";
const S = { map: 5.0, burrata: 9.8, noodles: 15.2, fries: 20.6, end: 25.6 };       // scene starts (s); the three food scenes ease from fast to slow (speed ramp)
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const eo = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const eio = (x: number) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const eob = (x: number, o = 1.5) => { x = clamp(x); const c = o + 1; return 1 + c * Math.pow(x - 1, 3) + o * Math.pow(x - 1, 2); };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const W = (clip: string, i: number) => CLIPS[clip].words[i];
const abs = (l: number, t: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: "absolute", left: l, top: t, ...extra });
const CSS = `
@font-face{font-family:'Jost';src:url(${staticFile("fonts/jost.woff2")});font-weight:100 900}
@font-face{font-family:'DM Mono';src:url(${staticFile("fonts/DMMono-Regular.ttf")});font-weight:400}
@font-face{font-family:'DM Mono';src:url(${staticFile("fonts/DMMono-Medium.ttf")});font-weight:500}`;
const sans = (size: number, wght: number, color = WHITE): React.CSSProperties => ({ fontFamily: "'Jost'", fontSize: size, fontWeight: wght, lineHeight: 0.95, color, letterSpacing: size * 0.01 });
const mono = (size: number, color = SAGE): React.CSSProperties => ({ fontFamily: "'DM Mono'", fontSize: size, fontWeight: 500, letterSpacing: size * 0.12, textTransform: "uppercase", color });
const circle = (cx: number, cy: number, d: number, bg: string, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: "absolute", left: cx - d / 2, top: cy - d / 2, width: d, height: d, borderRadius: d / 2, background: bg, ...extra });
const TILT = -18;      // the cafe logo's tilted O (from the Instagram profile picture)

// ------------------------------------------------------------ the cafe's tilted-O ring (logo mark): a white ellipse ring, tilted
function ORing({ cx, cy, h, rot, color = WHITE }: { cx: number; cy: number; h: number; rot: number; color?: string }) {
  const w = h * 0.78, bw = h * 0.15;
  return <div style={{ position: "absolute", left: cx - w / 2, top: cy - h / 2, width: w, height: h, borderRadius: "50%", border: `${bw}px solid ${color}`, boxSizing: "border-box", transform: `rotate(${rot}deg)` }} />;
}
function LogoMark({ cx, cy, d }: { cx: number; cy: number; d: number }) {
  return <><div style={circle(cx, cy, d, CHARL, { boxShadow: `0 0 0 3px ${SAGE}` })} /><ORing cx={cx} cy={cy} h={d * 0.5} rot={TILT} /></>;
}

// ------------------------------------------------------------ scene 1: the name stamps in letter by letter over the toast (cafe name first, L051)
function Hook({ t }: { t: number }) {
  if (t > S.map + 0.2) return null;
  const F = 206, rows = [["S", "L", "O", "W"], ["C", "A", "F", "E"]];
  const out = 1 - eo(seg(t, S.map - 0.35, S.map + 0.1));
  const kOf = (r: number, c: number) => eob(seg(t, -0.06 + (r * 4 + c) * 0.1, -0.06 + (r * 4 + c) * 0.1 + 0.24), 1.7);
  const spin = lerp(200, TILT, eob(seg(t, 0.14, 1.4), 1.2));
  const kd = eo(seg(t, W("v1", 2).t0 - 0.05, W("v1", 2).t0 + 0.4)), kw = eo(seg(t, W("v1", 3).t0 - 0.05, W("v1", 3).t0 + 0.35));
  const bar = eio(seg(t, 0.9, 1.5));
  const cell = (r: number, c: number, color: string, dx: number) => {
    const k = kOf(r, c), L = rows[r][c], o = r === 0 && c === 2;
    return (
      <div key={`${r}${c}${dx}`} style={{ width: o ? F * 0.7 : undefined, height: F * 0.8, display: "flex", alignItems: "center", justifyContent: "center", opacity: Math.min(1, k * 2), transform: `scale(${lerp(1.6, 1, k)})`, position: "relative" }}>
        {o ? <ORing cx={F * 0.35 + dx} cy={F * 0.4 + dx} h={F * 0.76} rot={spin} color={color} /> : <div style={{ ...sans(F, 800, color), position: "relative", left: dx, top: dx }}>{L}</div>}
      </div>
    );
  };
  const layer = (color: string, dx: number) => (
    <div style={abs(64, 262, { display: "flex", flexDirection: "column", rowGap: 0 })}>
      {rows.map((_, r) => <div key={r} style={{ display: "flex", columnGap: 4 }}>{rows[r].map((__, c) => cell(r, c, color, dx))}</div>)}
    </div>
  );
  return (
    <div style={{ opacity: out }}>
      {layer(CHAR, 7)}{layer(WHITE, 0)}
      <div style={abs(64, 262 + F * 1.6 + 14, { width: 640 * bar, height: 6, background: PINK })} />
      <div style={abs(740, 330, { ...mono(34, WHITE), opacity: kd, transform: `translateX(${(1 - kd) * -30}px)` })}>Kandivali</div>
      <div style={abs(740, 384, { ...mono(34, WHITE), opacity: kw, transform: `translateX(${(1 - kw) * -30}px)` })}>West</div>
    </div>
  );
}

// ------------------------------------------------------------ scene 2: map labels
function MapLabels({ t }: { t: number }) {
  if (t < S.map + 0.2 || t >= S.burrata + 0.1) return null;
  const a = W("v2", 4), b = W("v2", 5);
  const k = eo(seg(t, a.t0 - 0.05, a.t0 + 0.4)) * (1 - eo(seg(t, S.burrata - 0.45, S.burrata - 0.1)));
  const k2 = eob(seg(t, b.t0 - 0.05, b.t0 + 0.4), 1.3) * (1 - eo(seg(t, S.burrata - 0.45, S.burrata - 0.1)));
  return (
    <>
      <div style={abs(0, 960, { width: 900, height: 380, background: CHAR, opacity: 0.72 * k })} />
      <div style={abs(64, 990, { opacity: k, transform: `translateY(${(1 - k) * 40}px)` })}>
        <div style={mono(30, SAGE)}>Kandivali West · Mumbai</div>
        <div style={{ ...sans(150, 800), marginTop: 18 }}>Mahavir<br />Nagar</div>
      </div>
      <div style={abs(64, 1370, { opacity: k2, transform: `translateX(${(1 - k2) * -80}px)`, background: PINK, padding: "10px 24px 8px", ...mono(28, CHAR) })}>A new cafe</div>
      <div style={abs(64, 1440, { ...mono(24, WHITE), opacity: 1, background: CHAR, padding: "6px 12px 4px" })}>Map data: OpenStreetMap contributors</div>
    </>
  );
}

// ------------------------------------------------------------ persistent: Bombay Cafe Map bar logo (small, from scene 2), cafe name tag, no-rush ring
function BarLogo({ t }: { t: number }) {
  if (t < S.map + 0.15 || t >= S.end) return null; const k = eo(seg(t, S.map + 0.15, S.map + 0.55)) * (1 - eo(seg(t, S.end - 0.4, S.end - 0.1)));
  return <div style={abs(64, 60, { width: 470, height: 115, borderRadius: 22, background: CHAR, opacity: 0.88 * k, overflow: "hidden" })}><Img src={staticFile("brand/bombaycafemap-lockup-horizontal-ondark.png")} style={abs(0, 0, { width: 470, height: 115, objectFit: "contain", opacity: 1 / 0.88 })} /></div>;
}
function NameTag({ t }: { t: number }) {
  if (t < S.map + 0.25 || t >= S.end) return null; const k = eob(seg(t, S.map + 0.25, S.map + 0.65), 1.3) * (1 - eo(seg(t, S.end - 0.4, S.end - 0.1)));
  return (
    <div style={abs(64, 200, { display: "flex", alignItems: "center", columnGap: 16, opacity: k, transform: `translateX(${(1 - k) * -80}px)` })}>
      <div style={{ background: PINK, padding: "9px 22px 7px", ...sans(50, 800, CHAR), letterSpacing: 2, textTransform: "uppercase", whiteSpace: "nowrap" }}>Slow Cafe</div>
    </div>
  );
}
function NoRushRing({ t }: { t: number }) {
  if (t < S.noodles - 0.3 || t >= S.end + 0.5) return null;
  const k = eo(seg(t, S.noodles - 0.3, S.noodles + 0.2)) * (1 - eo(seg(t, S.end + 0.1, S.end + 0.5)));
  const p = seg(t, S.noodles, S.end), N = 48, cx = 868, cy = 340, r = 40;
  return (
    <div style={{ opacity: k }}>
      {Array.from({ length: N }, (_, i) => { const a = (i / N) * 360, lit = i / N < p; return <div key={i} style={abs(cx - 2.5, cy - r - 10, { width: 5, height: 14, borderRadius: 2.5, background: lit ? (i / N > p - 0.04 ? PINK : WHITE) : "rgba(244,245,247,0.22)", transformOrigin: `2.5px ${r + 10}px`, transform: `rotate(${a}deg)` })} />; })}
      <div style={abs(cx - 70, cy + 62, { width: 140, textAlign: "center", ...mono(18, WHITE), opacity: 0.85 })}>No rush</div>
    </div>
  );
}

// ------------------------------------------------------------ place-card tags: the dish name flips in and each word lights as it is spoken
type Tag = { clip: string; words: number[]; start: number; end: number; text: string[]; sub?: { idx: number[]; text: string }; dur: number };
const TAGS: Tag[] = [
  { clip: "v1", words: [], start: 2.7, end: S.map - 0.1, text: ["Tiramisu", "French", "toast"], dur: 0.3 },
  { clip: "v3", words: [0, 1, 2, 3], start: S.burrata + 0.35, end: S.noodles - 0.1, text: ["Tomato", "confit", "and", "burrata"], dur: 0.3 },
  { clip: "v4", words: [2, 3, 4], start: S.noodles + 0.4, end: S.fries - 0.1, text: ["Gochujang", "noodle", "bowl"], dur: 0.45 },
  { clip: "v5", words: [0, 1, 2], start: S.fries + 0.4, end: S.end - 0.1, text: ["Sweet", "potato", "fries"], sub: { idx: [4, 5, 6, 7], text: "dips made in house" }, dur: 0.6 },
];
function DishTag({ t }: { t: number }) {
  const tg = TAGS.find((x) => t >= x.start - 0.05 && t < x.end + 0.1); if (!tg) return null;
  const inn = eob(seg(t, tg.start, tg.start + tg.dur), 1.1), out = 1 - eo(seg(t, tg.end - 0.3, tg.end));
  const flip = (1 - inn) * -90;
  const c = CLIPS[tg.clip];
  return (
    <div style={abs(64, 1330, { perspective: 1000, opacity: Math.min(1, inn * 2) * out })}>
      <div style={{ transformOrigin: "50% 0%", transform: `rotateX(${flip}deg)`, background: WHITE, borderLeft: `16px solid ${PINK}`, padding: "20px 34px 22px 28px", boxShadow: `6px 6px 0 ${CONC}` }}>
        <div style={{ display: "flex", columnGap: 20 }}>
          {tg.text.map((w, i) => { const wi = tg.words[i]; const spoken = wi === undefined ? true : t >= c.words[wi].t0 - 0.02; return <div key={i} style={{ ...sans(72, 700, spoken ? CHAR : "#6a6f77"), whiteSpace: "nowrap" }}>{w}</div>; })}
        </div>
        {tg.sub && <div style={{ ...mono(26, "#5d6b61"), marginTop: 12, opacity: t >= c.words[tg.sub.idx[0]].t0 - 0.05 ? 1 : 0.0 }}>{tg.sub.text}</div>}
      </div>
    </div>
  );
}

// ------------------------------------------------------------ scene 6: end card on the cafe's charcoal, large Bombay Cafe Map lockup, handle held 3 s
function EndCard({ t }: { t: number }) {
  if (t < S.end - 0.05) return null; const u = t - S.end;
  const k = eob(seg(u, 0.2, 0.9), 1.2), k2 = eo(seg(u, 0.8, 1.3)), drift = 1 + 0.03 * seg(u, 1.0, 7.0);
  const cw = W("v6", 0);
  const kn = eob(seg(t, cw.t0 - 0.05, cw.t0 + 0.4), 1.3);
  const fw = [2, 6, 7, 8, 9].map((i) => W("v6", i)), kb = eob(seg(t, fw[0].t0 - 0.05, fw[0].t0 + 0.4), 1.3);
  return (
    <AbsoluteFill style={{ background: CHAR }}>
      <div style={abs(100, 360, { width: 880, height: 558, borderRadius: 34, overflow: "hidden", boxShadow: `0 0 0 5px ${SAGE}`, transform: `scale(${(0.86 + 0.14 * k) * drift})`, opacity: Math.min(1, k * 2) })}><Img src={staticFile("brand/bombaycafemap-lockup-stacked-ondark.png")} style={abs(0, 0, { width: 880, height: 558, objectFit: "contain" })} /></div>
      <div style={abs(100, 950, { opacity: k2 })}><div style={mono(34, WHITE)}><span style={{ color: PINK }}>@bombaycafemap</span> · bombaycafemap.com</div></div>
      <div style={abs(100, 1050, { display: "flex", alignItems: "center", columnGap: 26, opacity: k2 })}>
        <div style={{ position: "relative", width: 112, height: 112 }}><LogoMark cx={56} cy={56} d={112} /></div>
        <div><div style={{ ...sans(70, 700, WHITE), letterSpacing: 2 }}>Slow Cafe</div><div style={{ ...mono(26, SAGE), marginTop: 8 }}>Kandivali West · Mumbai</div></div>
      </div>
      {(() => { const ks = eob(seg(u, 1.2, 1.7), 1.6), n = (4.3 * eo(seg(u, 1.25, 2.1))).toFixed(1);
        return <div style={{ opacity: Math.min(1, ks * 2), transform: `scale(${0.6 + 0.4 * ks})`, transformOrigin: "50% 50%" }}>
          <div style={circle(850, 1110, 176, PINK)} />
          <div style={abs(850 - 88, 1110 - 62, { width: 176, textAlign: "center", ...sans(78, 800, CHAR) })}>{n}</div>
          <div style={abs(850 - 88, 1110 + 24, { width: 176, textAlign: "center", ...mono(17, CHAR) })}>/5 first look</div>
        </div>; })()}
      <div style={abs(100, 1230, { opacity: Math.min(1, kn * 2) })}><div style={{ ...sans(120, 800, WHITE), transform: `translateY(${(1 - kn) * 30}px)` }}>No rush.</div></div>
      <div style={abs(100, 1380, { display: "flex", columnGap: 18, alignItems: "center", opacity: Math.min(1, kb * 2), transform: `translateY(${(1 - kb) * 24}px)`, background: PINK, padding: "16px 34px 14px", borderRadius: 40 })}>
        {["Follow", "for", "the", "next", "one."].map((w, i) => { const f = eo(seg(t, fw[i].t0 - 0.02, fw[i].t0 + 0.25)); return <div key={i} style={{ ...sans(64, 700, CHAR), opacity: 0.35 + 0.65 * f }}>{w}</div>; })}
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
    <AbsoluteFill style={{ background: CHAR }}>
      <style>{CSS}</style>
      <Clip name="hook" from={0} to={S.map} />
      <Clip name="map" from={S.map} to={S.burrata} />
      <Clip name="burrata" from={S.burrata} to={S.noodles} />
      <Clip name="noodles" from={S.noodles} to={S.fries} />
      <Clip name="fries" from={S.fries} to={S.end} />
      <Hook t={t} /><MapLabels t={t} /><BarLogo t={t} /><NameTag t={t} /><NoRushRing t={t} /><DishTag t={t} />
      <EndCard t={t} />
    </AbsoluteFill>
  );
}
registerRoot(() => <Composition id="slowcafe" component={Film} width={1080} height={1920} fps={FPS} durationInFrames={Math.round(TOTAL * FPS)} />);
