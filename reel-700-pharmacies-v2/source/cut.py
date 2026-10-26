"""Cut the 700-pharmacies segments at 1920x1080, graded. Alternating gentle punch-ins (zoom around Dev) hide the jump cuts, like the reference."""
import json,subprocess
GRADE="curves=master='0/0.02 0.18/0.34 0.5/0.68 0.8/0.9 1/0.97',eq=saturation=1.18:contrast=1.05,colorbalance=rs=0.02:bs=-0.02:rm=0.03:bm=-0.02"
T=json.load(open('/root/reel4/timeline.json')); END=28.47+2.2
SRC='/root/drive-yt-talking/DJI_20260930090646_0621_D.MP4'
PUNCH={1:1.18,3:1.18,5:1.18}   # segment k -> zoom; 7 continues 6 (0.06s gap) so it stays wide
CX,CY=0.50,0.36
lst=[]
for s in T:
    a,b=s['src']
    if s['k']==len(T)-1: b=a+(END-s['reel'][0])
    z=PUNCH.get(s['k'],1.0); W,H=round(1920*z/2)*2,round(1080*z/2)*2
    x=min(max(round(W*CX-960),0),W-1920); y=min(max(round(H*CY-540),0),H-1080)
    vf=f"scale={W}:{H}:flags=lanczos,crop=1920:1080:{x}:{y},fps=30,format=yuv444p10le,{GRADE},format=yuv420p"
    o=f'foot/seg{s["k"]}.mp4'
    subprocess.run(['ffmpeg','-y','-v','error','-ss',str(a),'-i',SRC,'-t',f'{b-a:.3f}','-vf',vf,'-c:v','libx264','-crf','14','-preset','fast','-c:a','aac','-b:a','192k','-ar','48000','-ac','2',o],check=True)
    lst.append(f"file 'seg{s['k']}.mp4'")
open('foot/list.txt','w').write('\n'.join(lst))
subprocess.run(['ffmpeg','-y','-v','error','-f','concat','-safe','0','-i','foot/list.txt','-c','copy','foot/footage.mp4'],check=True)
