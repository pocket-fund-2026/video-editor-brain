const { chromium } = require('/Users/kabir/Ripping/node_modules/playwright-core');
const EXE = '/Users/kabir/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--allow-file-access-from-files']});
const pg=await (await b.newContext({viewport:{width:1080,height:1920}})).newPage(); await pg.goto('file://'+process.cwd()+'/film.html'); await pg.waitForFunction('window.__ready===true');
let fails=0,warns=0; const seenW=new Set();
const starts=await pg.evaluate(()=>window.SCENES.map(s=>s.start)); const inTr=t=>starts.some((s,i)=>i>=2&&t>=s&&t<s+0.46);
for(let t=0.1;t<29.7;t+=0.25){ if(inTr(t)) continue; await pg.evaluate(x=>window.renderAt(x),t);
 const items=await pg.evaluate(()=>{const out=[];const w=document.createTreeWalker(document.getElementById('stage'),NodeFilter.SHOW_TEXT);const seen=new Set();
  while(w.nextNode()){const n=w.currentNode;if(!n.textContent.trim())continue;const el=n.parentElement;if(!el||seen.has(el))continue;seen.add(el);
   let anc=el.parentElement,nested=false;while(anc&&anc.id!=='stage'){if([...anc.childNodes].some(x=>x.nodeType===3&&x.textContent.trim())){nested=true;break}anc=anc.parentElement}
   if(nested||getComputedStyle(el).visibility==='hidden'||el.closest('[data-ovk]'))continue;
   const r=document.createRange();r.selectNodeContents(el);const rc=r.getBoundingClientRect();if(rc.width<2||rc.height<2)continue;
   if(el.closest('svg'))continue; out.push({t:n.textContent.trim().slice(0,24),x:rc.left,y:rc.top,w:rc.width,h:rc.height,p:(el.closest('.abs')&&el.closest('.abs')!==el)?el.closest('.abs'):null})}
  const groups=new Map(),res=[]; for(const o of out){ if(o.p){ const g=groups.get(o.p)||{t:o.t,x:1e9,y:1e9,x2:-1e9,y2:-1e9}; g.x=Math.min(g.x,o.x); g.y=Math.min(g.y,o.y); g.x2=Math.max(g.x2,o.x+o.w); g.y2=Math.max(g.y2,o.y+o.h); groups.set(o.p,g)} else res.push({t:o.t,x:o.x,y:o.y,w:o.w,h:o.h}) } for(const g of groups.values()) res.push({t:g.t+'…',x:g.x,y:g.y,w:g.x2-g.x,h:g.y2-g.y}); return res});
 const inter=(a,c)=>Math.max(0,Math.min(a.x+a.w,c.x+c.w)-Math.max(a.x,c.x))*Math.max(0,Math.min(a.y+a.h,c.y+c.h)-Math.max(a.y,c.y));
 for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){const ar=inter(items[i],items[j]);if(ar>60){const k=`${items[i].t}|${items[j].t}`;if(!seenW.has(k)){seenW.add(k);fails++;console.log(`FAIL t=${t.toFixed(2)} "${items[i].t}" overlaps "${items[j].t}" (${Math.round(ar)} px2)`)}}}
 for(const it of items){if(it.y<250||it.y+it.h>1500||it.x+it.w>960){const k='S'+it.t;if(!seenW.has(k)){seenW.add(k);warns++;console.log(`WARN t=${t.toFixed(2)} "${it.t}" outside safe area x ${Math.round(it.x)}-${Math.round(it.x+it.w)} y ${Math.round(it.y)}-${Math.round(it.y+it.h)}`)}}}
}
console.log(fails?`FAILED ${fails} overlap(s), ${warns} warning(s)`:`OK no overlaps, ${warns} warning(s)`); await b.close()})();
