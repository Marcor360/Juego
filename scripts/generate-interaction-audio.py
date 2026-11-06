"""Original, deterministic short interaction sounds; leaves existing ambience intact."""
from pathlib import Path
import json,wave
import numpy as np
root=Path(__file__).resolve().parents[1];out=root/'assets/sounds';rate=32000
rng=np.random.default_rng(7719)
manifest=json.loads((out/'audio-manifest.json').read_text())
def write(name,duration,kind):
 t=np.arange(int(duration*rate))/rate
 noise=rng.normal(0,1,len(t));rough=np.convolve(noise,np.ones(11)/11,mode='same')
 if kind=='shift':
  y=(.18*rough+.07*np.sin(2*np.pi*(115*t-28*t*t)))*np.sin(np.pi*t/duration)**2*(.7+.3*np.sin(t*24)**2)
 elif kind=='land':y=.34*np.sin(2*np.pi*68*t)*np.exp(-t*16)+.19*rough*np.exp(-t*24)
 elif kind=='ignite':y=.12*noise*np.exp(-((t-.12)/.12)**2)+(.05*np.sin(2*np.pi*740*t)+.04*np.sin(2*np.pi*1110*t))*np.exp(-t*8)
 else:y=(.055*np.sin(2*np.pi*330*t)+.03*np.sin(2*np.pi*495*t)+.025*rough)*np.sin(np.pi*t/duration)**2
 fade=min(200,len(y)//8);y[:fade]*=np.linspace(0,1,fade);y[-fade:]*=np.linspace(1,0,fade)
 y=np.clip(y,-.78,.78)
 file=out/(name+'.wav')
 with wave.open(str(file),'wb') as f:f.setnchannels(1);f.setsampwidth(2);f.setframerate(rate);f.writeframes((y*32767).astype('<i2').tobytes())
 entry={'name':name,'file':file.name,'seconds':duration,'bytes':file.stat().st_size,'peak':float(np.max(np.abs(y))),'rms':float(np.sqrt(np.mean(y*y)))}
 manifest[:]=[m for m in manifest if m['name']!=name];manifest.append(entry)
for args in [('wood-shift',1.2,'shift'),('wood-land',.5,'land'),('ignite',.65,'ignite'),('talk-soft',.1,'talk')]:write(*args)
(out/'audio-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Generated wood-shift, wood-land, ignite and talk-soft.')
