"""Register source rectangles only; never resample or modify generated artwork."""
from PIL import Image
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1]
spec={'hero':('characters/hero.png',6,4),'actions':('characters/actions.png',3,3),'npcs':('characters/npcs.png',6,4),'citizens':('characters/citizens.png',4,4),'portraits':('portraits/portraits.png',3,3),'furniture':('props/furniture.png',4,2),'objects':('props/objects.png',4,2),'tiles':('tilesets/library.png',4,2),'facade':('props/facade.png',1,1)}
result={}
for key,(file,cols,rows) in spec.items():
 im=Image.open(ROOT/'assets/chapter2'/file).convert('RGBA'); w,h=im.size; frames=[]
 for row in range(rows):
  for col in range(cols):
   x0,y0,x1,y1=round(col*w/cols),round(row*h/rows),round((col+1)*w/cols),round((row+1)*h/rows)
   # Ignore almost transparent generation halos when registering the art bounds.
   bounds=im.getchannel('A').crop((x0,y0,x1,y1)).point(lambda a:255 if a>180 else 0).getbbox() if key!='tiles' else (2,2,x1-x0-2,y1-y0-2)
   if not bounds: raise RuntimeError(f'Empty frame: {key}:{row}:{col}')
   a,b,c,d=bounds;frames.append({'x':x0+a,'y':y0+b,'width':c-a,'height':d-b})
 result[key]={'file':file,'width':w,'height':h,'columns':cols,'rows':rows,'frames':frames}
(ROOT/'game/chapter2/art/manifest.json').write_text(json.dumps(result,indent=2)+'\n')
