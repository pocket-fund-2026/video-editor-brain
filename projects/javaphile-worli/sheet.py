import sys, glob
from PIL import Image
d, out = sys.argv[1], sys.argv[2]; w = int(sys.argv[3]) if len(sys.argv) > 3 else 270
fs = sorted(glob.glob(d + '/*.jpg') + glob.glob(d + '/t*.png')); ims = [Image.open(f).convert('RGB').resize((w, int(w * 16 / 9))) for f in fs]
cols = min(len(ims), 6); rows = (len(ims) + cols - 1) // cols; h = int(w * 16 / 9)
s = Image.new('RGB', (w * cols, h * rows), 'white')
for i, im in enumerate(ims): s.paste(im, ((i % cols) * w, (i // cols) * h))
s.save(out); print(len(ims), s.size)
