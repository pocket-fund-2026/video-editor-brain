"""Shared helpers for the learning-loop hooks. Hooks must never break a session: every entry point swallows errors."""
import hashlib, json, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
HOME = os.path.expanduser("~")
VIDEO_DIRS = [ROOT, os.path.join(HOME, "video-animations")]
STRONG = re.compile(r"\b(video|videos|reel|reels|animation|animations|animate|voiceover|narration|storyboard|footage|mp4|captions?|elevenlabs|transcribe|b-?roll)\b", re.I)

def read_stdin():
    try:
        raw = sys.stdin.read()
        return json.loads(raw) if raw.strip() else {}
    except Exception:
        return {}

def in_video_dir(cwd):
    cwd = os.path.abspath(cwd or os.getcwd())
    return any(cwd == d or cwd.startswith(d + os.sep) for d in VIDEO_DIRS)

def is_video(cwd, prompt=""):
    return in_video_dir(cwd) or bool(prompt and STRONG.search(prompt))

def jsonl(path):
    out = []
    if os.path.exists(path):
        for l in open(path, encoding="utf8"):
            l = l.strip()
            if l:
                try: out.append(json.loads(l))
                except Exception: pass
    return out

def core_rules():
    p = os.path.join(ROOT, "memory", "LEARNINGS.md")
    if not os.path.exists(p): return ""
    t = open(p, encoding="utf8").read()
    m = re.search(r"## Core rules.*?\n(.*?)\n## Log", t, re.S)
    return m.group(1).strip() if m else ""

def project_hash(project_dir):
    h = hashlib.sha256()
    files = []
    for dp, _, fns in os.walk(project_dir):
        for fn in fns:
            if fn.endswith((".js", ".css", ".json", ".md")) and fn not in ("README.md",):
                files.append(os.path.join(dp, fn))
    for f in sorted(files):
        h.update(os.path.relpath(f, project_dir).encode()); h.update(open(f, "rb").read())
    return h.hexdigest()[:16]

def projects():
    d = os.path.join(ROOT, "projects")
    return sorted(os.path.join(d, p) for p in os.listdir(d)) if os.path.isdir(d) else []

def safe(fn):
    def run():
        try: fn()
        except Exception as e:
            sys.stderr.write(f"[video-loop] hook error ignored: {e}\n")
        sys.exit(0)
    return run
