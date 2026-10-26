"""Person matte for foot/footage.mp4 with Robust Video Matting (onnx). Recurrent state resets at every jump cut. Writes foot/alpha.mp4 (gray)."""
import json,subprocess,numpy as np,onnxruntime as ort,time
W,H=1920,1080
cuts={round(s['reel'][0]*30) for s in json.load(open('/root/reel4/timeline.json'))}
so=ort.SessionOptions();so.intra_op_num_threads=4
sess=ort.InferenceSession('models/rvm_mobilenetv3_fp32.onnx',so)
dec=subprocess.Popen(['ffmpeg','-v','error','-i','foot/footage.mp4','-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
enc=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','gray','-s',f'{W}x{H}','-r','30','-i','-','-c:v','libx264','-crf','12','-pix_fmt','yuv420p','foot/alpha.mp4'],stdin=subprocess.PIPE)
z=np.zeros([1,1,1,1],np.float32);rec=[z]*4;dr=np.array([0.25],np.float32);i=0;t0=time.time()
while True:
    buf=dec.stdout.read(W*H*3)
    if len(buf)<W*H*3:break
    if i in cuts: rec=[z]*4
    src=(np.frombuffer(buf,np.uint8).reshape(H,W,3).transpose(2,0,1)[None].astype(np.float32)/255)
    fgr,pha,*rec=sess.run(None,{'src':src,'r1i':rec[0],'r2i':rec[1],'r3i':rec[2],'r4i':rec[3],'downsample_ratio':dr})
    enc.stdin.write((pha[0,0]*255).clip(0,255).astype(np.uint8).tobytes());i+=1
    if i%100==0:print(i,round(time.time()-t0),flush=True)
enc.stdin.close();enc.wait();print('frames',i)
