import fs from "node:fs";
import path from "node:path";
import { tokenize } from "/Users/kabir/Ripping/src/lib/words";
import { FREE_VOICES, planRead, readAloud } from "/Users/kabir/Ripping/src/audio/free-voice";
import { loadFreeVoiceEngine } from "/Users/kabir/Ripping/src/audio/voice-pack";
import { writeWav } from "/Users/kabir/Ripping/src/audio/wav";

const OUT = process.argv[2];
const VOICE = process.argv[3] || "ripping:heart";
const SPEED = Number(process.argv[4] || 1);
const SCENES: Record<string, string> = {
  hook: "You've definitely heard of this cafe. Britannia and Company, Ballard Estate. Serving lunch since nineteen twenty three.",
  story: "An Iranian immigrant, Rashid Kohinoor, opened it. His son Boman took over at twenty, and kept it going until he died at ninety seven.",
  dish: "And there's one reason people still make the trip. The berry poolaow. Saffron rice, chicken or mutton, and tart barberries, still brought in from Iran.",
  verdict: "So, worth the trip? Yes. Definitely. Order the berry poolaow, take your time, and sit inside a hundred years of old Bombay. Public rating, four point two.",
  visit: "Lunch only, closed by four on weekdays, shut on Sundays. Bring cash, and go hungry.",
  nearby: "Then it's a short walk to Bombay Coffee House, for your next stop.",
  end: "Which Mumbai institution should we visit next? Comment below.",
};
const rules = JSON.parse(fs.readFileSync("/Users/kabir/Ripping/assets/pronunciations.json", "utf8")).rules ?? [];
const base = FREE_VOICES.find((v) => v.id === VOICE)!;
const voice = { ...base, speed: base.speed * SPEED };
const engine = await loadFreeVoiceEngine({ info: (m: string) => console.log("pack:", m), warn: (m: string) => console.log("pack warn:", m), progress: (m: any) => console.log("pack progress:", typeof m === "string" ? m : JSON.stringify(m)) } as any);
fs.mkdirSync(OUT, { recursive: true });
const summary: Record<string, { seconds: number; words: number }> = {};
for (const [id, text] of Object.entries(SCENES)) {
  const tokens = tokenize(text);
  const chunks = planRead(text, tokens, rules);
  const read = await readAloud(engine, chunks, tokens, voice);
  const sr = 24000;
  const pcm = { sampleRate: sr, channels: 1, data: Int16Array.from(read.wave, (v) => Math.max(-32768, Math.min(32767, Math.round(v * 32767)))) };
  try { writeWav(path.join(OUT, id + ".wav"), pcm); } catch (e) { console.log("writeWav shape issue:", String(e).slice(0, 200)); }
  summary[id] = { seconds: +(read.wave.length / sr).toFixed(2), words: tokens.length };
  console.log(id, summary[id]);
}
fs.writeFileSync(path.join(OUT, "summary.json"), JSON.stringify(summary, null, 1));
