import json, numpy as np, subprocess, os
from PIL import Image
D='assets_dl/'; names={'neutral':'m_i.3.jpg','point':'m_i.5.jpg','win':'m_i.6.jpg','chest':'m_i.7.jpg','present':'m_i.8.jpg'}
from PIL import ImageDraw, ImageFilter
for k,f in names.items():
    im=Image.open(D+f).convert('RGB'); W,H=im.size
    m=im.copy(); 
    seeds=[(x,0) for x in range(0,W,20)]+[(0,y) for y in range(0,H-40,20)]+[(W-1,y) for y in range(0,H-40,20)]
    for sd in seeds:
        px=m.getpixel(sd)
        if px!=(255,0,255) and max(abs(px[i]-c) for i,c in enumerate((243,238,232)))<22:
            ImageDraw.floodfill(m,sd,(255,0,255),thresh=24)
    a=np.asarray(m); bgm=(a[...,0]==255)&(a[...,1]==0)&(a[...,2]==255)
    alpha=Image.fromarray(((~bgm)*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.9))
    al=np.clip((np.asarray(alpha,float)-50)/150,0,1)*255
    Image.fromarray(np.dstack([np.asarray(im),al.astype(np.uint8)]),'RGBA').save(f'assets/host_{k}.png'); print(k,im.size,round(al.mean()/255,2))
# timeline: per scene clip -> master voice track + word times
GAP=0.45; t=0.0; tl={}; cmd=['ffmpeg','-v','error','-y']; filt=[]; ids=[f's{i}' for i in range(1,12)]
for i,s in enumerate(ids):
    w=json.load(open(f'voice/{s}.words.json')); first=w[0]['s']; last=w[-1]['e']; dur=last-first
    tl[s]={'start':round(t,3),'speech':round(dur,3),'words':[{'w':x['w'],'s':round(t+x['s']-first,3),'e':round(t+x['e']-first,3)} for x in w]}
    cmd+=['-i',f'voice/{s}.wav']; filt.append(f'[{i}:a]atrim=start={first-0.02:.3f},asetpts=PTS-STARTPTS,adelay={int(t*1000)}|{int(t*1000)}[a{i}]')
    t+=dur+(GAP if s!='s11' else 0)
total=t; end_hold=3.2
filt.append(''.join(f'[a{i}]' for i in range(11))+f'amix=inputs=11:normalize=0,loudnorm=I=-14:TP=-1[v]')
subprocess.run(cmd+['-filter_complex',';'.join(filt),'-map','[v]','-ar','48000','voice_master.wav'],check=True)
json.dump({'_total_speech':round(total,3),'_film':round(total+end_hold,3)},open('sync/film_meta.json','w'))
for s in ids: tl[s]['text']=json.load(open('script.json'))[s]
json.dump(tl,open('data/timing.json','w'),indent=1,ensure_ascii=False); print('timing ok')
