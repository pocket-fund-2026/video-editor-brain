#!/usr/bin/env python3
"""Record feedback as a permanent lesson (the Librarian's write path).
Appends to memory/lessons.jsonl (searchable) and memory/LEARNINGS.md (readable log). Never edits or deletes old lessons.
Usage:
  record_lesson.py --project bombay-fort-reel --feedback "exact words from the user" --category brand-fit \
      --symptom "what was wrong" --cause "why it happened" --rule "what to do every time" [--check palette_check] [--tags a,b]
Then: add a case to evals/cases.jsonl if a check can guard it, and promote the rule to the playbook once it repeats or the user confirms it.
"""
import argparse, datetime, json, os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

def main():
    ap = argparse.ArgumentParser()
    for k in ("project", "feedback", "category", "symptom", "cause", "rule"): ap.add_argument("--" + k, required=True)
    ap.add_argument("--check", default="process"); ap.add_argument("--tags", default=""); ap.add_argument("--confirmed", default="no")
    a = ap.parse_args(); f = os.path.join(ROOT, "memory", "lessons.jsonl")
    n = sum(1 for l in open(f, encoding="utf8") if l.strip()) + 1; lid = f"L{n:03d}"; day = datetime.date.today().isoformat()
    rec = {"id": lid, "date": day, "project": a.project, "category": a.category, "feedback": a.feedback, "symptom": a.symptom, "cause": a.cause,
           "rule": a.rule, "check": a.check, "tags": [t for t in a.tags.split(",") if t], "user_confirmed": a.confirmed, "times_seen": 1}
    open(f, "a", encoding="utf8").write(json.dumps(rec, ensure_ascii=False) + "\n")
    open(os.path.join(ROOT, "memory", "LEARNINGS.md"), "a", encoding="utf8").write(
        f"\n### {lid} · {day} · {a.project} · {a.category}\n- Feedback (verbatim): {a.feedback}\n- Symptom: {a.symptom}\n- Cause: {a.cause}\n- Rule: {a.rule}\n- Guarded by: {a.check}\n")
    print("recorded", lid)

if __name__ == "__main__":
    main()
