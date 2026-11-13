const wt=(sid,i)=>CUES.W[sid][i];
function lab(R,txt,orange){const l=box(R,'lab',{},txt);if(orange)l.style.color='var(--orange)';return l}
function slip(R,x,y,w,h,rot){const s=box(R,'slip',{left:x,top:y,width:w,height:h});s.style.transform=`rotate(${rot}deg)`;s.dataset.rot=rot;
  s.style.clipPath='polygon(0 0,100% 0,100% 97%,96% 100%,92% 97%,88% 100%,84% 97%,80% 100%,76% 97%,72% 100%,68% 97%,64% 100%,60% 97%,56% 100%,52% 97%,48% 100%,44% 97%,40% 100%,36% 97%,32% 100%,28% 97%,24% 100%,20% 97%,16% 100%,12% 97%,8% 100%,4% 97%,0 100%)';return s}
function ink(root){/*soft shadow wrapper not needed; clip-path slips drop their own shadow via parent*/}
// ================= S1 hook (black)
(function(){const id='s1',R=scene(id,'black');lab(R,'FILE 01 · THE HOOK');
 const H=headline(R,96,425,96,[[{t:'A',at:-9},{t:'₹1&nbsp;Cr',at:-9}],[{t:'business',at:-9},{t:'for',at:-9},{t:'just',at:-9}]]);
 const big=box(R,'h',{left:90,top:640,fontSize:250,lineHeight:1},'₹27&nbsp;L');big.style.transformOrigin='0 70%';
 const mkp=svgMark(R,96,880,760,34,ul(760),'#D3743E',14);
 const tag=box(R,'abs',{left:640,top:432,width:250,height:84},'<div class="slip" style="left:0;top:8px;width:250px;height:72px;display:flex;align-items:center;justify-content:center;font:700 28px JetBrains Mono,monospace">SALES / YEAR</div><div class="tape" style="left:50px;top:-8px;transform:rotate(-3deg)"></div>');
 const host=makeHost(R,'R','point',[],[E['s1.crore'],wt(id,13),wt(id,15)],640);const cap=makeCap(R);
 SCENES.push({id,root:R,ground:'black',update(t){upd_headline(H,t);const s1=t>=E['s1.crore']&&t<E['s1.crore']+.25?1+0.07*Math.sin(Math.PI*(t-E['s1.crore'])/.25):1;H.ws[1].w.style.transform=`scale(${s1})`;H.ws[1].w.style.transformOrigin='0 60%';
   const b=t>=E['s1.lakh']&&t<E['s1.lakh']+.3?1+0.06*Math.sin(Math.PI*(t-E['s1.lakh'])/.3):1;big.style.transform=`scale(${b})`;drawMark(mkp,t,E['s1.lakh'],.4);
   const tp=ease((t-E['s1.year'])/.3);tag.style.opacity=t>=E['s1.year']?1:0;tag.style.transform=`translateY(${(1-tp)*-60}px) rotate(${-4+(1-tp)*6}deg)`;
   updHost(host,t,SC[id]);updCap(cap,id,t)}})})();
// ================= S2 bakery (paper)
(function(){const id='s2',R=scene(id,'paper');lab(R,'FILE 02 · THE BAKERY');
 const H=headline(R,96,425,112,[[{t:"Let's",at:wt(id,0)},{t:'say,',at:wt(id,1)}],[{t:'a',at:wt(id,3)},{t:'bakery.',cls:'acc',at:wt(id,4)}]]);
 const c=slip(R,96,800,560,340,-3);c.innerHTML='<div class="mono" style="position:absolute;left:36px;top:30px;font-weight:700;font-size:28px">THE BAKERY</div><div class="mono" style="position:absolute;left:36px;top:96px;font-weight:500;font-size:24px;color:#555">SALES / YEAR</div><div id="n2" style="position:absolute;left:36px;top:128px;font:900 130px Archivo">₹0 Cr</div><div class="mono" style="position:absolute;left:36px;top:290px;font-size:20px;color:#555">ILLUSTRATIVE FIGURES</div>';
 const n2=c.querySelector('#n2');const cw=box(R,'abs',{left:96,top:800,width:560,height:340});
 const st1=box(R,'stamp',{left:380,top:745,fontSize:34,color:'var(--smoke)'},'HYPOTHETICAL');
 const st2=box(R,'stamp',{left:520,top:905,fontSize:54,color:'var(--orange)'},'FOR SALE');
 const host=makeHost(R,'R','present',[],[E['s2.crore'],E['s2.selling']+.2],640);const cap=makeCap(R);
 SCENES.push({id,root:R,ground:'paper',update(t){upd_headline(H,t);const p=ease((t-wt(id,4))/.35);c.style.opacity=t>=wt(id,4)?1:0;c.style.transform=`translateY(${(1-p)*60}px) rotate(${-3-(1-p)*4}deg)`;
   const k=ease((t-E['s2.crore'])/.7);n2.textContent='₹'+(k<1?(k).toFixed(1):'1')+' Cr';stampAt(st1,t,E['s2.say']+0.1,8);stampAt(st2,t,E['s2.selling'],-9);updHost(host,t,SC[id]);updCap(cap,id,t)}})})();
// ================= S3 trap (paper)
(function(){const id='s3',R=scene(id,'paper');lab(R,'FILE 03 · THE TRAP');
 const H=headline(R,96,425,120,[[{t:'₹1&nbsp;Cr',at:wt(id,3)}],[{t:'business.',at:wt(id,5)}]]);
 const H2=headline(R,96,790,150,[[{t:'<span class="st">Pay ₹1&nbsp;Cr?<i></i></span>',at:wt(id,9)}]]);const strike=H2.h.querySelector('i');
 const stp=box(R,'stamp',{left:470,top:1010,fontSize:66,color:'var(--smoke)'},'WRONG');
 const host=makeHost(R,'L','neutral',[],[wt(id,2),wt(id,13)],560);const cap=makeCap(R);
 SCENES.push({id,root:R,ground:'paper',update(t){upd_headline(H,t);upd_headline(H2,t);strikeAt(strike,t,wt(id,14),.25);stampAt(stp,t,E['s3.wrong'],-10);updHost(host,t,SC[id]);updCap(cap,id,t)}})})();
// ================= S4 numbers (paper)
(function(){const id='s4',R=scene(id,'paper');lab(R,'FILE 04 · THE NUMBERS');
 const c=slip(R,96,430,660,690,-2);c.style.opacity=1;
 const hd=box(c,'mono',{left:36,top:28,fontSize:26,fontWeight:700},'BAKERY · ONE YEAR');
 const rows={};
 function row(k,top,l,v,cls){const r=box(c,'row',{top},'<span>'+l+'</span><span class="n">'+(v||'')+'</span>');rows[k]=r;return r}
 row('sales',84,'SALES','₹1 Cr');row('staff',200,'– STAFF','');row('ingr',254,'– INGREDIENTS','');row('rent',308,'– RENT','');row('elec',362,'– ELECTRICITY','');
 const note=box(c,'mono',{left:36,top:150,fontSize:21,color:'var(--smoke)',opacity:0},"NOT THE OWNER'S TAKE-HOME");
 const div=box(c,'abs',{left:36,top:438,height:5,width:0,background:'#0A0A0A'});
 const prof=box(c,'row',{top:470},'<span>OPERATING<br>PROFIT</span><span class="n" id="pf" style="font-size:112px">₹0 L</span>');const pf=prof.querySelector('#pf');
 box(c,'mono',{left:36,top:640,fontSize:20,color:'#555'},'ILLUSTRATIVE FIGURES');
 const stp=box(R,'stamp',{left:470,top:775,fontSize:46,color:'var(--orange)'},'PROFITABLE');
 const host=makeHost(R,'R','present',[],[wt(id,2),wt(id,19),E['s4.profit']],640);const cap=makeCap(R);
 const at={sales:wt(id,2)-.15,staff:E['s4.staff'],ingr:E['s4.ingr'],rent:E['s4.rent'],elec:E['s4.elec']};
 SCENES.push({id,root:R,ground:'paper',update(t){for(const k in at){const p=ease((t-at[k])/.28);rows[k].style.opacity=t>=at[k]?1:0;rows[k].style.transform=`translateX(${(1-p)*-40}px)`}
   const np=ease((t-E['s4.isnt'])/.25);note.style.opacity=t>=E['s4.isnt']?np:0;
   div.style.width=(ease((t-wt(id,12))/.4)*588)+'px';const pp=ease((t-E['s4.fifteen'])/.3);prof.style.opacity=t>=E['s4.fifteen']-.3?1:0;
   countText(pf,t,E['s4.fifteen'],E['s4.fifteen']+.65,0,15,v=>'₹'+v+' L');stampAt(stp,t,E['s4.profit'],9);updHost(host,t,SC[id]);updCap(cap,id,t)}})})();
// ================= S5 real price (paper)
(function(){const id='s5',R=scene(id,'paper');lab(R,'FILE 05 · THE REAL PRICE');
 const A=box(R,'abs',{left:0,top:0,width:1080,height:1200});
 const HA=headline(A,96,425,96,[[{t:'Not',at:wt(id,4)},{t:'buying',at:wt(id,5)},{t:'<span class="st">sales.<i></i></span>',at:wt(id,6)}]]);const strike=HA.h.querySelector('i');
 const HB=headline(A,96,650,100,[[{t:'Buying its',at:wt(id,8)}],[{t:'ability to',at:wt(id,10)}],[{t:'make',at:wt(id,12)},{t:'money.',cls:'acc',at:wt(id,13)}]]);
 const mk1=svgMark(A,96,905,300,30,ul(300),'#D3743E',10);
 const B=box(R,'abs',{left:0,top:0,width:1080,height:1200});
 const n1=box(B,'h',{left:90,top:410,fontSize:230,lineHeight:1},'₹15&nbsp;L');
 const x3=box(B,'h',{left:96,top:660,fontSize:130,lineHeight:1,color:'var(--smoke)'},'× 3');
 const rule=box(B,'abs',{left:96,top:830,height:6,width:0,background:'#0A0A0A'});
 const n2=box(B,'h',{left:90,top:870,fontSize:230,lineHeight:1},'₹0&nbsp;L');
 const mkc=svgMark(B,60,850,780,270,circ(780,270),'#D3743E',12);
 const host=makeHost(R,'R','point',[[E['s5.forty'],'win']],[wt(id,2),wt(id,13),E['s5.forty']],640);const cap=makeCap(R);
 const swap=wt(id,14)-0.3;
 SCENES.push({id,root:R,ground:'paper',update(t){upd_headline(HA,t);upd_headline(HB,t);strikeAt(strike,t,E['s5.sales'],.25);drawMark(mk1,t,wt(id,13)+.1,.4);
   const ap=ease((t-(swap-0.25))/.25);A.style.opacity=1-ap;A.style.transform=`translateY(${-ap*140}px)`;
   const bp=ease((t-wt(id,14))/.3);B.style.opacity=t>=wt(id,14)?bp:0;n1.style.opacity=1;
   const tp=ease((t-E['s5.three'])/.25);x3.style.opacity=t>=E['s5.three']?tp:0;x3.style.transform=`scale(${1+(1-tp)*.3})`;rule.style.width=(ease((t-E['s5.three']-.15)/.3)*620)+'px';
   n2.style.opacity=t>=E['s5.forty']-.1?1:0;countText(n2,t,E['s5.forty'],E['s5.forty']+.6,0,45,v=>'₹'+v+'&nbsp;L');n2.innerHTML=n2.textContent.replace(' ','&nbsp;');drawMark(mkc,t,wt(id,23),.42);
   updHost(host,t,SC[id]);updCap(cap,id,t)}})})();
// ================= S6 the catch (black)
(function(){const id='s6',R=scene(id,'black');lab(R,'FILE 06 · THE CATCH');
 const H=headline(R,96,425,110,[[{t:'A',at:wt(id,0)},{t:'₹1&nbsp;Cr',at:wt(id,1)},{t:'bakery',at:wt(id,3)}],[{t:'for',at:wt(id,4)},{t:'₹45&nbsp;L.',at:wt(id,5),style:{fontSize:'1.55em'}}]]);
 const H3=headline(R,96,880,84,[[{t:'Sounds',at:wt(id,8)},{t:'like',at:wt(id,9)},{t:'a',at:wt(id,10)},{t:'steal.',cls:'acc',at:wt(id,11)}]]);
 const stp=box(R,'stamp',{left:300,top:1040,fontSize:66,color:'var(--smoke)'},'NOT SO FAST');
 const host=makeHost(R,'L','neutral',[],[E['s6.crore'],E['s6.steal'],E['s6.fast']],560);const cap=makeCap(R);
 SCENES.push({id,root:R,ground:'black',update(t){upd_headline(H,t);upd_headline(H3,t);stampAt(stp,t,E['s6.fast'],-10);updHost(host,t,SC[id]);updCap(cap,id,t)}})})();
// ================= S7 head baker (paper)
(function(){const id='s7',R=scene(id,'paper');lab(R,'FILE 07 · THE HEAD BAKER');
 const H=headline(R,96,425,104,[[{t:'The',at:wt(id,3)},{t:'owner',at:wt(id,3)+.1}],[{t:'is the head',at:wt(id,4)}],[{t:'baker.',cls:'acc',at:wt(id,7)}]]);
 const mu=svgMark(R,96,745,330,26,ul(330),'#D3743E',10);
 const c=slip(R,96,810,640,300,2);
 const r1=box(c,'row',{top:40},'<span>OWNER =</span><span class="n" style="font-size:38px">HEAD BAKER</span>');
 const r2=box(c,'row',{top:170},'<span>NEW HIRE</span><span class="n" id="h6" style="font-size:78px">₹0 L</span>');const h6=r2.querySelector('#h6');
 box(c,'mono',{left:36,top:262,fontSize:20,color:'#555'},'PER YEAR · ILLUSTRATIVE');
 const stp=box(R,'stamp',{left:380,top:790,fontSize:56,color:'var(--smoke)'},'LEAVES');
 const host=makeHost(R,'R','present',[],[wt(id,7),E['s7.leaves'],E['s7.six']],640);const cap=makeCap(R);
 SCENES.push({id,root:R,ground:'paper',update(t){upd_headline(H,t);drawMark(mu,t,wt(id,7),.38);const a=wt(id,7)+.35;r1.style.opacity=t>=a?1:0;r1.style.transform=`translateX(${(1-ease((t-a)/.28))*-40}px)`;
   const b=wt(id,13)-.05;r2.style.opacity=t>=b?1:0;r2.style.transform=`translateX(${(1-ease((t-b)/.28))*-40}px)`;
   countText(h6,t,E['s7.six'],E['s7.six']+.45,0,6,v=>'₹'+v+' L');stampAt(stp,t,E['s7.leaves'],-10);updHost(host,t,SC[id]);updCap(cap,id,t)}})})();
// ================= S8 reprice (split)
(function(){const id='s8',R=scene(id,'paper');
 const top=box(R,'abs',{left:0,top:0,width:1080,height:860,background:'var(--graphite)',color:'#fff'});const bot=box(R,'abs',{left:0,top:860,width:1080,height:1060,background:'var(--paper)',color:'#0A0A0A'});
 const l=lab(R,'FILE 08 · THE REPRICE',true);
 const tl=box(top,'mono',{left:96,top:440,fontSize:28,fontWeight:700,color:'var(--smoke)',opacity:0},'PROFIT / YEAR');
 const a1=box(top,'h',{left:90,top:490,fontSize:120,lineHeight:1,color:'var(--smoke)',opacity:0},'<span class="st">₹15&nbsp;L<i></i></span>');const s1=a1.querySelector('i');
 const ar1=box(top,'h',{left:470,top:490,fontSize:120,lineHeight:1,color:'#fff',opacity:0},'→');
 const b1=box(top,'h',{left:610,top:490,fontSize:120,lineHeight:1,color:'#fff',opacity:0},'₹15&nbsp;L');
 const bl=box(bot,'mono',{left:96,top:60,fontSize:28,fontWeight:700,color:'var(--ember)',opacity:0},'PRICE = 3 × PROFIT');
 const a2=box(bot,'h',{left:90,top:110,fontSize:120,lineHeight:1,color:'var(--smoke)',opacity:0},'<span class="st">₹45&nbsp;L<i></i></span>');const s2=a2.querySelector('i');
 const ar2=box(bot,'h',{left:470,top:110,fontSize:120,lineHeight:1,opacity:0},'→');
 const b2=box(bot,'h',{left:610,top:110,fontSize:120,lineHeight:1,opacity:0},'₹45&nbsp;L');
 const mkc=svgMark(bot,570,70,420,200,circ(420,200),'#D3743E',11);
 const host=makeHost(R,'R','present',[],[E['s8.nine'],E['s8.seven']],640);const cap=makeCap(R);
 const fade=(e,t,t0)=>{e.style.opacity=t>=t0?ease((t-t0)/.25):0};
 SCENES.push({id,root:R,ground:'split',update(t,p){top.style.transform=`translateX(${-(1-p)*500}px)`;bot.style.transform=`translateX(${(1-p)*500}px)`;
   fade(tl,t,wt(id,1)-.2);fade(a1,t,wt(id,1));strikeAt(s1,t,wt(id,5),.2);fade(ar1,t,wt(id,5)+.1);fade(b1,t,E['s8.nine']-.4);countText(b1,t,wt(id,5)+.1,E['s8.nine']+.2,15,9,v=>'₹'+v+'&nbsp;L');b1.innerHTML=b1.textContent.replace(' ','&nbsp;');
   fade(bl,t,E['s8.three']);fade(a2,t,E['s8.forty']);strikeAt(s2,t,E['s8.drops'],.2);fade(ar2,t,E['s8.drops']+.1);fade(b2,t,wt(id,17)-.05);countText(b2,t,wt(id,17),E['s8.seven']+.3,45,27,v=>'₹'+v+'&nbsp;L');b2.innerHTML=b2.textContent.replace(' ','&nbsp;');
   drawMark(mkc,t,E['s8.seven'],.4);updHost(host,t,SC[id]);updCap(cap,id,t)}})})();
// ================= S9 same bakery (black)
(function(){const id='s9',R=scene(id,'black');lab(R,'FILE 09 · SAME BAKERY');
 const H=headline(R,96,425,120,[[{t:'Same',at:wt(id,0)},{t:'bakery.',at:wt(id,1)}],[{t:'Same',at:wt(id,2)},{t:'₹1&nbsp;Cr',at:wt(id,4)}],[{t:'in sales.',at:wt(id,6)}],[{t:'Different',at:wt(id,9),style:{fontSize:'.92em'}},{t:'price.',cls:'acc',at:wt(id,10)}]]);
 const mu=svgMark(R,600,905,290,30,ul(290),'#D3743E',12);
 const host=makeHost(R,'R','point',[],[wt(id,1),E['s9.same2'],E['s9.price']],640);const cap=makeCap(R);
 SCENES.push({id,root:R,ground:'black',update(t){upd_headline(H,t);drawMark(mu,t,E['s9.price'],.4);updHost(host,t,SC[id]);updCap(cap,id,t)}})})();
// ================= S10 lesson (paper)
(function(){const id='s10',R=scene(id,'paper');lab(R,'FILE 10 · THE LESSON');
 const old=box(R,'h',{left:96,top:470,fontSize:76,fontWeight:700,color:'var(--smoke)',opacity:0},'<span class="st">How much does it sell?<i></i></span>');const so=old.querySelector('i');
 const H=headline(R,96,425,96,[[{t:'How',at:wt(id,10)},{t:'much',at:wt(id,11)},{t:'will',at:wt(id,12)},{t:'it',at:wt(id,13)}],[{t:'make',cls:'acc',at:wt(id,14)},{t:'after',at:wt(id,15)}],[{t:'you take over?',at:wt(id,16)}]]);
 const mu=svgMark(R,96,640,260,26,ul(260),'#D3743E',10);
 const host=makeHost(R,'L','chest',[],[wt(id,8),wt(id,14)],640);const cap=makeCap(R);
 SCENES.push({id,root:R,ground:'paper',update(t){const o=t>=wt(id,4)&&t<wt(id,9)-.1?ease((t-wt(id,4))/.25):0;old.style.opacity=o;strikeAt(so,t,E['s10.sells'],.25);upd_headline(H,t);drawMark(mu,t,E['s10.make'],.4);updHost(host,t,SC[id]);updCap(cap,id,t)}})})();
// ================= S11 close (black)
(function(){const id='s11',R=scene(id,'black');
 const logo=mk('img',null,null,px({position:'absolute',left:140,top:430,width:800}));logo.src=ASSET.logo_white;R.appendChild(logo);
 const H=headline(R,96,640,110,[[{t:"Don't",at:wt(id,5)},{t:'start',at:wt(id,5)+.15},{t:'one.',at:wt(id,5)+.3}],[{t:'Buy',cls:'acc',at:wt(id,7)},{t:'one.',at:wt(id,7)+.12}]]);
 const cta=box(R,'abs',{left:96,top:960,width:430,height:112,background:'var(--orange)',color:'#0A0A0A',font:'700 56px JetBrains Mono,monospace',display:'flex',alignItems:'center',justifyContent:'center',opacity:0},'DM "LORE"');
 const sub=box(R,'mono',{left:96,top:1100,fontSize:26,fontWeight:700,color:'#fff',opacity:0},'TO BUY A PROFITABLE COMPANY');
 const host=makeHost(R,'R','chest',[],[wt(id,7),E['s11.dm']],640);const cap=makeCap(R);
 SCENES.push({id,root:R,ground:'black',update(t){logo.style.opacity=ease((t-SC[id]+.1)/.4);upd_headline(H,t);const p=clamp((t-E['s11.dm'])/.12);cta.style.opacity=t>=E['s11.dm']?1:0;const sh=(t>=E['s11.dm']&&t<E['s11.dm']+.07)?((Math.round((t-E['s11.dm'])*30)%2)?5:-5):0;cta.style.transform=`translateX(${sh}px) scale(${1.25-.25*ease(p)})`;sub.style.opacity=t>=E['s11.lore']?ease((t-E['s11.lore'])/.25):0;updHost(host,t,SC[id]);updCap(cap,id,t)}})})();
