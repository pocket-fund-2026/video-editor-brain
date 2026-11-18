#!/bin/zsh
# Render the Cafe Madras film: raea composition -> silent mp4, then mux the mixed audio. Run from the project folder after clips, audio/mix.wav and src/cues.ts exist.
set -e
mkdir -p out
raea render cafe.tsx -o out/boojee_silent.mp4 --manifest out/render.json --quality master 2>&1 | grep -E "APPLIED|REFUSED|ERROR|errors" || true
ffmpeg -v error -y -i out/boojee_silent.mp4 -i audio/mix.wav -c:v copy -c:a aac -b:a 192k -shortest out/boojee-cafe-v1.mp4
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height -of default=nw=1 out/boojee-cafe-v1.mp4
