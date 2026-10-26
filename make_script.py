"""Build timestamped scripts from transcripts/*.json -> scripts/<video>.md + SCRIPT_ALL.md.
Lines break on pauses >= GAP seconds or after MAXLEN seconds. Timestamps are [MM:SS.s]."""
import json, sys
from pathlib import Path

GAP, MAXLEN = 0.8, 12.0
root = Path(__file__).resolve().parent
tdir, sdir = root / "edit" / "transcripts", root / "scripts"
sdir.mkdir(exist_ok=True)

def ts(t):
    m, s = divmod(t, 60)
    return f"{int(m):02d}:{s:04.1f}"

def lines(words):
    cur, out = [], []
    for w in words:
        if w.get("type", "word") != "word":
            continue
        if cur and (w["start"] - cur[-1]["end"] >= GAP or w["end"] - cur[0]["start"] > MAXLEN):
            out.append(cur); cur = []
        cur.append(w)
    if cur:
        out.append(cur)
    return out

allmd = ["# YT talking: full script\n"]
for f in sorted(tdir.glob("*.json")):
    d = json.loads(f.read_text())
    words = d["words"]
    dur = max((w["end"] for w in words), default=0)
    md = [f"# {f.stem}\n", f"Duration: {ts(dur)} · {sum(1 for w in words if w.get('type','word')=='word')} words\n"]
    for seg in lines(words):
        md.append(f"**[{ts(seg[0]['start'])} - {ts(seg[-1]['end'])}]** " + " ".join(w["text"] for w in seg) + "\n")
    text = "\n".join(md)
    (sdir / f"{f.stem}.md").write_text(text)
    allmd.append("\n" + text.replace("# ", "## ", 1))
(root / "SCRIPT_ALL.md").write_text("\n".join(allmd))
print("built", len(list(tdir.glob('*.json'))), "scripts")
