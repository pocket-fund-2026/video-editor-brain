#!/usr/bin/env python3
"""Stop hook: refuse to finish (once) while (a) captured feedback has not been recorded as a lesson, or (b) a film project changed since its checks last passed.
Never loops: when Claude is already continuing because of this hook, it lets go."""
import json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(__file__))
from common import ROOT, read_stdin, jsonl, projects, project_hash, safe

@safe
def main():
    d = read_stdin()
    if d.get("stop_hook_active"): return
    why = []
    pending = [i for i in jsonl(os.path.join(ROOT, "memory", "inbox.jsonl")) if not i.get("handled")]
    if pending:
        why.append(f"{len(pending)} piece(s) of user feedback are saved in memory/inbox.jsonl but not recorded as lessons. Record each with tools/qa/record_lesson.py (verbatim words, symptom, cause, one-line rule, check), add a regression case if a script can test it, then run tools/loop/mark_handled.py. First item: \"{pending[0]['words'][:140]}\"")
    # plan gate: a new-film request in the last 24 h needs a design_brief.json written AFTER it (the designer step cannot be skipped)
    import datetime
    reqs = jsonl(os.path.join(ROOT, "memory", "requests.jsonl"))
    if reqs:
        last = reqs[-1]; t0 = datetime.datetime.fromisoformat(last["ts"]).timestamp()
        if datetime.datetime.now().timestamp() - t0 < 86400:
            briefs = [os.path.getmtime(os.path.join(p, "design_brief.json")) for p in projects() if os.path.exists(os.path.join(p, "design_brief.json"))]
            if not any(m >= t0 for m in briefs):
                why.append(f"new-film request \"{last['words'][:90]}\" has no design brief yet. Run the designer agent (3 concepts, 1 experiment via tools/loop/suggest_moves.py) and write projects/<name>/design_brief.json, or tell the user plainly that the designer step was not run.")
    changed = subprocess.run(["git", "status", "--porcelain", "--", "projects/"], cwd=ROOT, capture_output=True, text=True).stdout.strip()
    if changed:
        stamp = {}
        sp = os.path.join(ROOT, "memory", ".evals_stamp.json")
        if os.path.exists(sp):
            try: stamp = json.load(open(sp))
            except Exception: pass
        stale = [os.path.basename(p) for p in projects() if os.path.exists(os.path.join(p, "scenes.json")) and stamp.get(os.path.basename(p)) != project_hash(p)]
        if stale: why.append("film project(s) " + ", ".join(stale) + " changed since the checks last passed. Run: python3 tools/qa/run_evals.py projects/<name> (it must print READY TO SHOW), or tell the user which checks you could not run and why.")
    if why: print(json.dumps({"decision": "block", "reason": "[video-loop] Before finishing:\n- " + "\n- ".join(why)}))

main()
