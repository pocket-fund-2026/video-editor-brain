#!/bin/bash
# v3 (first-reel graphics, decluttered): render both layers in parallel, then composite footage -> behind layer -> Dev (matte) -> front layer.
set -e; cd /root/reel5; rm -rf out4
python3 render4.py --layers back > r4back.log 2>&1 & B=$!
python3 render4.py --layers front > r4front.log 2>&1 & F=$!
wait $B $F
ffmpeg -y -v error -i foot/footage.mp4 -i foot/alpha.mp4 -framerate 30 -i out4/back/%04d.png -framerate 30 -i out4/front/%04d.png \
 -filter_complex "[0:v]split[f1][f2];[1:v]format=gray[a];[f2][a]alphamerge[dev];[f1][2:v]overlay=eof_action=pass[b];[b][dev]overlay[c];[c][3:v]overlay=eof_action=pass,format=yuv420p[v]" \
 -map "[v]" -map 0:a -t 30.67 -r 30 -c:v libx264 -crf 17 -preset medium -c:a aac -b:a 192k -movflags +faststart reel_v3.mp4
echo BUILT
