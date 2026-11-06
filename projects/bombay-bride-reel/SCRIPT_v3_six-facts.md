# Bombay Bride reel 1 — "The Shopping Issue" (script v3, story and history version)

Status: DRAFT for approval. Nothing is built. (Lesson L026: script first, story first.)
Earlier drafts kept: SCRIPT_v1_the-list.md, SCRIPT_v2_tips.md (advice lines, replaced by this).

## Direction (your words)
Woman's voice, made with Ripping's free voice. The six lines are written by me. It is about storytelling and fun facts or history of each place, not shopping tips.

## Story spine
Mumbai began as seven islands. Joined up over time, it became one city. Each spread is one place and one true piece of its history, so the issue reads as a short trip through how the city was put together.

## Voice
- Ripping's free voices are American or British; there is no Indian-accented option. Recommended: Emma (British woman, crisp and even) for a dry editor. Alternative: Heart (American woman, warmer and most natural).
- One-line tests are already generated (lesson L011). Please listen and tell me which one, and whether the names sound right (Dadasaheb Phalke, Kalbadevi, Kipling, Bandra):
  - Emma: /private/tmp/claude-501/-Users-kabir/dc859fbb-b67e-477e-af25-9cb05299e590/scratchpad/voice_test/emma/hook.wav, colaba.wav, dadar.wav, bandra.wav, crawford.wav
  - Heart: /private/tmp/claude-501/-Users-kabir/dc859fbb-b67e-477e-af25-9cb05299e590/scratchpad/voice_test/heart/hook.wav, colaba.wav, dadar.wav, bandra.wav, crawford.wav
- Not verified by ear by me. The final pass uses tools/voice/build_timing.py for exact word times (L010).

## Timeline (about 31 s, 1080x1920)
| t (s) | Page | VO | On screen | Motion |
|---|---|---|---|---|
| 0.0–2.8 | Hook | "Mumbai began as seven islands." | Black. White Bodoni italic, the line set one word at a time. Seven small hairline dots sit along the bottom | Words set like type; the dots draw in |
| 2.8–5.6 | Cover | "This is where it learned to shop." | White cover: BOMBAY BRIDE masthead, THE SHOPPING ISSUE, "No. 01 · Mumbai · November to February", halftone henna-hands photo | Masthead stamps with a small shake; halftone resolves coarse to fine |
| 5.6–9.2 | Spread 1 · Colaba | "In 1838 a causeway joined Colaba to the city." | Old Colaba Causeway postcard, big numeral 1838, label COLABA, caption line | A hairline causeway draws between two drawn island shapes |
| 9.2–12.8 | Spread 2 · Zaveri Bazaar | "One jeweller here has traded since 1864." | Zaveri lane photo, big numeral 1864, label ZAVERI BAZAAR | The year counts up from 1800 to 1864 and stamps |
| 12.8–16.4 | Spread 3 · Crawford Market | "Rudyard Kipling's father carved panels for this market." | Market watchtower photo, big numeral 1869, label CRAWFORD MARKET | A hairline frame is chiselled around the photo, chip by chip |
| 16.4–20.0 | Spread 4 · Kalbadevi | "Kalbadevi's temple moved twice, once for a tramline." | Kalbadevi street photo, big word TWICE, label KALBADEVI | A drawn temple mark hops twice along a rail line |
| 20.0–23.6 | Spread 5 · Dadar | "Dadasaheb Phalke shot part of his first film here." | Dadar flower-market photo with a drawn film-strip edge, big word PHALKE, label DADAR–MATUNGA | The film strip edge scrolls past the photo |
| 23.6–27.2 | Spread 6 · Bandra | "Bandra may come from the Marathi word for monkeys." | Linking Road photo, big word VANDRE, label BANDRA | VANDRE is typeset letter by letter, a question mark last |
| 27.2–31.2 | Back cover | "Read the full issue." | Black. White Bb, "Read the full issue", bombay-bride.com, small photo credit. Held 4.0 s | Cut to black; Bb stamps; nothing moves after 28.2 s |

Frame rules (L002, L003): text between y 250 and 1500, x under 960; each text once per frame; 24 px or more between blocks. The Bb sits top-left of every spread. Each caption is the line the voice says; the big numeral or word is different text, so nothing repeats.

## Facts (all from the sources below; status in verified.json)
- Seven islands: Wikipedia "Seven Islands of Bombay" (the islands were merged into one landmass by reclamation, finished by 1845).
- Colaba Causeway: completed 1838, joined Colaba and Old Woman's Island, the last two of the seven islands, to Bombay (Wikipedia "Colaba Causeway").
- Zaveri Bazaar: Tribhovandas Bhimji Zaveri, in the market, established 1864 (Wikipedia "Zaveri Bazaar"; also on bombay-bride.com).
- Crawford Market: completed 1869; two carved panels by John Lockwood Kipling, father of Rudyard Kipling (Wikipedia "Crawford Market").
- Kalbadevi: the temple was relocated twice; one move was to widen the road for a tramline (Wikipedia "Kalbadevi").
- Dadar: Dadasaheb Phalke partly shot his first film, Raja Harishchandra, at Mathura Bhavan in Dadar East (Wikipedia "Dadar").
- Bandra: the name may come from the Marathi word vandr, "monkeys"; another theory is the Persian bandar, "port" (Wikipedia "Bandra"). The line says "may".
These are encyclopedia sources, not primary records. I would like you, or someone who knows the city, to confirm each before the reel goes out. No store names, prices, hours or distances.

## Look and sound (unchanged from v2)
Pure black, white and one pale grey; Bodoni Moda and Jost; page-turn spreads with hard paper-edge shadows; halftone resolve on the photos; sound design only (paper, stamp, pen, type ticks), no music bed.
Photos (site set): colaba-postcard, zaveri, crawford-tower, kalbadevi, dadar, bandra-linking, hands (cover). Credits: back-cover line "Photos: Wikimedia Commons" and the post caption points to bombay-bride.com/about.

## Animation count
23 instances: 1 hook typesetting + 7 hook dots; counted as 1; 1 cover stamp; 7 halftone resolves; 7 page turns; 6 micro-animations (causeway draw, year count-up, chisel frame, temple hop, film strip, VANDRE typesetting); 1 Bb stamp. New designs: 3 (halftone resolve, page turn, typesetting).

## Length
About 31 s, not 20. Six true stories need about 3.6 s each. If you want 20 s, I would cut it to the cover plus three places (Colaba, Crawford, Bandra) and move the others to later reels.

## Next, once you approve
Run the designer pass and log it; choose the voice; generate the full VO and word timings; build the cover and first spread and show frames; then the rest, foley, frame sheets, run_evals, critic review.

## Questions left (defaults in brackets)
1. Emma or Heart? [Emma]
2. Do the six facts feel right, or do you want different ones? Is 31 s fine? [yes, 31 s]
3. Can someone confirm the facts (especially the Phalke film and the Bandra name)? [flag in the caption as "history"; confirm before posting]
4. Post date and platform order. [this week, Instagram first]
