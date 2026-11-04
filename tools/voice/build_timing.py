#!/usr/bin/env python3
"""Turn per-scene narration recordings (any voice, any file names) into everything the film needs. (lesson L010)
 1. Identifies which clip is which scene by transcribing it (whisper-cli) and comparing with narration.json.
 2. Finds the time of every spoken word, aligned to the script words (digits like 1923 are expanded to words).
 3. Cuts the dead air before the first word, writes data/timing.json (caption windows + key-moment marks),
    sizes each scene to its speech (+ hold), mixes one loudness-normalised narration track on the film timeline.
Usage: build_timing.py PROJECT CLIPS_DIR OUT_WAV [--hold 0.7] [--model PATH_TO_ggml.bin]
Needs: ffmpeg, whisper-cli (brew install whisper-cpp) and a ggml model.
"""
import argparse, difflib, glob, json, os, re, subprocess, sys, unicodedata

ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()
def below100(n): return [ONES[n]] if n < 20 else [TENS[n // 10]] + ([ONES[n % 10]] if n % 10 else [])
def spoken(tok):
    t = tok.replace(",", "")
    if re.fullmatch(r"\d+\.\d+", t): a, b = t.split("."); return spoken(a) + ["point"] + [ONES[int(c)] for c in b]
    if re.fullmatch(r"\d{4}", t) and 1100 <= int(t) <= 2099 and not t.endswith("00"): return below100(int(t[:2])) + (below100(int(t[2:])) if int(t[2:]) else [])
    if re.fullmatch(r"\d+", t):
        n = int(t)
        if n < 100: return below100(n)
        if n < 1000: return [ONES[n // 100], "hundred"] + (below100(n % 100) if n % 100 else [])
    return [tok]
def norm(w):
    w = unicodedata.normalize("NFKD", w).encode("ascii", "ignore").decode().lower().replace("&", "and")
    return re.sub(r"[^a-z0-9.']", "", w).strip(".'")
def words_of(text): return [norm(w) for w in re.findall(r"[A-Za-z0-9'.&À-ɏ]+", text) if norm(w)]

def transcribe(path, model):
    wav = path + ".16k.wav"; subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", path, "-ac", "1", "-ar", "16000", wav], check=True)
    base = path + ".w"; subprocess.run(["whisper-cli", "-m", model, "-f", wav, "-ml", "1", "-sow", "-oj", "-of", base], capture_output=True, check=True)
    d = json.load(open(base + ".json")); out = []
    for s in d["transcription"]:
        t = s["text"].strip()
        if t and not t.startswith("["): out.append((s["offsets"]["from"] / 1000, s["offsets"]["to"] / 1000, t))
    for f in (wav, base + ".json"): os.remove(f)
    return out

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("project"); ap.add_argument("clips"); ap.add_argument("out")
    ap.add_argument("--hold", type=float, default=0.7); ap.add_argument("--model", default=os.path.expanduser("~/.cache/hyperframes/whisper/models/ggml-small.en.bin"))
    a = ap.parse_args(); P = a.project
    narr = json.load(open(f"{P}/narration.json")); sc = json.load(open(f"{P}/scenes.json"))
    files = sorted([f for f in glob.glob(a.clips + "/*") if f.lower().endswith((".mp3", ".wav", ".m4a")) and "trim" not in f and "voiceover" not in f], key=os.path.getmtime)
    heard = {f: transcribe(f, a.model) for f in files}
    # identify: best script match per clip, latest file wins on ties
    best = {}
    for f in files:
        txt = " ".join(norm(t) for _, _, t in heard[f]); flat = []
        for _, _, t in heard[f]: flat += [norm(x) for x in spoken(t.strip(".,?!")) ]
        for sid, n in narr.items():
            script = words_of(" ".join(n["chunks"])); r = difflib.SequenceMatcher(None, script, flat).ratio()
            if r > best.get(sid, (0, None))[0] - 1e-9 and r > 0.6: best[sid] = (r, f)
    missing = [s for s in narr if s not in best]
    if missing: sys.exit("could not match a clip for: " + ", ".join(missing))
    timing, clips = {}, {}
    for sid, n in narr.items():
        r, f = best[sid]; print(f"{sid}: {os.path.basename(f)[:48]}  (match {r:.2f})")
        heardw = []   # expanded heard words with times
        for s, e, t in heard[f]:
            parts = spoken(t.strip(".,?!")); step = (e - s) / len(parts)
            for i, p in enumerate(parts): heardw.append((s + i * step, s + (i + 1) * step, norm(p)))
        script = words_of(" ".join(n["chunks"])); sm = difflib.SequenceMatcher(None, script, [h[2] for h in heardw], autojunk=False)
        st = [None] * len(script); en = [None] * len(script)
        for blk in sm.get_matching_blocks():
            for k in range(blk.size): st[blk.a + k] = heardw[blk.b + k][0]; en[blk.a + k] = heardw[blk.b + k][1]
        for i in range(len(script)):                       # fill unmatched words by interpolation
            if st[i] is None:
                l = next((j for j in range(i - 1, -1, -1) if st[j] is not None), None); r2 = next((j for j in range(i + 1, len(script)) if st[j] is not None), None)
                if l is None: st[i] = heardw[0][0]
                elif r2 is None: st[i] = en[l]
                else: st[i] = st[l] + (st[r2] - st[l]) * (i - l) / (r2 - l)
                en[i] = st[i] + 0.2
        lead = max(0.0, st[0] - 0.04); rel = lambda x: round(x - lead, 3)
        counts = [len(words_of(c)) for c in n["chunks"]]; idx = [0]
        for c in counts: idx.append(idx[-1] + c)
        win = []
        for i in range(len(counts)):
            s0 = max(0.0, rel(st[idx[i]]) - 0.1); e0 = rel(st[idx[i + 1]]) - 0.03 if i + 1 < len(counts) else rel(en[-1]) + 0.6
            win.append([round(s0, 2), round(e0, 2)])
        marks = {}
        for name, w in n.get("marks", {}).items():
            j = next(k for k, x in enumerate(script) if x == w); marks[name] = round(rel(st[j]), 2)
        timing[sid] = {"win": win, "marks": marks, "speech_end": round(rel(en[-1]), 2)}
        dst = os.path.join(a.clips, f"{sid}_trim.wav"); subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(lead), "-i", f, "-ac", "1", "-ar", "44100", dst], check=True); clips[sid] = dst
    if "visit" in timing:
        m = timing["visit"]["marks"]; m["r1"] = max(m["r1"], 0.55); m["r0"] = 0.3
    for s in sc["scenes"]:
        s["dur"] = round(max(s["dur"], timing[s["id"]]["speech_end"] + a.hold), 1)
    os.makedirs(f"{P}/data", exist_ok=True); json.dump(timing, open(f"{P}/data/timing.json", "w"), indent=1); json.dump(sc, open(f"{P}/scenes.json", "w"), indent=1)
    t0 = 0.0; ins = []; fl = []; lab = []; total = round(sum(s["dur"] for s in sc["scenes"]), 2)
    for i, s in enumerate(sc["scenes"]):
        ins += ["-i", clips[s["id"]]]; ms = int(t0 * 1000); fl.append(f"[{i}:a]adelay={ms}|{ms},apad=whole_dur={total}[a{i}]"); lab.append(f"[a{i}]"); t0 += s["dur"]
    subprocess.run(["ffmpeg", "-v", "error", "-y", *ins, "-filter_complex", ";".join(fl) + ";" + "".join(lab) + f"amix=inputs={len(lab)}:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=7[out]", "-map", "[out]", "-t", str(total), "-ar", "44100", a.out], check=True)
    print("scene lengths:", {s["id"]: s["dur"] for s in sc["scenes"]}, "total", total, "s"); print("wrote", a.out)

if __name__ == "__main__":
    main()
