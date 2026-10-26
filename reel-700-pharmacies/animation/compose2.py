from PIL import Image
import importlib.util
spec=importlib.util.spec_from_file_location("c","/root/reel4/compose.py")
import re
src=open('/root/reel4/compose.py').read().split("b0=base()")[0]
exec(src)
b0=base()
jobs=[('A_headline','t001.60','c1'),('B_map','t005.10','c2'),('C_years','t005.00','c3'),('D_year','t004.70','c4'),('E_end','t001.20',None)]
for j,t,c in jobs:
    im=over(b0,f'/root/reel4/prev2/{j}/{t}.png')
    if c: im=over(im,f'/root/reel4/prev2/{c}.png')
    im.convert('RGB').save(f'/root/reel4/comps/F_{j}.png')
im=over(b0,'/root/reel4/prev2/c5.png'); im.convert('RGB').save('/root/reel4/comps/F_dev_only.png')
