#!/usr/bin/env python3
"""Single source of truth for sync (lesson L010). Reads the voice clip word times (from whisper, /tmp/bi_words.json) and the
film-timeline start of each clip, writes data/timing.json + data/timing.js. Every caption word and every key animation in film.html is
driven from these numbers, never from a separate guessed clock. Run from the project folder."""
import json
STARTS = {"l1": 0.35, "l2": 5.5, "l3": 10.2, "l4": 16.0, "l5": 22.8, "l6": 27.7}
SCRIPT = {"l1": "Taking you to a new cafe today", "l2": "Bombay Island began in Malad, in 2018", "l3": "Rupal roasts the coffee. Vineet designs the menu.",
          "l4": "Vikhroli, 2021. Andheri West, 2026.", "l5": "Order the Tiramisu Cold Brew at the Island Brew Bar", "l6": "Save this for your next Andheri coffee"}
W = json.load(open("/tmp/bi_words.json"))
def times(c):  # (heard word, start) list in film time
    return [(w, round(STARTS[c] + s, 3)) for w, s, e in W[c]["words"]]
T = {c: {"start": STARTS[c], "dur": round(W[c]["dur"], 3), "end": round(STARTS[c] + W[c]["dur"], 3), "heard": times(c)} for c in STARTS}
# map the on-screen caption words to heard-word times by index (whisper splits some names, so the index map is explicit)
def pick(c, idx): return T[c]["heard"][idx][1]
cap = {
 "l1": [("Taking", pick("l1", 4)), ("you", pick("l1", 5)), ("to", pick("l1", 6)), ("a", pick("l1", 7)), ("new", pick("l1", 8)), ("cafe", pick("l1", 9)), ("today", pick("l1", 10))],
 "l2": [("Bombay", pick("l2", 0)), ("Island", pick("l2", 1)), ("began", pick("l2", 2)), ("in", pick("l2", 3)), ("Malad,", pick("l2", 4)), ("in", pick("l2", 5)), ("2018", pick("l2", 6))],
 "l3": [("Rupal", pick("l3", 0)), ("roasts", pick("l3", 1)), ("the", pick("l3", 2)), ("coffee.", pick("l3", 3)), ("Vineet", pick("l3", 4)), ("designs", pick("l3", 5)), ("the", pick("l3", 6)), ("menu.", pick("l3", 7))],
 "l4": [("Vikhroli,", pick("l4", 0)), ("2021.", pick("l4", 2)), ("Andheri", pick("l4", 3)), ("West,", pick("l4", 4)), ("2026.", pick("l4", 5))],
 "l5": [("Order", pick("l5", 0)), ("the", pick("l5", 1)), ("Tiramisu", pick("l5", 2)), ("Cold", pick("l5", 3)), ("Brew", pick("l5", 4)), ("at", pick("l5", 5)), ("the", pick("l5", 6)), ("Island", pick("l5", 7)), ("Brew", pick("l5", 8)), ("Bar", pick("l5", 9))],
 "l6": [("Save", pick("l6", 0)), ("this", pick("l6", 1)), ("for", pick("l6", 2)), ("your", pick("l6", 3)), ("next", pick("l6", 4)), ("Andheri", pick("l6", 5)), ("coffee", pick("l6", 6))],
}
# key animation cues = the word that names what appears
cue = {
 "bi_badge": pick("l2", 0), "malad": pick("l2", 4), "y2018": pick("l2", 6),
 "roast": pick("l3", 1), "crack": pick("l3", 3), "menu": pick("l3", 4),
 "vikhroli": pick("l4", 0), "y2021": pick("l4", 2), "andheri": pick("l4", 3), "y2026": pick("l4", 5),
 "layers": pick("l5", 2), "ice": pick("l5", 3), "foam": pick("l5", 4), "bar": pick("l5", 7),
 "save": pick("l6", 0), "bean": pick("l6", 6),
}
out = {"clips": T, "captions": cap, "cues": cue, "film": 32.2}
json.dump(out, open("data/timing.json", "w"), indent=1)
open("data/timing.js", "w").write("window.TIMING=" + json.dumps(out) + ";")
print(json.dumps(cue, indent=1))
