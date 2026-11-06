# Bombay Bride reel 1 — "The Shopping Issue" (script v2, for approval)

Status: DRAFT. Nothing is built. Per lesson L026 the script is approved before any build.
Replaces v1 "The List" (kept as SCRIPT_v1_the-list.md).

## Brief (your answers so far, plus defaults I filled in)
- Concept: a fashion-magazine reel. A cover, six fast spreads (one per shopping quarter), a back cover.  [you chose]
- Voice: an editor. Dry, assured, short.  [you chose]
- Pictures: the site's black-and-white photographs, plus drawn black line objects where a photo is missing.  [you chose "mix"]
- Length: 20 s teaser, 1080x1920, Instagram Reels first.  [you chose]
- DEFAULTS I assumed (change any): woman's voice, Indian English, generated and tested on one line first; sound design only, no music bed; end card says "Read the full issue" + bombay-bride.com; captions burned in; Bb in the top corner of every spread; no store names; no prices or hours.

## Look (new vs the last 3 films)
- Palette: pure black, pure white, one pale hairline grey. No colour, no cream, no orange. Photos are greyscale already.
- Type: Bodoni Moda (display, italic for the advice lines) + Jost capitals for small labels. Same faces as bombay-bride.com.
- Opening: a printed cover, not a map or a 3D scene.
- Motion: page turns. Each spread is a sheet of paper that slides off with a hard 6px paper-edge shadow, no blur.
- Texture: the photos are rendered as halftone dots on the page, coarse to fine as each spread lands (new move).
- Differs from bombay-fort-reel (map-led, gold/cyan) and mary-lodge-reel (3D ink-and-cel, teal) on palette, type, opening, motion and photo treatment.

## Timeline (20.0 s)
| t (s) | Page | VO (editor) | On screen | Motion (physical reason) |
|---|---|---|---|---|
| 0.0–1.0 | Hook | — | Black frame. White Bodoni italic: "Six worlds. One list." | Letters set into place one by one, like type being composed |
| 1.0–3.0 | Cover | "The Shopping Issue." | White cover: BOMBAY BRIDE masthead (Bodoni caps), THE SHOPPING ISSUE, "No. 01 · Mumbai · November to February", big halftone photo of henna hands | Masthead stamps down with a small shake; halftone dots resolve coarse to fine |
| 3.0–5.3 | Spread 1 · Zaveri Bazaar | "Gold. Get the bill itemised." | Photo bleeds off the right edge, label ZAVERI BAZAAR, italic line "Get the bill itemised." | Cover lifts away; new page lands with a hard shadow edge |
| 5.3–7.6 | Spread 2 · Kalbadevi | "Cloth. Buy it first." | Street photo, tilted 2°, label KALBADEVI | Page turn; a drawn measuring tape runs along the bottom hairline |
| 7.6–9.9 | Spread 3 · Dadar | "Flowers. Buy them last." | Flower photo cropped tight, label DADAR–MATUNGA | Page turn; a needle draws a thread across the photo |
| 9.9–12.2 | Spread 4 · Crawford Market | "The small things. Count them." | Market aisle photo, label CRAWFORD MARKET | Page turn; tally marks are scratched beside the line, one per beat |
| 12.2–14.5 | Spread 5 · Bandra | "Fittings. Book three weeks ahead." | Linking Road photo, label BANDRA | Page turn; a drawn appointment page flips back three leaves |
| 14.5–16.8 | Spread 6 · Colaba | "Then an hour by the sea." | Old Colaba Causeway postcard photo, label COLABA | Page turn; a hairline wave line draws across the foot of the page |
| 16.8–20.0 | Back cover | "Read the full issue." | Black page. White Bb, "Read the full issue", bombay-bride.com. Tiny credit line (see Credits). Held 3.2 s | Cut to black; Bb stamps in; nothing moves after 17.8 s |

Frame rules (lessons L002, L003): text stays in y 250–1500 and x < 960; each piece of text appears once per frame; at least 24 px between text blocks. The Bb sits top-left of every spread at 90 px.

## Voice and word-time sync
Generate the VO first, then run tools/voice/build_timing.py and set each screen event to its cue word. Cue words: "Shopping Issue" (cover stamp), "Gold" (spread 1 lands), "Cloth", "Flowers", "small things", "Fittings", "hour", "Read" (back cover). Test one short line with the chosen voice before generating all of it (lesson L011). Free-plan limits apply: use the ElevenLabs web app and match clips to scenes by transcript.

## Sound design (no music bed)
Paper slide + soft slap for each page turn (7), a type-setting tick for the hook, a stamp thud for the masthead and the Bb, a pen scratch for tally marks, a thread pull for the Dadar spread. Built with tools/audio/build_foley.py alongside the scenes (lesson L014).

## Facts on screen and in the voice (only what the site already says)
- "Get the bill itemised": bombay-bride.com Zaveri Bazaar guide (itemised bill: weight, purity, making charges).
- "Buy it first" (cloth): the six-market checklist and Kalbadevi guide (tailoring turnaround). Wording is editorial; confirm you are happy to say it.
- "Flowers last": Dadar–Matunga guide (Kabutar Khana flower stalls, last-minute garland run).
- "Count the small things": Crawford Market & Lalbaug guide ("the hundred small things").
- "Book three weeks ahead": Bandra / sherwani guides (appointment-only ateliers, three weeks' lead or more in November to February). Strings go in verified.json; please confirm you stand behind the three-week figure.
- "An hour by the sea": editorial; Colaba is the trip's last stop in the Colaba guide.
- No store names, prices, hours or distances.

## Pictures
Real photographs only for the six quarters and the cover (the site's black-and-white set: hands, zaveri, kalbadevi, dadar, crawford-aisle, bandra-linking, colaba-postcard). Drawn black line objects (tape, needle, tally marks, appointment leaves, wave) are small and secondary. No faked storefronts. No people used as portraits.

## Credits (licence requirement)
The photos are CC-licensed from Wikimedia Commons (credits on bombay-bride.com/about). Posting caption carries "Photos: Wikimedia Commons contributors, details at bombay-bride.com/about". The back cover carries a small line "Photos: Wikimedia Commons" (grey, 24 px, inside the safe area).

## Animation count (tell-first, per L021/L025)
Instances: 1 hook typesetting; 1 cover stamp; 7 halftone resolves (cover + 6 spreads); 7 page turns (cover to spread 1 ... spread 6 to back); 6 per-spread micro-animations (tape, thread, tally, appointment leaves, wave, plus a rule that draws under the Zaveri line); 1 Bb stamp. = 23 instances.
New designs: 3 (halftone resolve, paper-edge page turn, typesetting). The other 5 micro-animations are small and drawn from scratch for this film.

## Production plan (after you approve)
1. Designer agent run + design_log entry; palette_allow.json (done) and verified.json (done, pending your confirmation).
2. Voice test, then full VO, timing json.
3. Build scenes one at a time (cover, one spread, then the rest) with a frame preview after the first two.
4. Foley, mix, render frames sheet, run_evals.py, critic agent review.
5. Posting copy and caption with credits.

## Questions I still need answered (defaults in brackets)
1. Voice: woman or man? [woman, low and dry]  Accent? [Indian English, Mumbai-neutral]
2. Are the six advice lines right, especially "Buy it first" and "Book three weeks ahead"? [yes, keep]
3. Any real clips you can shoot (a bill, cloth, a lane)? [no; photos only for this reel]
4. End card wording: "Read the full issue" + bombay-bride.com? [yes]
5. Post date and platform order? [this week, Instagram first]
