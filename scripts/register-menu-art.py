"""Record real alpha bounds and stable foot anchors without changing the generated PNG."""
from pathlib import Path
from statistics import median
import json
import sys
from PIL import Image
root=Path(__file__).resolve().parents[1]
source=sys.argv[1] if len(sys.argv)>1 else 'assets/menu/hero.png'
destination=sys.argv[2] if len(sys.argv)>2 else 'game/rendering/menu-art.json'
im=Image.open(root/source).convert('RGBA')
frames=[]
for i in range(6):
    x0=round((i%3)*im.width/3);x1=round((i%3+1)*im.width/3)
    y0=round((i//3)*im.height/2);y1=round((i//3+1)*im.height/2)
    alpha=im.getchannel('A').crop((x0,y0,x1,y1)).point(lambda a:255 if a>=120 else 0)
    box=alpha.getbbox()
    if not box:raise ValueError(f'Empty frame {i}')
    l,t,r,b=box
    frames.append({'x':x0+l,'y':y0+t,'width':r-l,'height':b-t,'anchorX':(x0+l+x0+r)/2,'anchorY':y0+b,'cell':{'x':x0,'y':y0,'width':x1-x0,'height':y1-y0}})
# Per-frame feet registration avoids a visible bounce when the row switches to a blink.
data={'width':im.width,'height':im.height,'columns':3,'rows':2,'referenceHeight':median(f['height'] for f in frames[:3]),'frames':frames,'variants':{'beginning':[0,3],'middle':[1,4],'ending':[2,5]}}
(root/destination).write_text(json.dumps(data,indent=2)+'\n')
print({'dimensions':im.size,'frames':len(frames),'height':data['referenceHeight']})
