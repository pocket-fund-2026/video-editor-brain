#!/usr/bin/env python3
"""Build data/city_data.js: island rings/roads shifted into the pin frame + a real-road route (Dijkstra, Fort -> cafe). Run from the project folder."""
import json,math,heapq
s=open('../mary-lodge-reel/data/map_data.js').read()
d=json.loads(s[s.index('=')+1:].rstrip().rstrip(';')); city=d['city']
m=json.load(open('data/map.json')); LAT,LON=m['origin']
kx=111320*math.cos(math.radians(18.934473)); ky=110574
FX=-(LON-72.840358)*kx; FY=(LAT-18.934473)*ky
shp=lambda pl:[round(v+(FX if i%2==0 else FY)) for i,v in enumerate(pl)]
out={'rings':[shp(r) for r in city['rings']],'roads':[shp(r) for r in city['roads']]}
G={};P={}
def snap(x,y,t=18): return (round(x/t),round(y/t))
def add(pl):
    pts=[(pl[i],pl[i+1]) for i in range(0,len(pl),2)]
    for a,b in zip(pts,pts[1:]):
        na,nb=snap(*a),snap(*b); P[na]=a; P[nb]=b
        if na==nb: continue
        w=math.dist(a,b); G.setdefault(na,[]).append((nb,w)); G.setdefault(nb,[]).append((na,w))
for r in m['r']: add(r['p'])
for r in out['roads']: add(r)
near=lambda x,y:min(P,key=lambda n:math.dist(P[n],(x,y)))
src=near(FX,FY); dst=near(0,0)
dist={src:0};prev={};q=[(0,src)]
while q:
    d0,u=heapq.heappop(q)
    if u==dst:break
    if d0>dist.get(u,1e18):continue
    for v,w in G.get(u,[]):
        nd=d0+w
        if nd<dist.get(v,1e18):dist[v]=nd;prev[v]=u;heapq.heappush(q,(nd,v))
route=[]
if dst in dist:
    n=dst
    while n!=src: route.append(P[n]);n=prev[n]
    route.append(P[src]);route.reverse()
print('fort in pin frame',round(FX),round(FY),'| src',P[src],'dst',P[dst],'| route pts',len(route),'len',round(dist.get(dst,0)),'OK' if dst in dist else 'NO PATH')
if route: route.append((0,0))   # final hop onto the pin
out['route']=[round(v) for p in route for v in p]
open('data/city_data.js','w').write('window.MAPCITY='+json.dumps(out,separators=(',',':'))+';\nwindow.MAPMID='+json.dumps(m,separators=(',',':'))+';')
