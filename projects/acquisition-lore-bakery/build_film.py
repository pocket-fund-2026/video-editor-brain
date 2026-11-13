import json,random,base64,io
from PIL import Image
cues=open('sync/cues.json').read(); sc=open('scenes.js').read(); src=open('film.src.html').read()
random.seed(7); im=Image.new('RGBA',(256,256))
im.putdata([((255,255,255) if random.random()>.5 else (0,0,0))+(random.choice([0,0,16,26,38]),) for _ in range(256*256)])
b=io.BytesIO(); im.save(b,'PNG'); grain='data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
assets={'host_'+k:f'assets/host_{k}.png' for k in ('neutral','point','win','chest','present')}; assets.update({'logo_white':'assets/logo_white.png','logo_dark':'assets/logo_dark.png','grain':grain})
html=src.replace('/*CUES*/null',cues).replace('/*ASSETS*/null',json.dumps(assets)).replace('/*SCENES*/',sc)
open('film.html','w').write(html); print('film.html',len(html))
