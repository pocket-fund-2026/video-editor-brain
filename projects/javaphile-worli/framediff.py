#!/usr/bin/env python3
"""Mean frame-to-frame luminance change of a video (0-255), measured on 270x480 gray frames. Usage: framediff.py VIDEO"""
import subprocess, sys, numpy as np
W, H = 270, 480
p = subprocess.run(['ffmpeg', '-v', 'error', '-i', sys.argv[1], '-vf', f'scale={W}:{H}', '-pix_fmt', 'gray', '-f', 'rawvideo', '-'], capture_output=True)
a = np.frombuffer(p.stdout, np.uint8).reshape(-1, H, W).astype(np.float32); d = np.abs(np.diff(a, axis=0)).mean(axis=(1, 2))
TR = [(1.3, 1.7), (8.3, 8.7), (11.7, 12.1), (14.2, 14.6), (16.4, 16.8)]
t = (np.arange(len(d)) + 1) / 30; inT = np.zeros(len(d), bool)
for lo, hi in TR: inT |= (t >= lo) & (t <= hi + 1 / 30)
print('frames', len(a), 'median', round(float(np.median(d)), 2))
print('outside transitions: max', round(float(d[~inT].max()), 2), 'at', round(float(t[~inT][d[~inT].argmax()]), 2), 's; mean', round(float(d[~inT].mean()), 2))
print('inside transitions: max', round(float(d[inT].max()), 2), 'at', round(float(t[inT][d[inT].argmax()]), 2), 's')
o=np.where(~inT)[0]; print('top outside:', [(round(float(t[i]),2), round(float(d[i]),1)) for i in o[np.argsort(-d[o])][:6]])
for i in np.argsort(-d)[:6]: print('  top', round(float(t[i]), 2), 's', round(float(d[i]), 1), 'in-transition' if inT[i] else '')
