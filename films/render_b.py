"""Render and package three original 1080p Manim algebra films."""
from pathlib import Path
import subprocess,sys,os,json,wave,shutil
import numpy as np
ROOT=Path(__file__).resolve().parent.parent
os.environ['PATH']='/Library/TeX/texbin:/opt/homebrew/bin:'+os.environ.get('PATH','')
PYTHON=os.environ.get('MANIM_PYTHON',sys.executable)
FFMPEG=shutil.which('ffmpeg') or 'ffmpeg'
FFPROBE=shutil.which('ffprobe') or 'ffprobe'
F=[('Ekvationer','04-ekvationer'),('Problem','05-problem'),('BadaLed','06-bada-led')]
def music(path,seconds,variation):
    sr=24000;t=np.arange(int(sr*seconds))/sr;out=np.zeros_like(t)
    chords=[[146.832,184.997,220.0],[130.813,164.814,195.998],[174.614,220,261.626],[130.813,195.998,261.626]]
    for k,start in enumerate(np.arange(0,seconds,8)):
        ix=(t>=start)&(t<start+8);u=t[ix]-start;env=np.sin(np.pi*u/8)**1.5
        for freq in chords[(k+variation)%len(chords)]:out[ix]+=.022*env*(np.sin(2*np.pi*freq*u)+.13*np.sin(4*np.pi*freq*u))
    out*=np.minimum(t/3,1)*np.minimum((seconds-t)/4,1)
    with wave.open(str(path),'wb') as f:f.setnchannels(1);f.setsampwidth(2);f.setframerate(sr);f.writeframes((np.clip(out,-.8,.8)*32767).astype('<i2').tobytes())

def run(only=None):
    only=only or []
    unknown=set(only)-{slug for _,slug in F}
    if unknown:raise SystemExit('Unknown film: '+', '.join(sorted(unknown)))
    for i,(scene,slug) in enumerate(F):
        if only and slug not in only:continue
        log=ROOT/f'.build/{slug}.log';log.parent.mkdir(parents=True,exist_ok=True)
        media=ROOT/'.build'/slug
        cmd=[PYTHON,'-m','manim','--resolution','1920,1080','--fps','30','--format','mp4','--media_dir',str(media),str(ROOT/'films/part_b.py'),scene]
        with log.open('w') as h:subprocess.run(cmd,cwd=ROOT,env=os.environ,stdout=h,stderr=subprocess.STDOUT,check=True)
        raw=media/'videos/part_b/1080p30'/f'{scene}.mp4'
        if not raw.exists():raw=list(media.rglob(f'{scene}.mp4'))[0]
        probe=json.loads(subprocess.check_output([FFPROBE,'-v','error','-show_format','-show_streams','-of','json',str(raw)]))
        dur=float(probe['format']['duration']);assert 180<=dur<=300,dur
        sound=media/'music.wav';music(sound,dur,i+1)
        out=ROOT/'dist/assets/films'/f'{slug}.mp4';out.parent.mkdir(parents=True,exist_ok=True)
        subprocess.run([FFMPEG,'-y','-v','error','-i',str(raw),'-i',str(sound),'-map','0:v','-map','1:a','-c:v','libx264','-crf','25','-preset','fast','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-movflags','+faststart','-shortest',str(out)],check=True)
        poster=ROOT/'dist/assets/posters'/f'{slug}.jpg';poster.parent.mkdir(parents=True,exist_ok=True)
        subprocess.run([FFMPEG,'-y','-v','error','-ss','79','-i',str(out),'-frames:v','1','-q:v','2',str(poster)],check=True)
        print(json.dumps({'slug':slug,'duration':dur,'bytes':out.stat().st_size,'poster':str(poster)},ensure_ascii=False),flush=True)
if __name__=='__main__':run(sys.argv[1:])
