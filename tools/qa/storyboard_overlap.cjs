#!/usr/bin/env node
/* Storyboard overlap check (lesson L029): finds text blocks that overlap each other, or sit outside the safe area,
 * in every storyboard frame of a project's frame page.
 * Usage: node storyboard_overlap.cjs FRAME_PAGE.html beat1,beat2,... [--p 0.15,0.55,1]
 * The frame page reads #b=BEAT&p=PROGRESS from its URL, sets window.__ready = true when drawn, and uses 1080x1920 pixels.
 * FAIL = two different text blocks overlap by more than 60 square px. WARN = text outside y 250-1500 or right of x 960.
 * Needs playwright-core and a Chromium; set PW and EXE below or via env PLAYWRIGHT_CORE and CHROME_EXE. */
const path = require('path');
const PW = process.env.PLAYWRIGHT_CORE || '/Users/kabir/Ripping/node_modules/playwright-core';
const EXE = process.env.CHROME_EXE || '/Users/kabir/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const { chromium } = require(PW);
const page_ = path.resolve(process.argv[2]);
const beats = (process.argv[3] || '').split(',').filter(Boolean);
const pi = process.argv.indexOf('--p');
const ps = (pi > 0 ? process.argv[pi + 1] : '0.15,0.55,1').split(',').map(Number);
(async () => {
  const b = await chromium.launch({ executablePath: EXE, args: ['--allow-file-access-from-files'] });
  const ctx = await b.newContext({ viewport: { width: 1080, height: 1920 } });
  let fails = 0, warns = 0;
  for (const bt of beats) for (const p of ps) {
    const pg = await ctx.newPage();
    await pg.goto(`file://${page_}#b=${bt}&p=${p}`);
    try { await pg.waitForFunction('window.__ready===true', null, { timeout: 30000 }); } catch (e) { console.log(`FAIL ${bt} p=${p}: page never became ready`); fails++; await pg.close(); continue; }
    const items = await pg.evaluate(() => {
      const out = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const seen = new Set();
      while (walker.nextNode()) {
        const n = walker.currentNode; if (!n.textContent.trim()) continue;
        const el = n.parentElement; if (!el || seen.has(el)) continue; seen.add(el);
        if (el.closest('script,style,[data-ovk]')) continue;
        let anc = el.parentElement, nested = false;   // a span inside a text-bearing block is part of that block
        while (anc && anc !== document.body) { if ([...anc.childNodes].some(x => x.nodeType === 3 && x.textContent.trim())) { nested = true; break; } anc = anc.parentElement; }
        if (nested) continue;
        const r = document.createRange(); r.selectNodeContents(el); const rc = r.getBoundingClientRect();
        if (rc.width < 2 || rc.height < 2) continue;
        // an element clipped to zero width (e.g. a fill wipe) is not visible text
        const box = el.getBoundingClientRect(); if (box.width < 2) continue;
        out.push({ t: n.textContent.trim().slice(0, 28), x: rc.left, y: rc.top, w: rc.width, h: rc.height, el: el.className || el.tagName });
      }
      return out;
    });
    const inter = (a, c) => Math.max(0, Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x)) * Math.max(0, Math.min(a.y + a.h, c.y + c.h) - Math.max(a.y, c.y));
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const area = inter(items[i], items[j]);
      if (area > 60) { fails++; console.log(`FAIL ${bt} p=${p}: "${items[i].t}" overlaps "${items[j].t}" (${Math.round(area)} px2)`); }
    }
    for (const it of items) {
      if (it.y < 250 || it.y + it.h > 1500 || it.x + it.w > 960) {
        if (/lab/.test(String(it.el)) && it.y > 250) continue;
        warns++; console.log(`WARN ${bt} p=${p}: "${it.t}" outside the safe area (x ${Math.round(it.x)}-${Math.round(it.x + it.w)}, y ${Math.round(it.y)}-${Math.round(it.y + it.h)})`);
      }
    }
    await pg.close();
  }
  await b.close();
  console.log(fails ? `FAILED: ${fails} overlap(s), ${warns} warning(s)` : `OK: no overlaps, ${warns} warning(s)`);
  process.exit(fails ? 1 : 0);
})();
