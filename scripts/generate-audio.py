"""Deterministic original sound design. NumPy + local ffmpeg; no external samples."""
from pathlib import Path
import json, subprocess, wave
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/sounds'
OUT.mkdir(exist_ok=True)
RATE = 32000
rng = np.random.default_rng(80321)
report = []

def noise(n, smooth=1):
    samples = rng.normal(0, 1, n)
    if smooth > 1:
        samples = np.convolve(samples, np.ones(smooth) / smooth, mode='same')
    return samples

def note(freq, duration, gain=.15):
    t = np.arange(int(RATE * duration)) / RATE
    return gain * (np.sin(2*np.pi*freq*t) + .25*np.sin(4*np.pi*freq*t)) * (1-np.exp(-t*70)) * np.exp(-t*3) * np.minimum(1,(duration-t)/.06)

def put(track, sound, at, pan=0):
    indices = (np.arange(len(sound)) + int(at*RATE)) % len(track)
    if track.ndim == 1: np.add.at(track, indices, sound)
    else:
        np.add.at(track[:,0], indices, sound*np.sqrt((1-pan)/2))
        np.add.at(track[:,1], indices, sound*np.sqrt((1+pan)/2))

def save(name, samples, ambience=False):
    samples = samples - np.mean(samples, axis=0)
    peak = np.max(np.abs(samples))
    if peak > .82: samples *= .82 / peak
    if not ambience:
        fade = min(int(RATE*.008),len(samples)//8)
        samples[:fade] *= np.linspace(0,1,fade)
        samples[-fade:] *= np.linspace(1,0,fade)
    data = (np.clip(samples,-1,1)*32767).astype('<i2')
    temp = OUT / (name+'.wav')
    with wave.open(str(temp),'wb') as f:
        f.setnchannels(2 if samples.ndim == 2 else 1); f.setsampwidth(2); f.setframerate(RATE); f.writeframes(data.tobytes())
    path = temp
    if ambience:
        path = OUT / (name+'.mp3')
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(temp),'-codec:a','libmp3lame','-b:a','96k','-map_metadata','-1',str(path)],check=True)
        temp.unlink()
    report.append({'name':name,'file':path.name,'seconds':round(len(samples)/RATE,3),'channels':2 if samples.ndim==2 else 1,'peak':round(float(np.max(np.abs(samples))),4),'rms':round(float(np.sqrt(np.mean(samples*samples))),4),'bytes':path.stat().st_size})

# Foot contact: a heel/body transient, then low filtered grit appropriate to surface.
for surface, pitch, grit in [('grass',95,.13),('wood',175,.06),('stone',270,.09)]:
    for variant in [1,2]:
        t = np.arange(int(RATE*.16))/RATE
        body = np.sin(2*np.pi*(pitch+variant*8)*t)*np.exp(-t*48)*.22
        crunch = noise(len(t),3 if surface=='grass' else 1)*np.exp(-t*32)*grit
        save(f'step-{surface}-{variant}',body+crunch)

def effect(name,duration):
    t=np.arange(int(RATE*duration))/RATE
    env=np.sin(np.pi*t/duration)**1.5
    if name=='jump': return (.07*noise(len(t),12)+.13*np.sin(2*np.pi*(210*t+440*t*t)))*env
    if name=='fall': return (noise(len(t),10)*.22 + np.sin(2*np.pi*(150*t-70*t*t))*.08)*env
    if name=='land': return .27*np.sin(2*np.pi*72*t)*np.exp(-t*22)+noise(len(t),7)*.12*np.exp(-t*25)
    if name=='damage': return (.14*np.sin(2*np.pi*(310*t-270*t*t))+.05*noise(len(t),4))*env
    if name=='page': return noise(len(t),3)*.12*env
    if name=='chest': return noise(len(t),18)*.18*env+.08*np.sin(2*np.pi*(105*t+20*t*t))*env
    if name=='interact': return .11*np.sin(2*np.pi*523.25*t)*env*np.exp(-t*5)
    return sum(np.sin(2*np.pi*f*t)*np.exp(-t*5)*.12 for f in [523.25,659.25,783.99])*np.minimum(1,t/.01)
for name,duration in [('jump',.24),('fall',.65),('land',.2),('damage',.3),('page',.24),('chest',.65),('interact',.18),('discovery',.85)]: save(name,effect(name,duration))

# Circular colored noise is periodic; notes/chirps wrap into the next loop.
DURATION=48
N=RATE*DURATION
frequencies=np.fft.rfftfreq(N,1/RATE)
def breeze(cutoff,gain):
    white=rng.normal(0,1,N)
    colored=np.fft.irfft(np.fft.rfft(white)/(1+(frequencies/cutoff)**2),n=N)
    colored/=max(1e-9,np.std(colored))
    return colored*gain
for name in ['menu','forest','stream','bridge','clearing','mist','refuge','library']:
    track=np.zeros((N,2))
    for side in range(2):
        track[:,side]+=breeze(650 if name=='stream' else 70 if name=='library' else 160,.022 if name=='stream' else .003 if name=='library' else .008)
    tlong=np.arange(N)/RATE
    # Several non-aligned gusts and slow stereo movement replace a constant bed.
    for side in range(2):
        phase=side*.9
        movement=.65+.21*np.sin(2*np.pi*tlong/48+phase)+.13*np.sin(2*np.pi*tlong*3/48+1.7+phase)
        track[:,side]*=movement
    if name=='stream':
        for side in range(2):
            track[:,side]+=breeze(1500,.008)*(0.55+.45*np.sin(2*np.pi*tlong*5/48+side)**2)
    if name=='bridge':
        for at in [3.7,12.4,27.1,39.6]:
            creak=effect('chest',.65)*.15
            put(track,creak,at,float(rng.uniform(-.7,.7)))
        track[:,0]+=breeze(350,.01)*(1+np.sin(2*np.pi*tlong/48))
    if name in ['menu','clearing','refuge','library']:
        pitches={
            'menu':[130.8128,164.8138,195.9977,146.8324,174.6141,220],
            'clearing':[196,246.94,293.66,174.61,220,261.63],
            'refuge':[174.61,220,261.63,130.81,164.81,196],
            'library':[146.83,174.61,220,164.81,196,246.94],
        }[name]
        for beat in range(32):
            freq=pitches[(beat//4)%len(pitches)]*(2 if beat%2 else 1)
            put(track,note(freq,3,.075 if name=='menu' else .045),beat*1.5 + (.12 if beat%3==0 else 0),(-.35 if beat%2 else .35))
        melody={
            'menu':[523.25,659.25,587.33,783.99,659.25,523.25],
            'clearing':[783.99,659.25,880,783.99,587.33,659.25],
            'refuge':[523.25,698.46,659.25,587.33,523.25,349.23],
            'library':[440,523.25,659.25,587.33,523.25,440],
        }[name]
        for i,freq in enumerate(melody):
            put(track,note(freq,2.5,.045 if name=='menu' else .03),2+i*3.5,.2)
            if i%2==0: put(track,note(freq*.5,3,.025),29+i*2.6,-.35)
    if name in ['forest','stream','clearing','refuge']:
        for at in [2.1,8.7,15.3,26.6,35.1,43.8]:
            t=np.arange(int(RATE*.36))/RATE
            pitch=float(rng.uniform(1450,2050))
            chirp=np.sin(2*np.pi*(pitch*t+600*t*t+3*np.sin(t*28)))*np.sin(np.pi*t/.36)**3*.025
            put(track,chirp,at,float(rng.uniform(-.8,.8)))
    if name=='mist':
        for freq in [65+20/48,98,130+40/48]:
            t=np.arange(N)/RATE
            pad=.012*np.sin(2*np.pi*freq*t)*(0.5+.25*np.sin(2*np.pi*t/48)+.25*np.sin(2*np.pi*t*3/48+1.5))
            track+=pad[:,None]
    if name=='library':
        for at in [4.2,17.3,31.7,44.8]: put(track,effect('page',.24)*.22,at,-.5)
        for at in range(0,48,2): put(track,note(440,.08,.012),at,.6)
    save('ambience-'+name,track,True)
(OUT/'audio-manifest.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'assets':len(report),'bytes':sum(x['bytes'] for x in report)}))

# Keep interactive effects in the same reproducible asset pipeline.
import subprocess,sys
subprocess.run([sys.executable,str(Path(__file__).with_name("generate-interaction-audio.py"))],check=True)
