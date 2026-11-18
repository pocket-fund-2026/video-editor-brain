// Boojee Cafe reel for Bombay Cafe Map: "Wall Quote". raea composition (React/TS). The 2D scenes (stencil hook, croissant, avocado toast, crepes) are rendered from scenes2d (media/clips),
// the map is three.js (media/clips/map.mp4). Type, tags, tracker, paint-roller wipes, seat count-up and end card are raea. Every caption and animation reads src/cues.ts (voice word times, L046).
// No pours (L059). Palette: chalk wall, spray black, mint spray. No orange, no cream. Voice: Kokoro heart (L063).
import { AbsoluteFill, Composition, Img, Sequence, Video, registerRoot, staticFile, useCurrentFrame } from "raea";
import { CLIPS, TOTAL } from "./src/cues";

const FPS = 30;
const CHALK = "#F2F3F0", INK = "#0B0B0C", MINT = "#19C9A0", GREY = "#6A6D73", SOFT = "#1B1C1F";
const S = { map: 5.2, croissant: 11.7, avocado: 17.0, crepe: 22.3, end: 27.5 };       // scene starts (s)
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const eo = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const eio = (x: number) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const eob = (x: number, o = 1.5) => { x = clamp(x); const c = o + 1; return 1 + c * Math.pow(x - 1, 3) + o * Math.pow(x - 1, 2); };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const W = (clip: string, i: number) => CLIPS[clip].words[i];
const abs = (l: number, t: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: "absolute", left: l, top: t, ...extra });
const CSS = `
@font-face{font-family:'BSS';src:url(${staticFile("fonts/BigShouldersStencil.ttf")});font-weight:100 900}
@font-face{font-family:'DM Mono';src:url(${staticFile("fonts/DMMono-Regular.ttf")});font-weight:400}
@font-face{font-family:'DM Mono';src:url(${staticFile("fonts/DMMono-Medium.ttf")});font-weight:500}`;
const stencil = (size: number, wght: number, color = INK): React.CSSProperties => ({ fontFamily: "'BSS'", fontSize: size, fontWeight: wght, lineHeight: 0.92, color, letterSpacing: size * 0.02, textTransform: "uppercase" });
const mono = (size: number, color = GREY): React.CSSProperties => ({ fontFamily: "'DM Mono'", fontSize: size, fontWeight: 500, letterSpacing: size * 0.12, textTransform: "uppercase", color });

// ------------------------------------------------------------ scene 1: the stencil hook is in the clip; raea adds the place tag locked to "Bandra West"
function HookTag({ t }: { t: number }) {
  if (t > S.map + 0.2) return null;
  const a = W("v1", 2), b = W("v1", 3), out = 1 - eo(seg(t, S.map - 0.35, S.map + 0.1));
  const ka = eob(seg(t, a.t0 - 0.05, a.t0 + 0.4), 1.3), kb = eob(seg(t, b.t0 - 0.05, b.t0 + 0.4), 1.3);
  const bar = eio(seg(t, a.t0, b.t0 + 0.5));
  return (
    <div style={{ opacity: out }}>
      <div style={abs(64, 1360, { display: "flex", columnGap: 18, alignItems: "baseline" })}>
        <div style={{ ...stencil(104, 800), opacity: Math.min(1, ka * 2), transform: `translateY(${(1 - ka) * 40}px)` }}>Bandra</div>
        <div style={{ ...stencil(104, 800, MINT), opacity: Math.min(1, kb * 2), transform: `translateY(${(1 - kb) * 40}px)`, WebkitTextStroke: `2px ${INK}` }}>West</div>
      </div>
      <div style={abs(64, 1470, { width: 560 * bar, height: 8, background: INK })} />
    </div>
  );
}

// ------------------------------------------------------------ scene 2: map labels + seat count-up (locked to "fifteen") + year stamp (locked to "Twenty nineteen")
function MapLabels({ t }: { t: number }) {
  if (t < S.map + 0.2 || t >= S.croissant + 0.1) return null;
  const y0 = W("v2", 0), f = W("v2", 3), road = W("v2", 6);
  const fade = 1 - eo(seg(t, S.croissant - 0.45, S.croissant - 0.1));
  const kr = eo(seg(t, road.t0 - 0.05, road.t0 + 0.4)) * fade, ky = eob(seg(t, y0.t0 - 0.05, y0.t0 + 0.35), 1.4) * fade, ks = eob(seg(t, f.t0 - 0.35, f.t0 + 0.1), 1.3) * fade;
  const seats = Math.round(lerp(0, 15, eo(seg(t, f.t0 - 0.3, f.t0 + 0.5))));
  const shake = ky > 0.97 ? 0 : (1 - clamp(ky)) * 8;
  return (
    <>
      <div style={abs(0, 900, { width: 960, height: 560, background: INK, opacity: 0.93 * Math.max(kr, ky, ks) })} />
      <div style={abs(64, 930, { opacity: ky, transform: `translateX(${(1 - ky) * -70}px) rotate(${-2 + shake * 0.2}deg)`, display: "flex", alignItems: "center", columnGap: 18, background: MINT, padding: "10px 26px 8px" })}>
        <div style={mono(28, INK)}>Since</div><div style={{ ...stencil(88, 800, INK), fontVariantNumeric: "tabular-nums" }}>2019</div>
      </div>
      <div style={abs(64, 1070, { opacity: ks, transform: `translateY(${(1 - ks) * 40}px)`, display: "flex", alignItems: "baseline", columnGap: 20 })}>
        <div style={{ ...stencil(190, 800, CHALK), fontVariantNumeric: "tabular-nums", minWidth: 190 }}>{seats}</div><div style={mono(34, CHALK)}>seats at the start</div>
      </div>
      <div style={abs(64, 1290, { opacity: kr, transform: `translateY(${(1 - kr) * 30}px)` })}>
        <div style={mono(28, MINT)}>Bandra West · Mumbai</div>
        <div style={{ ...stencil(92, 700, CHALK), marginTop: 12 }}>Perry Cross Road</div>
      </div>
      <div style={abs(64, 1420, { ...mono(24, CHALK), background: SOFT, padding: "6px 12px 4px", opacity: Math.max(kr, ky) })}>Map data: OpenStreetMap contributors</div>
    </>
  );
}

// ------------------------------------------------------------ persistent: Bombay Cafe Map bar logo (small, from scene 2), cafe name tag, course tracker
function BarLogo({ t }: { t: number }) {
  if (t < S.map + 0.15 || t >= S.end) return null; const k = eo(seg(t, S.map + 0.15, S.map + 0.55)) * (1 - eo(seg(t, S.end - 0.4, S.end - 0.1)));
  return <div style={abs(64, 60, { width: 470, height: 115, borderRadius: 22, background: CHALK, opacity: 0.95 * k, overflow: "hidden", boxShadow: `0 0 0 4px ${INK}` })}><Img src={staticFile("brand/bombaycafemap-lockup-horizontal.png")} style={abs(0, 0, { width: 470, height: 115, objectFit: "contain" })} /></div>;
}
function NameTag({ t }: { t: number }) {
  if (t < S.map + 0.25 || t >= S.end) return null; const k = eob(seg(t, S.map + 0.25, S.map + 0.65), 1.3) * (1 - eo(seg(t, S.end - 0.4, S.end - 0.1)));
  return (
    <div style={abs(64, 222, { opacity: k, transform: `translateX(${(1 - k) * -80}px)` })}>
      <div style={{ background: INK, padding: "8px 22px 6px", ...stencil(54, 800, MINT), whiteSpace: "nowrap" }}>Boojee Cafe</div>
    </div>
  );
}
function Course({ t }: { t: number }) {
  if (t < S.croissant - 0.3 || t >= S.end + 0.5) return null;
  const k = eo(seg(t, S.croissant - 0.3, S.croissant + 0.2)) * (1 - eo(seg(t, S.end + 0.1, S.end + 0.5)));
  const starts = [S.croissant, S.avocado, S.crepe], names = ["Croissant", "Toast", "Crepes"];
  return (
    <div style={abs(64, 306, { display: "flex", columnGap: 12, opacity: k })}>
      {starts.map((s, i) => { const on = t >= s - 0.05, cur = t >= s && (i === 2 || t < starts[i + 1]); return (
        <div key={i} style={{ display: "flex", alignItems: "center", columnGap: 8, background: cur ? INK : "rgba(242,243,240,0.85)", border: `3px solid ${INK}`, padding: "4px 12px 2px" }}>
          <div style={{ ...mono(24, cur ? MINT : on ? INK : GREY) }}>{`0${i + 1}`}</div><div style={{ ...mono(24, cur ? CHALK : on ? INK : GREY) }}>{names[i]}</div>
        </div>); })}
    </div>
  );
}

// ------------------------------------------------------------ place-card tags: the dish name flips in and each word lights as it is spoken
type Tag = { clip: string; words: number[]; start: number; end: number; text: string[]; dur: number };
const TAGS: Tag[] = [
  { clip: "v3", words: [3, 4], start: S.croissant + 0.35, end: S.avocado - 0.1, text: ["Almond", "croissant"], dur: 0.4 },
  { clip: "v4", words: [1, 2], start: S.avocado + 0.35, end: S.crepe - 0.1, text: ["Avocado", "toast"], dur: 0.4 },
  { clip: "v5", words: [1], start: S.crepe + 0.35, end: S.end - 0.1, text: ["Crepes"], dur: 0.45 },
];
function DishTag({ t }: { t: number }) {
  const tg = TAGS.find((x) => t >= x.start - 0.05 && t < x.end + 0.1); if (!tg) return null;
  const inn = eob(seg(t, tg.start, tg.start + tg.dur), 1.1), out = 1 - eo(seg(t, tg.end - 0.3, tg.end));
  const c = CLIPS[tg.clip];
  return (
    <div style={abs(64, 1330, { perspective: 1000, opacity: Math.min(1, inn * 2) * out })}>
      <div style={{ transformOrigin: "50% 0%", transform: `rotateX(${(1 - inn) * -90}deg)`, background: CHALK, border: `6px solid ${INK}`, borderLeft: `22px solid ${MINT}`, padding: "16px 34px 18px 26px", boxShadow: `8px 8px 0 ${INK}` }}>
        <div style={{ display: "flex", columnGap: 20 }}>
          {tg.text.map((w, i) => { const spoken = t >= c.words[tg.words[i]].t0 - 0.02; return <div key={i} style={{ ...stencil(92, 800, spoken ? INK : "#9a9c9f"), whiteSpace: "nowrap" }}>{w}</div>; })}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ transition: a mint paint roller sweeps down and reveals the next scene
function RollerWipe({ t }: { t: number }) {
  const B = [S.map, S.croissant, S.avocado, S.crepe, S.end];
  const b = B.find((x) => t > x - 0.34 && t < x + 0.34); if (b === undefined) return null;
  const y = lerp(-2300, 1950, eio(seg(t, b - 0.34, b + 0.34)));
  return (
    <>
      <div style={abs(0, y, { width: 1080, height: 2300, background: MINT, borderBottom: `10px solid ${INK}` })} />
      <div style={abs(0, y + 2300, { width: 1080, height: 60, background: "linear-gradient(rgba(11,11,12,0.35), rgba(11,11,12,0))" })} />
    </>
  );
}

// ------------------------------------------------------------ scene 6: chalk end card, large Bombay Cafe Map lockup, handle held 3 s
function EndCard({ t }: { t: number }) {
  if (t < S.end - 0.05) return null; const u = t - S.end;
  const k = eob(seg(u, 0.2, 0.9), 1.2), k2 = eo(seg(u, 0.8, 1.3)), drift = 1 + 0.03 * seg(u, 1.0, 7.0);
  const kn = eob(seg(u, 0.5, 1.1), 1.3);
  const th = [0, 1].map((i) => W("v6", i));
  const fw = [2, 6, 7, 8, 9].map((i) => W("v6", i)), kb = eob(seg(t, fw[0].t0 - 0.05, fw[0].t0 + 0.4), 1.3);
  return (
    <AbsoluteFill style={{ background: CHALK }}>
      <div style={abs(100, 320, { width: 880, height: 558, borderRadius: 34, overflow: "hidden", boxShadow: `0 0 0 6px ${INK}`, transform: `scale(${(0.86 + 0.14 * k) * drift})`, opacity: Math.min(1, k * 2) })}><Img src={staticFile("brand/bombaycafemap-lockup-stacked.png")} style={abs(0, 0, { width: 880, height: 558, objectFit: "contain" })} /></div>
      <div style={abs(100, 912, { opacity: k2 })}><div style={mono(34, INK)}><span style={{ color: INK, background: MINT, padding: "2px 8px" }}>@bombaycafemap</span> · bombaycafemap.com</div></div>
      <div style={abs(100, 1010, { opacity: Math.min(1, kn * 2), transform: `translateY(${(1 - kn) * 30}px)` })}>
        <div style={{ ...stencil(158, 800, INK) }}>Boojee Cafe</div>
        <div style={{ ...mono(28, GREY), marginTop: 14 }}>Bandra West · since 2019</div>
      </div>
      <div style={abs(100, 1262, { display: "flex", columnGap: 16 })}>
        {["Humble", "beginnings."].map((w, i) => { const f = eo(seg(t, th[i].t0 - 0.02, th[i].t0 + 0.25)); return <div key={i} style={{ ...stencil(76, 700, INK), opacity: 0.3 + 0.7 * f }}>{w}</div>; })}
      </div>
      <div style={abs(100, 1382, { display: "flex", columnGap: 18, alignItems: "center", opacity: Math.min(1, kb * 2), transform: `translateY(${(1 - kb) * 24}px)`, background: INK, padding: "14px 34px 12px", borderRadius: 40 })}>
        {["Follow", "for", "the", "next", "one."].map((w, i) => { const f = eo(seg(t, fw[i].t0 - 0.02, fw[i].t0 + 0.25)); return <div key={i} style={{ ...stencil(64, 800, MINT), opacity: 0.4 + 0.6 * f }}>{w}</div>; })}
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
    <AbsoluteFill style={{ background: CHALK }}>
      <style>{CSS}</style>
      <Clip name="hook" from={0} to={S.map} />
      <Clip name="map" from={S.map} to={S.croissant} />
      <Clip name="croissant" from={S.croissant} to={S.avocado} />
      <Clip name="avocado" from={S.avocado} to={S.crepe} />
      <Clip name="crepe" from={S.crepe} to={S.end} />
      <HookTag t={t} /><MapLabels t={t} /><BarLogo t={t} /><NameTag t={t} /><Course t={t} /><DishTag t={t} />
      <EndCard t={t} />
      <RollerWipe t={t} />
    </AbsoluteFill>
  );
}
registerRoot(() => <Composition id="boojee" component={Film} width={1080} height={1920} fps={FPS} durationInFrames={Math.round(TOTAL * FPS)} />);
