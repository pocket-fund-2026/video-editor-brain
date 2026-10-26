import json, glob, os
import numpy as np
from scipy.io import wavfile
from faster_whisper import WhisperModel
m = WhisperModel("medium", device="cpu", compute_type="int8", cpu_threads=4)
for f in sorted(glob.glob("/root/style-reels/wav/*.wav")):
    b = os.path.basename(f)[:-4]; o = f"/root/style-reels/asr/{b}.json"
    if os.path.exists(o): continue
    sr, a = wavfile.read(f); a = a.astype(np.float32) / 32768.0
    segs, info = m.transcribe(a, word_timestamps=True, vad_filter=True, language="en")
    words = [{"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)} for s in segs for w in s.words]
    json.dump(words, open(o, "w")); print(b, len(words), flush=True)
print("ASRDONE")
