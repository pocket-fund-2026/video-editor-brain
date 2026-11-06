const { chromium } = require('/Users/kabir/Ripping/node_modules/playwright-core');
const EXE = '/Users/kabir/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const FPS = 30, WORKERS = 4; const FROM = +process.env.FROM, TO = +process.env.TO; const fs = require('fs'); fs.mkdirSync('frames', { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: EXE, args: ['--allow-file-access-from-files'] });
  const pgs = [];
  for (let k = 0; k < WORKERS; k++) { const pg = await (await b.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })).newPage(); await pg.goto('file://' + process.cwd() + '/film.html'); await pg.waitForFunction('window.__ready===true', null, { timeout: 30000 }); pgs.push(pg); }
  const total = await pgs[0].evaluate('window.TOTAL'); const N = Math.round(total * FPS); console.log('frames', N);
  let done = 0;
  await Promise.all(pgs.map(async (pg, k) => { for (let i = FROM + k; i < TO; i += WORKERS) { await pg.evaluate(t => window.renderAt(t), i / FPS); await pg.screenshot({ path: `frames/${String(i).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 92 }); done++; if (done % 100 === 0) console.log('done', done); } }));
  await b.close(); console.log('finished', N);
})();
