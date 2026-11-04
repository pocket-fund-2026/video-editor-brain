#!/usr/bin/env python3
"""Record how a design experiment landed. Moves kept twice become 'Proven'; dropped moves go on the Avoid list.
Usage: record_experiment.py --project P --move "paper-tear transition" --outcome kept|dropped|neutral --feedback "user's words"
"""
import argparse, datetime, json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from common import ROOT, jsonl

def main():
    ap = argparse.ArgumentParser()
    for k in ("project", "move", "outcome", "feedback"): ap.add_argument("--" + k, required=True)
    a = ap.parse_args(); assert a.outcome in ("kept", "dropped", "neutral")
    f = os.path.join(ROOT, "memory", "experiments.jsonl")
    open(f, "a", encoding="utf8").write(json.dumps({"date": datetime.date.today().isoformat(), "project": a.project, "move": a.move, "outcome": a.outcome, "feedback": a.feedback}, ensure_ascii=False) + "\n")
    allx = jsonl(f); kept = sum(1 for e in allx if e["move"] == a.move and e["outcome"] == "kept")
    pb = os.path.join(ROOT, "playbook", "DESIGN_MOVES.md"); t = open(pb, encoding="utf8").read()
    if a.outcome == "dropped" and f"- AVOID {a.move}" not in t:
        t = t.replace("## Avoid (the user disliked these)\n", f"## Avoid (the user disliked these)\n- AVOID {a.move}: {a.feedback[:120]}\n", 1)
    if a.outcome == "kept" and kept >= 2 and f"- PROVEN {a.move}" not in t:
        t = t.replace("## Proven (kept in 2+ films)\n", f"## Proven (kept in 2+ films)\n- PROVEN {a.move}\n", 1)
    open(pb, "w", encoding="utf8").write(t); print("recorded", a.move, a.outcome, "| kept count", kept)

if __name__ == "__main__":
    main()
