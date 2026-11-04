# Learnings (read the Core rules before every video)

## Core rules (distilled from feedback; the log below is the evidence)
1. Keep the reference video's palette. Never orange/terracotta + cream (reads as Claude branding). (L001)
2. No text twice in one frame; 24 px minimum between text blocks. (L002)
3. Text stays between y 250 and 1500, left of x 960, on a 1080x1920 frame. (L003)
4. No price, hour or distance on screen unless verified. (L004)
5. Show "Map data: OpenStreetMap contributors" whenever OSM data is used. (L005)
6. Render frames and run `tools/qa/run_evals.py` before saying a film is ready. (L006)
7. Ask about narration at the start; the Motion artifact cannot carry a voiceover. (L007)
8. Reuse the map engine; maps are central to this user's videos. (L009)
9. Always innovate: change at least 3 unlocked design dimensions versus the last 3 films and test one new move; run the designer first. (L012)
10. The loop runs through hooks: feedback is captured verbatim and must be recorded as a lesson before finishing. (L012)

## Log (newest last; written by tools/qa/record_lesson.py)

### L001 · 2026-11-04 · bombay-fort-reel · brand-fit
- Feedback (verbatim): claude elements were noticeable (user confirmed: the orange and cream colors)
- Symptom: The copper/orange plus cream palette read as Claude's own branding, so the film looked AI-made.
- Cause: Switched from the reference reel's gold, cool white and cyan to a warm brown/copper/cream palette to match the logo, without checking with the user.
- Rule: Keep the palette of the reference reel the user supplied. Never use orange/terracotta plus cream. If a client brand is warm, ask before using it. Run palette_check.
- Guarded by: palette_check

### L002 · 2026-11-04 · bombay-fort-reel · layout-overlap
- Feedback (verbatim): a bit of textual overlap in the your turn animation
- Symptom: End card stacked tagline, URL, poll label and caption too tightly; the URL appeared in the header and the card, and the poll label repeated the caption question.
- Cause: Laid out by eye and never measured text boxes.
- Rule: No text appears twice in one frame. Leave at least 24 px between text blocks. Run overlap_check at 0.5 s steps on every scene before showing a film.
- Guarded by: overlap_check

### L003 · 2026-11-04 · bombay-fort-reel · safe-zone
- Feedback (verbatim): (found by the agent, not reported)
- Symptom: Captions and labels sat in the bottom 420 px and right 120 px that Instagram buttons cover.
- Cause: Composed for the whole frame instead of the platform's visible area.
- Rule: Keep text between y 250 and 1500 and left of x 960 on a 1080x1920 frame; captions start at 1300 or higher.
- Guarded by: overlap_check

### L004 · 2026-11-04 · bombay-fort-reel · factual-claim
- Feedback (verbatim): (found by the agent)
- Symptom: Opening hours, prices and the distance between two cafes disagreed across sources.
- Cause: Used listings and blogs instead of verifying.
- Rule: Show no price, hour or distance on screen unless verified by phone or visit; list verified strings in the project's verified.json. A map distance must match the measured map.
- Guarded by: facts_check

### L005 · 2026-11-04 · bombay-fort-reel · attribution-license
- Feedback (verbatim): (found by the agent)
- Symptom: OpenStreetMap data was used without the required credit on screen.
- Cause: Credit was planned but not built.
- Rule: Always show 'Map data: OpenStreetMap contributors' when OSM data is used.
- Guarded by: facts_check

### L006 · 2026-11-04 · bombay-fort-reel · process-skipped-verification
- Feedback (verbatim): (found by the agent)
- Symptom: First version went to the user unseen; rendering test frames afterwards exposed five visual defects, and the overlap checker later found seven more.
- Cause: Declared the film done after checking only that the code parsed.
- Rule: Render frames with render_frames.py --sheet and run run_evals.py before telling the user a film is ready. Give the critic agent the frames and check output, not the editor's summary.
- Guarded by: run_evals

### L007 · 2026-11-04 · bombay-fort-reel · tooling-limit
- Feedback (verbatim): add the voiceover now
- Symptom: The Motion artifact has no narration track, which only surfaced when the user asked for the voiceover.
- Cause: Did not ask about narration at the start of the project.
- Rule: At brief time ask whether narration is needed. If yes, generate it separately (Ripping's free Kokoro voice) and mix it with ffmpeg; budget time for the voice pack download.
- Guarded by: process

### L008 · 2026-11-04 · bombay-fort-reel · layout-css
- Feedback (verbatim): (found by the agent)
- Symptom: Cards with padding ran past the right edge of the frame.
- Cause: Default content-box sizing added padding to the set width.
- Rule: base.css sets box-sizing: border-box on every padded box.
- Guarded by: overlap_check

### L009 · 2026-11-04 · bombay-fort-reel · map-reuse
- Feedback (verbatim): maps will be used a lot so remember that
- Symptom: (standing instruction)
- Cause: The user's videos rely on real-geography maps.
- Rule: Reuse the FortMap engine in projects/bombay-fort-reel/shared.js. Fetch new regions with tools/maps/fetch_region.py. Open on the city shape, zoom into the neighbourhood, show OSM credit.
- Guarded by: process

### L010 · 2026-11-04 · bombay-fort-reel · timing-sync
- Feedback (verbatim): what the fuck is that voiceover whatt the fuck there is a delay first of all and there is no backgrount image
- Symptom: Narration started about 0.4 s after each scene (0.27 s of dead air in every clip plus a fixed offset), captions and key moments ran on a separate guessed clock, 1.5-2.3 s silent gaps between lines, and the map background was so dim it read as no background
- Cause: Placed clips by guessed times instead of measured word times, and dimmed the map to 78 percent behind text
- Rule: Get exact word times from the voice engine, cut leading silence, start each clip at its scene start, drive captions and key animations from word times (data/timing.json), size scenes to the speech, keep the map background clearly visible (dim 50 percent or less)
- Guarded by: process

### L011 · 2026-11-04 · bombay-fort-reel · tooling-limit
- Feedback (verbatim): use sana female audio / you do it on your own
- Symptom: Chosen ElevenLabs library voice (Sana) could not be generated through the API on a free plan (402), Voice Design was also blocked (403)
- Cause: Did not check plan limits for library voices before promising to generate with the chosen voice
- Rule: Before offering a specific ElevenLabs library voice, test one short generation first; on a free plan use the web app and match clips to scenes by transcript with tools/voice/build_timing.py
- Guarded by: process

### L012 · 2026-11-04 · bombay-fort-reel · process-skipped-verification
- Feedback (verbatim): create a proper self learning loop and always innovate with new designs and yes merge the hooks
- Symptom: The loop depended on remembering to run it, and every film risked repeating the same look
- Cause: Nothing automatic captured feedback or forced variety
- Rule: Run the loop through hooks (SessionStart, UserPromptSubmit, Stop) and gate every new film on a design variety check: change at least 3 unlocked dimensions versus the last 3 films and test one new move; log every film and experiment
- Guarded by: novelty_check

### L013 · 2026-11-04 · chorus-cafe · brand-fit
- Feedback (verbatim): dont make it ai slop
- Symptom: Risk that the new film reads as generic AI output: stock gradients, glows, emoji, identical rounded cards, centered symmetry, floaty bouncing motion, perfect vector smoothness
- Cause: Defaults of generated design: gradients, blur glows, uniform cards, templated motion, no point of view
- Rule: Anti-slop: no gradients or glow or blur, no emoji, no uniform card grids; one idea per scene; use real specifics (real menu words, real streets, real prices); asymmetric composition; hand-made imperfection seeded from data (uneven stitch spacing, slight wobble); restraint in motion with a physical reason for every move; typography with a point of view
- Guarded by: slop_check
