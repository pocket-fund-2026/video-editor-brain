#!/usr/bin/env python3
"""Mark captured feedback as recorded. Usage: mark_handled.py [--lesson L012]   (marks every pending item) """
import argparse, json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from common import ROOT, jsonl
ap = argparse.ArgumentParser(); ap.add_argument("--lesson", default="recorded"); a = ap.parse_args()
p = os.path.join(ROOT, "memory", "inbox.jsonl"); items = jsonl(p); n = 0
for i in items:
    if not i.get("handled"): i["handled"] = True; i["lesson"] = a.lesson; n += 1
open(p, "w", encoding="utf8").write("".join(json.dumps(i, ensure_ascii=False) + "\n" for i in items)); print("marked", n, "item(s) handled")
