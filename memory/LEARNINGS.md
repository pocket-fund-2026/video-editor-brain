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

### L033 · 2026-11-07 · javaphile-worli · brand-fit
- Feedback (verbatim): its not always necessary for storefront photo just have good food items in there and make the reel good
- Symptom: I asked for a storefront photo and listed it as blocking, though no photo exists for this cafe
- Cause: Applied the storefront rule (L019, L024) to every cafe, even when no reference photo is available
- Rule: A storefront scene is optional. When there is no reference photo, skip it and spend that time on well-made food and coffee scenes; do not ask the user for a photo or invent an entrance
- Guarded by: process

### L034 · 2026-11-07 · javaphile-worli · brand-fit
- Feedback (verbatim): make it 20 seconds long
- Symptom: Reel was planned at 36 s because I copied the Mary Lodge length without asking; the user expected 20 s with a good hook
- Cause: Assumed a length instead of asking at brief time
- Rule: Ask the target length at brief time; default for Bombay Cafe Map cafe reels is about 20 s with a food-first hook in the first 2 s, map snap kept short, end card held 3 s
- Guarded by: process

### L035 · 2026-11-07 · javaphile-worli · brand-fit
- Feedback (verbatim): the reel must be 20 seconds total (not 36). New timeline: 0-3 s hook: first frame is a striking close-up of the French toast with the line 'the French toast list at a quiet Worli cafe', then a fast map snap to Worli (about 2 s); 3-8 s coffee pour centrepiece; 8-15 s French toast flavours plus a fast bowls/tartine cut; 15-20 s end card (hold 3 s or more). Shorten the voiceover script to about 45 words.
- Symptom: First cut was 36 s with a slow map opening; the hero food did not appear until 16 s
- Cause: Built the scene lengths from the earlier brief without a total-length budget or a food-first hook
- Rule: Bombay Cafe Map cafe reels: 20 s total; open on a close-up of the hero dish with one big typographic line in the first frame, then a fast map snap (about 2 s, OSM credit on screen); coffee pour centrepiece 3-8 s; flavours plus a fast bowls cut 8-15 s; end card 15-20 s holding 3 s or more; voiceover about 30-45 words
- Guarded by: process

### L036 · 2026-11-07 · javaphile-worli · brand-fit
- Feedback (verbatim): the reel is glitching a lot and the voice is too fast can you improve it to be better and also where is the bombay cafe map stuff
- Symptom: v2 20 s reel glitched visibly, narration was too fast to follow, and Bombay Cafe Map branding appeared only as a tiny label in the first 1.4 s
- Cause: Cramming 31 words into the 20 s cut at engine default speed; strong frame-to-frame changes from the riso grain, misregistration and hard cuts; branding limited to one mono label
- Rule: Bombay Cafe Map reels: narration at a calm pace (at most about 2.2 words a second, slower Kokoro speed, trim words rather than speed up), no frame-to-frame flicker (static grain, no per-frame jitter), and the Bombay Cafe Map logo/wordmark visible in the top bar throughout and large on the end card with the handle
- Guarded by: process

### L037 · 2026-11-07 · javaphile-worli · brand-fit
- Feedback (verbatim): the hook is not fucking bombay cafe map what the fuck bro
- Symptom: v2 opened on a Javaphile French toast close-up with the line 'the French toast list at a quiet Worli cafe'; Bombay Cafe Map was only a tiny label, so the hook was not the account
- Cause: I replaced the user's standing map-first opening (L021) with my own food-first hook (L035) and treated 'make it 20 seconds' as approval of it
- Rule: Supersedes L035's opening: every Bombay Cafe Map reel opens on Bombay Cafe Map itself: the real logo big in frame 1, then the 3D Mumbai map zoom and 'Bombay Cafe Map is taking you to a new cafe today'; the cafe and its food come after, never as the hook. Never replace a standing opening rule without the user's explicit yes
- Guarded by: process

### L038 · 2026-11-07 · javaphile-worli · brand-fit
- Feedback (verbatim): you havent even included the cafe name
- Symptom: v3 showed 'Javaphile Café' only for about 2 s over the map and as a small line on the end card; the voiceover never said it and it was absent from the pour, toast and bowls scenes
- Cause: Fixed the brand hook and dropped the cafe name line from the voiceover to cut words; treated the name as secondary to the Bombay Cafe Map logo
- Rule: Every cafe reel names the featured cafe three ways: spoken in the voiceover, a persistent name tag in every food scene, and big on the end card (about the same size as the account lockup); check the name is on screen in frames across the whole film, not only once
- Guarded by: process

### L039 · 2026-11-07 · javaphile-worli · brand-fit
- Feedback (verbatim): yoou need to have new animations bro tomorrow onwards and open the folder where the video is right now
- Symptom: Standing instruction: from the next reel onwards every reel must bring new animations, not reuse the same ones
- Cause: Javaphile reuses the pour, 3D toast and map-zoom patterns from earlier films; the user expects fresh animations each day
- Rule: From 2026-11-08 onwards each new reel must introduce new animations: before building, list the animations and name what is new versus the last 3 reels (pour, map zoom, food reveals, transitions, end card); at least 3 of the animations must be new, and the user hears the count and the list before the build starts
- Guarded by: process

### L040 · 2026-11-11 · bombaycafemap-prithvi · brand-fit
- Feedback (verbatim): use prithvi cafe juhu and better color palette for it
- Symptom: I picked Kyani & Co. and proposed ink plus cool white; the user wanted Prithvi Cafe Juhu and a better, more distinctive palette
- Cause: Chose the cafe with the best-documented history and defaulted to a near-monochrome brand palette instead of designing a palette for the cafe's own mood
- Rule: When the user picks a cafe, use it; propose a cafe-specific two-to-three colour palette (not orange/cream, not the last 3 reels' palettes) and show it as swatches in the storyboard before building
- Guarded by: process

### L041 · 2026-11-11 · bombaycafemap-prithvi · brand-fit
- Feedback (verbatim): where is the script and i dont want tea pouring eeverytime and what about the zoom into the location
- Symptom: Plan gave a compact table, not a full scene-by-scene script; featured chai again as a hero food; the map zoom into Juhu was a one-line mention
- Cause: Assumed a table was the script and reused the tea/coffee drink beat from earlier cafe reels; skipped specifying the L009/L021 zoom
- Rule: Show the full scene-by-scene script (voice, on-screen text, sound) and a stage-by-stage map zoom spec; no tea/chai pouring as a hero shot, vary the hero food per reel
- Guarded by: process

### L042 · 2026-11-11 · bombaycafemap-prithvi · brand-fit
- Feedback (verbatim): and the buildings properly made as well
- Symptom: Plan only said real OSM buildings rise as extruded blocks; user wants the buildings properly made, not generic boxes
- Cause: Relied on plain footprint extrusion from the map engine without a detail pass or a hand-built hero building
- Rule: Map buildings need a detail pass (heights from OSM levels, roof shapes, window and edge detail, lighting) and the cafe's own building/compound is hand-modelled and checked in frames before the film is shown
- Guarded by: process

### L043 · 2026-11-11 · bombaycafemap-prithvi · brand-fit
- Feedback (verbatim): the food items look bad first of all and bombay cafe map is inconsistent and the spotlight follow map looks so bad you know how to edit improve on it i have given you a shit tonne of github repos to make 3d animations
- Symptom: Animation preview used crude CSS food, a hand-drawn cup logo with a different wordmark than the real lockup, and a flat 2D spotlight map instead of the existing 3D engines and repos
- Cause: Drew quick CSS placeholders instead of using the real brand logo files, the FortMap engine, the three.js tooling and the food models already in the repo
- Rule: Previews must use the real logo files, the real FortMap/three.js map and the project 3D food models, never CSS stand-ins; look through the user's cloned repos and tools for 3D assets before drawing anything
- Guarded by: process

### L044 · 2026-11-11 · acquisition-lore-bakery · timing-sync
- Feedback (verbatim): the audio and animation need to match
- Symptom: User reminded mid-build that voiceover and on-screen animation must be in sync (applies to the first Acquisition Lore reel)
- Cause: Risk of timing animations on a guessed clock separate from the voice
- Rule: Every Acquisition Lore animation (caption words, count-ups, stamps, strike-throughs, pose changes, marker marks) fires from data/timing.json word times taken from the voice engine; scenes are sized to the speech; no guessed timestamps
- Guarded by: scene cue times in film.html must be read from timing.json, not hard-coded

### L045 · 2026-11-12 · bombay-island-coffee · brand-fit
- Feedback (verbatim): go through the site and pick the logo https://www.facebook.com/Bombayisland/ and use this logo and make sure a lot of people can watch it and it should look good too. i need the page to be well built attracting audience
- Symptom: I used the site's cream lockup (BOMBAY ISLAND COFFEE ROASTERS) but the user wanted the cafe's official Facebook page logo (ARTISAN ROASTERS / BOMBAY ISLAND / COFFEE COMPANY with roaster icon)
- Cause: Took the logo from the website header only and did not check the cafe's social profile
- Rule: When the user names a cafe's social page, take the logo from that page's profile picture (og:image) as the primary lockup and cross-check the site; design the reel for reach: hook in the first 2 s, burned-in captions, safe zones, strong end-card follow prompt
- Guarded by: process

### L046 · 2026-11-12 · bombay-island-coffee · timing-sync
- Feedback (verbatim): the animations and subtitles shouldnt mismatch
- Symptom: Animations and subtitles must line up; user warns they should not mismatch
- Cause: Standing risk: captions and animations driven from separate clocks instead of the voice word times (see L010)
- Rule: Drive every caption and key animation from the voice engine word times (data/timing.json); the subtitle text must name what is on screen at that moment; check that each caption's start is within 0.15 s of its animation cue
- Guarded by: retrieve-only until a cue-sync check exists

### L047 · 2026-11-12 · bombay-island-coffee · timing-sync
- Feedback (verbatim): the animations and subtitles shouldnt mismatch
- Symptom: Captions and key animations could drift apart when each was timed by hand
- Cause: No single clock: captions, map markers and drink layers were not all driven from the voice word times
- Rule: Drive every caption word and key animation from data/timing.json (voice word times); run projects/bombay-island-coffee/verify_sync.py (copy it per project) and require every caption/animation pair within 0.15 s; check frames at each caption change
- Guarded by: verify_sync.py (project-level)

### L048 · 2026-11-12 · yazdani-bakery-fort · brand-fit
- Feedback (verbatim): can you generate a new reel for bombaycafemap instagram with better animations and use the self learning loops please
- Symptom: Request for a new Bombay Cafe Map reel with better animations, explicitly through the self-learning loop, with no cafe named
- Cause: No cafe was chosen by the user, so one must be proposed from the site with verified facts; the last 5 reels already used Mary Lodge, Chorus, Prithvi, Javaphile and Bombay Island
- Rule: When asked for a new reel with no cafe named: run retrieve, designer (3 concepts, 1 experiment) and suggest_moves, propose a cafe not yet featured with facts verified on its bombaycafemap.com page, and show animation count plus new-vs-last-3 list, scene script, palette swatches and map zoom spec before building
- Guarded by: process

### L049 · 2026-11-13 · araku-coffee-apollo-bunder · brand-fit
- Feedback (verbatim): dont ever use the prices just the food items and the self learning loop isnt working
- Symptom: A price figure was in the draft facts for Araku and the plan still mentioned it; earlier lessons already said no prices, but facts_check let verified prices through
- Cause: facts_check allowed any price listed in verified.json, so a standing no-prices rule was never a hard block
- Rule: Never show or say a price in any reel, verified or not; name the food items from the cafe's own page instead
- Guarded by: facts_check

### L050 · 2026-11-13 · araku-coffee-apollo-bunder · process-skipped-verification
- Feedback (verbatim): the self learning loop isnt working
- Symptom: A new-reel request ended with no designer run and no design_brief.json; lessons only logged, planning steps were rules with no gate; 14 of 48 inbox rows were task notifications; the same 'no prices' feedback came back
- Cause: Stop gate only inspected existing projects and feedback-like prompts, so a request that never became a project passed; facts_check was permissive; task notifications were captured as feedback
- Rule: A new-film request logged in memory/requests.jsonl blocks finishing until a design_brief.json newer than the request exists; system and task notices are never captured as feedback
- Guarded by: stop_gate

### L051 · 2026-11-13 · kyani-co-marine-lines · brand-fit
- Feedback (verbatim): i approve it dont start with bombay cafe map at start start with the cafe's name and end with bombay cafe map and make sure it is good
- Symptom: Plan opened on the Bombay Cafe Map logo (per L037); user wants the cafe's own name first and Bombay Cafe Map only at the end
- Cause: Applied the standing logo-first opening rule without asking whether it still held
- Rule: Supersedes L037 from 2026-11-13 by the user's explicit yes: every Bombay Cafe Map reel opens on the featured cafe's name in frame 1 (no Bombay Cafe Map logo in the first scene), keeps the cafe name on screen and spoken, and ends on the large Bombay Cafe Map lockup with the handle held 3 s; a small top-bar Bombay Cafe Map mark may appear from scene 2
- Guarded by: process

### L052 · 2026-11-13 · kyani-co-marine-lines · process-skipped-verification
- Feedback (verbatim): do it faster it shouldnt take 2hrs
- Symptom: Reel build was estimated at 30 to 60 more minutes after about 40 already spent, and the user expected far less
- Cause: Polished every scene before rendering anything complete, and gave a vague estimate instead of a time budget
- Rule: Give a time budget up front and render a complete rough first cut of the whole reel (voice, foley, end card) within about 20 minutes, then polish in a v2; never polish scene by scene before the whole film exists
- Guarded by: process

### L053 · 2026-11-13 · kyani-co-marine-lines · pacing
- Feedback (verbatim): the feedback on the last reel is that its to fast fix it asap
- Symptom: Kyani reel v1 packed 6 scenes into 22.5 s with narration near 2.2 words/s and 2-4 s per scene; viewers said it is too fast
- Cause: Script was sized to a short runtime and narration speed, with no check of reading time per scene, caption dwell or room for each visual to land
- Rule: Pace for a first-time viewer: at most 1.8 spoken words/s, each scene holds at least 4.5 s, each caption word stays on screen at least 0.4 s, and a hero visual needs about 1 s of stillness after it lands; target 28-35 s for a 6-scene cafe reel. Time-stretching a finished cut is a fallback only; fix pacing at script and timing stage
- Guarded by: timing.py/data_timing.json: words per second <= 1.8, every scene >= 4.5 s, total >= 28 s; flag a film as too fast otherwise

### L054 · 2026-11-13 · cafe-mondegar-colaba · brand-fit
- Feedback (verbatim): make a reel such that it pops off come up with better stuff for me
- Symptom: The proposed plan was a competent jukebox playlist but the user wants a reel that pops, with more inventive ideas, and did not want to answer approval questions
- Cause: Proposed one incremental concept and stopped to ask two questions instead of raising the creative ceiling and starting
- Rule: When the user asks for a reel that pops, bring bolder ideas (a physical hero object, a signature interaction, a punchy first 1.5 s with big type and a sound hit) and start the rough cut; do not wait on approvals for minor choices
- Guarded by: process

### L055 · 2026-11-13 · cafe-mondegar-colaba · process-skipped-verification
- Feedback (verbatim): render anything engine is at work right and can you improve on the animations and tell me about the script
- Symptom: User could not tell whether raea (the Render Anything Engine) was driving the build and wanted stronger animations plus the script explained
- Cause: Planned and researched for several steps without saying which engine renders what, and the script lived only in a file
- Rule: State the render engine and what runs in it at the start of a build, and walk the user through the script scene by scene (voice, on-screen text, animation, sound) in the reply, not only in a file
- Guarded by: process

### L056 · 2026-11-13 · cafe-mondegar-colaba · brand-fit
- Feedback (verbatim): dont use blender then find something eelse and use three.js
- Symptom: Plan depended on the Blender MCP for model search, which was not running
- Cause: Reached for Blender asset search without checking it was connected
- Rule: Do not depend on Blender for 3D assets; source models from the user's cloned repos, CC0 libraries fetched directly, or procedural geometry, and render 3D scenes in three.js (projects/*/vendor)
- Guarded by: process

### L057 · 2026-11-13 · cafe-mondegar-colaba · process-skipped-verification
- Feedback (verbatim): idk just keep building the reel and make it fast properly with proper animations and texts and food items and stuff which just makes the reel more catchy
- Symptom: User waited through status updates and wanted the reel finished quickly with strong animations, text and food
- Cause: Stopped to report status while a worker finished instead of continuing the build
- Rule: Keep building without status stops: finish the full rough cut first, then report once; make food and on-screen text visibly catchy (name every food item on screen as it lands)
- Guarded by: process

### L058 · 2026-11-16 · slow-cafe-kandivali · brand-fit
- Feedback (verbatim): search up the cafe SLOW CAFE and lets make a reel in that and also one more thing i want is this and it should look good find whatever you can on that cafe
- Symptom: User named a cafe not on bombaycafemap.com and asked for research plus a good-looking reel; the message cut off at 'one more thing i want is this' with no attachment
- Cause: Earlier I picked cafes myself (Sea Lounge, a hotel lounge) instead of waiting for the user's choice; this time the user chose the cafe but the extra request was missing
- Rule: When the user names a cafe, research it from press and reviews first (site page may not exist), build only from sourced facts, and when a request is cut off ('is this' with no content) ask one question for the missing item instead of guessing
- Guarded by: process: design_brief.json facts all traceable to a source; no hours or prices

### L059 · 2026-11-16 · slow-cafe-kandivali · brand-fit
- Feedback (verbatim): i dint need espresso pur again and again and use different food dishes
- Symptom: Slow Cafe script made an espresso coconut float pour a hero scene, again, and leaned on drinks instead of varied food
- Cause: Copied the pour centrepiece pattern from earlier cafe reels (and L021/L035) instead of choosing hero dishes for this cafe
- Rule: No pour shots (espresso, tea, coffee) as a hero in cafe reels; each reel uses at least three different named food dishes, each with a different motion; check the script for the word pour before showing it
- Guarded by: process: grep SCRIPT.md for pour/espresso before presenting

### L060 · 2026-11-16 · slow-cafe-kandivali · brand-fit
- Feedback (verbatim): i dont want toy like images you can have 2d images too which look god
- Symptom: Procedural three.js food (toast, burrata, noodles, fries) read as toy-like even after polish passes
- Cause: Procedural primitives and canvas textures cannot reach appetising food realism; I kept polishing 3D instead of switching to 2D imagery
- Rule: Do not use procedural 3D for hero food. Use good-looking 2D images (generated photoreal or illustrated, one consistent look) with 2D motion (push-ins, steam, dust, light sweeps, crossfades). 3D stays for the map only.
- Guarded by: process: no food scene is a procedural three.js clip; frames of each food scene checked for appetising realism

### L061 · 2026-11-17 · cafe-madras-matunga · process-skipped-verification
- Feedback (verbatim): use the video editor brain
- Symptom: User had to tell me to use the video editor brain; I had built setup and research before invoking its agents, lessons and QA tools visibly
- Cause: Did not say up front that I was running the brain's loop (retrieve lessons, designer brief, editor agents, critic) and delegated unnamed forks
- Rule: At the start of every video task, state which brain steps are running (retrieve.py lessons, designer brief, editor agents per scene, run_evals, critic) and use the repo's agents and tools for them
- Guarded by: process: design_brief.json and retrieve output exist before scene builds

### L062 · 2026-11-17 · general · process
- Feedback (verbatim): fuck the designer step dont bring it up again
- Symptom: Stop hook reminder was restated in every reply on a non-film request (repo visibility), annoying the user
- Cause: Gate treats any logged request as a new-film request and I narrated it each turn
- Rule: Do not mention or narrate the designer step in replies unless the user is actually requesting a new film
- Guarded by: process

### L063 · 2026-11-18 · bombay-cafe-map · brand-fit
- Feedback (verbatim): all the reels need to have the same voice
- Symptom: Bombay Cafe Map reels used two different voices: Kokoro heart (Prithvi, Island Coffee, Mondegar, Slow Cafe, Kyani, Madras) and ElevenLabs Sana (Chorus Cafe, Bombay Fort)
- Cause: Voice chosen per reel with no series-wide standard
- Rule: Every Bombay Cafe Map reel uses the same narrator: Kokoro ripping:heart via each project's gen_voice.mts. Do not use Sana/ElevenLabs or any other voice in this series without the user's explicit yes.
- Guarded by: grep each cafe project for non-heart voice; none allowed

### L064 · 2026-11-23 · records-coffee-pali-hill · brand-fit
- Feedback (verbatim): where are the fucking foood items you retard
- Symptom: records.coffee v1 shipped with no food or drink on screen, although the user chose option 3A (coffee plus room, verified only); the site lists no menu so I skipped food entirely and dropped coffee too
- Cause: Treated 'verified only' as 'nothing the bombaycafemap page lists' and did not search the cafe's other sources (editorial write-ups, Instagram) for named items; also never showed the user a scene plan before rendering
- Rule: Every cafe reel must show at least 2-3 real named food or drink items, each with its own animation, even when the bombaycafemap page lists none: search editorial sources (Knocksense, Homegrown, Outlook Traveller, the cafe's Instagram), cite the source in verified.json, and flag in the hand-off that the menu was not confirmed on the cafe's own site. Never ship a food-free cafe reel; if the length cap is tight, cut a fact scene before cutting food.
- Guarded by: process
