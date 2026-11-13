"""Foley + music bed built from sync/cues.json (same word-time cues that drive the animation: L010/L044/L014)."""
import json, numpy as np, wave
SR=48000; C=json.load(open('sync/cues.json')); N=int((C['film']+1)*SR); rng=np.random.default_rng(11)
def env(n,a=.002,r=.1): e=np.ones(n); na=max(1,int(a*SR)); e[:na]=np.linspace(0,1,na); nr=int(r*SR); e[-nr:]*=np.linspace(1,0,nr) if nr<n else 1; return e
def lp(x,fc):  # one-pole low-pass
    a=np.exp(-2*np.pi*fc/SR); y=np.zeros_like(x); s=0.
    for i,v in enumerate(x): s=(1-a)*v+a*s; y[i]=s
    return y
def hp(x,fc): return x-lp(x,fc)
def tick(): n=int(.06*SR); t=np.arange(n)/SR; return (np.sin(2*np.pi*1900*t)*np.exp(-t*90)*.6+np.sin(2*np.pi*620*t)*np.exp(-t*55)*.35)*.5
def stamp():
    n=int(.34*SR); t=np.arange(n)/SR; f=45+55*np.exp(-t*28); th=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*13)
    nz=lp(rng.standard_normal(n),2500)*np.exp(-t*70)*.8; return (th*.9+nz)*.9
def slide():
    n=int(.24*SR); t=np.arange(n)/SR; x=hp(lp(rng.standard_normal(n),4500),700)*np.sin(np.pi*t/.24)**1.5; return x*.45
def pen():
    n=int(.34*SR); t=np.arange(n)/SR; x=hp(lp(rng.standard_normal(n),6000),1800); m=.55+.45*np.sin(2*np.pi*23*t); return x*m*np.sin(np.pi*np.clip(t/.34,0,1))**.6*.45
def tape():
    n=int(.26*SR); t=np.arange(n)/SR; x=hp(rng.standard_normal(n),2500)*(0.5+0.5*np.sign(np.sin(2*np.pi*(60+220*t/.26)*t)))*np.exp(-t*8); return x*.28
def count():
    out=np.zeros(int(.8*SR)); k=tick()*.55
    for i in range(14):
        p=int(i*.045*SR); out[p:p+len(k)]+=k[:len(out)-p]
    return out
K={'tick':tick,'stamp':stamp,'slide':slide,'pen':pen,'tape':tape,'count':count}
fol=np.zeros(N)
for ev in C['sfx']+C['slide_sfx']:
    w=K[ev['kind']](); p=int(max(0,ev['t'])*SR); fol[p:p+len(w)]+=w[:N-p]
# music: soft lo-fi pad + pluck, Am F C G, 78 bpm
bpm=78; beat=60/bpm; chords=[[57,60,64],[53,57,60],[48,55,64],[55,59,62]]
mus=np.zeros(N); fr=lambda m:440*2**((m-69)/12)
for bar in range(int((C['film']+1)/(beat*4))+1):
    ch=chords[bar%4]; t0=bar*beat*4; p=int(t0*SR); n=int(beat*4*SR); t=np.arange(n)/SR
    pad=sum(np.sin(2*np.pi*fr(m-12)*t)+.3*np.sin(2*np.pi*fr(m)*t) for m in ch)*np.sin(np.pi*t/(beat*4))**.7
    mus[p:p+n]+=pad[:max(0,min(n,N-p))]*.05
    for k,m in enumerate([ch[0],ch[1],ch[2],ch[1],ch[2],ch[1],ch[0],ch[1]]):
        q=int((t0+k*beat/2)*SR); nn=int(.5*SR); tt=np.arange(nn)/SR; pl=(np.sin(2*np.pi*fr(m+12)*tt)+.4*np.sin(2*np.pi*fr(m+24)*tt))*np.exp(-tt*7)*.05
        if q<N: mus[q:q+nn]+=pl[:N-q]
mus=lp(mus,2600)
# duck music under voice
v=wave.open('voice_master.wav'); vd=np.frombuffer(v.readframes(v.getnframes()),np.int16).astype(float)/32768; vd=np.pad(vd,(0,max(0,N-len(vd))))[:N]
envv=lp(np.abs(vd),6); envv=np.clip(envv/ (envv.max()+1e-9)*8,0,1); mus*=1-0.55*envv
fade=np.ones(N); e=int(2*SR); fade[-e:]=np.linspace(1,0,e); mus*=fade
mix=vd*1.0+fol*0.36+mus*1.0
def w16(name,x):
    x=np.clip(x,-1,1); f=wave.open(name,'wb'); f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((x*32767).astype(np.int16).tobytes()); f.close()
w16('foley.wav',fol); w16('music.wav',mus); w16('mix_raw.wav',mix); print('foley+music ok', len(C['sfx'])+len(C['slide_sfx']),'events')
