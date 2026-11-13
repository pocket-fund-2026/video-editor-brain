#!/usr/bin/env python3
"""UserPromptSubmit hook: for video work, (1) save feedback-like messages word for word to memory/inbox.jsonl so they cannot be forgotten,
(2) hand Claude the few lessons that match this request. Silent for every other kind of prompt."""
import datetime, json, os, re, sys
sys.path.insert(0, os.path.dirname(__file__)); sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "qa"))
from common import ROOT, read_stdin, is_video, safe

FEEDBACK = re.compile(r"(\bwtf\b|what the f|\bsucks?\b|\bbad\b|\bwrong\b|\bfix\b|\bshould\b|shouldn'?t|\bdon'?t\b|\bdont\b|noticeable|overlap|delay|doesn'?t|\bnot (good|working|right)\b|\bhate\b|\bugly\b|\bbetter\b|\bimprov|\bneeds? to\b|\btoo (dark|bright|slow|fast|long|short|quiet|loud)|\bfeedback\b|\bboring\b|\bgeneric\b|\bpoor\b|\bclaude\b)", re.I)

NEW_FILM = re.compile(r"\b(new|another|next|generate|make|create|come up with)\b.{0,40}\b(reel|video|film)\b", re.I)

@safe
def main():
    d = read_stdin(); prompt = d.get("prompt", "") or ""
    if not is_video(d.get("cwd"), prompt): return
    # background-task and system notices are not user feedback: they polluted the inbox (14 of 48 rows) and the lessons
    if re.match(r"\s*(<task-notification|<system-reminder|\[SYSTEM NOTIFICATION)", prompt): return
    lines = []
    # a request for a NEW film is logged separately so the Stop hook can demand a designer brief for it (plan gate)
    if NEW_FILM.search(prompt):
        with open(os.path.join(ROOT, "memory", "requests.jsonl"), "a", encoding="utf8") as f:
            f.write(json.dumps({"ts": datetime.datetime.now().isoformat(timespec="seconds"), "words": prompt[:600]}, ensure_ascii=False) + "\n")
        lines.append("[video-loop] New-film request logged. You may not finish until projects/<name>/design_brief.json exists (designer agent: 3 concepts, 1 experiment, new-vs-last-3 list).")
    if len(prompt.split()) >= 5 and FEEDBACK.search(prompt):
        with open(os.path.join(ROOT, "memory", "inbox.jsonl"), "a", encoding="utf8") as f:
            f.write(json.dumps({"ts": datetime.datetime.now().isoformat(timespec="seconds"), "words": prompt[:1500], "handled": False}, ensure_ascii=False) + "\n")
        lines.append("[video-loop] This message looks like FEEDBACK on video work and was saved word for word to memory/inbox.jsonl. Before you finish: record it as a lesson (python3 ~/video-editor-brain/tools/qa/record_lesson.py, user's exact words, one-line rule, a check if testable), then run tools/loop/mark_handled.py. If its meaning is unclear, ask one question instead of guessing.")
    try:
        import retrieve
        hits = retrieve.search(prompt, 4)
        if hits: lines.append("[video-loop] Lessons that apply to this request:\n" + "\n".join("- " + s for _, s in hits))
    except Exception: pass
    if lines: print("\n".join(lines))

main()
