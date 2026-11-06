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

### L014 · 2026-11-04 · chorus-cafe · process-skipped-verification
- Feedback (verbatim): where are the sound effects
- Symptom: Sound effects were in the design brief but not built, so the first preview was silent
- Cause: Planned foley and then shipped the picture without it
- Rule: Build foley with the scenes (tools/audio/build_foley.py + sfx.json) and mux it into every preview; a film without sound events for every scene is not ready
- Guarded by: sound_check

### L015 · 2026-11-04 · chorus-cafe · layout-overlap
- Feedback (verbatim): remove the prices and build something inplace of that just complement the fucking food dumbass and give it a rating too / and occupy more space in video it looks to cluttered
- Symptom: Prices on screen instead of praise, no rating, small cluttered elements leaving large empty areas
- Cause: Pulled prices straight from the menu and packed many small items per scene
- Rule: Show no prices unless asked; praise the food with sourced, truthful wording; rate honestly (public rating if one exists, else a labelled first-look score); one hero element per scene, big, using the whole frame
- Guarded by: process

### L016 · 2026-11-04 · chorus-cafe · brand-fit
- Feedback (verbatim): the house made dip and bread looks bad and where the fuck is the logo and turn it into a 40 seconds reel use the logo almost everywhere / and positioning looks ai so fix it
- Symptom: Dip and bread drawing looked bad; the client logo appeared only at the start and end; centered even-margin positioning read as AI-made; film was 66 s
- Cause: Used literal circles for food, treated the logo as a bookend, and laid scenes out on a neat grid
- Rule: Use the client logo throughout (woven pattern, pin, tags, top bar, big open and close); compose like real patchwork (overlap, tilt, bleed off edges, scale contrast) instead of centered stacks; hit the requested length (40 s reel); draw food as designed objects not literal circles
- Guarded by: process

### L017 · 2026-11-04 · chorus-cafe · brand-fit
- Feedback (verbatim): which first dish is getting cluttered and you need to make stuff look like fucking food and not clothes
- Symptom: Dips were flat fabric swatches and the pasta a striped cloth, so the food read as clothes; the first dish scene packed five tiles, spirals and bread
- Cause: Leaned on the patchwork and fabric metaphor instead of drawing the real dish
- Rule: Food scenes must show recognisable food (bowls with garnish, torn bread with crumb, pasta on a plate, plated desserts) in the thread style, one hero per scene, never fabric swatches or striped cloth
- Guarded by: process

### L018 · 2026-11-04 · chorus-cafe · brand-fit
- Feedback (verbatim): and you removed the fucking logo
- Symptom: Swapping the lockup for the small looping-C monogram in food scenes read as removing the logo
- Cause: Used the monogram alone in scenes 2 to 5
- Rule: Keep the full CHORUS CAFE wordmark visible in every scene (top-left, 470px wide); the monogram is an extra, never a replacement
- Guarded by: process

### L019 · 2026-11-05 · bandra-cafe · brand-fit
- Feedback (verbatim): improve the animations again and i want to see food items as well properly of that cafe. / try generating the image of the cafe or storefront as well this time
- Symptom: Earlier films had weak animation and food drawn abstractly; no cafe storefront imagery
- Cause: Relied on vector metaphors instead of showing the real cafe and its real dishes
- Rule: Every cafe film shows the cafe storefront (generated or sourced image) and each hero dish clearly and properly, with richer purposeful animation than the previous film; show cafe selection and script to the user before building
- Guarded by: process

### L020 · 2026-11-05 · bandra-cafe · factual-claim
- Feedback (verbatim): i need a cafe bro tf is benne find something better
- Symptom: Proposed Benne, a South Indian restaurant, when the user asked for a cafe
- Cause: Took roundup lists at face value without checking each venue is actually a cafe
- Rule: When asked for a cafe, shortlist only venues whose primary identity is a cafe (coffee, bakery, brunch), verified on their own page; drop restaurants even if they appear in cafe roundups
- Guarded by: process

### L021 · 2026-11-05 · mary-lodge-reel · brand-fit
- Feedback (verbatim): yes lets go with this you better make the storefront properly and go with taking you to a new cafe today zooming in from a detailed good 3d map of mumbai and have proper food and cofee and lets go with the cafe pour zoom properly and tell me how many animations will be there
- Symptom: Standing brief for Mary Lodge by Subko: detailed 3D Mumbai map zoom opening, properly made storefront, proper food and coffee, a pour zoom, and an animation count up front
- Cause: Brief confirmed after shortlist
- Rule: Mary Lodge reel: open with 'taking you to a new cafe today' over a detailed 3D Mumbai map zoom, build a proper storefront, show real-looking food and coffee, make the pour zoom the centrepiece, and tell the user the animation count before building
- Guarded by: process

### L022 · 2026-11-05 · mary-lodge-reel · process-skipped-verification
- Feedback (verbatim): keep working and fix the not working setup as well
- Symptom: Storefront preview had a black door, near-invisible shutter motion, and no design brief
- Cause: Declared progress after one pass without checking the door reveal and the shutter swing frame by frame
- Rule: After building an animation, render frames at its key moments and confirm each motion is visible (door reveals something lit, shutters visibly swing) before reporting it done
- Guarded by: process

### L023 · 2026-11-05 · mary-lodge-reel · brand-fit
- Feedback (verbatim): continue building this stuff and the art style should match
- Symptom: The generated storefront photo is photographic while the 3D scenes are inked illustration, so the film would mix two looks
- Cause: Mixed asset types without a shared look
- Rule: Every asset, including generated or photo images, must pass through the same ink/cel illustration pass so the whole film reads as one art style
- Guarded by: process

### L024 · 2026-11-05 · mary-lodge-reel · brand-fit
- Feedback (verbatim): /Users/kabir/Downloads use this photo for reference to make the subko building three.js use proper image modeling and dont use a painted picture build a 3d styled store definitely a painting. work on it again
- Symptom: The storefront scene used a flat generated picture (read as a painting), not a real 3D building of the Subko cafe
- Cause: Used the AI image as a textured plane instead of modelling the building from a real reference photo
- Rule: Model the Subko/Mary Lodge storefront as real Three.js 3D geometry from the user's reference photo in Downloads; do not use a flat painted or generated picture for the storefront scene
- Guarded by: process

### L025 · 2026-11-05 · bombaycafemap-brand-guideline · brand-fit
- Feedback (verbatim): improve this and i will be making reels on cafess in mumbau
- Symptom: Reel chapter of the Bombay Cafe Map guideline was a generic frame gallery with no production detail for real Mumbai cafe reels, and Series 5 still said Mocha-toned after Mocha was removed from the palette
- Cause: Guideline described how frames look but not how to brief, film, script, time or post a cafe reel
- Rule: Reel guidance for Bombay Cafe Map must be a production playbook for Mumbai cafe reels: per-reel brief, shot list with real footage, script and word-time sync, hook bank from site collections, area list, posting copy, and an animation count before building; keep colour names consistent with the palette
- Guarded by: grep the guideline for removed colour names; confirm every reel has a brief, a shot list and an animation count

### L026 · 2026-11-06 · bombay-bride-reel · brand-fit
- Feedback (verbatim): you need to first make a reel for this so come up with a script. its more about story telling than products
- Symptom: Bombay Bride reel brief: user wants a storytelling script first, not a product or store showcase
- Cause: Site is a store directory, so default framing would be listings and ratings
- Rule: Bombay Bride reels: write the script first and lead with story (a person, a tension, a payoff). Stores and ratings are background texture, never the hook. Get script approval before building.
- Guarded by: process

### L027 · 2026-11-06 · bombay-bride-reel · brand-fit
- Feedback (verbatim): its more about story telling and the fun facts or even history of that place
- Symptom: Reel script v2 used shopping tips as the advice lines; the user wants storytelling, fun facts and history of each place
- Cause: Defaulted to tip-style lines because the site is a shopping directory
- Rule: Bombay Bride reels: each spread tells one true fun fact or piece of history of the place (with a source in verified.json), not a shopping tip; hedge contested facts with 'may'.
- Guarded by: process

### L028 · 2026-11-06 · bombay-bride-reel · process-skipped-verification
- Feedback (verbatim): give me the screenshots of the animations which you will be making for them and make them unique too and put them in a claude artifact along with it put the script as well
- Symptom: User could not judge the reel from a text script alone; wanted to see the planned animations before building
- Cause: Script was presented as text and tables only, with no visual previews of the animations
- Rule: Before building a Bombay Bride reel, show a storyboard artifact: three still frames per animation (start, middle, end), each animation visually distinct, plus the full script, and get approval.
- Guarded by: process

### L029 · 2026-11-06 · bombay-bride-reel · layout-overlap
- Feedback (verbatim): there is a lot of overlap in animations
- Symptom: User sees a lot of overlap in the storyboard animations; unclear whether elements overlap on screen or the animations repeat each other
- Cause: Spreads reuse one layout (halftone photo, header, caption) and some elements are stacked tightly (stamp over sign, temple ghosts, caption near hero words)
- Rule: Storyboard animations must not repeat the same layout or gimmick and no on-screen elements may overlap unless the overlap is the idea; check both before showing.
- Guarded by: process

### L030 · 2026-11-06 · bombay-bride-reel · brand-fit
- Feedback (verbatim): it needs to be about bridal shopping and stuff revolving around it
- Symptom: Reel script v4 told general Mumbai place history (Kolabhat, Causeway, Kipling, Phalke film, tramline) that has nothing to do with bridal shopping
- Cause: Read 'fun facts and history of that place' as city history instead of the bridal items bought there
- Rule: Bombay Bride reels are about bridal shopping and what revolves around it: each spread is one bridal item (gold, silk, flowers, mehndi, bangles, lehenga) with one true sourced fact or history, plus the market where you buy it. No general city trivia.
- Guarded by: process

### L031 · 2026-11-06 · bombay-bride-reel · layout-overlap
- Feedback (verbatim): the last logo is broken and everything is very squeezed into the image now work in it
- Symptom: The end-card stamp logo looked broken: the iris transition into it cut the ring and the Bb mid-stamp. Content was also small and crowded into the top of the frame, with captions colliding with drawings
- Cause: Iris transition masked the stamp while it was still animating in; layouts used small elements and left no breathing room, and the gold pendant overlapped the caption
- Rule: Never mask or clip the end-card logo during a transition: hard cut to it, then stamp. Fill the safe area (y 250-1500) with larger photos (full-bleed), bigger type (54px+ captions) and clear gaps; run the film overlap check at every quarter second before showing.
- Guarded by: process

### L032 · 2026-11-06 · bombay-bride-reel · brand-fit
- Feedback (verbatim): you need to align the logo and the outer circle properly just work on the animations first and wtf are those managalsutra and bangles work on your fucking animations
- Symptom: Mangalsutra read as a wobbly line of dots with a blob, bangles as a coil of ellipses in a tube; end-card Bb sat about 44px below the ring centre and the ring text was upside-down at the bottom
- Cause: Drew abstract stand-ins instead of the real objects and placed the logo by eye, not by the ring's centre
- Rule: Draw each bridal item as the real object (necklace with beads, chain and pendant; hand and forearm wearing bangles) so a stranger recognises it; centre the end-card Bb on the ring centre by calculation and keep ring text upright. Animations first, polish second.
- Guarded by: process
