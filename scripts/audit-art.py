"""Inventory every image and build a visual review sheet without changing originals."""
from pathlib import Path
from PIL import Image, ImageDraw
import json
root=Path(__file__).resolve().parents[1]
report=json.loads((root/'game/rendering/asset-report.json').read_text())
sources={entry['source'] for entry in report}
entries=[]
for path in sorted((root/'assets').rglob('*')):
    if path.suffix.lower() not in ['.png','.webp']: continue
    relative=str(path.relative_to(root))
    image=Image.open(path)
    entries.append({'path':relative,'dimensions':list(image.size),'bytes':path.stat().st_size,'alpha':image.mode=='RGBA','role':'runtime' if relative.startswith('assets/runtime/') else 'master' if relative in sources else 'legacy-unused'})
(root/'docs/ART_INVENTORY.json').write_text(json.dumps(entries,indent=2)+'\n')
paths=[root/entry['source'] for entry in report]

width=1000;cellw=250;cellh=170
sheet=Image.new('RGB',(width,((len(paths)+3)//4)*cellh),'#d9d1bd')
draw=ImageDraw.Draw(sheet)
for i,path in enumerate(paths):
    image=Image.open(path).convert('RGBA'); image.thumbnail((238,140))
    x=(i%4)*cellw+(cellw-image.width)//2;y=(i//4)*cellh
    sheet.paste(image,(x,y),image)
    draw.text(((i%4)*cellw+5,y+143),str(path.relative_to(root/'assets')),fill='#253b3a')
sheet.save('/tmp/art-review.jpg',quality=90)
print({'images':len(entries),'runtime':sum(x['role']=='runtime' for x in entries),'masters':sum(x['role']=='master' for x in entries),'legacy':sum(x['role']=='legacy-unused' for x in entries)})
