# Bombay Bride reel 1 — "The Shopping Issue" (script v4: Colaba developed, full script)

Status: DRAFT for approval. Nothing is built. Earlier drafts: SCRIPT_v1_the-list.md, SCRIPT_v2_tips.md, SCRIPT_v3_six-facts.md.
Rules applied: L026 (story first, script approved before build), L027 (each spread is one true fact or piece of history, sourced in verified.json, "may" for contested ones), L009 (real OSM map engine for place plates, credit on screen), L002/L003 (no repeated text block, safe area).

## What changed in v4
Colaba is the lead place and now tells its own small story in three beats: where the name comes from, why the Causeway was built, and what people actually call it. The map engine (FortMap, real OSM data, drawn in black line on white) carries the first two beats. The other five places keep one fact each.

## Full voiceover, read straight through (Emma timings measured)
"Mumbai began as seven islands. This is where it learned to shop.
Colaba comes from Kolabhat, the Kolis' word.
Boats kept capsizing. In 1838, a causeway replaced them.
Officially, Shahid Bhagat Singh Road. Locals say the Causeway.
One jeweller here has traded since 1864.
Rudyard Kipling's father carved panels for this market.
Kalbadevi's temple moved twice, once for a tramline.
Dadasaheb Phalke shot part of his first film here.
Bandra may come from the Marathi word for monkeys.
Read the full issue."
Spoken length with Emma: about 38 s of speech across about 44 s of film. Heart reads about 10% faster.

## Timeline (master cut, about 44 s, 1080x1920)
| t (s) | Page | VO (Emma length) | On screen | Motion |
|---|---|---|---|---|
| 0.0–3.0 | Hook | "Mumbai began as seven islands." (2.6) | Black. White Bodoni italic, set word by word. Seven hairline dots along the foot | Words set like type; dots draw in |
| 3.0–6.0 | Cover | "This is where it learned to shop." (2.2) | White cover: BOMBAY BRIDE, THE SHOPPING ISSUE, "No. 01 · Mumbai · November to February", halftone henna-hands photo | Masthead stamps with a small shake; halftone resolves |
| 6.0–9.7 | 1a Colaba · the name | "Colaba comes from Kolabhat, the Kolis' word." (3.2) | White page, black-line OSM map. Starts on the shape of the city, zooms to the southern tip. Big COLABA, hero word KOLI, caption line, "Map data: OpenStreetMap contributors" | Slow zoom; the island is filled solid black as it lands |
| 9.7–15.5 | 1b Colaba · the Causeway | "Boats kept capsizing. In 1838, a causeway replaced them." (5.3) | Same map, tighter. The Causeway road line draws across the gap. Big numeral 1838 | The road line draws from the Fort side to Colaba; a small drawn boat tips over once and is crossed out |
| 15.5–20.9 | 1c Colaba · the street | "Officially, Shahid Bhagat Singh Road. Locals say the Causeway." (4.9) | Old Colaba Causeway postcard photo, halftone. Big words THE CAUSEWAY struck through a street-sign shape and replaced by the official name | Street-sign plate drawn; "Shahid Bhagat Singh Road" is typeset, then "the Causeway" is stamped over it |
| 20.9–24.9 | 2 Zaveri Bazaar | "One jeweller here has traded since 1864." (3.6) | Zaveri lane photo, big numeral 1864, label ZAVERI BAZAAR | The year counts up from 1800 to 1864 and stamps |
| 24.9–29.0 | 3 Crawford Market | "Rudyard Kipling's father carved panels for this market." (3.7) | Market watchtower photo, small label "completed 1869", label CRAWFORD MARKET | A hairline frame is chiselled around the photo, chip by chip |
| 29.0–33.0 | 4 Kalbadevi | "Kalbadevi's temple moved twice, once for a tramline." (3.6) | Kalbadevi street photo, big word TWICE, label KALBADEVI | A drawn temple mark hops twice along a rail line |
| 33.0–36.8 | 5 Dadar | "Dadasaheb Phalke shot part of his first film here." (3.3) | Dadar flower-market photo with a drawn film-strip edge, label DADAR–MATUNGA | The film-strip edge scrolls past the photo |
| 36.8–40.6 | 6 Bandra | "Bandra may come from the Marathi word for monkeys." (3.2) | Linking Road photo, big word VANDRE?, label BANDRA | VANDRE is typeset letter by letter, a question mark last |
| 40.6–44.6 | Back cover | "Read the full issue." (1.9) | Black. White Bb, "Read the full issue", bombay-bride.com, small photo credit. Held 4.0 s | Cut to black; Bb stamps; nothing moves after 41.6 s |

Frame rules: text between y 250 and 1500, x under 960; 24 px or more between text blocks; no text block repeated in one frame; the Bb sits top-left on every spread. Where the voice says a year, the year is the big numeral and the caption leaves the digits out. The OSM credit line is on 1a and 1b.

## Colaba beats in detail (sources in verified.json)
- 1a Name: the name comes from Kolabhat, a word in the language of the Kolis, the islands' indigenous people before the Portuguese. (Wikipedia: Colaba)
- 1b Causeway: boats to Colaba were overcrowded and some capsized, which made a causeway urgent; it was completed in 1838 under Governor Robert Grant and joined Colaba and Old Woman's Island, the last of the seven islands, to the mainland of Bombay. (Wikipedia: Colaba Causeway)
- 1c Street: the Causeway is officially Shahid Bhagat Singh Road; locals call it the Causeway. (Wikipedia: Colaba Causeway)
- Held in reserve if you want a fourth beat: horse-drawn trams ran along it from 1873; Cusrow Baug, a Parsi colony of over 500 families, was built beside it in 1934. (Wikipedia: Colaba Causeway)
- Map: real OSM data from tools/maps/fetch_region.py; open on the city, highlight Colaba, zoom to the Causeway.

## Cut-downs
- 30 s: hook, cover, Colaba 1a and 1b, Crawford, Bandra, back cover.
- 20 s: cover, Colaba 1b, Crawford, back cover (hook line becomes the cover VO).

## Look and sound
Pure black, white and one pale grey; Bodoni Moda and Jost; page-turn spreads with hard paper-edge shadows; sound design only (paper, stamp, pen, type tick, a soft thud at each page), no music bed. Photos from the site set with credits on the back cover and in the post caption. Voice: Ripping's free woman's voice, Emma recommended. Clips are in /private/tmp/claude-501/-Users-kabir/dc859fbb-b67e-477e-af25-9cb05299e590/scratchpad/voice_test (full_emma, full_heart, colaba_emma, colaba_heart).

## Animation count
1 hook typesetting (with dots), 1 cover stamp, 7 halftone resolves, 2 map moves (zoom, causeway draw), 8 page turns, 8 micro-animations (island fill, boat tips, sign stamp, year count, chisel frame, temple hop, film strip, VANDRE typeset), 1 Bb stamp = 28 instances. New designs: 4 (halftone resolve, page turn, typesetting, black-line map plate).

## Next, once you approve
Designer pass and log; pick the voice; full VO and word timings with build_timing.py; fetch the Colaba OSM region; build cover and Colaba 1a first and show frames; then the rest, foley, frame sheets, run_evals, critic review.
