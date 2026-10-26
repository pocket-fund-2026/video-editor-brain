from PIL import Image, ImageFilter, ImageEnhance, ImageDraw
im=Image.open('/root/reel4/comps/dev4k.png').convert('RGB')
def base(band_y=1000):
    # blurred, darkened 9:16 fill from the same frame; the whole 16:9 frame sits uncropped as a full-width band
    W,H=im.size; s=1920/H; fill=im.resize((int(W*s),1920),Image.LANCZOS); x0=(fill.width-1080)//2
    bg=fill.crop((x0,0,x0+1080,1920)).filter(ImageFilter.GaussianBlur(34)); bg=ImageEnhance.Brightness(bg).enhance(0.55)
    band=im.resize((1080,608),Image.LANCZOS)
    sh=Image.new('RGBA',(1080,1920),(0,0,0,0)); d=ImageDraw.Draw(sh); d.rectangle([0,band_y-6,1080,band_y+608+6],fill=(0,0,0,150)); sh=sh.filter(ImageFilter.GaussianBlur(14))
    out=bg.convert('RGBA'); out.alpha_composite(sh); out.paste(band,(0,band_y)); return out
def over(b,png):
    g=Image.open(png).convert('RGBA'); b=b.convert('RGBA'); b.alpha_composite(g); return b
b0=base(); b0.convert('RGB').save('/root/reel4/comps/base3.png')
jobs=[('A_headline','t001.60','c1'),('B_map','t005.10','c2'),('C_years','t005.00','c3'),('D_year','t004.70','c4'),('E_end','t001.20',None)]
for j,t,c in jobs:
    x=over(b0,f'/root/reel4/prev2/{j}/{t}.png')
    if c: x=over(x,f'/root/reel4/prev2/{c}.png')
    x.convert('RGB').save(f'/root/reel4/comps/G_{j}.png')
over(b0,'/root/reel4/prev2/c5.png').convert('RGB').save('/root/reel4/comps/G_dev_only.png')
