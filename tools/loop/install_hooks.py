#!/usr/bin/env python3
"""Install (or refresh) the three learning-loop hooks in ~/.claude/settings.json. Safe to run again: it merges, never replaces.
Usage: python3 tools/loop/install_hooks.py [--remove]"""
import json, os, sys
SETTINGS = os.path.expanduser("~/.claude/settings.json")
HERE = os.path.dirname(os.path.abspath(__file__))
MARK = "tools/loop/"
EVENTS = {"SessionStart": ("session_start.py", 15), "UserPromptSubmit": ("capture_feedback.py", 15), "Stop": ("stop_gate.py", 20)}
s = json.load(open(SETTINGS)) if os.path.exists(SETTINGS) else {}
hooks = s.setdefault("hooks", {})
for ev, (script, to) in EVENTS.items():
    groups = [g for g in hooks.get(ev, []) if not any(MARK in h.get("command", "") for h in g.get("hooks", []))]
    if "--remove" not in sys.argv:
        groups.append({"hooks": [{"type": "command", "command": f'python3 "{os.path.join(HERE, script)}"', "timeout": to}]})
    if groups: hooks[ev] = groups
    else: hooks.pop(ev, None)
os.makedirs(os.path.dirname(SETTINGS), exist_ok=True); json.dump(s, open(SETTINGS, "w"), indent=2); print("hooks", "removed" if "--remove" in sys.argv else "installed", "->", SETTINGS)
