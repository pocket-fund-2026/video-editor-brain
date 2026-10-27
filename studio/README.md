# Reel Studio (studio/)

`index.html` is the source of the claude.ai artifact "Reel Edit Studio": editing styles sidebar (A to L), 14 live animation previews, looks (teal, cream, mint, glass, riso, pencil) and motion feels.

## Learning loop
1. `python3 learn/learn.py --root /root [--plans DIR]` reads the shipped 700-pharmacies reel timings (reel4), the cut rhythm of the reference reels (style-reels) and, if given, plans saved from the studio, and writes `lessons.json`.
2. The studio embeds `lessons.json` (`const LESSONS`). "Auto-edit from lessons" retimes each animation to the spoken word it illustrates (lead-in, length).
3. After editing in the studio, export the plans (Download plan JSON, or read the artifact db `plans` collection), re-run step 1 with `--plans`, republish `index.html`.

Footage proxies and thumbnails are not stored here.
