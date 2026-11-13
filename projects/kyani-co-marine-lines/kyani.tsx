// Kyani & Co. reel for Bombay Cafe Map, rendered by raea (React/TS composition, Bevy 3D map). 1080x1920, 30 fps.
// Every caption and animation reads src/cues.ts (whisper word times of the narration): one clock (L046).
import { AbsoluteFill, Composition, Img, registerRoot, staticFile, useCurrentFrame } from "raea";
import { Canvas3D } from "raea/3d";
import { Camera3d } from "raea/camera";
import { Transform } from "raea/transform";
import { Mesh3d, BufferMesh } from "raea/mesh";
import { StandardMaterial } from "raea/pbr";
import { DirectionalLight, AmbientLight, SpotLight } from "raea/light";
import { CITY, JER, ROADS, SIL, SILEDGE, SILROADS, ISLAND_BBOX, JER_FACTS, JERWINLIT, JERWINDARK, JERDETAIL } from "./src/mapdata";
import { CLIPS, TOTAL } from "./src/cues";

const FPS = 30;
const INK = "#121316", MARBLE = "#F1F4F6", RED = "#D0344A", MUTE = "#9AA3B2";
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const eo = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const eio = (x: number) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const eob = (x: number, o = 1.5) => { x = clamp(x); const c = o + 1; return 1 + c * Math.pow(x - 1, 3) + o * Math.pow(x - 1, 2); };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const W = (clip: string, i: number) => CLIPS[clip].words[i];
// what the caption SHOWS for a spoken word (the voice is fed phonetic spellings; the screen never shows them)
const SHOW: Record<string, string> = { Kyahnee: "Kyani", and: "&", Co: "Co.", nineteen: "1904", Irani: "Irani" };
const HIDE = new Set(["oh", "four"]);

// timeline (seconds), from the voice word times
const T_MAP = 1.7, T_TABLE = 6.6, T_BUN = 10.4, T_CAKE = 12.6, T_BILL = 15.85, T_END = 16.8;
const J = JER_FACTS.centre;

const CSS = `
@font-face{font-family:'Fraunces';src:url(${staticFile("fonts/Fraunces.ttf")});font-weight:100 900}
@font-face{font-family:'DM Mono';src:url(${staticFile("fonts/DMMono-Regular.ttf")});font-weight:400}
@font-face{font-family:'DM Mono';src:url(${staticFile("fonts/DMMono-Medium.ttf")});font-weight:500}
`;
const serif = (size: number, wght: number): React.CSSProperties => ({ fontFamily: "'Fraunces'", fontSize: size, fontWeight: wght, fontVariationSettings: `"wght" ${wght}, "opsz" 144`, lineHeight: 0.95, color: MARBLE });
const mono = (size: number): React.CSSProperties => ({ fontFamily: "'DM Mono'", fontSize: size, fontWeight: 500, letterSpacing: size * 0.1, textTransform: "uppercase", color: MUTE });
const abs = (l: number, t: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: "absolute", left: l, top: t, ...extra });
// weight pulse (the experiment): a word swells on its spoken beat and settles
const pulse = (t: number, t0: number, base = 560, peak = 900) => base + (peak - base) * Math.exp(-Math.max(0, t - t0) * 5.5) * (t >= t0 ? 1 : 0);

// ---------------------------------------------------------------- scene 1: the name, under a ceiling fan
function Fan({ t }: { t: number }) {
  const spin = 1500 * 0.5 * (1 - Math.exp(-t / 0.5)) + 110 * t;       // degrees, fast then slowing
  const k = 1 + 4 * eio(seg(t, 1.45, 1.95)); const op = 1 - eio(seg(t, 1.55, 1.95));
  const blade = (rot: number, o: number) => (
    <div style={abs(540 - 12, 470 - 12, { width: 24, height: 24, transform: `rotate(${rot}deg)`, opacity: o })}>
      <div style={abs(-30, -62, { width: 330, height: 96, borderRadius: 48, background: "linear-gradient(90deg,#d0344a,#7a1d2b)", transform: "translateX(16px)" })} />
    </div>
  );
  return (
    <div style={abs(0, 0, { width: 1080, height: 1920, transform: `scale(${k})`, transformOrigin: "540px 482px", opacity: op })}>
      {[0, 90, 180, 270].map((b) => [<div key={"g3" + b}>{blade(spin + b - 30, 0.1)}</div>, <div key={"g2" + b}>{blade(spin + b - 18, 0.2)}</div>, <div key={"g1" + b}>{blade(spin + b - 8, 0.4)}</div>, <div key={b}>{blade(spin + b, 1)}</div>])}
      <div style={abs(540 - 54, 482 - 54, { width: 108, height: 108, borderRadius: 54, background: MARBLE })} />
      <div style={abs(540 - 14, 482 - 14, { width: 28, height: 28, borderRadius: 14, background: INK })} />
    </div>
  );
}
function Opening({ t }: { t: number }) {
  if (t > 2.0) return null;
  const fade = 1 - eio(seg(t, 1.5, 1.95));
  const k1 = eob(seg(t, W("v1", 0).t0, W("v1", 0).t0 + 0.4), 1.2), k2 = eob(seg(t, W("v1", 2).t0 - 0.12, W("v1", 2).t0 + 0.4), 1.2);
  return (
    <AbsoluteFill style={{ background: `rgba(18,19,22,${fade})` }}>
      <Fan t={t} />
      <div style={abs(64, 860, { opacity: k1 * (1 - eio(seg(t, 1.6, 1.95))), transform: `translateY(${(1 - k1) * 60}px)` })}>
        <div style={serif(250, pulse(t, W("v1", 0).t0))}>Kyani</div>
      </div>
      <div style={abs(64, 1100, { opacity: k2 * (1 - eio(seg(t, 1.6, 1.95))), transform: `translateY(${(1 - k2) * 60}px)` })}>
        <div style={{ ...serif(150, pulse(t, W("v1", 2).t0)), color: RED }}>&amp; Co.</div>
      </div>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------- scene 2: map dive island -> Marine Lines -> Jer Mahal
function useMapCam(t: number) {
  const u = clamp((t - T_MAP) / (T_TABLE - T_MAP));
  const cx = (ISLAND_BBOX[0] + ISLAND_BBOX[2]) / 2 - 3500, cz = (ISLAND_BBOX[1] + ISLAND_BBOX[3]) / 2 + 3000;
  // altitude falls on a log scale: island silhouette -> neighbourhood -> the building
  const alt = Math.exp(lerp(Math.log(52000), Math.log(150), eio(Math.pow(u, 0.9))));
  const k = eio(clamp((u - 0.12) / 0.7));
  const tx = lerp(cx, J[0], k), tz = lerp(cz, J[1], k);
  const pitch = lerp(88, 38, eio(clamp((u - 0.25) / 0.7))) * Math.PI / 180;
  const orbit = lerp(0, -0.55, eio(clamp((u - 0.55) / 0.45)));
  const horiz = alt / Math.tan(pitch);
  return { pos: [tx + Math.sin(orbit) * horiz, alt, tz + Math.cos(orbit) * horiz] as [number, number, number], look: [tx, 8, tz] as [number, number, number], u, alt };
}
function World({ t }: { t: number }) {
  const cam = useMapCam(t);
  const dim = 1 - 0.7 * eio(seg(t, 5.0, 5.9));          // everything but the Jer Mahal building dims at the end
  return (
    <Canvas3D layered>
      <Camera3d transform={Transform.fromXyz(...cam.pos).lookingAt(cam.look)} projection={{ Perspective: { fov: (38 * Math.PI) / 180, near: 5, far: 400000 } }} />
      <DirectionalLight transform={Transform.fromXyz(J[0] - 400, 600, J[1] + 250).lookingAt([J[0], 0, J[1]])} illuminance={9500 * dim} shadow_maps_enabled />
      <AmbientLight brightness={300 * dim + 40} color="#9fb0d8" />
      <SpotLight transform={Transform.fromXyz(J[0] - 40, 150, J[1] + 120).lookingAt([J[0], 6, J[1]])} intensity={60000000 * eio(seg(t, 4.9, 5.8))} range={600} color="#ffffff" />
      <Mesh3d name="sil"><BufferMesh {...SIL} /><StandardMaterial base_color="#ffffff" unlit /></Mesh3d>
      <Mesh3d name="siledge"><BufferMesh {...SILEDGE} /><StandardMaterial base_color="#ffffff" unlit /></Mesh3d>
      <Mesh3d name="silroads"><BufferMesh {...SILROADS} /><StandardMaterial base_color="#ffffff" unlit /></Mesh3d>
      <Mesh3d name="city"><BufferMesh {...CITY} /><StandardMaterial base_color="#ffffff" perceptual_roughness={0.9} /></Mesh3d>
      <Mesh3d name="roads"><BufferMesh {...ROADS} /><StandardMaterial base_color="#ffffff" perceptual_roughness={1} /></Mesh3d>
      <Mesh3d name="jer"><BufferMesh {...JER} /><StandardMaterial base_color="#ffffff" perceptual_roughness={0.6} /></Mesh3d>
      <Mesh3d name="jerdetail"><BufferMesh {...JERDETAIL} /><StandardMaterial base_color="#ffffff" perceptual_roughness={0.7} /></Mesh3d>
      <Mesh3d name="jerdark"><BufferMesh {...JERWINDARK} /><StandardMaterial base_color="#ffffff" perceptual_roughness={0.3} /></Mesh3d>
      <Mesh3d name="jerlit"><BufferMesh {...JERWINLIT} /><StandardMaterial base_color="#ffffff" unlit /></Mesh3d>
    </Canvas3D>
  );
}

// ---------------------------------------------------------------- overlays: bar logo, name tag, captions, labels
function BarLogo({ t }: { t: number }) {
  if (t < T_MAP + 0.1 || t >= T_END) return null;
  const k = eo(seg(t, T_MAP + 0.1, T_MAP + 0.5));
  return <div style={abs(64, 60, { width: 470, height: 115, borderRadius: 22, background: MARBLE, opacity: k, overflow: "hidden" })}><Img src={staticFile("brand/bombaycafemap-lockup-horizontal.png")} style={abs(0, 0, { width: 470, height: 115, objectFit: "contain" })} /></div>;
}
function NameTag({ t }: { t: number }) {
  if (t < 2.0 || t >= T_END) return null;
  const k = eob(seg(t, 2.0, 2.4), 1.3);
  return <div style={abs(64, 250, { background: RED, padding: "8px 24px 6px", opacity: k, transform: `translateX(${(1 - k) * -80}px)`, ...serif(54, 800), color: MARBLE, whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: 2 })}>Kyani &amp; Co.</div>;
}
function Caption({ t }: { t: number }) {
  // the sentence being spoken: words appear on their own times, the current word swells (weight pulse)
  const clipKey = Object.keys(CLIPS).find((k) => t >= CLIPS[k].start - 0.05 && t < CLIPS[k].end + 0.35);
  if (!clipKey || clipKey === "v1") return null;
  const c = CLIPS[clipKey]; const out = 1 - seg(t, c.end + 0.1, c.end + 0.35);
  return (
    <div style={abs(64, 1320, { width: 880, opacity: out, display: "flex", flexWrap: "wrap", columnGap: 18 })}>
      {c.words.filter((w) => !HIDE.has(w.w)).map((w, i) => { const k = eo(seg(t, w.t0 - 0.02, w.t0 + 0.2)); return <span key={i} style={{ ...serif(64, pulse(t, w.t0, 520, 860)), opacity: k, transform: `translateY(${(1 - k) * 24}px)`, display: "block", lineHeight: 1.08 }}>{SHOW[w.w] ?? w.w}</span>; })}
    </div>
  );
}
function MapLabels({ t }: { t: number }) {
  if (t < T_MAP + 0.2 || t >= T_TABLE + 0.2) return null;
  const a = W("v1", 3); const place = eo(seg(t, a.t0 - 0.05, a.t0 + 0.35)) * (1 - eo(seg(t, 4.3, 4.6)));
  const year = W("v1", 5);
  const n = Math.round(lerp(1850, 1904, eo(seg(t, year.t0 - 0.05, year.t0 + 0.7))));
  const yk = eo(seg(t, year.t0 - 0.05, year.t0 + 0.3)) * (1 - eo(seg(t, 6.3, 6.6)));
  return (
    <>
      <div style={abs(64, 470, { opacity: place })}><div style={mono(30)}>Mumbai · South Bombay</div><div style={{ ...serif(170, pulse(t, a.t0)), marginTop: 14 }}>Marine<br />Lines</div></div>
      <div style={abs(64, 1020, { opacity: yk })}><div style={mono(30)}>Open since</div><div style={{ ...serif(200, pulse(t, year.t0 + 0.4)), color: RED }}>{n}</div></div>
      <div style={abs(64, 1470, { ...mono(20), opacity: 0.8 })}>Map data: OpenStreetMap contributors</div>
    </>
  );
}


// ---------------------------------------------------------------- scenes 3-6: the marble table, top-down (simple first cut)
const rot = (deg: number) => `rotate(${deg}deg)`;
const circle = (cx: number, cy: number, d: number, bg: string, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: "absolute", left: cx - d / 2, top: cy - d / 2, width: d, height: d, borderRadius: d / 2, background: bg, ...extra });
const ell = (cx: number, cy: number, w: number, h: number, bg: string, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: "absolute", left: cx - w / 2, top: cy - h / 2, width: w, height: h, borderRadius: Math.min(w, h) / 2, background: bg, ...extra });
const VEINS = [[-120, 330, 1500, -18], [200, 700, 1300, 9], [-80, 1010, 1600, -26], [300, 1300, 1200, 14], [-200, 520, 1400, 31], [100, 1560, 1500, -8], [400, 120, 1100, 22]];
function Marble({ t, t0 }: { t: number; t0: number }) {
  const k = eo(seg(t, t0, t0 + 0.25));
  return (
    <AbsoluteFill style={{ background: "#16181d", opacity: k }}>
      {VEINS.map((v, i) => <div key={i} style={abs(v[0], v[1], { width: v[2], height: 2 + (i % 3), transform: rot(v[3]), background: "linear-gradient(90deg, rgba(241,244,246,0), rgba(241,244,246,0.16), rgba(241,244,246,0))" })} />)}
    </AbsoluteFill>
  );
}
function PlateAt({ x, y, d, k = 1 }: { x: number; y: number; d: number; k?: number }) {
  return (<div style={{ opacity: Math.min(1, k * 2), transform: `scale(${0.6 + 0.4 * k})`, transformOrigin: `${x}px ${y}px` }}>
    <div style={circle(x + 14, y + 20, d, "rgba(0,0,0,0.45)")} /><div style={circle(x, y, d, MARBLE)} /><div style={circle(x, y, d * 0.8, "#E3E8EC")} /><div style={circle(x, y, d * 0.72, "#F7F9FA")} />
  </div>);
}
function Chair({ x, y, ang, k }: { x: number; y: number; ang: number; k: number }) {
  return (<div style={{ opacity: Math.min(1, k * 2), transform: `scale(${0.4 + 0.6 * k}) ${rot(ang)}`, transformOrigin: `${x}px ${y}px` }}>
    <div style={circle(x, y, 190, "#6B4A35")} /><div style={circle(x, y, 140, "#7d583f")} />
    <div style={ell(x, y + (ang === 180 ? -118 : 118), 200, 34, "#3a1c0f")} />
  </div>);
}
function TableScene({ t }: { t: number }) {   // 6.6 - 10.4 : marble, slow fans, shared seats
  if (t < T_TABLE || t >= T_BUN + 0.1) return null;
  const k = eob(seg(t, T_TABLE + 0.05, T_TABLE + 0.5), 1.2);
  const fan = eo(seg(t, 7.9, 8.4)) * (1 - eo(seg(t, 10.0, 10.4))); const sp = (t - 7.9) * 38;
  const c1 = eob(seg(t, 8.56, 8.95), 1.6), c2 = eob(seg(t, 8.72, 9.1), 1.6), c3 = eob(seg(t, 9.08, 9.45), 1.6);
  return (
    <AbsoluteFill>
      <Marble t={t} t0={T_TABLE} />
      <Chair x={170} y={760} ang={90} k={c1} /><Chair x={910} y={760} ang={270} k={c2} /><Chair x={540} y={1200} ang={0} k={c3} />
      <PlateAt x={540} y={760} d={560} k={k} />
      <div style={{ opacity: fan * 0.55 }}>{[0, 90, 180, 270].map((b) => <div key={b} style={abs(540, 760 - 40, { width: 540, height: 80, borderRadius: 40, background: "rgba(0,0,0,0.5)", transformOrigin: "0px 40px", transform: rot(sp + b) })} />)}</div>
    </AbsoluteFill>
  );
}
function BunScene({ t }: { t: number }) {      // 10.4 - 12.8 : bun maska
  if (t < T_BUN || t >= T_CAKE + 0.2) return null;
  const k = eob(seg(t, T_BUN, T_BUN + 0.4), 1.2), out = 1 - eio(seg(t, T_CAKE, T_CAKE + 0.25));
  const sp = eob(seg(t, W("v4", 3).t0, W("v4", 3).t0 + 0.45), 1.3);          // "bun": the bun splits
  const bt = W("v4", 4).t0, drop = eob(seg(t, bt, bt + 0.35), 1.4), melt = eo(seg(t, bt + 0.3, bt + 1.2));   // "maska": butter lands and melts
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Marble t={t} t0={T_BUN} />
      <PlateAt x={540} y={800} d={640} k={k} />
      <div style={ell(540, 850, 400, 150, "#B9783A")} />
      <div style={ell(540, 850 - 24, 340, 96, "#F0DCB4", { opacity: sp })} />
      <div style={ell(540 - 70 * sp, 780 - 130 * sp, 400, 190, "#C98A45", { transform: rot(-16 * sp) })} />
      <div style={ell(540 - 70 * sp - 70, 780 - 130 * sp - 40, 130, 30, "rgba(255,240,200,0.5)", { transform: rot(-16 * sp - 8) })} />
      <div style={{ opacity: drop, transform: `translateY(${(1 - drop) * -420}px) ${rot(-6 + 6 * drop)}` }}>
        <div style={ell(540, 842, 190 + 150 * melt, 90 - 42 * melt, "#F7E8A0", { boxShadow: "0 0 40px rgba(247,232,160,0.55)" })} />
      </div>
    </AbsoluteFill>
  );
}
function CakeScene({ t }: { t: number }) {     // 12.75 - 15.85 : mawa cake, keema pav
  if (t < T_CAKE + 0.15 || t >= T_BILL + 0.1) return null;
  const k = eob(seg(t, T_CAKE + 0.2, T_CAKE + 0.65), 1.2), out = 1 - eio(seg(t, T_BILL - 0.1, T_BILL + 0.1));
  const cut = W("v5", 2).t0; const knife = seg(t, cut - 0.1, cut + 0.18), slide = eob(seg(t, cut + 0.12, cut + 0.6), 1.2);
  const pv = W("v5", 5).t0 - 0.05; const pk = eob(seg(t, pv, pv + 0.5), 1.1);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Marble t={t} t0={T_CAKE + 0.15} />
      <PlateAt x={540} y={575} d={470} k={k} />
      <div style={ell(520, 595, 300, 200, "#E0B36A", { borderRadius: 44 })} />
      <div style={ell(520, 555, 300, 64, "#EAD9A0", { borderRadius: 36, opacity: 0.8 })} />
      <div style={ell(520 + 175 * slide, 595 + 14 * slide, 104, 196, "#F0DCB4", { borderRadius: 30, transform: rot(7 * slide) })} />
      {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} style={circle(520 + 175 * slide + (i % 2 ? 20 : -18), 540 + i * 28 + 14 * slide, 9, "#C98A45", { opacity: slide })} />)}
      <div style={abs(525 - 175 * (1 - knife), 520, { width: 4, height: 250 * knife, background: "rgba(255,255,255,0.9)", opacity: knife < 1 ? 1 : 0 })} />
      <div style={{ opacity: Math.min(1, pk * 2), transform: `translateX(${(1 - pk) * 700}px)` }}>
        <PlateAt x={540} y={1090} d={390} k={1} />
        <div style={ell(455, 1080, 135, 108, "#C98A45")} /><div style={ell(625, 1080, 135, 108, "#C98A45")} />
        <div style={ell(540, 1105, 270, 108, "#A2602A")} />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <div key={i} style={circle(440 + i * 33, 1095 + (i % 2) * 24 - 8, 13, "#3B1A10")} />)}
      </div>
    </AbsoluteFill>
  );
}
function Wipe({ t }: { t: number }) {          // chequered tablecloth wipe, 12.45 - 13.15
  if (t < T_CAKE - 0.15 || t > T_CAKE + 0.6) return null;
  const x = lerp(-1300, 1300, (t - (T_CAKE - 0.15)) / 0.75);
  return <div style={abs(x, 0, { width: 1200, height: 1920, background: "repeating-conic-gradient(#D0344A 0 25%, #F1F4F6 0 50%)", backgroundSize: "140px 140px" })} />;
}
function Bill({ t }: { t: number }) {          // 15.85 - 16.8 : handwritten bill, no prices
  if (t < T_BILL || t >= T_END) return null;
  const k = eob(seg(t, T_BILL, T_BILL + 0.3), 1.2);
  const line = (i: number, txt: string) => { const w = eo(seg(t, T_BILL + 0.08 + i * 0.27, T_BILL + 0.32 + i * 0.27)); return <div style={abs(70, 190 + i * 150, { width: 560 * w, height: 120, overflow: "hidden", whiteSpace: "nowrap" })}><div style={{ ...serif(88, 600), color: INK, fontStyle: "italic" }}>{txt}</div></div>; };
  return (
    <AbsoluteFill>
      <Marble t={t} t0={T_BILL} />
      <div style={abs(190, 330, { width: 700, height: 760, background: MARBLE, borderRadius: 14, transform: `${rot(-3)} translateY(${(1 - k) * 500}px)`, opacity: Math.min(1, k * 2) })}>
        <div style={abs(70, 70, { ...mono(26), color: "#6b7280" })}>Kyani &amp; Co. · table 4</div>
        {line(0, "Bun maska")}{line(1, "Mawa cake")}{line(2, "Keema pav")}
        <div style={abs(70, 640, { width: 560, height: 3, background: "#c4c9d0" })} />
      </div>
    </AbsoluteFill>
  );
}
function EndCard({ t }: { t: number }) {       // hard cut at 16.8 : large Bombay Cafe Map lockup, handle, small cafe name
  if (t < T_END) return null;
  const u = t - T_END; const k = eob(seg(u, 0.05, 0.5), 1.3), k2 = eo(seg(u, 0.5, 0.8)); const drift = 1 + 0.035 * seg(u, 0.5, 6.0);   // slow push so the held card never freezes
  return (
    <AbsoluteFill style={{ background: INK }}>
      <div style={abs(100, 300, { width: 880, height: 558, borderRadius: 34, background: MARBLE, overflow: "hidden", transform: `scale(${(0.85 + 0.15 * k) * drift})`, opacity: Math.min(1, k * 2) })}><Img src={staticFile("brand/bombaycafemap-lockup-stacked.png")} style={abs(0, 0, { width: 880, height: 558, objectFit: "contain" })} /></div>
      <div style={abs(100 + 18 * seg(u, 0.5, 6.0), 935, { opacity: k2 })}><div style={{ ...mono(32), color: MARBLE }}><span style={{ color: RED }}>@bombaycafemap</span> · bombaycafemap.com</div></div>
      <div style={abs(100 + 30 * seg(u, 0.5, 6.0), 1020, { opacity: k2 })}><div style={mono(26)}>This week</div><div style={{ ...serif(96, 800), color: MARBLE, marginTop: 8 }}>Kyani &amp; Co.</div><div style={{ ...mono(26), marginTop: 10 }}>Marine Lines · Mumbai</div></div>
    </AbsoluteFill>
  );
}

function Film() {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{ background: INK }}>
      <style>{CSS}</style>
      {t >= T_MAP - 0.1 && t < T_TABLE + 0.3 && <World t={t} />}
      <MapLabels t={t} />
      <TableScene t={t} /><BunScene t={t} /><CakeScene t={t} /><Wipe t={t} /><Bill t={t} />
      <Opening t={t} />
      <BarLogo t={t} />
      <NameTag t={t} />
      <EndCard t={t} />
      <Caption t={t} />
    </AbsoluteFill>
  );
}
registerRoot(() => <Composition id="kyani" component={Film} width={1080} height={1920} fps={FPS} durationInFrames={Math.round(TOTAL * FPS)} />);
