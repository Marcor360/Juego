"""Original synthesized prototype audio. No samples or external recordings."""
import math, wave, struct, pathlib
root=pathlib.Path(__file__).resolve().parents[1]/'assets/sounds'
root.mkdir(exist_ok=True)
rate=22050
for name,duration in [('ambient',12),('discovery',.7),('step',.09),('interact',.18)]:
    samples=[]
    for i in range(int(rate*duration)):
        t=i/rate
        if name=='ambient':
            envelope=min(1,t/.5,(duration-t)/.5)
            value=sum(math.sin(2*math.pi*f*t)*.035 for f in [130.8128,164.8138,195.9977,261.6256])*envelope
        elif name=='discovery':
            value=sum(math.sin(2*math.pi*f*t)*math.exp(-5*t)*.15 for f in [523.25,659.25,783.99])
        elif name=='step': value=math.sin(2*math.pi*(140-500*t)*t)*math.exp(-50*t)*.2
        else: value=math.sin(2*math.pi*440*t)*math.sin(math.pi*t/duration)*.12
        samples.append(struct.pack('<h',int(max(-1,min(1,value))*32767)))
    with wave.open(str(root/(name+'.wav')),'wb') as w:
        w.setnchannels(1);w.setsampwidth(2);w.setframerate(rate);w.writeframes(b''.join(samples))
