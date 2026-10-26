"""Word-time params for gfx3.html, from the Whisper timeline used by v1."""
import json
T=json.load(open('/root/reel4/timeline.json'));W=[(w[2].strip('.,?').lower(),w[0]) for s in T for w in s['words']]
def at(word,n=1):
    k=0
    for x,t in W:
        if x==word:
            k+=1
            if k==n:return t
    raise KeyError(word)
w=dict(coolest=at('coolest'),operator=at('operator'),over1=at('over'),n700=at('700'),italy=at('italy'),less=at('less'),years=at('years'),
       first=at('first'),year1=at('year'),hundred1=at('hundred'),acq=at('acquisitions'),how=at('how'),hundred2=at('hundred',2),one=at('one'),
       company=at('company'),three=at('three'),days=at('days'),ridic=at('ridiculous'),inspires=at('inspires'),pushes=at('pushes'),
       domore=at('more'),achieve=at('achieve'),more2=at('more',2))
S=json.load(open('/root/reel4/full/subs.json'))
json.dump(dict(dur=S['dur'],w=w,chunks=S['chunks']),open('/root/reel5/params.json','w'),indent=1);print(w)
