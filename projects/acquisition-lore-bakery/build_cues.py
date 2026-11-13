"""Single source of truth for sync (lesson L010 / L044): every animation + sfx time is a word time from data/timing.json.
Writes sync/cues.json read by film.html (via build_film.py) and foley.py."""
import json
T=json.load(open('data/timing.json')); S=[f's{i}' for i in range(1,12)]
def wt(sid,i,end=False): w=T[sid]['words'][i]; return w['e' if end else 's']
starts={s:T[s]['start'] for s in S}; FILM=json.load(open('sync/film_meta.json'))['_film']
ends={s:(starts[S[i+1]] if i<10 else FILM) for i,s in enumerate(S)}
# phrases: (spoken tokens count, display text, keyword (display substring or None))
P={
's1':[(7,'You can buy a business making','₹1 Cr'),(0,'','')],
}
# build phrases from explicit (spoken_text, display_text, key)
PH={
's1':[("You can buy a business making one crore rupees a year","You can buy a business making ₹1 Cr a year","₹1 Cr"),("for just twenty seven lakh","for just ₹27 L","₹27 L"),("Let me explain","Let me explain",None)],
's2':[("Let's say there's a bakery","Let's say there's a bakery","bakery"),("It makes one crore a year in sales","It makes ₹1 Cr a year in sales","₹1 Cr"),("One day, the owner says he's selling","One day, the owner says he's selling","selling")],
's3':[("You think, okay,","You think, okay,",None),("one crore business,","₹1 Cr business,","₹1 Cr"),("so I need one crore to buy it","so I need ₹1 Cr to buy it","₹1 Cr"),("Wrong","Wrong.","Wrong")],
's4':[("That one crore isn't what he takes home","That ₹1 Cr isn't what he takes home","₹1 Cr"),("Staff, ingredients, rent, electricity","Staff, ingredients, rent, electricity","electricity"),("After all of it, the bakery keeps","After all of it, the bakery keeps",None),("fifteen lakh a year in operating profit","₹15 L a year in operating profit","₹15 L")],
's5':[("Here's the thing","Here's the thing","thing"),("You're not buying sales","You're not buying sales","sales"),("You're buying its ability to make money","You're buying its ability to make money","money"),("Pay three times that profit,","Pay 3 times that profit,","3 times"),("and it's forty five lakh","and it's ₹45 L","₹45 L")],
's6':[("A one crore bakery for forty five lakh","A ₹1 Cr bakery for ₹45 L","₹45 L"),("Sounds like a steal","Sounds like a steal","steal"),("Well, not so fast","Well, not so fast","fast")],
's7':[("What if the owner is the head baker","What if the owner is the head baker","head baker"),("The moment he leaves,","The moment he leaves,","leaves"),("you hire someone for six lakh a year","you hire someone for ₹6 L a year","₹6 L")],
's8':[("Now fifteen lakh of profit becomes nine","Now ₹15 L of profit becomes ₹9 L","₹9 L"),("Same three times,","Same 3 times,",None),("and your forty five lakh drops to twenty seven","and your ₹45 L drops to ₹27 L","₹27 L")],
's9':[("Same bakery","Same bakery",None),("Same one crore in sales","Same ₹1 Cr in sales","₹1 Cr"),("A completely different price","A completely different price","price")],
's10':[("So the real question isn't how much it sells","So the real question isn't how much it sells","sells"),("It's how much it will make","It's how much it will make","make"),("after you take over","after you take over",None)],
's11':[("Save this reel","Save this reel","Save"),("And if you'd rather buy than build, DM LORE","And if you'd rather buy than build, DM LORE","LORE")],
}
phr={}
for s in S:
    i=0; out=[]
    for spoken,disp,key in PH[s]:
        n=len(spoken.split()); a=i; b=i+n-1; i+=n
        out.append({'s':round(wt(s,a),3),'e':round(wt(s,b,True),3),'text':disp,'key':key})
    assert i==len(T[s]['words']),(s,i,len(T[s]['words']))
    for k,p in enumerate(out): p['hold']=round(out[k+1]['s'] if k+1<len(out) else ends[s],3)
    phr[s]=out
# named events (animation + sfx). (name, scene, word index, offset, sfx kind or None)
E=[
('s1.crore','s1',7,0,'tick'),('s1.year','s1',10,0,'tape'),('s1.lakh','s1',13,0,'stamp'),
('s2.say','s2',1,0,'stamp'),('s2.crore','s2',8,0,'tick'),('s2.selling','s2',19,-0.2,'stamp'),
('s3.one','s3',3,0,'tick'),('s3.need','s3',8,0,'tick'),('s3.wrong','s3',14,0.2,'stamp'),
('s4.isnt','s4',3,0,'pen'),('s4.staff','s4',8,0,'tick'),('s4.ingr','s4',9,0,'tick'),('s4.rent','s4',10,0,'tick'),('s4.elec','s4',11,0,'tick'),('s4.fifteen','s4',19,0,'count'),('s4.profit','s4',25,0,'stamp'),
('s5.sales','s5',6,0.25,'pen'),('s5.money','s5',13,0,'tick'),('s5.three','s5',15,0,'tick'),('s5.forty','s5',21,0,'count'),
('s6.crore','s6',2,0,'tick'),('s6.forty','s6',5,0,'tick'),('s6.steal','s6',11,0,'tick'),('s6.fast','s6',15,0,'stamp'),
('s7.baker','s7',7,0,'pen'),('s7.leaves','s7',11,0,'stamp'),('s7.six','s7',16,0,'count'),
('s8.fifteen','s8',1,0,'tick'),('s8.nine','s8',6,0,'count'),('s8.three','s8',8,0,'tick'),('s8.forty','s8',12,0,'tick'),('s8.drops','s8',15,0,'pen'),('s8.seven','s8',18,0,'pen'),
('s9.same1','s9',0,0,'tick'),('s9.same2','s9',2,0,'tick'),('s9.price','s9',10,0,'pen'),
('s10.sells','s10',8,0.25,'pen'),('s10.make','s10',14,0,'tick'),
('s11.dm','s11',10,0,'stamp'),('s11.lore','s11',11,0,'tick'),
]
ev={}; sfx=[]
for name,s,i,off,kind in E:
    t=round(wt(s,i)+off,3); ev[name]=t
    if kind: sfx.append({'t':t,'kind':kind,'name':name})
# pose changes + nods at keywords
cues={'W':{s:[w['s'] for w in T[s]['words']] for s in S},'film':FILM,'starts':starts,'ends':ends,'phrases':phr,'ev':ev,'sfx':sfx,
 'slide_sfx':[{'t':round(starts[s]-0.24,3),'kind':'slide','name':'slide.'+s} for s in S[1:]]}
json.dump(cues,open('sync/cues.json','w'),indent=1,ensure_ascii=False); print('cues ok',len(ev),'events',FILM)
