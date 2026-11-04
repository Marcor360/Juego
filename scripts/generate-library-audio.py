"""Original synthesized music and UI foley, no samples or third-party recordings."""
from pathlib import Path
import math,wave,struct,random
root=Path(__file__).resolve().parents[1]/'assets/chapter2/audio';root.mkdir(exist_ok=True)
rate=16000
for name,notes in {'courtyard':[60,64,67,71,69,67,64,62],'library':[57,60,64,67,65,64,62,60],'research':[62,65,69,72,69,67,65,64],'quiet':[53,57,60,65,64,60,57,55],'great':[60,64,67,72,71,69,67,64]}.items():
 duration=24;out=[]
 for i in range(rate*duration):
  t=i/rate;beat=int(t/1.5);phase=t%1.5;f=440*2**((notes[beat%8]-69)/12)
  bell=(math.sin(2*math.pi*f*t)+.25*math.sin(2*math.pi*f*2*t))*math.exp(-phase*3)*.11
  chord=sum(math.sin(2*math.pi*440*2**((n-12-69)/12)*t)*.016 for n in notes[:3]);env=min(1,t/1.2,(duration-t)/1.2)
  out.append(struct.pack('<h',int((bell+chord)*env*32767)))
 with wave.open(str(root/(name+'.wav')),'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(rate);w.writeframes(b''.join(out))
for name,f,duration in [('page',330,.18),('mechanism',155,.3),('success',660,.8),('card',440,.12),('step',125,.08)]:
 out=[]
 for i in range(int(rate*duration)):
  t=i/rate;v=sum(math.sin(2*math.pi*f*m*t)*math.exp(-t*8)*.07 for m in ([1,1.25,1.5] if name=='success' else [1,2]))*min(1,t*100)
  out.append(struct.pack('<h',int(v*32767)))
 with wave.open(str(root/(name+'.wav')),'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(rate);w.writeframes(b''.join(out))
