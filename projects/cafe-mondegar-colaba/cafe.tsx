// Cafe Mondegar reel for Bombay Cafe Map: "Now Playing". raea composition (React/TS). 3D scenes (map dive, jukebox, plate) are three.js renders in media/clips;
// all type, wipes, murals, end card and the audio-reactive bars are raea. Every caption and animation reads src/cues.ts (voice word times, L046) and src/eq.ts (bars from the final mix).
import { AbsoluteFill, Composition, Img, Sequence, Video, registerRoot, staticFile, useCurrentFrame } from "raea";
import { CLIPS, TOTAL } from "./src/cues";
import { EQ } from "./src/eq";

const FPS = 30;
const NAVY = "#0B1233", CHROME = "#EEF2F7", PINK = "#FF3E8A", PINKD = "#C81F66", MUTE = "#8F9BC4", DEEP = "#141C4A";   // PINKD: pink text on chrome (3:1+)
const S = { map: 5.8, mural: 11.2, juke: 16.6, plate: 22.0, end: 27.4 };       // scene starts (s)
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const eo = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const eio = (x: number) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const eob = (x: number, o = 1.5) => { x = clamp(x); const c = o + 1; return 1 + c * Math.pow(x - 1, 3) + o * Math.pow(x - 1, 2); };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const W = (clip: string, i: number) => CLIPS[clip].words[i];
const abs = (l: number, t: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: "absolute", left: l, top: t, ...extra });
const CSS = `
@font-face{font-family:'Fraunces';src:url(${staticFile("fonts/Fraunces.ttf")});font-weight:100 900}
@font-face{font-family:'DM Mono';src:url(${staticFile("fonts/DMMono-Regular.ttf")});font-weight:400}
@font-face{font-family:'DM Mono';src:url(${staticFile("fonts/DMMono-Medium.ttf")});font-weight:500}`;
const serif = (size: number, wght: number, color = CHROME): React.CSSProperties => ({ fontFamily: "'Fraunces'", fontSize: size, fontWeight: wght, fontVariationSettings: `"wght" ${wght}, "opsz" 144`, lineHeight: 0.95, color });
const mono = (size: number, color = MUTE): React.CSSProperties => ({ fontFamily: "'DM Mono'", fontSize: size, fontWeight: 500, letterSpacing: size * 0.12, textTransform: "uppercase", color });
const pulse = (t: number, t0: number, base = 560, peak = 900) => base + (peak - base) * Math.exp(-Math.max(0, t - t0) * 5.5) * (t >= t0 ? 1 : 0);
const circle = (cx: number, cy: number, d: number, bg: string, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: "absolute", left: cx - d / 2, top: cy - d / 2, width: d, height: d, borderRadius: d / 2, background: bg, ...extra });
const frameNo = (t: number) => Math.min(EQ.length - 1, Math.max(0, Math.round(t * FPS)));

// ------------------------------------------------------------ vinyl record (wipe, hook, end card)
function Disc({ cx, cy, d, rot, label = PINK }: { cx: number; cy: number; d: number; rot: number; label?: string }) {
  return (
    <div style={circle(cx, cy, d, "#05081c", { transform: `rotate(${rot}deg)`, boxShadow: "0 0 0 6px #1b2358", overflow: "hidden" })}>
      {[0.46, 0.52, 0.58, 0.64, 0.70, 0.76, 0.82, 0.88, 0.94].map((r) => <div key={r} style={circle(d / 2, d / 2, d * r, "transparent", { border: "2px solid rgba(238,242,247,0.10)", boxSizing: "border-box" })} />)}
      <div style={abs(d * 0.5, d * 0.06, { width: d * 0.38, height: d * 0.1, background: "rgba(238,242,247,0.10)", borderRadius: d, transform: "rotate(24deg)" })} />
      <div style={circle(d / 2, d / 2, d * 0.34, label)} /><div style={circle(d / 2, d / 2, d * 0.30, "transparent", { border: `3px solid ${NAVY}`, opacity: 0.35 })} />
      <div style={circle(d / 2, d / 2, d * 0.035, NAVY)} />
    </div>
  );
}
function DiscWipe({ t, tb }: { t: number; tb: number }) {      // a huge record sweeps across and hides the cut at tb
  const u = (t - (tb - 0.38)) / 0.76; if (u < 0 || u > 1) return null;
  const cx = lerp(-1750, 2830, eio(u));
  return <><Disc cx={cx} cy={960} d={3000} rot={u * 420} /><div style={abs(0, 0, { width: 1080, height: 1920, background: PINK, opacity: 0.55 * Math.max(0, 1 - Math.abs(u - 0.5) * 7) })} /></>;
}
function Bars({ t, x0 = 94, y = 1450, h = 130, k = 1 }: { t: number; x0?: number; y?: number; h?: number; k?: number }) {
  const row = EQ[frameNo(t)] ?? [];
  return <div style={{ opacity: k }}>{row.map((v, i) => { const bh = 10 + v * h; return <div key={i} style={abs(x0 + i * 76, y - bh, { width: 56, height: bh, background: v > 0.82 ? CHROME : PINK, borderRadius: 4 })} />; })}</div>;
}

// ------------------------------------------------------------ scene 1: coin, clunk, the name on a jukebox title strip
function Hook({ t }: { t: number }) {
  if (t > S.map + 0.45) return null;
  const coinY = lerp(-160, 560, eo(seg(t, 0.0, 0.5))), coinIn = t < 0.56; const spin = Math.abs(Math.cos(t * 17));
  const flash = Math.max(0, 1 - seg(t, 0.62, 0.92)) * (t >= 0.62 ? 1 : 0);
  const neon = t < 0.7 ? 0 : t < 1.2 ? [1, 0, 1, 0, 1, 1, 0, 1][Math.floor((t - 0.7) * 16) % 8] * 0.9 + 0.1 : 1;
  const k1 = eob(seg(t, W("v1", 0).t0 - 0.05, W("v1", 0).t0 + 0.28), 1.8), k2 = eob(seg(t, W("v1", 1).t0 - 0.05, W("v1", 1).t0 + 0.3), 1.8);
  const kc = eo(seg(t, W("v1", 2).t0 - 0.05, W("v1", 2).t0 + 0.3));
  const yr = W("v1", 4); const n = Math.round(lerp(1900, 1932, eo(seg(t, yr.t0 - 0.1, yr.t0 + 0.7)))); const ky = eo(seg(t, W("v1", 3).t0 - 0.05, W("v1", 3).t0 + 0.3));
  const arm = lerp(-38, 4, eob(seg(t, 0.75, 1.15), 1.3));
  const sh = k1 > 0 && k1 < 1 ? 0 : 0;
  return (
    <AbsoluteFill style={{ background: NAVY }}>
      <div style={abs(540 - 150, 592, { width: 300, height: 20, background: "#02040f", borderRadius: 10, outline: flash > 0 ? `${Math.round(8 * flash) + 2}px solid ${PINK}` : "none" })} />
      {coinIn && <div style={{ ...circle(540, coinY, 130, CHROME, { boxShadow: "inset -14px -14px 0 #9aa6c4" }), transform: `scaleX(${0.15 + 0.85 * spin})`, opacity: t > 0.44 ? 1 - seg(t, 0.44, 0.56) : 1 }} />}
      <div style={abs(40, 650, { width: 1000, height: 600, borderRadius: 44, border: `7px solid ${PINK}`, opacity: neon, outline: `3px solid rgba(255,62,138,${0.35 * neon})`, outlineOffset: 10 })} />
      <div style={abs(64, 676, { width: 952, height: 548, borderRadius: 26, background: CHROME, transform: `scale(${eob(seg(t, 0.62, 1.0), 1.4) * (1 + 0.025 * seg(t, 1.0, 5.8))})`, transformOrigin: "50% 50%", opacity: seg(t, 0.62, 0.8) })}>
        <div style={abs(0, 0, { width: 952, height: 18, background: PINK, borderRadius: "26px 26px 0 0" })} />
        <div style={abs(44, 54, { opacity: k1, transform: `scale(${lerp(1.5, 1, k1)})`, transformOrigin: "0 50%" })}><div style={serif(210, pulse(t, W("v1", 0).t0, 640, 900), NAVY)}>Cafe</div></div>
        <div style={abs(44, 248, { opacity: k2, transform: `scale(${lerp(1.5, 1, k2)})`, transformOrigin: "0 50%" })}><div style={serif(166, pulse(t, W("v1", 1).t0, 640, 900), NAVY)}>Mondegar</div></div>
        <div style={abs(44, 440, { width: 864, height: 3, background: NAVY, opacity: 0.25 * kc })} />
        <div style={abs(44, 458, { opacity: kc, transform: `translateX(${(1 - kc) * -40}px)` })}><div style={{ ...mono(38, PINKD), fontWeight: 500 }}>Colaba, Mumbai</div></div>
        <div style={abs(560, 458, { opacity: ky })}><div style={{ ...mono(38, NAVY) }}>Since {n}</div></div>
      </div>
      <Bars t={t} y={1440} h={150} k={seg(t, 0.8, 1.3)} />
      <Disc cx={540} cy={1930} d={760} rot={t * 200} />
    </AbsoluteFill>
  );
}

// ------------------------------------------------------------ scene 2: map overlays
function MapLabels({ t }: { t: number }) {
  if (t < S.map + 0.2 || t >= S.mural + 0.1) return null;
  const a = W("v2", 2), b = W("v2", 5);
  const place = eo(seg(t, a.t0 - 0.05, a.t0 + 0.4)) * (1 - eo(seg(t, 9.4, 9.8)));
  const near = eob(seg(t, b.t0 - 0.05, b.t0 + 0.35), 1.4) * (1 - eo(seg(t, 10.2, 10.6)));
  return (
    <>
      <div style={abs(0, 380, { width: 820, height: 520, background: "rgba(11,18,51,0.80)", opacity: place })} />
      <div style={abs(0, 960, { width: 640, height: 140, background: "rgba(11,18,51,0.80)", opacity: near })} />
      <div style={abs(64, 470, { opacity: place, transform: `translateY(${(1 - place) * 40}px)` })}><div style={mono(30)}>Mumbai · South Bombay</div><div style={{ ...serif(160, pulse(t, a.t0)), marginTop: 14 }}>Colaba<br />Causeway</div></div>
      <div style={abs(64, 1010, { opacity: near, transform: `translateX(${(1 - near) * -120}px)` })}><div style={{ background: PINK, padding: "12px 26px 10px", ...mono(34, NAVY), fontWeight: 500 }}>Near Regal Cinema</div></div>
      <div style={abs(64, 1452, { ...mono(20), opacity: 0.85 })}>Map data: OpenStreetMap contributors</div>
    </>
  );
}
// ------------------------------------------------------------ scene 3: murals on a printed card, parallax push, pink scan light
function Murals({ t }: { t: number }) {
  if (t < S.mural - 0.05 || t >= S.juke + 0.1) return null;
  const u = seg(t, S.mural, S.juke); const zoom = lerp(1.0, 1.22, eio(u)); const pan = lerp(-60, 60, eio(u));
  const card = eob(seg(t, S.mural + 0.25, S.mural + 0.85), 1.2); const scan = seg(t, S.mural + 0.9, S.mural + 3.9);
  return (
    <AbsoluteFill style={{ background: NAVY }}>
      <Img src={staticFile("murals.jpg")} style={abs(-380, -100, { width: 1840, height: 2120, objectFit: "cover", opacity: 0.0, transform: `scale(${1.05 + 0.06 * u})` })} />
      <div style={abs(60, 520, { width: 960, height: 720, transform: `rotate(${lerp(-4, -1.5, eio(u))}deg) translateY(${(1 - card) * 700}px)`, opacity: Math.min(1, card * 2), boxShadow: `0 0 0 8px ${PINK}`, overflow: "hidden", background: NAVY })}>
        <Img src={staticFile("murals.jpg")} style={abs(-(zoom - 1) * 480 + pan * -0.4, -(zoom - 1) * 360, { width: 960 * zoom, height: 720 * zoom })} />
        <div style={abs(0, 0, { width: 960, height: 720, background: NAVY, opacity: 0.22, mixBlendMode: "multiply" })} />
        <div style={abs(lerp(-300, 1100, scan), 0, { width: 240, height: 720, background: "rgba(255,62,138,0.32)", transform: "skewX(-14deg)", mixBlendMode: "screen" })} />
      </div>
      <div style={abs(64, 1452, { ...mono(20), opacity: 0.85 })}>Photo: zadeus on Flickr · CC BY-SA 2.0</div>
    </AbsoluteFill>
  );
}
// ------------------------------------------------------------ scene 4/5 overlays
function JukeLabel({ t }: { t: number }) {
  if (t < S.juke + 0.2 || t >= S.plate + 0.1) return null; const k = eo(seg(t, S.juke + 0.3, S.juke + 0.7)) * (1 - eo(seg(t, S.plate - 0.2, S.plate + 0.05)));
  return <div style={abs(650, 268, { opacity: k, ...mono(28, PINK) })}>● Now playing</div>;
}
function PlateWords({ t }: { t: number }) {
  if (t < S.plate + 0.5 || t >= S.end + 0.1) return null; const c = W("v5", 4), g = W("v5", 5);
  const out = 1 - eo(seg(t, S.end - 0.2, S.end + 0.05)); const inn = eob(seg(t, W("v5", 0).t0 - 0.1, W("v5", 0).t0 + 0.3), 1.2);
  const kk = eob(seg(t, c.t0 - 0.05, c.t0 + 0.35), 1.6), kg = eob(seg(t, g.t0 - 0.05, g.t0 + 0.35), 1.6);
  return (
    <div style={abs(64, 1290, { width: 860, height: 190, background: CHROME, borderRadius: 22, borderTop: `14px solid ${PINK}`, boxSizing: "border-box", opacity: out * Math.min(1, inn * 2), transform: `translateY(${(1 - inn) * 80}px)` })}>
      <div style={abs(36, 30, { ...mono(26, "#5b6593") })}>For breakfast, order</div>
      <div style={abs(36, 68, { display: "flex", columnGap: 22 })}>
        <div style={{ ...serif(96, pulse(t, c.t0, 560, 900), NAVY), opacity: kk, transform: `translateY(${(1 - kk) * 40}px)` }}>Kheema</div>
        <div style={{ ...serif(96, pulse(t, g.t0, 560, 900), PINKD), opacity: kg, transform: `translateY(${(1 - kg) * 40}px)` }}>ghotala</div>
      </div>
    </div>
  );
}
function FoodTags({ t }: { t: number }) {
  if (t < S.plate + 1 || t >= S.end) return null; const out = 1 - eo(seg(t, S.end - 0.3, S.end - 0.05));
  const tag = (txt: string, t0: number, x: number, y: number) => { const k = eob(seg(t, t0, t0 + 0.35), 1.8); return <div key={txt} style={abs(x, y, { opacity: Math.min(1, k * 2) * out, transform: `scale(${0.4 + 0.6 * k}) rotate(${(1 - k) * -8}deg)`, transformOrigin: "0 50%", background: PINK, padding: "10px 24px 8px", ...mono(30, NAVY), fontWeight: 500 })}>{txt}</div>; };
  return <>{tag("Toast", S.plate + 1.55, 64, 820)}{tag("Fried eggs", S.plate + 2.75, 690, 800)}</>;
}
// ------------------------------------------------------------ persistent: bar logo, name tag, captions
function BarLogo({ t }: { t: number }) {
  if (t < S.map + 0.15 || t >= S.end) return null; const k = eo(seg(t, S.map + 0.15, S.map + 0.55));
  return <div style={abs(64, 60, { width: 470, height: 115, borderRadius: 22, background: CHROME, opacity: k, overflow: "hidden" })}><Img src={staticFile("brand/bombaycafemap-lockup-horizontal.png")} style={abs(0, 0, { width: 470, height: 115, objectFit: "contain" })} /></div>;
}
function NameTag({ t }: { t: number }) {
  if (t < S.map + 0.25 || t >= S.end) return null; const k = eob(seg(t, S.map + 0.25, S.map + 0.65), 1.3);
  return <div style={abs(64, 250, { background: PINK, padding: "8px 24px 6px", opacity: k, transform: `translateX(${(1 - k) * -80}px)`, ...serif(54, 800, NAVY), whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: 2 })}>Cafe Mondegar</div>;
}
const CAPTION_CLIPS = ["v3", "v4"];
function Caption({ t }: { t: number }) {
  const key = CAPTION_CLIPS.find((k) => t >= CLIPS[k].start - 0.05 && t < CLIPS[k].end + 0.45); if (!key) return null;
  const c = CLIPS[key]; const out = 1 - seg(t, c.end + 0.25, c.end + 0.45); const inn = eob(seg(t, c.start - 0.05, c.start + 0.35), 1.2);
  return (
    <div style={abs(64, 1235, { width: 860, minHeight: 170, background: CHROME, borderRadius: 22, borderTop: `14px solid ${PINK}`, padding: "22px 36px 24px", opacity: out * Math.min(1, inn * 2), transform: `translateY(${(1 - inn) * 80}px)`, display: "flex", flexWrap: "wrap", columnGap: 16, alignContent: "center", boxSizing: "border-box" })}>
      {c.words.map((w, i) => { const k = eo(seg(t, w.t0 - 0.02, w.t0 + 0.2)); const cur = t >= w.t0 && t < w.t1 + 0.12; return <span key={i} style={{ ...serif(64, pulse(t, w.t0, 560, 900), cur ? PINKD : NAVY), opacity: k, display: "block", lineHeight: 1.1 }}>{w.w}</span>; })}
    </div>
  );
}
// ------------------------------------------------------------ scene 6: the record spins down into the Bombay Cafe Map lockup
function EndCard({ t }: { t: number }) {
  if (t < S.end - 0.05) return null; const u = t - S.end;
  const spinA = u < 0.3 ? 0 : 1800 * (1 - Math.exp(-(u - 0.3) / 0.9)) * 0.9 + 40 * (u - 0.3);   // fast then settling: spin-down
  const k = eob(seg(u, 0.35, 0.9), 1.3), k2 = eo(seg(u, 0.9, 1.3)), drift = 1 + 0.035 * seg(u, 1.0, 6.0);
  return (
    <AbsoluteFill style={{ background: NAVY }}>
      <Disc cx={540} cy={720} d={1040 * (0.9 + 0.1 * eo(seg(u, 0.1, 0.8)))} rot={spinA} />
      <div style={abs(100, 441, { width: 880, height: 558, borderRadius: 34, background: CHROME, overflow: "hidden", transform: `scale(${(0.85 + 0.15 * k) * drift})`, opacity: Math.min(1, k * 2), boxShadow: `0 0 0 6px ${PINK}` })}><Img src={staticFile("brand/bombaycafemap-lockup-stacked.png")} style={abs(0, 0, { width: 880, height: 558, objectFit: "contain" })} /></div>
      <div style={abs(100 + 18 * seg(u, 1, 6), 1085, { opacity: k2 })}><div style={{ ...mono(32, CHROME) }}><span style={{ color: PINK }}>@bombaycafemap</span> · bombaycafemap.com</div></div>
      <div style={abs(100 + 30 * seg(u, 1, 6), 1170, { opacity: k2 })}><div style={mono(26)}>This week</div><div style={{ ...serif(96, 800), marginTop: 8 }}>Cafe Mondegar</div><div style={{ ...mono(26), marginTop: 10 }}>Colaba · Mumbai</div></div>
      <div style={abs(100, 1362, { background: PINK, padding: "14px 34px 12px", borderRadius: 40, opacity: k2, transform: `scale(${1 + 0.04 * Math.sin(u * 5)})`, transformOrigin: "0 50%", ...mono(30, NAVY), fontWeight: 500 })}>Follow for more Mumbai cafes</div>
      <Bars t={t} y={1500} h={56} k={k2} />
    </AbsoluteFill>
  );
}

function Film() {
  const t = useCurrentFrame() / FPS; const fr = (s: number) => Math.round(s * FPS);
  return (
    <AbsoluteFill style={{ background: NAVY }}>
      <style>{CSS}</style>
      <Hook t={t} />
      <Sequence from={fr(S.map)} durationInFrames={fr(S.mural - S.map)}><Video src={staticFile("clips/map.mp4")} style={abs(0, 0, { width: 1080, height: 1920 })} /></Sequence>
      <Murals t={t} />
      <Sequence from={fr(S.juke)} durationInFrames={fr(S.plate - S.juke)}><Video src={staticFile("clips/jukebox.mp4")} style={abs(0, 0, { width: 1080, height: 1920 })} /></Sequence>
      <Sequence from={fr(S.plate)} durationInFrames={fr(S.end - S.plate)}><Video src={staticFile("clips/plate.mp4")} style={abs(0, 0, { width: 1080, height: 1920 })} /></Sequence>
      <MapLabels t={t} /><JukeLabel t={t} /><PlateWords t={t} /><FoodTags t={t} />
      <BarLogo t={t} /><NameTag t={t} /><Caption t={t} />
      <EndCard t={t} />
      {[S.map, S.mural, S.juke, S.plate, S.end].map((b) => <DiscWipe key={b} t={t} tb={b} />)}
    </AbsoluteFill>
  );
}
registerRoot(() => <Composition id="mondegar" component={Film} width={1080} height={1920} fps={FPS} durationInFrames={Math.round(TOTAL * FPS)} />);
