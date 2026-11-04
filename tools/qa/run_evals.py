#!/usr/bin/env python3
"""Run every check against a film project. A film is NOT ready to show until this exits 0.
Each past failure is a case in evals/cases.jsonl pointing at the check that guards it.
Usage: python3 tools/qa/run_evals.py PROJECT        (needs playwright for the overlap check)
"""
import json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
CHECKS = [("palette_check", "palette_check.py"), ("facts_check", "facts_check.py"), ("novelty_check", "../loop/novelty_check.py"), ("overlap_check", "overlap_check.py")]

def main():
    project = sys.argv[1]; results = {}
    for name, script in CHECKS:
        r = subprocess.run([sys.executable, os.path.join(HERE, script), project], capture_output=True, text=True)
        results[name] = r.returncode == 0
        print(f"[{'PASS' if r.returncode == 0 else 'FAIL'}] {name}")
        for line in (r.stdout + r.stderr).splitlines():
            if line.startswith(("FAIL", "PAGE ERRORS")) or "check:" in line: print("   ", line)
    cases = [json.loads(l) for l in open(os.path.join(ROOT, "evals", "cases.jsonl")) if l.strip()]
    print("\nRegression cases (each one is a past mistake that must not come back):")
    for c in cases:
        print(f"  {'ok ' if results.get(c['check'], True) else 'BAD'} {c['id']}  {c['lesson']}  {c['title']}  -> {c['check']}")
    bad = [c for c in cases if not results.get(c["check"], True)]
    print(f"\n{len(cases) - len(bad)}/{len(cases)} regression cases hold.", "READY TO SHOW" if not bad and all(results.values()) else "NOT READY: fix the failures above")
    if all(results.values()) and not bad:   # remember that this exact version of the film passed (the Stop hook reads this)
        sys.path.insert(0, os.path.join(ROOT, "tools", "loop")); from common import project_hash
        sp = os.path.join(ROOT, "memory", ".evals_stamp.json"); st = json.load(open(sp)) if os.path.exists(sp) else {}
        st[os.path.basename(os.path.normpath(project))] = project_hash(project); json.dump(st, open(sp, "w"), indent=1)
    sys.exit(0 if all(results.values()) else 1)

if __name__ == "__main__":
    main()
