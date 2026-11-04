#!/usr/bin/env python3
"""Design variety gate (lesson L012): a new film must not repeat the look of the last three.
Reads PROJECT/design_brief.json:  {"concept": "...", "locked": ["palette"], "dimensions": {"opening": "...", ...}, "moves": ["..."], "experiment": {"move": "...", "hypothesis": "..."}}
FAIL when fewer than 3 UNLOCKED dimensions (or all of them, if fewer than 3 are unlocked) differ from every one of the last 3 logged films,
or when the film has no experiment (one new move to test, recorded afterwards with record_experiment.py).
Locked dimensions are things the user fixed (a reference video's palette, a brand): they are allowed to repeat.
Usage: novelty_check.py PROJECT [--record]    --record appends the brief to memory/design_log.jsonl once the film has shipped.
"""
import argparse, datetime, json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from common import ROOT, jsonl

LOG = os.path.join(ROOT, "memory", "design_log.jsonl")
key = lambda v: json.dumps(sorted(v) if isinstance(v, list) else v, sort_keys=True)

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("project"); ap.add_argument("--record", action="store_true"); a = ap.parse_args()
    bf = os.path.join(a.project, "design_brief.json")
    if not os.path.exists(bf): print("FAIL no design_brief.json: run the designer step first (concept, dimensions, one experiment)"); sys.exit(1)
    b = json.load(open(bf)); name = os.path.basename(os.path.normpath(a.project)); dims = b["dimensions"]; locked = set(b.get("locked", []))
    if a.record:
        rec = {"date": datetime.date.today().isoformat(), "project": name, "concept": b.get("concept", ""), "dimensions": dims, "moves": b.get("moves", []), "locked": sorted(locked)}
        with open(LOG, "a", encoding="utf8") as f: f.write(json.dumps(rec, ensure_ascii=False) + "\n")
        print("recorded", name, "in design_log.jsonl"); return
    prev = [e for e in jsonl(LOG) if e["project"] != name][-3:]; fails = []
    unlocked = [d for d in dims if d not in locked]
    new = [d for d in unlocked if all(key(dims[d]) != key(e["dimensions"].get(d)) for e in prev)]
    need = min(3, len(unlocked))
    if prev and len(new) < need: fails.append(f"only {len(new)} of {len(unlocked)} unlocked design dimensions are new (need {need}); new: {new or 'none'}; repeated: {[d for d in unlocked if d not in new]}")
    exp = b.get("experiment") or {}
    past = {e.get("move") for e in jsonl(os.path.join(ROOT, "memory", "experiments.jsonl"))}
    if not exp.get("move"): fails.append("no experiment: pick one move you have never tried (tools/loop/suggest_moves.py) and say what you expect")
    elif exp["move"] in past and prev: fails.append(f"experiment '{exp['move']}' was already tried; choose a new move")
    for f in fails: print("FAIL", f)
    print(f"novelty_check: {len(new)}/{len(unlocked)} unlocked dimensions new vs last {len(prev)} film(s); locked {sorted(locked)}; experiment: {exp.get('move')}")
    sys.exit(1 if fails else 0)

if __name__ == "__main__":
    main()
