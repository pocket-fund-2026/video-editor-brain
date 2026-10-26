"""python3 chk4.py --times 4.0,6.5 --name a   -> renders those moments of gfx4.html (both layers), composites them over the
real footage with Dev's matte, and writes /root/reel5/chk4/<name>_sheet.png (plus full-size chk4/<name>_<t>.png)."""
import argparse,os,subprocess
from PIL import Image
ap=argparse.ArgumentParser();ap.add_argument('--times',required=True);ap.add_argument('--name',required=True);a=ap.parse_args()
os.chdir('/root/reel5');od=f'prev4_{a.name}';os.makedirs('chk4',exist_ok=True)
subprocess.run(['python3','render4.py','--times',a.times,'--outdir',od],check=True)
ts=[float(x) for x in a.times.split(',')];outs=[]
for t in ts:
    fr={}
    for src,k in [('foot/footage.mp4','f'),('foot/alpha.mp4','a')]:
        fn=f'chk4/_src_{k}_{t:06.2f}.png'
        if not os.path.exists(fn):subprocess.run(['ffmpeg','-v','error','-y','-ss',f'{t:.3f}','-i',src,'-frames:v','1',fn],check=True)
        fr[k]=fn
    f=Image.open(fr['f']).convert('RGBA');x=f.copy()
    x.alpha_composite(Image.open(f'{od}/back/t{t:06.2f}.png').convert('RGBA'))
    dev=f.copy();dev.putalpha(Image.open(fr['a']).convert('L'));x.alpha_composite(dev)
    x.alpha_composite(Image.open(f'{od}/front/t{t:06.2f}.png').convert('RGBA'))
    o=f'chk4/{a.name}_{t:06.2f}.png';x.convert('RGB').save(o);outs.append(o)
cols=min(3,len(outs));rows=(len(outs)+cols-1)//cols;s=Image.new('RGB',(960*cols,540*rows))
for i,o in enumerate(outs):s.paste(Image.open(o).resize((960,540)),((i%cols)*960,(i//cols)*540))
s.save(f'chk4/{a.name}_sheet.png');print(f'chk4/{a.name}_sheet.png')
