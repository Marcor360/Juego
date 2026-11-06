"""Subset runtime fonts for Spanish/Latin UI while retaining the licensed masters."""
from pathlib import Path
from fontTools import subset
import json
root=Path(__file__).resolve().parents[1]
report=[]
for source,target in [('CormorantGaramond.ttf','Cormorant.ttf'),('PixelifySans.ttf','Pixelify.ttf')]:
    options=subset.Options()
    options.name_IDs=['*']; options.name_languages=['*']; options.name_legacy=True
    font=subset.load_font(str(root/'assets/fonts'/source),options)
    keep=set(range(0x20,0x250))|set(range(0x2000,0x2070))|set(range(0x2190,0x2200))|set(range(0x25a0,0x2700))
    subsetter=subset.Subsetter(options=options);subsetter.populate(unicodes=keep);subsetter.subset(font)
    assert set(map(ord,"áéíóúüñÁÉÍÓÚÜÑ¿¡")).issubset(font.getBestCmap()), "Missing Spanish glyphs"
    output=root/'assets/runtime'/target
    subset.save_font(font,str(output),options)
    report.append({'source':'assets/fonts/'+source,'runtime':'assets/runtime/'+target,'originalBytes':(root/'assets/fonts'/source).stat().st_size,'runtimeBytes':output.stat().st_size})
(root/'game/rendering/font-report.json').write_text(json.dumps(report,indent=2)+'\n')
print(report)
