"""Reproducible 1080p render, original score, captions and poster export."""
from pathlib import Path
import subprocess,os,json,wave,sys,shutil
import numpy as np
ROOT=Path(__file__).resolve().parent.parent
PYTHON=os.environ.get('MANIM_PYTHON',sys.executable)
ENV=dict(os.environ,PATH='/Library/TeX/texbin:/opt/homebrew/bin:'+os.environ.get('PATH',''))

def soundtrack(path,duration,variation):
    rate=32000;t=np.arange(int(rate*duration))/rate
    sig=np.zeros_like(t)
    chords=[[146.83,220,293.66],[130.81,196,261.63],[164.81,246.94,329.63],[174.61,261.63,349.23]]
    for k,start in enumerate(np.arange(0,duration,8)):
        local=t-start;mask=(local>=0)&(local<12);z=local[mask];env=np.minimum(z/1.3,1)*np.exp(-z/5.0)*np.minimum((12-z)/2,1)
        for i,f in enumerate(chords[(k+variation)%4]):sig[mask]+=.018*env*np.sin(2*np.pi*f*z+i*.3)+.004*env*np.sin(2*np.pi*2*f*z)
    sig*=np.minimum(t/3,1)*np.minimum((duration-t)/4,1)
    stereo=np.stack([sig,sig*.92],axis=1);pcm=np.clip(stereo*32767,-32767,32767).astype('<i2')
    with wave.open(str(path),'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(rate);w.writeframes(pcm.tobytes())

if __name__=='__main__':
    import sys
    only=sys.argv[1:]
    specs=[('Uttryck','01-uttryck'),('Monster','02-monster'),('Forenkla','03-forenkla')]
    for i,(scene,slug) in enumerate(specs):
        if only and slug not in only:continue
        work=ROOT/'.build'/slug;work.mkdir(parents=True,exist_ok=True)
        subprocess.run([PYTHON,'-m','manim','-qh','--fps','30','--media_dir',str(work),'--disable_caching',str(ROOT/'films/part_a.py'),scene],cwd=ROOT,env=ENV,check=True)
        raw=next(work.glob('videos/part_a/1080p30/'+scene+'.mp4'))
        dur=float(subprocess.check_output([(shutil.which('ffprobe') or '/opt/homebrew/bin/ffprobe'),'-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(raw)]))
        music=work/'score.wav';soundtrack(music,dur,i)
        out=ROOT/'dist/assets/films'/(slug+'.mp4');out.parent.mkdir(parents=True,exist_ok=True)
        subprocess.run([(shutil.which('ffmpeg') or '/opt/homebrew/bin/ffmpeg'),'-y','-loglevel','error','-i',str(raw),'-i',str(music),'-map','0:v:0','-map','1:a:0','-c:v','libx264','-preset','fast','-crf','25','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-movflags','+faststart','-shortest',str(out)],check=True)
        poster=ROOT/'dist/assets/posters'/(slug+'.jpg');poster.parent.mkdir(parents=True,exist_ok=True)
        subprocess.run([(shutil.which('ffmpeg') or '/opt/homebrew/bin/ffmpeg'),'-y','-loglevel','error','-ss','40','-i',str(out),'-frames:v','1','-q:v','2',str(poster)],check=True)
        print(json.dumps({'file':str(out),'duration':dur,'bytes':out.stat().st_size}),flush=True)
