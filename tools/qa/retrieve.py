#!/usr/bin/env python3
"""Find the few lessons that matter for the task at hand (BM25 over lessons.jsonl and the playbook).
Pulls the top-K instead of loading the whole memory (the agentmemory / archival-tier idea).
Usage: retrieve.py "build an end card with a poll and logo" [-k 6]
Swap-in point: replace search() with a RAGFlow or vector backend when the memory outgrows a few hundred lessons.
"""
import argparse, json, math, os, re
from collections import Counter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
tok = lambda s: re.findall(r"[a-z0-9]+", s.lower())

def docs():
    out = []
    for l in open(os.path.join(ROOT, "memory", "lessons.jsonl"), encoding="utf8"):
        if l.strip():
            d = json.loads(l)
            out.append((d["id"], f"{d['id']} [{d['category']}] RULE: {d['rule']}  (symptom: {d['symptom']})", " ".join([d["category"], d["symptom"], d["cause"], d["rule"], " ".join(d.get("tags", []))])))
    pb = os.path.join(ROOT, "playbook", "EDITING_PLAYBOOK.md")
    if os.path.exists(pb):
        for i, line in enumerate(l.strip() for l in open(pb, encoding="utf8") if l.strip().startswith("- ")):
            out.append((f"PB{i}", "playbook: " + line[2:], line))
    return out

def search(q, k):
    D = docs(); N = len(D); toks = [tok(t) for _, _, t in D]; avg = sum(map(len, toks)) / max(N, 1)
    df = Counter(w for t in toks for w in set(t)); sc = []
    for (i, show, _), t in zip(D, toks):
        c = Counter(t); s = 0
        for w in tok(q):
            if w in c: s += math.log(1 + (N - df[w] + .5) / (df[w] + .5)) * c[w] * 2.2 / (c[w] + 1.2 * (.25 + .75 * len(t) / avg))
        sc.append((s, show))
    return [x for x in sorted(sc, reverse=True) if x[0] > 0][:k]

if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("query"); ap.add_argument("-k", type=int, default=6); a = ap.parse_args()
    for s, show in search(a.query, a.k): print(f"{s:5.2f}  {show}")
