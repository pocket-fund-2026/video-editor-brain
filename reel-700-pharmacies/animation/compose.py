from PIL import Image, ImageFilter, ImageEnhance
import sys, glob, os, subprocess
def base(shift=450, cx=1880):
    im=Image.open('/root/reel4/comps/dev4k.png').convert('RGB'); W,H=im.size
    x0=max(0,min(W-1215,cx-607)); strip=im.crop((x0,0,x0+1215,2160)).resize((1080,1920),Image.LANCZOS)
    bg=strip.filter(ImageFilter.GaussianBlur(28)); bg=ImageEnhance.Brightness(bg).enhance(0.8)
    mask=Image.new('L',(1080,1920),255)
    from PIL import ImageDraw
    d=ImageDraw.Draw(mask)
    for y in range(260): d.line([(0,y),(1080,y)],fill=int(255*y/260))
    sharp=Image.new('RGB',(1080,1920)); sharp.paste(strip,(0,shift)); m2=Image.new('L',(1080,1920),0); m2.paste(mask,(0,shift))
    out=bg.copy(); out.paste(sharp,(0,0),m2); return out
def over(b,png):
    g=Image.open(png).convert('RGBA'); b=b.convert('RGBA'); b.alpha_composite(g); return b
b0=base()
b0.convert('RGB').save('/root/reel4/comps/base.png')
jobs=[('A_headline','t001.40'),('B_map','t005.60'),('C_years','t005.60'),('D_year','t005.60'),('E_end','t001.60')]
outs=[]
for j,t in jobs:
    im=over(b0,f'/root/reel4/prev2/{j}/{t}.png')
    cap=sys.argv[1:] 
    im.convert('RGB').save(f'/root/reel4/comps/{j}.png'); outs.append(f'/root/reel4/comps/{j}.png')
print(outs)
