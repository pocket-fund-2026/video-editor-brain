#!/usr/bin/env python3
"""SessionStart hook: when a session opens in a video folder, put the learned rules, recent lessons and fresh design ideas in front of Claude."""
import os, subprocess, sys
sys.path.insert(0, os.path.dirname(__file__))
from common import ROOT, read_stdin, in_video_dir, core_rules, jsonl, safe

@safe
def main():
    d = read_stdin()
    if not in_video_dir(d.get("cwd")): return
    out = ["[video-loop] You are in a video project. Follow CLAUDE.md in ~/video-editor-brain. Core rules learned from feedback:", core_rules()]
    last = jsonl(os.path.join(ROOT, "memory", "lessons.jsonl"))[-3:]
    if last: out.append("Most recent lessons: " + " | ".join(f"{l['id']} {l['rule'][:110]}" for l in last))
    try:
        ideas = subprocess.run([sys.executable, os.path.join(ROOT, "tools", "loop", "suggest_moves.py"), "-n", "4"], capture_output=True, text=True, timeout=8).stdout.strip()
        if ideas: out.append("Fresh design moves not used in the last 3 films (always innovate: try at least one new move per film, never repeat the previous look):\n" + ideas)
    except Exception: pass
    try:
        dirty = subprocess.run(["git", "status", "--porcelain", "--", "memory/", "playbook/", "evals/"], cwd=ROOT, capture_output=True, text=True, timeout=8).stdout.strip()
        if dirty: out.append("Unsaved learning: lessons/playbook changes in ~/video-editor-brain are not committed yet. Commit and push them (git add memory playbook evals && git commit && git push) so they persist and reach other machines.")
    except Exception: pass
    out.append("Workflow: retrieve lessons -> designer (3 concepts, 1 experiment) -> build one scene at a time -> tools/qa/run_evals.py must say READY TO SHOW -> critic review -> record feedback verbatim with tools/qa/record_lesson.py.")
    print("\n".join(x for x in out if x))

main()
