#!/bin/bash
# Composite v2: footage -> behind-Dev layer -> Dev (footage + RVM matte) -> front layer (graphics + captions), with audio.
set -e; cd /root/reel5
ffmpeg -y -v error -i foot/footage.mp4 -i foot/alpha.mp4 -framerate 30 -i out/back/%04d.png -framerate 30 -i out/front/%04d.png \
 -filter_complex "[0:v]split[f1][f2];[1:v]format=gray[a];[f2][a]alphamerge[dev];[f1][2:v]overlay=eof_action=pass[b];[b][dev]overlay[c];[c][3:v]overlay=eof_action=pass,format=yuv420p[v]" \
 -map "[v]" -map 0:a -t 30.67 -r 30 -c:v libx264 -crf 17 -preset medium -c:a aac -b:a 192k -movflags +faststart reel_v2.mp4
echo BUILT
