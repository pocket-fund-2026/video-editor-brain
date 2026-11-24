// Cafe Madras reel for Bombay Cafe Map: "Steel & Steam". raea composition (React/TS). The dish scenes (dosa hook, idli, rasam vada, sheera) are 2D illustrations rendered from scenes2d (media/clips),
// the map is three.js (media/clips/map.mp4). All type, tags, course tracker, steel-plate wipes, the 1940 count-up and the end card are raea. Every caption and animation reads src/cues.ts (voice word times, L046).
// No pours anywhere (L059). Palette (new): banana-leaf green, steel, jasmine white, kolam cobalt. No orange, no cream, no pink, no red.
import { AbsoluteFill, Composition, Img, Sequence, Video, registerRoot, staticFile, useCurrentFrame } from "raea";
import { CLIPS, TOTAL } from "./src/cues";

const FPS = 30;
const GREEN = "#14312A", GREENL = "#1B3F34", STEEL = "#B5BDC2", WHITE = "#F4F6F1", COBALT = "#4F7DF0", DEEP = "#0E241E";
const S = { map: 5.0, idli: 9.8, rasam: 15.2, sheera: 20.6, end: 25.6 };       // scene starts (s)
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const eo = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const eio = (x: number) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const eob = (x: number, o = 1.5) => { x = clamp(x); const c = o + 1; return 1 + c * Math.pow(x - 1, 3) + o * Math.pow(x - 1, 2); };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const W = (clip: string, i: number) => CLIPS[clip].words[i];
const abs = (l: number, t: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: "absolute", left: l, top: t, ...extra });
const CSS = `
@font-face{font-family:'Bricolage';src:url(${staticFile("fonts/Bricolage.ttf")});font-weight:200 800}
@font-face{font-family:'DM Mono';src:url(${staticFile("fonts/DMMono-Regular.ttf")});font-weight:400}
@font-face{font-family:'DM Mono';src:url(${staticFile("fonts/DMMono-Medium.ttf")});font-weight:500}`;
const sans = (size: number, wght: number, color = WHITE, wdth = 100): React.CSSProperties => ({ fontFamily: "'Bricolage'", fontSize: size, fontWeight: wght, fontVariationSettings: `"wdth" ${wdth}`, lineHeight: 0.9, color, letterSpacing: size * -0.01 });
const mono = (size: number, color = STEEL): React.CSSProperties => ({ fontFamily: "'DM Mono'", fontSize: size, fontWeight: 500, letterSpacing: size * 0.12, textTransform: "uppercase", color });

// ------------------------------------------------------------ scene 1: kinetic word-stack. CAFE and MADRAS slam in, then resize until the stack fills the frame width (cafe name first, L051)
function Hook({ t }: { t: number }) {
  if (t > S.map + 0.2) return null;
  const out = 1 - eo(seg(t, S.map - 0.35, S.map + 0.1));
  const w1 = W("v1", 0), w2 = W("v1", 1);
  const k1 = eob(seg(t, Math.max(0, w1.t0 - 0.2), Math.max(0, w1.t0 - 0.2) + 0.32), 1.8), k2 = eob(seg(t, w2.t0 - 0.12, w2.t0 + 0.3), 1.8);
  const fit = eio(seg(t, 0.9, 1.7));                                      // after both land the stack resizes to fill the width
  const sizeA = lerp(270, 300, fit), sizeB = lerp(250, 300, fit), lsA = lerp(50, 112, fit);
  const kd = eo(seg(t, W("v1", 2).t0 - 0.05, W("v1", 2).t0 + 0.4)), ke = eo(seg(t, W("v1", 3).t0 - 0.05, W("v1", 3).t0 + 0.35));
  const bar = eio(seg(t, 1.4, 2.0));
  const shake = (k: number, s: number) => (k > 0.97 && k < 1.04 ? 0 : (1 - clamp(k)) * s);
  return (
    <div style={{ opacity: out }}>
      <div style={abs(54, 262, { ...sans(sizeA, 800, DEEP, 82), letterSpacing: lsA, opacity: Math.min(1, k1 * 2), transform: `translateY(${(1 - k1) * -260}px) scale(${lerp(1.5, 1, clamp(k1))})`, transformOrigin: "0 0", left: 54 + 7, top: 262 + 7 })}>CAFE</div>
      <div style={abs(54, 262, { ...sans(sizeA, 800, WHITE, 82), letterSpacing: lsA, opacity: Math.min(1, k1 * 2), transform: `translateY(${(1 - k1) * -260}px) scale(${lerp(1.5, 1, clamp(k1))})`, transformOrigin: "0 0" })}>CAFE</div>
      <div style={abs(54 + 7, 262 + sizeA * 0.9 + 6 + 7, { ...sans(sizeB, 800, DEEP, 82), opacity: Math.min(1, k2 * 2), transform: `translateX(${(1 - k2) * 340}px) scale(${lerp(1.4, 1, clamp(k2))})`, transformOrigin: "0 0" })}>MADRAS</div>
      <div style={abs(54, 262 + sizeA * 0.9 + 6, { ...sans(sizeB, 800, WHITE, 82), opacity: Math.min(1, k2 * 2), transform: `translateX(${(1 - k2) * 340}px) scale(${lerp(1.4, 1, clamp(k2))})`, transformOrigin: "0 0" })}>MADRAS</div>
      <div style={abs(60, 262 + sizeA * 0.9 + sizeB * 0.9 + 34, { width: 700 * bar, height: 8, background: COBALT })} />
      <div style={abs(60, 262 + sizeA * 0.9 + sizeB * 0.9 + 66, { ...mono(36, WHITE), opacity: kd, transform: `translateX(${(1 - kd) * -30}px)` })}>Matunga</div>
      <div style={abs(300, 262 + sizeA * 0.9 + sizeB * 0.9 + 66, { ...mono(36, WHITE), opacity: ke, transform: `translateX(${(1 - ke) * -30}px)` })}>East</div>
    </div>
  );
}

// ------------------------------------------------------------ scene 2: map labels + 1940 count-up (locked to "nineteen forty")
function MapLabels({ t }: { t: number }) {
  if (t < S.map + 0.2 || t >= S.idli + 0.1) return null;
  const a = W("v2", 5), n0 = W("v2", 2), n1 = W("v2", 3);
  const fade = 1 - eo(seg(t, S.idli - 0.45, S.idli - 0.1));
  const k = eo(seg(t, a.t0 - 0.05, a.t0 + 0.4)) * fade;
  const kc = eob(seg(t, n0.t0 - 0.1, n0.t0 + 0.35), 1.3) * fade;
  const year = Math.round(lerp(1900, 1940, eo(seg(t, n0.t0 + 0.05, n1.t0 + 0.35))));
  return (
    <>
      <div style={abs(0, 960, { width: 900, height: 420, background: DEEP, opacity: 0.92 * Math.max(k, kc) })} />
      <div style={abs(64, 990, { opacity: k, transform: `translateY(${(1 - k) * 40}px)` })}>
        <div style={mono(30, STEEL)}>Matunga East · Mumbai</div>
        <div style={{ ...sans(140, 800), marginTop: 18 }}>King&apos;s<br />Circle</div>
      </div>
      <div style={abs(64, 1370, { opacity: kc, transform: `translateX(${(1 - kc) * -80}px)`, display: "flex", alignItems: "center", columnGap: 18, background: COBALT, padding: "10px 24px 8px" })}>
        <div style={{ ...mono(28, DEEP) }}>Since</div><div style={{ ...sans(64, 800, DEEP), fontVariantNumeric: "tabular-nums" }}>{year}</div>
      </div>
      <div style={abs(64, 1450, { ...mono(28, WHITE), background: DEEP, padding: "6px 12px 4px" })}>Map data: OpenStreetMap contributors</div>
    </>
  );
}

// ------------------------------------------------------------ persistent: Bombay Cafe Map bar logo (small, from scene 2), cafe name tag, course tracker
function BarLogo({ t }: { t: number }) {
  if (t < S.map + 0.15 || t >= S.end) return null; const k = eo(seg(t, S.map + 0.15, S.map + 0.55)) * (1 - eo(seg(t, S.end - 0.4, S.end - 0.1)));
  return <div style={abs(64, 60, { width: 470, height: 115, borderRadius: 22, background: DEEP, opacity: 0.9 * k, overflow: "hidden" })}><Img src={staticFile("brand/bombaycafemap-lockup-horizontal-ondark.png")} style={abs(0, 0, { width: 470, height: 115, objectFit: "contain", opacity: 1 / 0.9 })} /></div>;
}
function NameTag({ t }: { t: number }) {
  if (t < S.map + 0.25 || t >= S.end) return null; const k = eob(seg(t, S.map + 0.25, S.map + 0.65), 1.3) * (1 - eo(seg(t, S.end - 0.4, S.end - 0.1)));
  return (
    <div style={abs(64, 200, { display: "flex", alignItems: "center", columnGap: 16, opacity: k, transform: `translateX(${(1 - k) * -80}px)` })}>
      <div style={{ background: COBALT, padding: "9px 22px 7px", ...sans(50, 800, DEEP, 85), letterSpacing: 2, textTransform: "uppercase", whiteSpace: "nowrap" }}>Cafe Madras</div>
    </div>
  );
}
function Course({ t }: { t: number }) {                                  // three courses lit as they are served: idli, rasam vada, sheera
  if (t < S.idli - 0.3 || t >= S.end + 0.5) return null;
  const k = eo(seg(t, S.idli - 0.3, S.idli + 0.2)) * (1 - eo(seg(t, S.end + 0.1, S.end + 0.5)));
  const starts = [S.idli, S.rasam, S.sheera], names = ["Idli", "Vada", "Sheera"];
  return (
    <div style={abs(64, 282, { display: "flex", columnGap: 12, opacity: k })}>
      {starts.map((s, i) => { const on = t >= s - 0.05, cur = t >= s && (i === 2 || t < starts[i + 1]); return (
        <div key={i} style={{ display: "flex", alignItems: "center", columnGap: 8, background: cur ? WHITE : "rgba(14,36,30,0.78)", padding: "6px 14px 4px" }}>
          <div style={{ ...mono(24, cur ? DEEP : on ? WHITE : STEEL) }}>{`0${i + 1}`}</div><div style={{ ...mono(24, cur ? DEEP : on ? WHITE : STEEL) }}>{names[i]}</div>
        </div>); })}
    </div>
  );
}

// ------------------------------------------------------------ place-card tags: the dish name flips in and each word lights as it is spoken
type Tag = { pos?: [number, number]; clip: string; words: number[]; start: number; end: number; text: string[]; sub?: { idx: number[]; text: string }; dur: number };
const TAGS: Tag[] = [
  { pos: [64, 1430], clip: "v1", words: [], start: 2.7, end: S.map - 0.1, text: ["Mysore", "masala", "dosa"], dur: 0.3 },
  { clip: "v3", words: [3, 4, 5], start: S.idli + 0.35, end: S.rasam - 0.1, text: ["Idli", "and", "sambar"], dur: 0.35 },
  { clip: "v4", words: [1, 2], start: S.rasam + 0.35, end: S.sheera - 0.1, text: ["Rasam", "vada"], sub: { idx: [5, 6, 7], text: "tur dal rasam" }, dur: 0.45 },
  { clip: "v5", words: [2, 3], start: S.sheera + 0.35, end: S.end - 0.1, text: ["Pineapple", "sheera"], dur: 0.5 },
];
function DishTag({ t }: { t: number }) {
  const tg = TAGS.find((x) => t >= x.start - 0.05 && t < x.end + 0.1); if (!tg) return null;
  const inn = eob(seg(t, tg.start, tg.start + tg.dur), 1.1), out = 1 - eo(seg(t, tg.end - 0.3, tg.end));
  const flip = (1 - inn) * -90;
  const c = CLIPS[tg.clip];
  return (
    <div style={abs(tg.pos ? tg.pos[0] : 64, tg.pos ? tg.pos[1] : 1330, { perspective: 1000, opacity: Math.min(1, inn * 2) * out })}>
      <div style={{ transformOrigin: "50% 0%", transform: `rotateX(${flip}deg)`, background: WHITE, borderLeft: `16px solid ${COBALT}`, padding: "20px 34px 22px 28px", boxShadow: `6px 6px 0 ${STEEL}` }}>
        <div style={{ display: "flex", columnGap: 20 }}>
          {tg.text.map((w, i) => { const wi = tg.words[i]; const spoken = wi === undefined ? true : t >= c.words[wi].t0 - 0.02; return <div key={i} style={{ ...sans(72, 800, spoken ? DEEP : "#6a7b75", 88), whiteSpace: "nowrap" }}>{w}</div>; })}
        </div>
        {tg.sub && <div style={{ ...mono(26, "#3d554b"), marginTop: 12, opacity: t >= c.words[tg.sub.idx[0]].t0 - 0.05 ? 1 : 0.0 }}>{tg.sub.text}</div>}
      </div>
    </div>
  );
}

// ------------------------------------------------------------ transition: a brushed-steel disc grows over the dish, then shrinks away to reveal the next scene (steel-plate wipe)
function PlateWipe({ t }: { t: number }) {
  const B = [S.map, S.idli, S.rasam, S.sheera, S.end];
  const b = B.find((x) => t > x - 0.34 && t < x + 0.34); if (b === undefined) return null;
  const grow = eio(seg(t, b - 0.32, b)), shrink = eio(seg(t, b, b + 0.32));
  const r = t < b ? lerp(0, 1500, grow) : lerp(1500, 0, shrink);
  if (r < 2) return null;
  const cx = 540, cy = 1000;
  const sweep = 40 + 20 * Math.sin(t * 9);
  return <div style={abs(cx - r, cy - r, { width: 2 * r, height: 2 * r, borderRadius: r, background: `conic-gradient(from ${sweep}deg, #8E989E, #D6DCDF, #7C868C, #C9D0D4, #8E989E)`, boxShadow: `0 0 0 ${Math.min(10, r * 0.05)}px #E6EBEE, 0 0 60px rgba(0,0,0,0.45)` })} />;
}

// ------------------------------------------------------------ scene 6: end card on leaf green, large Bombay Cafe Map lockup, handle held 3 s
function EndCard({ t }: { t: number }) {
  if (t < S.end - 0.05) return null; const u = t - S.end;
  const k = eob(seg(u, 0.2, 0.9), 1.2), k2 = eo(seg(u, 0.8, 1.3)), drift = 1 + 0.03 * seg(u, 1.0, 7.0);
  const kn = eob(seg(u, 0.5, 1.1), 1.3);
  const th = [0, 1, 2, 3].map((i) => W("v6", i));
  const fw = [4, 8, 9, 10, 11].map((i) => W("v6", i)), kb = eob(seg(t, fw[0].t0 - 0.05, fw[0].t0 + 0.4), 1.3);
  return (
    <AbsoluteFill style={{ background: GREEN }}>
      <div style={abs(100, 320, { width: 880, height: 558, borderRadius: 34, overflow: "hidden", boxShadow: `0 0 0 5px ${STEEL}`, transform: `scale(${(0.86 + 0.14 * k) * drift})`, opacity: Math.min(1, k * 2) })}><Img src={staticFile("brand/bombaycafemap-lockup-stacked-ondark.png")} style={abs(0, 0, { width: 880, height: 558, objectFit: "contain" })} /></div>
      <div style={abs(100, 912, { opacity: k2 })}><div style={mono(34, WHITE)}><span style={{ color: COBALT, background: WHITE, padding: "2px 8px" }}>@bombaycafemap</span> · bombaycafemap.com</div></div>
      <div style={abs(100, 1010, { opacity: Math.min(1, kn * 2), transform: `translateY(${(1 - kn) * 30}px)` })}>
        <div style={{ ...sans(132, 800, WHITE, 85), letterSpacing: 1 }}>Cafe Madras</div>
        <div style={{ ...mono(28, STEEL), marginTop: 14 }}>Matunga East · Mumbai · since 1940</div>
      </div>
      <div style={abs(100, 1250, { display: "flex", columnGap: 16 })}>
        {["Three", "generations,", "one", "family."].map((w, i) => { const f = eo(seg(t, th[i].t0 - 0.02, th[i].t0 + 0.25)); return <div key={i} style={{ ...sans(52, 700, WHITE, 90), opacity: 0.3 + 0.7 * f }}>{w}</div>; })}
      </div>
      <div style={abs(100, 1380, { display: "flex", columnGap: 18, alignItems: "center", opacity: Math.min(1, kb * 2), transform: `translateY(${(1 - kb) * 24}px)`, background: COBALT, padding: "16px 34px 14px", borderRadius: 40 })}>
        {["Follow", "for", "the", "next", "one."].map((w, i) => { const f = eo(seg(t, fw[i].t0 - 0.02, fw[i].t0 + 0.25)); return <div key={i} style={{ ...sans(60, 800, WHITE, 90), opacity: 0.4 + 0.6 * f }}>{w}</div>; })}
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
    <AbsoluteFill style={{ background: GREEN }}>
      <style>{CSS}</style>
      <Clip name="hook" from={0} to={S.map} />
      <Clip name="map" from={S.map} to={S.idli} />
      <Clip name="idli" from={S.idli} to={S.rasam} />
      <Clip name="rasam" from={S.rasam} to={S.sheera} />
      <Clip name="sheera" from={S.sheera} to={S.end} />
      <Hook t={t} /><MapLabels t={t} /><BarLogo t={t} /><NameTag t={t} /><Course t={t} /><DishTag t={t} />
      <EndCard t={t} />
      <PlateWipe t={t} />
    </AbsoluteFill>
  );
}
registerRoot(() => <Composition id="cafemadras" component={Film} width={1080} height={1920} fps={FPS} durationInFrames={Math.round(TOTAL * FPS)} />);
