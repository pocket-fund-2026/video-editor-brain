# Narration tools
- `generate_narration.mts`: reads one script per scene with Ripping's free Kokoro voice (no key, no cost). Run from a Ripping install: `cd ~/Ripping && npx tsx PATH/generate_narration.mts OUT_DIR ripping:heart 1.08`. First run downloads the voice pack (about 540 MB). Voices: heart, michael, bella, fenrir, emma, fable. The last number scales the pace (1.08 = 8% faster).
- `mix_voiceover.py`: places the clips on the film timeline and normalises loudness.
- Limits learned (L007): the Motion artifact cannot hold a voiceover; overlay the narration on the exported MP4 with the ffmpeg line in the script header.
- Not verified by ear: Kohinoor, "poolaow" (the spelling used for pulao) and "nineteen twenty three" pronunciations. Listen before publishing.
