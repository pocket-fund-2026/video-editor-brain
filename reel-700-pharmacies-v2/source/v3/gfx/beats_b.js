/* beats_b.js : second half (reaction, calendar, push, end). Reel-1 graphics ported to horizontal + Kautilya palette. */

/* D. 15.4-19.85  "I didn't even know that was possible, dude. How can you buy a hundred companies in one year?" */
BEATS.reaction=(tl,w,t0,t1)=>{
  const q=div("card",{left:"90px",top:"170px",width:"560px",height:"230px"});
  q.innerHTML=`<div style="position:absolute;left:30px;top:30px;width:56px;height:56px;border-radius:50%;background:${C.teal};color:#fff;font-size:26px;font-weight:700;display:flex;align-items:center;justify-content:center">D</div>
    <div style="position:absolute;left:102px;top:34px;font-size:22px;font-weight:700;color:${C.teal}">Dev <span style="font-weight:500;color:${C.mid}">&middot; just now</span></div>
    <div style="position:absolute;left:102px;top:62px;font-size:16px;font-weight:600;letter-spacing:.16em;color:${C.mid}">REACTION</div>
    <div class="qtb" style="position:absolute;left:32px;top:110px;right:32px;font-size:40px;font-weight:600;line-height:1.15;letter-spacing:-.02em;color:${C.teal}">I didn&rsquo;t even know that was possible.</div>`;
  const qt=q.querySelector(".qtb");
  cardIn(tl,q,t0+.05,-1);gsap.set(qt,{clipPath:"inset(0 100% 0 0)"});tl.to(qt,{clipPath:"inset(0 0% 0 0)",duration:.9,ease:"none"},t0+.2);
  /* giant 100 in the sky BEHIND Dev, with one small line folded under it */
  const big=div("abs shadow",{left:"0",width:"1920px",top:"20px",textAlign:"center",fontSize:"400px",fontWeight:"300",letterSpacing:"-.05em",color:C.white,lineHeight:"1"},'<span class="b100">0</span>',"bk");
  const lab=div("tcard",{left:"1330px",top:"250px",padding:"18px 30px",borderRadius:"18px",fontSize:"28px",fontWeight:"700",letterSpacing:".18em",lineHeight:"1.35"},`COMPANIES<br><span style="color:${C.pale}">IN ONE YEAR?</span>`);
  gsap.set(big,{opacity:0,y:40});tl.to(big,{opacity:.95,y:0,duration:.45,ease:"power3.out"},w.hundred2-.25);
  count(tl,big.querySelector(".b100"),100,w.hundred2-.2,.7);
  gsap.set(lab,{opacity:0,x:30});tl.to(lab,{opacity:1,x:0,duration:.35,ease:"power3.out"},w.hundred2+.35);
  out(tl,[q,big,lab],t1-.3);
};

/* E. 19.8-23.15  "you're buying a company every three days, like that is ridiculous"  -- reel-1 One-year dot calendar */
BEATS.calendar=(tl,w,t0,t1)=>{
  const X=1335,Y=90,CW=545,CH=740;
  const card=div("card",{left:X+"px",top:Y+"px",width:CW+"px",height:CH+"px"});
  const head=div("abs",{left:(X+40)+"px",top:(Y+40)+"px",fontSize:"56px",fontWeight:"700",letterSpacing:"-.03em",lineHeight:"1",color:C.teal},"One year");
  const sub0=div("abs kick",{left:(X+42)+"px",top:(Y+108)+"px"},"365 DAYS");
  const cnt=div("abs",{right:(1920-X-CW+40)+"px",top:(Y+26)+"px",fontSize:"84px",fontWeight:"300",letterSpacing:"-.04em",lineHeight:"1",textAlign:"right",color:C.teal},'<span class="cc">0</span>');
  const sub=div("abs kick",{right:(1920-X-CW+42)+"px",top:(Y+108)+"px",textAlign:"right"},"COMPANIES BOUGHT");
  const s=svgLayer();
  const months=[31,28,31,30,31,30,31,31,30,31,30,31],MN=["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  const pos=[];const sp=19,mw=7*sp,gx=(CW-80-3*mw)/2;
  months.forEach((n,m)=>{const col=m%3,row=Math.floor(m/3);const bx=X+40+col*(mw+gx),by=Y+180+row*122;
    const t=svgEl(s,"text",{x:bx-1,y:by-10,"font-size":14,"letter-spacing":"2.5","font-family":"Mont","font-weight":700,fill:C.mid});t.textContent=MN[m];
    for(let d=0;d<n;d++){const cx=bx+(d%7)*sp+6,cy=by+6+Math.floor(d/7)*sp;svgEl(s,"circle",{cx,cy,r:5.2,fill:"#C9DCE2"});pos.push({cx,cy})}});
  const hc=[];for(let i=0;i<100;i++){const p=pos[Math.min(364,Math.floor(i*3.65))];hc.push(svgEl(s,"circle",{cx:p.cx,cy:p.cy,r:0,fill:C.teal}))}
  const pill=div("abs",{left:(X+CW/2-200)+"px",top:(Y+CH-82)+"px",width:"400px",textAlign:"center",padding:"14px 0",borderRadius:"999px",background:C.teal,color:"#fff",fontSize:"26px",fontWeight:"700",letterSpacing:".14em",opacity:0},`<span style="color:${C.pale}">&#9679;</span> EVERY 3 DAYS`);
  cardIn(tl,card,t0+.02,1);const inner=[head,sub0,cnt,sub,s];gsap.set(inner,{opacity:0});tl.to(inner,{opacity:1,duration:.3},t0+.25);
  const c0=t0+.45,fill=Math.max(.8,w.three-c0-.1);
  tl.to(hc,{attr:{r:6.6},duration:.2,ease:"back.out(2)",stagger:{each:fill/100}},c0);
  {const n=cnt.querySelector(".cc"),o={v:0};tl.to(o,{v:100,duration:fill,ease:"none",onUpdate(){n.textContent=Math.round(o.v)}},c0+.05)}
  tl.fromTo(pill,{opacity:0,y:18,scale:.9},{opacity:1,y:0,scale:1,duration:.32,ease:"back.out(1.8)"},w.three)
    .to([hc[0],hc[1],hc[2]],{attr:{r:10},duration:.16,ease:"power2.out",stagger:.12},w.three)
    .to([hc[0],hc[1],hc[2]],{attr:{r:6.6},duration:.2},w.three+.5);
  tl.to(hc,{attr:{r:8.4},duration:.14,ease:"power1.out",stagger:{each:.008}},w.ridic)
    .to(hc,{attr:{r:6.6},duration:.2,ease:"power1.inOut",stagger:{each:.008}},w.ridic+.16);
  tl.to(card,{scale:1.025,duration:.16,yoyo:true,repeat:1,ease:"power2.out",transformOrigin:"50% 50%"},w.ridic);
  out(tl,[card,...inner,pill],t1-.3);
};

/* F. 23.1-28.45  "And it really inspires me and pushes me to do more and just achieve more" -- reel-1 staircase */
BEATS.push=(tl,w,t0,t1)=>{
  const X=70,Y=110,CW=600,CH=760;
  const card=div("card",{left:X+"px",top:Y+"px",width:CW+"px",height:CH+"px"});
  const kick=div("abs kick",{left:(X+44)+"px",top:(Y+44)+"px"},"WHAT IT DOES TO ME");
  const head=div("abs",{left:(X+42)+"px",top:(Y+80)+"px",fontSize:"62px",fontWeight:"700",letterSpacing:"-.03em",lineHeight:"1",color:C.teal},`It <span style="font-weight:300;font-style:italic;color:${C.mid}">inspires</span> me.`);
  const s=svgLayer();
  const pen=(x1,y1,x2,y2,col,sw)=>{const p=svgEl(s,"path",{d:`M${x1},${y1} Q${(x1+x2)/2+6},${(y1+y2)/2-5} ${x2},${y2}`,fill:"none",stroke:col,"stroke-width":sw,"stroke-linecap":"round"});drawable(p);return p};
  const und=pen(X+112,Y+156,X+372,Y+152,C.mid,6);
  const bx=X+60,by=Y+CH-70,st=118,rise=118;
  const pts=[[bx,by],[bx+st,by],[bx+st,by-rise],[bx+2*st,by-rise],[bx+2*st,by-2*rise],[bx+3*st,by-2*rise],[bx+3*st,by-3*rise],[bx+3*st+150,by-3*rise]];
  svgEl(s,"path",{d:"M"+pts.map(q=>q.join(",")).join("L"),fill:"none",stroke:"#C9DCE2","stroke-width":9,"stroke-linejoin":"round","stroke-linecap":"round"});
  const stair=svgEl(s,"path",{d:"M"+pts.map(q=>q.join(",")).join("L"),fill:"none",stroke:C.teal,"stroke-width":9,"stroke-linejoin":"round","stroke-linecap":"round"});
  const L=drawable(stair);
  const ex=pts[7][0],ey=pts[7][1];
  const arrow=svgEl(s,"path",{d:`M${ex-22},${ey-22} L${ex+2},${ey} L${ex-22},${ey+22}`,fill:"none",stroke:C.teal,"stroke-width":9,"stroke-linecap":"round","stroke-linejoin":"round",opacity:0});
  const dot=svgEl(s,"circle",{cx:bx,cy:by,r:15,fill:C.mid,opacity:0});
  const lenAt=i=>{let a=0;for(let k=1;k<=i;k++)a+=Math.hypot(pts[k][0]-pts[k-1][0],pts[k][1]-pts[k-1][1]);return a};
  const o={l:0};const upd=()=>{stair.style.strokeDashoffset=L-o.l;const p=stair.getPointAtLength(o.l);dot.setAttribute("cx",p.x);dot.setAttribute("cy",p.y)};
  const pDo=div("abs",{left:(pts[3][0]+16)+"px",top:(pts[3][1]+18)+"px",padding:"11px 20px",borderRadius:"999px",background:C.mid,color:"#fff",fontSize:"24px",fontWeight:"700",letterSpacing:".12em",opacity:0},"DO MORE");
  const pAch=div("abs",{right:(1920-X-CW+40)+"px",top:(ey-96)+"px",padding:"13px 24px",borderRadius:"999px",background:C.teal,color:"#fff",fontSize:"28px",fontWeight:"700",letterSpacing:".12em",opacity:0},"ACHIEVE MORE");
  cardIn(tl,card,t0+.02,-1);gsap.set([kick,head],{opacity:0,y:16});
  tl.to(kick,{opacity:1,y:0,duration:.3},t0+.2).to(head,{opacity:1,y:0,duration:.4,ease:"power3.out"},Math.max(t0+.3,w.inspires-.12));
  tl.to(und,{strokeDashoffset:0,duration:.4,ease:"power2.out"},w.inspires+.15);
  tl.to(dot,{opacity:1,duration:.15},w.pushes);
  tl.to(o,{l:lenAt(3),duration:w.domore-w.pushes,ease:"power1.inOut",onUpdate:upd},w.pushes);
  tl.fromTo(pDo,{opacity:0,y:14,scale:.9},{opacity:1,y:0,scale:1,duration:.3,ease:"back.out(1.8)"},w.domore);
  tl.to(o,{l:L,duration:w.achieve-w.domore+.25,ease:"power2.inOut",onUpdate:upd},w.domore+.2);
  tl.to(arrow,{opacity:1,duration:.15},w.achieve+.3).to(dot,{opacity:0,duration:.15},w.achieve+.3);
  tl.fromTo(pAch,{opacity:0,y:18,scale:.85},{opacity:1,y:0,scale:1,duration:.34,ease:"back.out(2)"},w.achieve);
  tl.to(pAch,{scale:1.1,duration:.12,yoyo:true,repeat:1,ease:"power2.out"},w.more2);
  out(tl,[card,kick,head,s,pDo,pAch],t1-.3);
};

/* G. 28.45-end  full-screen teal title card */
BEATS.end=(tl,w,t0)=>{
  const bg=div("abs",{left:"0",top:"0",width:"1920px",height:"1080px",background:`linear-gradient(135deg,${C.teal},${C.deep})`});
  gsap.set(bg,{clipPath:"inset(0 100% 0 0)"});tl.to(bg,{clipPath:"inset(0 0% 0 0)",duration:.45,ease:"power3.inOut"},t0);
  const a=div("abs",{left:"0",width:"1920px",top:"250px",textAlign:"center",fontSize:"120px",fontWeight:"700",letterSpacing:"-.035em",lineHeight:"1",color:C.white},`700 <span style="font-weight:300">pharmacies.</span>`);
  const b=div("abs",{left:"0",width:"1920px",top:"390px",textAlign:"center",fontSize:"96px",fontWeight:"300",letterSpacing:"-.03em",lineHeight:"1",color:C.pale},"Under 5 years.");
  const ln=div("abs",{left:"900px",top:"540px",width:"120px",height:"3px",background:C.pale});
  const lg=div("abs",{left:"0",width:"1920px",top:"600px",display:"flex",flexDirection:"column",alignItems:"center"},`<img src="kautilya_mark.svg" style="height:120px"><div style="margin-top:20px;font-size:30px;font-weight:400;letter-spacing:.34em;padding-left:.34em;color:#fff">KAUTILYA</div>`);
  gsap.set([a,b],{opacity:0,y:34});tl.to(a,{opacity:1,y:0,duration:.5,ease:"power3.out"},t0+.3).to(b,{opacity:1,y:0,duration:.5,ease:"power3.out"},t0+.5);
  gsap.set(ln,{scaleX:0});tl.to(ln,{scaleX:1,duration:.4,ease:"power2.out"},t0+.75);
  gsap.set(lg,{opacity:0,y:16});tl.to(lg,{opacity:1,y:0,duration:.5,ease:"power2.out"},t0+.9);
};
