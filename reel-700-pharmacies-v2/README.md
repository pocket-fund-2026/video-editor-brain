# 700 pharmacies reel, version 2 (horizontal)

A completely new edit of the same 30.7 s story. Version 1 (`../reel-700-pharmacies`) is final and stays as it is.

**Status (26 Oct 2026):** first full cut rendered (`/root/reel5/reel_v2.mp4`, 30.7 s, 1920×1080). `build.sh` composites it.

## Brief
- **Format:** horizontal 1920×1080, 30 fps. Dev stays full frame, and the graphics sit **around** him, in the left and right thirds and in the sky behind his head.
- **Content:** real numbers, line items, a map and motion graphs, each landing on the word Dev says.
- **Style reference:** Drive `Video-12863.mp4`. There are 24 frames in `reference-frames/` (2 contact sheets plus the singles). From it we take:
  - cards floating beside the speaker
  - giant numbers *behind* the speaker's head
  - UI-style cards: name tag, comment card, calendar, checklist
  - full-screen title cards
  - wide/close punch-ins on cuts
  - captions where each word lights up as it is spoken

## Kautilya palette (from `kautilya_original.svg`)
The SVG holds only brand teal `#0D485D` and white, set in Gotham Book. Every colour in the video is built from those two:

| Token | Hex | Use |
|---|---|---|
| deep | `#08303E` | shadows, title-card gradient |
| teal (brand) | `#0D485D` | panels, caption box, chart lines, ticks |
| mid | `#2F6F84` | labels, secondary text |
| pale | `#9EC3CF` | unspoken caption words, highlights |
| mist | `#E8F1F3` | card paper |
| white | `#FFFFFF` | numbers, spoken words |

Type is Montserrat (variable font) as a stand-in for Gotham, which is not available here.

## Beat sheet (reel seconds = Whisper word times)
| Time | Dev says | Left of Dev | Behind Dev | Right of Dev |
|---|---|---|---|---|
| 0.0–8.6 | "The coolest story… an operator" | "HELLO my name is" name tag; *The Operator* writes in on "operator" (3.36) | | |
| 3.2–8.9 | "who has bought over 700 pharmacies in Italy" | | giant **0→700** counter from "over" (5.42) | Italy map card: outline draws, 700 pharmacy crosses fill by "Italy" (8.22), counter |
| 8.9–15.4 | "less than five years… first year… a hundred acquisitions" | motion graph: acquisitions YR1–YR5 drawing to **700**; YR1 band and **100+ IN YEAR 1** on "hundred" (14.36) | | line items ticked: Less than 5 years / Year one / **100+ acquisitions** |
| 15.4–19.8 | "I didn't even know that was possible… a hundred companies in one year?" | comment-style reaction card that types in | giant **0→100** on "hundred" (18.16) | teal card **100 COMPANIES / 1 YEAR?** |
| 19.8–23.1 | "buying a company every three days… ridiculous" | big **3 DAYS PER DEAL**; **RIDICULOUS.** stamp (22.44) | | month calendar, every 3rd day fills; **1 COMPANY EVERY 3 DAYS** pill on "three" |
| 23.1–28.3 | "inspires me and pushes me to do more… achieve more" | teal checklist: Inspires me / Pushes me / Do more / **Achieve more**, each ticked on its word | | rising "output" curve from "pushes" to **MORE ↑** on "achieve" |
| 28.5–30.7 | (end) | full-screen teal title card: **700 pharmacies. / Under 5 years.** with the Kautilya mark and wordmark | | |

Captions run the whole reel in a teal box. Words are pale until spoken, then white, and key words get a pale underline.

## Pipeline (`source/`)
1. `cut.py`: the same 8 segments as v1, from `DJI_20260930090646_0621_D.MP4`, at 1920×1080 with the v1 brightening grade applied in 10-bit. Segments 1, 3 and 5 get a gentle 1.18× punch-in to hide the jump cuts.
2. `matte.py`: Robust Video Matting (`rvm_mobilenetv3_fp32.onnx`, onnxruntime, CPU, about 2.5 min) gives Dev's alpha matte. The recurrent state resets at every cut.
3. `params.py`: pulls word times from `../reel-700-pharmacies` timing and the caption chunks into `params.json`.
4. `gfx/gfx3.html`: every graphic on one GSAP timeline, split into a `bk` layer (behind Dev) and a `fr` layer (in front).
5. `render3.py`: renders both layers as transparent PNG sequences with headless Chrome.
6. Composite order: footage → behind layer → Dev (footage plus matte) → front layer and captions, then the audio.

Footage, the matte, the model and the rendered frames are kept on the server (`/root/reel5`), not in git.

## Version 3 (decluttered, 26 Oct 2026)
The user's feedback on v2: drop the "HELLO my name is" tag, use only the first reel's graphics, keep it minimal, keep Dev's reaction card, and put proper animation around and behind Dev.
- **Source:** `source/v3/`. `gfx4.html` is the shell (palette, layers, beat groups, captions). `beats_a.js` holds headline, map and years; `beats_b.js` holds reaction, calendar, push and end. The two files were built in parallel by two agents.
- **Beats:** "One operator. / 700 pharmacies." headline · Italy map whose crosses fill in step with a giant 700 behind Dev · Under 5 years blocks, year 1 circled, 100+ ACQUISITIONS · YEAR 1 · Dev reaction card + giant 100 behind Dev · one-year 100-dot calendar, EVERY 3 DAYS · staircase to ACHIEVE MORE · teal Kautilya end card.
- **Build:** `build4.sh` renders both layers in parallel, then composites them to `/root/reel5/reel_v3.mp4`. The whole build takes about 3 minutes.
