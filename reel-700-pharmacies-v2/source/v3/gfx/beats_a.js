/* beats_a.js — first half: headline, map, years (ported from reel-1 gfx2.html, horizontal + Kautilya palette) */
(function(){
/* hand-drawn wobbly ellipse + pen underline (from reel 1) */
function scribble(svg,cx,cy,rx,ry,color,wd){const pts=[];const n=40;for(let i=0;i<=n+6;i++){const a=-1.9+i/n*2*Math.PI;const j=1+0.035*Math.sin(i*1.7)+(i>n?0.06*(i-n)/6:0);pts.push([cx+Math.cos(a)*rx*j,cy+Math.sin(a)*ry*j])}
  const p=svgEl(svg,"path",{d:"M"+pts.map(q=>q.join(",")).join("L"),fill:"none",stroke:color,"stroke-width":wd,"stroke-linecap":"round","stroke-linejoin":"round"});drawable(p);return p}
function pen(svg,x1,y1,x2,y2,color,wd){const p=svgEl(svg,"path",{d:`M${x1},${y1} Q${(x1+x2)/2+6},${(y1+y2)/2-7} ${x2},${y2}`,fill:"none",stroke:color,"stroke-width":wd,"stroke-linecap":"round"});drawable(p);return p}
const TS="0 6px 30px rgba(8,48,62,.6),0 2px 6px rgba(8,48,62,.45)";

/* A. headline: "One operator." / "700 pharmacies." on the left, beside Dev */
BEATS.headline=(tl,w,t0,t1)=>{
  const X=80;
  const a=div("abs",{left:X+"px",top:"200px",fontSize:"78px",fontWeight:"300",lineHeight:"1",color:C.white,textShadow:TS,whiteSpace:"nowrap"},"One");
  const b=div("abs",{left:X+"px",top:"282px",fontSize:"92px",fontWeight:"800",lineHeight:"1",letterSpacing:"-.02em",color:C.white,textShadow:TS,whiteSpace:"nowrap"},"operator.");
  const c=div("abs",{left:(X-6)+"px",top:"450px",fontSize:"210px",fontWeight:"800",lineHeight:".9",letterSpacing:"-.04em",color:C.white,textShadow:TS,whiteSpace:"nowrap"},"700");
  const d=div("abs",{left:X+"px",top:"650px",fontSize:"64px",fontWeight:"300",lineHeight:"1",color:C.white,textShadow:TS,whiteSpace:"nowrap"},"pharmacies.");
  const svg=svgLayer("fr");const u=pen(svg,X+4,400,X+430,394,C.pale,9);
  [a,b,c,d].forEach(e=>gsap.set(e,{opacity:0,y:36}));
  tl.to(a,{opacity:1,y:0,duration:.5,ease:"power3.out"},t0+.1)
    .to(b,{opacity:1,y:0,duration:.5,ease:"power3.out"},t0+.28)
    .to(u,{strokeDashoffset:0,duration:.45,ease:"power2.out"},t0+.75)
    .to(c,{opacity:1,y:0,duration:.55,ease:"power3.out"},t0+1.1)
    .to(d,{opacity:1,y:0,duration:.5,ease:"power3.out"},t0+1.3);
  out(tl,[a,b,c,d,svg],t1-.3);
};

/* B. Italy card on the right; crosses + giant counter (behind Dev) fill 0->700 from "700" to "Italy" */
BEATS.map=(tl,w,t0,t1)=>{
  const CX=1240,CY=90,CW=600,CH=790;
  const card=div("card",{left:CX+"px",top:CY+"px",width:CW+"px",height:CH+"px"});
  const kick=div("abs kick",{left:(CX+44)+"px",top:(CY+40)+"px"},"PHARMACIES &middot; ITALY");
  const svg=svgLayer("fr");
  const polys=[];window.ITA.features[0].geometry.coordinates.forEach(p=>{const r=p[0];let a=1e9,b=-1e9,c=1e9,d=-1e9;r.forEach(([x,y])=>{a=Math.min(a,x);b=Math.max(b,x);c=Math.min(c,y);d=Math.max(d,y)});if((b-a)*(d-c)>0.08)polys.push(r)});
  let lo0=1e9,lo1=-1e9,la0=1e9,la1=-1e9;polys.forEach(r=>r.forEach(([x,y])=>{lo0=Math.min(lo0,x);lo1=Math.max(lo1,x);la0=Math.min(la0,y);la1=Math.max(la1,y)}));
  const k=Math.cos(41.5*Math.PI/180),mh=650,sc=mh/(la1-la0),mw=(lo1-lo0)*k*sc,ox=CX+CW/2-mw/2+10,oy=CY+CH-mh-36;
  const pr=([x,y])=>[ox+(x-lo0)*k*sc,oy+(la1-y)*sc];
  const paths=polys.map(r=>{const p=svgEl(svg,"path",{d:"M"+r.map(c=>pr(c).join(",")).join("L")+"Z",fill:"rgba(13,72,93,.06)",stroke:C.teal,"stroke-width":3,"stroke-linejoin":"round"});drawable(p);return p});
  const inside=(x,y)=>polys.some(r=>{let c=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const[xi,yi]=r[i],[xj,yj]=r[j];if((yi>y)!=(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c}return c});
  const R=rng(11),pts=[];let guard=0;
  while(pts.length<700&&guard++<500000){const x=lo0+R()*(lo1-lo0),y=la0+R()*(la1-la0);if(!inside(x,y))continue;const[px,py]=pr([x,y]);if(pts.some(q=>(q[0]-px)**2+(q[1]-py)**2<70))continue;pts.push([px,py])}
  const crosses=pts.map(([x,y])=>svgEl(svg,"path",{d:`M${x-1.6},${y-5}h3.2v3.4h3.4v3.2h-3.4v3.4h-3.2v-3.4h-3.4v-3.2h3.4z`,fill:C.teal}));
  crosses.forEach((c,i)=>gsap.set(c,{opacity:0,scale:0,svgOrigin:pts[i][0]+" "+pts[i][1]}));
  /* giant number behind Dev */
  const big=div("abs",{left:"150px",top:"70px",fontSize:"380px",fontWeight:"800",letterSpacing:"-.05em",lineHeight:"1",color:C.white,opacity:0,textShadow:"0 20px 60px rgba(8,48,62,.45)",whiteSpace:"nowrap"},"<span>0</span>","bk");
  const bigL=div("abs",{left:"172px",top:"440px",fontSize:"34px",fontWeight:"600",letterSpacing:".3em",color:C.white,opacity:0,textShadow:TS},"PHARMACIES","bk");
  const fill0=w.n700,fill=w.italy-w.n700;
  cardIn(tl,card,t0+.1,1);gsap.set([kick],{opacity:0});tl.to([kick],{opacity:1,duration:.3,ease:"power2.out"},t0+.35);
  tl.to(paths,{strokeDashoffset:0,duration:.9,ease:"power2.out"},t0+.4);
  tl.to(crosses,{opacity:1,scale:1,duration:.3,ease:"back.out(2.2)",stagger:{amount:fill-.25,from:"random"}},fill0);
  /* linear-ish counters so number tracks crosses */
  [big.firstChild].forEach(n=>{const o={v:0};tl.to(o,{v:700,duration:fill,ease:"none",onUpdate(){n.textContent=Math.round(o.v)}},fill0)});
  tl.fromTo(big,{opacity:0,y:40},{opacity:.92,y:0,duration:.5,ease:"power3.out"},fill0-.1).fromTo(bigL,{opacity:0,y:20},{opacity:1,y:0,duration:.4,ease:"power3.out"},fill0+.2);
  out(tl,[card,kick,svg,big,bigL],t1-.3);
};

/* C. "Under 5 years": 5 blocks fill on "less than five years", year 1 emphasised, "100+ ACQUISITIONS" */
BEATS.years=(tl,w,t0,t1)=>{
  const CX=1250,CY=170,CW=590,CH=520,PX=44;
  const card=div("card",{left:CX+"px",top:CY+"px",width:CW+"px",height:CH+"px"});
  const head=div("abs",{left:(CX+PX)+"px",top:(CY+44)+"px",fontSize:"64px",fontWeight:"800",letterSpacing:"-.025em",lineHeight:"1",color:C.teal,whiteSpace:"nowrap"},'Under <span style="color:'+C.mid+'">5</span> years');
  const BW=CW-2*PX,BY=CY+170;
  const bar=div("abs",{left:(CX+PX)+"px",top:BY+"px",width:BW+"px",height:"96px",display:"flex",gap:"10px"},"");
  const blocks=[],fills=[],labs=[];
  for(let i=0;i<5;i++){const b=document.createElement("div");b.style.cssText="flex:1;height:100%;position:relative";
    b.innerHTML=`<div style="position:absolute;inset:0;border-radius:14px;background:rgba(158,195,207,.45);overflow:hidden"><div class="fill" style="position:absolute;inset:0;background:${C.teal};transform-origin:left center;transform:scaleX(0)"></div></div><div class="lab" style="position:absolute;left:0;right:0;bottom:-38px;text-align:center;font-size:17px;font-weight:600;letter-spacing:.16em;color:${C.mid}">YEAR ${i+1}</div>`;
    bar.appendChild(b);blocks.push(b);fills.push(b.querySelector(".fill"));labs.push(b.querySelector(".lab"))}
  const tot=div("abs",{left:(CX+PX)+"px",top:(CY+CH-110)+"px",fontSize:"64px",fontWeight:"800",letterSpacing:"-.03em",lineHeight:"1",color:C.teal,whiteSpace:"nowrap"},'<span>0</span><span style="font-size:22px;font-weight:600;letter-spacing:.18em;color:'+C.mid+'"> &nbsp;PHARMACIES</span>');
  const tag=div("tcard",{left:(CX+PX)+"px",top:(CY+CH+28)+"px",padding:"14px 26px",borderRadius:"999px",fontSize:"42px",fontWeight:"800",letterSpacing:".04em",whiteSpace:"nowrap",opacity:0},'100+ <span style="font-weight:600;font-size:26px;letter-spacing:.16em;color:'+C.pale+'">&nbsp;ACQUISITIONS · YEAR 1</span>');
  const svg=svgLayer("fr");const bw=(BW-40)/5;
  const circ=scribble(svg,CX+PX+bw/2,BY+68,bw/2+20,94,C.teal,5);
  cardIn(tl,card,t0+.1,1);gsap.set([head,bar,tot],{opacity:0});tl.to([head,bar,tot],{opacity:1,duration:.3},t0+.35);
  const y0=w.less,y5=w.years+.45,dd=(y5-y0)/5;
  fills.forEach((f,i)=>tl.to(f,{scaleX:1,duration:dd+.05,ease:"power1.inOut"},y0+i*dd));
  count(tl,tot.firstChild,700,y0,y5-y0+.1);
  /* year 1 emphasis on "first year" */
  tl.to(fills.slice(1),{backgroundColor:C.pale,duration:.3},w.first)
    .to(labs[0],{color:C.teal,fontWeight:800,duration:.2},w.first)
    .fromTo(blocks[0],{scale:1},{scale:1.08,duration:.3,ease:"back.out(2)",transformOrigin:"50% 50%"},w.first)
    .to(circ,{strokeDashoffset:0,duration:.5,ease:"power2.out"},w.year1);
  tl.fromTo(tag,{opacity:0,y:20,scale:.85},{opacity:1,y:0,scale:1,duration:.35,ease:"back.out(1.8)",transformOrigin:"0% 50%"},w.hundred1);
  out(tl,[card,head,bar,tot,tag,svg],t1-.3);
};
})();
