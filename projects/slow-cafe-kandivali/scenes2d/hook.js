(function(){
const R=355;
function blobPath(rx,ry,n,jit,seed,pw){
  const r=K.rng(seed),pts=[];
  for(let i=0;i<n;i++){const a=i/n*Math.PI*2,c=Math.cos(a),s=Math.sin(a);
    const x=rx*Math.sign(c)*Math.pow(Math.abs(c),2/pw),y=ry*Math.sign(s)*Math.pow(Math.abs(s),2/pw),j=1+jit*(r()-.5);pts.push([x*j,y*j]);}
  let d=`M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for(let i=0;i<n;i++){const p0=pts[(i-1+n)%n],p1=pts[i],p2=pts[(i+1)%n],p3=pts[(i+2)%n];
    d+=`C${(p1[0]+(p2[0]-p0[0])/6).toFixed(1)},${(p1[1]+(p2[1]-p0[1])/6).toFixed(1)} ${(p2[0]-(p3[0]-p1[0])/6).toFixed(1)},${(p2[1]-(p3[1]-p1[1])/6).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;}
  return d+'Z';
}
const defs=`${K.defs()}
<radialGradient id="plateG" cx="35%" cy="30%" r="85%"><stop offset="0" stop-color="#B9D0BB"/><stop offset="1" stop-color="#84A389"/></radialGradient>
<radialGradient id="wellG" cx="40%" cy="35%" r="80%"><stop offset="0" stop-color="#A7C2AA"/><stop offset="1" stop-color="#8CAA91"/></radialGradient>
<linearGradient id="crustG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C98338"/><stop offset="1" stop-color="#8A4A1B"/></linearGradient>
<linearGradient id="crumbG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F4D18F"/><stop offset="1" stop-color="#DDA95B"/></linearGradient>
<radialGradient id="creamG" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#F1EFEA"/><stop offset="1" stop-color="#D3D5DC"/></radialGradient>
<linearGradient id="ladyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0D295"/><stop offset=".6" stop-color="#E2B873"/><stop offset="1" stop-color="#C9954B"/></linearGradient>
<linearGradient id="chocG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6A3C24"/><stop offset="1" stop-color="#2E190F"/></linearGradient>
<clipPath id="toastClip"><path d="${blobPath(150,122,18,.05,7,3.4)}" transform="scale(.89,.87)"/></clipPath>`;
const TP=blobPath(150,122,18,.05,7,3.4);
// toast detail strings
function toastDetail(seed){
  const r=K.rng(seed);let s='';
  for(let i=0;i<110;i++){const a=r()*6.283,d=Math.sqrt(r())*.82,x=Math.cos(a)*d*130,y=Math.sin(a)*d*104,rx=1+r()*3,ry=rx*(.5+r()*.5);
    s+=`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${r()<.7?'#B9833E':'#FFF0C8'}" opacity="${(.25+r()*.4).toFixed(2)}" transform="rotate(${(r()*180)|0} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;}
  for(let i=0;i<46;i++){const a=r()*6.283,d=.72+r()*.18,x=Math.cos(a)*d*135,y=Math.sin(a)*d*108;
    s+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1+r()*2).toFixed(1)}" fill="#7B4217" opacity="${(.25+r()*.35).toFixed(2)}"/>`;}
  return s;
}
const TD=[toastDetail(11),toastDetail(23)];
function toast(i,hl){
  return `<g filter="url(#blur14)" opacity=".42" transform="translate(14,22)"><path d="${TP}" fill="#1E1A16"/></g>
<path d="${TP}" fill="#6E3913" transform="translate(5,8)"/>
<path d="${TP}" fill="url(#crustG)"/>
<path d="${TP}" fill="none" stroke="#E7A858" stroke-width="3" opacity=".35" transform="translate(${-2+hl},-3)"/>
<path d="${TP}" fill="url(#crumbG)" transform="scale(.89,.87)"/>
<g clip-path="url(#toastClip)"><ellipse cx="${i?-30:70}" cy="${i?-82:78}" rx="150" ry="42" fill="#8E5521" opacity=".55" filter="url(#blur14)" transform="rotate(${i?-8:10})"/>
<ellipse cx="${-60+hl*3}" cy="-55" rx="90" ry="40" fill="#FFF1C9" opacity=".35" filter="url(#blur14)"/>${TD[i]}</g>
<path d="${TP}" fill="none" stroke="#FFEFC0" stroke-width="2" opacity=".35" transform="scale(.89,.87) translate(${-2+hl*.5},-2)"/>`;
}
function lady(seed,hl=0){
  const r=K.rng(seed);let s='';
  for(let i=0;i<70;i++){const x=(r()-.5)*150,y=(r()-.5)*40;s+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(.7+r()*1.8).toFixed(1)}" fill="${r()<.55?'#FBF1D6':'#B07F3E'}" opacity="${(.3+r()*.4).toFixed(2)}"/>`;}
  return `<g filter="url(#blur6)" opacity=".4" transform="translate(9,14)"><rect x="-92" y="-31" width="184" height="62" rx="30" fill="#1E1A16"/></g>
<rect x="-92" y="-31" width="184" height="62" rx="30" fill="#B7843F"/>
<rect x="-90" y="-31" width="180" height="58" rx="29" fill="url(#ladyG)"/>
<rect x="-70" y="${-22+hl*.3}" width="120" height="9" rx="4.5" fill="#FFF3D3" opacity=".5"/>${s}
<rect x="-90" y="-31" width="180" height="58" rx="29" fill="none" stroke="#9C6B2E" stroke-width="2" opacity=".5"/>`;
}
const LD=[lady(5),lady(9)];
// cream dollop
function dollop(r,seed,hl,dusted){
  const rg=K.rng(seed);let s=`<g filter="url(#blur6)" opacity=".38" transform="translate(${r*.12},${r*.2})"><circle r="${r}" fill="#22201C"/></g><circle r="${r}" fill="#BFC2CB"/><circle r="${r*.97}" fill="url(#creamG)"/>`;
  const ring=(n,rad,pr,ph,op)=>{for(let k=0;k<n;k++){const a=ph+k/n*6.283+(rg()-.5)*.12,x=Math.cos(a)*rad,y=Math.sin(a)*rad;
    s+=`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(pr*(.95+rg()*.15)).toFixed(1)}" ry="${(pr*.62).toFixed(1)}" fill="url(#creamG)" stroke="#C4C7CF" stroke-width="1.4" opacity="${op}" transform="rotate(${((a*180/Math.PI)+90+20).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;}};
  const tiers=[[1,0,0],[.74,-.03,-.05],[.5,-.05,-.09],[.27,-.06,-.13]];
  tiers.forEach((q,ti)=>{if(ti===0)return;const cx=q[1]*r,cy=q[2]*r,rr=q[0]*r;
    s+=`<circle cx="${(cx+rr*.1).toFixed(1)}" cy="${(cy+rr*.14).toFixed(1)}" r="${rr.toFixed(1)}" fill="#9EA3B0" opacity=".85"/><circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${rr.toFixed(1)}" fill="url(#creamG)"/>`;
    const n=10+ti*2,ph=rg()*6;for(let k=0;k<n;k++){const an=ph+k/n*6.283+(rg()-.5)*.1,c=Math.cos(an),sn=Math.sin(an);
      s+=`<path d="M${(cx+c*rr*.98).toFixed(1)},${(cy+sn*rr*.98).toFixed(1)} Q${(cx+Math.cos(an+.5)*rr*.78).toFixed(1)},${(cy+Math.sin(an+.5)*rr*.78).toFixed(1)} ${(cx+Math.cos(an+.9)*rr*.5).toFixed(1)},${(cy+Math.sin(an+.9)*rr*.5).toFixed(1)}" stroke="#B6BAC4" stroke-width="${(2.2-ti*.3).toFixed(1)}" fill="none" opacity=".75" stroke-linecap="round"/><path d="M${(cx+c*rr*.98-1).toFixed(1)},${(cy+sn*rr*.98-1).toFixed(1)} Q${(cx+Math.cos(an+.5)*rr*.78-1).toFixed(1)},${(cy+Math.sin(an+.5)*rr*.78-1).toFixed(1)} ${(cx+Math.cos(an+.9)*rr*.5-1).toFixed(1)},${(cy+Math.sin(an+.9)*rr*.5-1).toFixed(1)}" stroke="#fff" stroke-width="1.3" fill="none" opacity=".8"/>`;}});
  s+=`<path d="M${(-r*.08).toFixed(1)},${(-r*.1).toFixed(1)} q${(r*.1).toFixed(1)},${(-r*.2).toFixed(1)} ${(r*.08).toFixed(1)},${(-r*.28).toFixed(1)}" stroke="#fff" stroke-width="3" fill="none" opacity=".9"/>`;
  s+=`<ellipse cx="${-r*.3+hl}" cy="${-r*.38}" rx="${r*.26}" ry="${r*.13}" fill="#fff" opacity=".85" transform="rotate(-30 ${-r*.3} ${-r*.38})"/>`;
  s+=`<circle r="${r*.97}" fill="none" stroke="#fff" stroke-width="1.5" opacity=".5" transform="translate(-1.5,-1.5)"/>`;
  const dust=[];for(let i=0;i<90;i++){const a=rg()*6.283,d=Math.sqrt(rg())*r*.92;dust.push([Math.cos(a)*d,Math.sin(a)*d,.8+rg()*1.9,rg(),rg()]);}
  return {base:s,dust};
}
const DOL=[ [-125,-70,58,31],[-30,-118,46,32],[100,30,68,33],[12,116,50,34] ].map(d=>({x:d[0],y:d[1],r:d[2],o:dollop(d[2],d[3],0),dd:dollop(d[2],d[3],0).dust}));
function dollopAt(d,t,hl){
  const o=dollop(d.r,d.o===0?0:d.seed||0,0); return o;
}
// precompute dollop svg with highlight param (call per frame, cheap)
const DSEED=[31,32,33,34];
function dollopSVG(i,t,hl){
  const d=DOL[i],o=dollop(d.r,DSEED[i],hl);let s=o.base;
  const pr=K.seg(t,2.25,2.9);
  if(pr>0){let dots='';o.dust.forEach(p=>{const v=K.clamp((pr-p[3]*.8)/.2);if(v>0)dots+=`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${p[2].toFixed(1)}" fill="${p[4]<.5?'#5B3A28':'#7A5036'}" opacity="${(v*.8).toFixed(2)}"/>`;});
    // fine overlay haze
    s+=`<circle r="${d.r*.9}" fill="#7A5036" opacity="${(pr*.1).toFixed(2)}"/>`+dots;}
  return s;
}
// static cocoa on toast
const clumps=[[-165,-10],[-70,-135],[150,-35],[185,95],[-10,165],[60,-40],[-110,60],[120,110]];
let cocoa='';{const r=K.rng(77);clumps.forEach(c=>{for(let i=0;i<55;i++){const a=r()*6.283,d=Math.pow(r(),1.6)*42;cocoa+=`<circle cx="${(c[0]+Math.cos(a)*d).toFixed(1)}" cy="${(c[1]+Math.sin(a)*d).toFixed(1)}" r="${(.7+r()*1.8).toFixed(1)}" fill="${r()<.5?'#4E2F1F':'#6B4630'}" opacity="${(.35+r()*.45).toFixed(2)}"/>`;}});}
// chocolate curls
function curl(len,rot,x,y,hl){len*=1.3;return `<g transform="translate(${x},${y}) rotate(${rot})"><rect x="${-len/2+3}" y="2" width="${len}" height="11" rx="5.5" fill="#1E1A16" opacity=".35" filter="url(#blur6)"/><path d="M${-len/2},0 Q0,${-9} ${len/2},2 L${len/2-2},11 Q0,2 ${-len/2+2},10Z" fill="url(#chocG)"/><path d="M${-len/2+4},2 Q0,-6 ${len/2-6},3" stroke="#B88562" stroke-width="1.6" fill="none" opacity=".7"/></g>`;}
const CURLS=[[34,30,-150,10],[26,-20,-70,-5],[30,50,62,-62],[30,-40,170,-25],[28,70,192,92],[26,10,-28,55],[30,80,-60,-125],[24,-30,130,125],[26,60,-175,-60]];
// coffee drips
let drips='';{const r=K.rng(99);[[-250,-60],[-230,40],[250,-90],[230,120],[-120,230],[60,255],[250,-20],[-20,-230],[130,-215],[-210,-150]].forEach(p=>{const rr=3+r()*7;
  drips+=`<ellipse cx="${p[0]}" cy="${p[1]}" rx="${rr*1.1}" ry="${rr}" fill="#4B2E1E" opacity=".7"/><ellipse cx="${p[0]-rr*.3}" cy="${p[1]-rr*.3}" rx="${rr*.35}" ry="${rr*.25}" fill="#F2E7D8" opacity=".5"/>`;
  if(r()<.5)drips+=`<circle cx="${p[0]+rr*2.2}" cy="${p[1]+rr*1.4}" r="${rr*.4}" fill="#4B2E1E" opacity=".6"/>`;});}
// puff particles
const PUF=[];{const r=K.rng(2024);for(let i=0;i<760;i++){const a=r()*6.283,d=Math.sqrt(r())*190;PUF.push({ox:Math.cos(a)*d*.9-10,oy:Math.sin(a)*d*.6-10,dx:60+r()*330,dy:-(160+r()*520),dl:r()*.45,rad:.9+Math.pow(r(),2)*4.2,op:.35+r()*.55,ph:r()*6.283,c:r()<.5?'#5B3A28':(r()<.5?'#7A5036':'#3F2619')});}}
const BL=[];{const r=K.rng(5);for(let i=0;i<7;i++)BL.push({ox:(r()-.5)*220,oy:(r()-.5)*120,dx:80+r()*220,dy:-(120+r()*340),rad:50+r()*60});}
function puff(t){
  if(t<2.2||t>3.95)return '';let s='<g filter="url(#blur30)">';
  BL.forEach(b=>{const p=K.seg(t,2.2,3.9),e=K.eo(p);s+=`<circle cx="${(b.ox+b.dx*e).toFixed(1)}" cy="${(b.oy+b.dy*e).toFixed(1)}" r="${(b.rad*(.6+p*1.6)).toFixed(1)}" fill="#6B4630" opacity="${(Math.min(p*8,1)*Math.pow(1-p,1.6)*.4).toFixed(3)}"/>`;});
  s+='</g><g filter="url(#blur6)" opacity=".5">';
  s+='</g><g>';
  PUF.forEach(q=>{const p=K.seg(t,2.2+q.dl,3.9);if(p<=0||p>=1)return;const e=K.eo(p);
    const x=q.ox+q.dx*e+Math.sin(q.ph+p*4)*14*p,y=q.oy+q.dy*e+Math.cos(q.ph+p*3)*10*p;
    const o=Math.min(p*10,1)*Math.pow(1-p,1.3)*q.op;if(o<.01)return;
    s+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(q.rad*(1+p*.8)).toFixed(2)}" fill="${q.c}" opacity="${o.toFixed(2)}"/>`;});
  return s+'</g>';
}
const pop=(t,a,b)=>({k:K.eob(K.seg(t,a,b),2),o:K.clamp((t-a)/.08)});
function place(inner,x,y,rot,t,a,b,dy=-40){const p=pop(t,a,b);if(p.o<=0)return '';
  return `<g opacity="${p.o.toFixed(2)}" transform="translate(${x},${y+dy*(1-p.k)}) rotate(${rot}) scale(${Math.max(p.k,.01).toFixed(3)})">${inner}</g>`;}
window.SCENE={dur:5.0,setT(t,stage){
  const pl=K.seg(t,0,.6),pk=K.eob(pl,2.2),dropY=-320*(1-pk),ps=1+.1*(1-pk),pa=K.clamp(t/.12);
  const cam=1.15*(1+.04*K.eio(K.seg(t,.9,2.1))),hl=Math.sin(t*.6)*5+t*1.5,land=K.eo(pl);
  const sh=`<g opacity="${(.2+.3*land)*pa}"><g filter="url(#blur30)" transform="translate(${10+26*land},${14+40*land}) scale(${1+.0*(1-land)})"><circle cx="540" cy="1010" r="${R*(1+.03*(1-land))}" fill="#222226" opacity=".8"/></g><g filter="url(#blur14)" transform="translate(${6+8*land},${8+14*land})"><circle cx="540" cy="1010" r="${R}" fill="#1B1B1E" opacity=".5"/></g></g>`;
  let plate=`<g opacity="${pa.toFixed(2)}" transform="translate(0,${dropY.toFixed(1)}) translate(540,1010) scale(${ps.toFixed(3)}) translate(-540,-1010)">`;
  plate+=`<g transform="translate(540,1010)"><circle r="${R}" fill="#6F8F76"/><circle r="${R-3}" fill="url(#plateG)"/><circle r="${R-26}" fill="none" stroke="#D2E3D3" stroke-width="2.4" opacity=".8"/><circle r="${R-30}" fill="none" stroke="#6F8F76" stroke-width="1.5" opacity=".35"/>
  <circle r="${R-60}" fill="url(#wellG)"/><circle r="${R-60}" fill="none" stroke="#7E9C84" stroke-width="3" opacity=".55" transform="translate(2,3)"/><circle r="${R-62}" fill="none" stroke="#DCEBDD" stroke-width="2" opacity=".35" transform="translate(-2,-3)"/>
  <path d="M${-R*.8},${-R*.35} A${R*.88},${R*.88} 0 0 1 ${-R*.3},${-R*.82}" stroke="#fff" stroke-width="10" fill="none" opacity="${(.25+.05*Math.sin(t)).toFixed(2)}" stroke-linecap="round" filter="url(#blur6)" transform="translate(${hl},${hl*.3})"/></g>`;
  plate+=`<g transform="translate(540,1010)"><g opacity="${K.clamp((t-.3)/.3)}">${drips}</g>`;
  plate+=place(LD[0],-160,225,-20,t,.3,.65)+place(LD[1],175,235,16,t,.4,.7);
  plate+=`<g transform="translate(0,-25) scale(1.2)">`;
  plate+=place(toast(0,hl),-55,-30,-9,t,.25,.6)+place(toast(1,hl),75,50,7,t,.35,.7);
  plate+=`<g opacity="${K.clamp((t-.75)/.3)}">${cocoa}</g>`;
  for(let i=0;i<4;i++){const d=DOL[i],a=.55+i*.1;plate+=place(dollopSVG(i,t,hl),d.x,d.y,0,t,a,a+.32,-50);}
  CURLS.forEach((c,i)=>{plate+=place(curl(c[0],c[1],0,0,hl),c[2],c[3],0,t,.85+i*.015,1.05+i*.015,-30);});
  plate+=`</g></g></g>`;
  const puffG=`<g transform="translate(540,1010)">${puff(t)}</g>`;
  stage.innerHTML=`<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs>${K.concrete(t)}
<g transform="translate(540,1010) scale(${cam.toFixed(4)}) translate(-540,-1010)">${sh}${plate}${puffG}</g>
<rect width="1080" height="1920" filter="url(#grain)" opacity=".35"/></svg>`;
}};
})();
