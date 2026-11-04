#!/usr/bin/env python3
"""Innovation engine: suggest fresh design moves that were NOT used in the last 3 films and were not dropped by the user.
Usage: suggest_moves.py [-n 4] [--dimension opening]     Moves live in playbook/DESIGN_MOVES.md as lines:  - [dimension] name: description
"""
import argparse, os, re, sys, random
sys.path.insert(0, os.path.dirname(__file__))
from common import ROOT, jsonl

def load_moves():
    out = []
    for l in open(os.path.join(ROOT, "playbook", "DESIGN_MOVES.md"), encoding="utf8"):
        m = re.match(r"- \[(\w[\w-]*)\] ([^:]+): (.+)", l.strip())
        if m: out.append((m.group(1), m.group(2).strip(), m.group(3).strip()))
    return out

def banned():
    log = jsonl(os.path.join(ROOT, "memory", "design_log.jsonl"))[-3:]
    recent = {mv for e in log for mv in e.get("moves", [])}
    dropped = {e["move"] for e in jsonl(os.path.join(ROOT, "memory", "experiments.jsonl")) if e.get("outcome") == "dropped"}
    return recent, dropped

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("-n", type=int, default=4); ap.add_argument("--dimension"); a = ap.parse_args()
    recent, dropped = banned(); moves = [m for m in load_moves() if m[1] not in recent and m[1] not in dropped and (not a.dimension or m[0] == a.dimension)]
    random.shuffle(moves); seen = set(); pick = []
    for d, n, desc in moves:                       # one per dimension first, for variety
        if d not in seen: seen.add(d); pick.append((d, n, desc))
    for d, n, desc in moves:
        if len(pick) >= a.n: break
        if (d, n, desc) not in pick: pick.append((d, n, desc))
    for d, n, desc in pick[:a.n]: print(f"- [{d}] {n}: {desc}")
    if not pick: print("(no unused moves left: add new ones to playbook/DESIGN_MOVES.md)")

if __name__ == "__main__":
    main()
