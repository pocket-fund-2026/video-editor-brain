# Bombay Bride reel — "The List" (v1 script, for approval)

Format: 9:16, ~38s, VO + on-screen words (one text layer at a time, no overlaps).
Angle: story of ONE bride's list and the city that answers it. Products stay out of frame.
Palette: Bombay Bride (maroon #C43873/#9E2C5C, gold #C9A227, jade #2E5C4E sparingly, ink #2B1C24). No orange/cream.

## Script (VO)

| t | VO | On screen |
|---|----|-----------|
| 0-3 | Every Mumbai wedding starts the same way. With a list. | Handwritten-style list on a blush page, first line inks in: "everything." |
| 3-8 | Mum's list. Aunty's list. Forty things, and none of them in the same place. | List lines multiply and spill off the page |
| 8-12 | Because this city doesn't sell weddings in one shop. It sells them in six different worlds. | 3D Mumbai map zooms from city shape into the island; six gold pins drop |
| 12-17 | Gold is in the lanes behind Mumbadevi, where bargaining is a language, and has been since the 1700s. | Zaveri Bazaar pin pulls in, lane sketch, gold thread line draws |
| 17-22 | Fabric is Kalbadevi. Mulji Jetha. Rolls stacked to the ceiling, and a tailor who needs it by Friday. | Pin to Kalbadevi, thread line moves, a bolt of fabric unrolls into a route |
| 22-27 | The lehenga she actually dreamed about? That's a Bandra appointment, booked three weeks ago. | Pin to Bandra, calendar page flips back three weeks |
| 27-32 | And the last thing, always the last, is Colaba. Bangles, mehendi, one more hour by the sea. | Pin to Colaba, sea line, gold thread connects all six pins into one loop |
| 32-35 | Six worlds. One list. Three or four days, if you plan it right. | The list reappears, every line struck through in gold |
| 35-38 | We mapped all of it. | Logo + "bombay-bride.com". Hold end card 3s+ (extend to 41s total) |

Hook (first frame, before VO): the list with one word being written. No logo, no product.
Open question for you: does "Mum's list" fit, or should the bride be the narrator (first person)?

## Facts used (all from the site)
- Six shopping quarters, 109 stores mapped; Zaveri Bazaar jewellery spine since the 18th century
- Bandra atelier appointments need ~3 weeks lead in Nov-Feb season
- A full list realistically takes 3-4 days
- Not claimed: prices, ratings, any single store name

## Animation count (to build)
1. List ink-in + spill (1)  2. Map zoom city to island + 6 pin drops (reuse FortMap engine, fetch_region.py) (2)
3. Gold thread route between quarters (1)  4. Fabric unroll (1)  5. Calendar flip (1)
6. Strike-through list finale (1)  7. End card (1)  = 8 animations, 3 new designs (fabric unroll, calendar flip, gold thread)

## Needs before building
- Your OK on story angle and VO voice (female, warm, unhurried?)
- Real footage? Else illustrated lanes only; I won't fake storefronts
- Blush ground reads close to cream: use white #FFFDFB + maroon blocks instead?
