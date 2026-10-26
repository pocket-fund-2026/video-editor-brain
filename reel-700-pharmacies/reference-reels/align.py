import json,sys
b=sys.argv[1]
w=json.load(open(f"asr/{b}.json")); c=[float(x) for x in open(f"cuts/{b}.txt")]
# merge cuts closer than 0.25s
cc=[]
for t in c:
    if not cc or t-cc[-1]>0.25: cc.append(t)
out=[];ci=0;line=[];start=None
def flush():
    global line,start
    if line: out.append((start," ".join(x["w"] for x in line)))
    line=[];start=None
for x in w:
    while ci<len(cc) and cc[ci]<=x["s"]:
        flush(); out.append((cc[ci],"  ▶ VISUAL CHANGE")); ci+=1
    if start is None: start=x["s"]
    line.append(x)
    if len(line)>=7 or x["w"].endswith((".","?","!")): flush()
flush()
for t,s in out: print(f"{t:5.1f}  {s}")
