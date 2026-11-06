"""Inspect alpha bounds and record source rectangles; never changes image pixels.
Developer helper only: Python + Pillow. Runtime consumes committed metadata.
"""
from pathlib import Path
import json
from statistics import median
from PIL import Image
root=Path(__file__).resolve().parents[1]
def register(path,columns,rows):
    image=Image.open(root/path).convert('RGBA')
    result={'width':image.width,'height':image.height,'columns':columns,'rows':rows,'frames':[]}
    for i in range(columns*rows):
        x0=round((i%columns)*image.width/columns);x1=round((i%columns+1)*image.width/columns)
        if path.endswith("v3/terrain.png"):
            edges=[0,640,1270,1620,image.width];x0,x1=edges[i],edges[i+1]
        y0=round((i//columns)*image.height/rows);y1=round((i//columns+1)*image.height/rows)
        alpha=image.getchannel('A').crop((x0,y0,x1,y1)).point(lambda p:255 if p>=120 else 0)
        box=alpha.getbbox()
        if not box: raise ValueError(f'Empty frame {i}: {path}')
        l,t,r,b=box
        result['frames'].append({'x':x0+l,'y':y0+t,'width':r-l,'height':b-t,'anchorX':(x0+x1)/2,'anchorY':y0+(y1-y0)*.94,'cell':{'x':x0,'y':y0,'width':x1-x0,'height':y1-y0}})
    # Registration follows the observed feet rather than assuming a generated baseline.
    for row in range(rows):
        frames=result['frames'][row*columns:(row+1)*columns]
        baseline=median(f['y']+f['height'] for f in frames)
        for frame in frames: frame['anchorY']=baseline
    result['referenceHeight']=result['frames'][0]['height']
    return result
packs={'locals':('assets/characters/v3/locals.png',6,2),'localsPortraits':('assets/characters/v3/locals-portraits.png',2,2),'heroTalk':('assets/characters/v3/hero-talk.png',6,1),'travelerTalk':('assets/characters/v3/traveler-talk.png',6,1),'branch':('assets/props/v3/branch-clear.png',4,2),'flame':('assets/effects/flame.png',6,1),'waterfall':('assets/effects/waterfall.png',4,2),'decor':('assets/props/v3/decor.png',4,2),'castPortraits':('assets/characters/v3/cast-portraits.png',2,4),'cast':('assets/characters/v3/cast.png',6,4),'water':('assets/effects/water.png',4,2),'pickups':('assets/props/v3/pickups.png',4,3),'menuEmblems':('assets/menu/emblems.png',3,1),'library':('assets/props/v3/library.png',4,1),'traveler':('assets/characters/v3/traveler.png',4,3),'hero':('assets/characters/v2/hero.png',4,3),'npcs':('assets/characters/v2/npcs.png',4,2),'props':('assets/props/v2/forest-props.png',4,1),'portraits':('assets/characters/v2/portraits.png',3,2),'treasures':('assets/props/v2/treasures.png',4,1),'others':('assets/characters/v3/others.png',3,2),'chest':('assets/props/v3/chest.png',4,1),'terrain':('assets/props/v3/terrain.png',4,1)}
metadata={k:register(*v) for k,v in packs.items()}
# Each traveler pose places its own soles at the actor's physical foot.
for frame in metadata['traveler']['frames']:
    frame['anchorY']=frame['y']+frame['height']
for frame in metadata['library']['frames']:
    frame['anchorY']=frame['y']+frame['height']
for name in ['cast','locals','heroTalk','travelerTalk','branch','flame','pickups','menuEmblems','decor']:
    for frame in metadata[name]['frames']:
        frame['anchorY']=frame['y']+frame['height']
for name in ['branch','flame']:
    metadata[name]['referenceHeight']=max(f['height'] for f in metadata[name]['frames'])
# Walkable surfaces exclude the moss, bridge posts and rope above the deck.
metadata['terrain']['frames'][0]['surfaceY']=355
metadata['terrain']['frames'][1]['surfaceY']=409
# Unlike character poses, unrelated ground props do not share a baseline.
for frame in metadata['terrain']['frames'][2:]:
    frame['anchorY']=frame['y']+frame['height']
(root/'game/rendering/art.json').write_text(json.dumps(metadata,indent=2)+'\n')
print({k:{'size':(v['width'],v['height']),'frames':len(v['frames'])} for k,v in metadata.items()})
