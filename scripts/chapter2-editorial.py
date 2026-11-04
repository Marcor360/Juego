"""Build a review table from actual shipping questions; never marks unverified sources as verified."""
import json,re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
story=json.loads((root/'game/chapter2/content/story.json').read_text())
slugs={'Proverbios':'proverbios','Hechos':'hechos','2 Timoteo':'2-timoteo','Hebreos':'hebreos','Colosenses':'colosenses','Lucas':'lucas','Salmo':'salmos','Santiago':'santiago','1 Pedro':'1-pedro','1 Tesalonicenses':'1-tesalonicenses'}
def source(reference):
 for name,slug in slugs.items():
  if reference.startswith(name):
   match=re.search(r'(\d+):',reference[len(name):]);return 'https://www.jw.org/es/biblioteca/biblia/biblia-estudio/libros/'+slug+'/'+(match.group(1) if match else '')+'/'
 return 'https://www.jw.org/es/biblioteca/biblia/'
rows=['# Control editorial — capítulo 2','','Las explicaciones son contenido original adaptado, no citas textuales. La red del entorno respondió `403 Forbidden` al consultar JW.ORG. Ninguna referencia se marca como verificada. Los enlaces son destinos propuestos y necesitan comprobación editorial antes de publicar.','','| Escena | Referencia | Pregunta | Respuesta aceptada | Explicación | Fuente propuesta | Estado |','|---|---|---|---|---|---|---|']
for s in story['scenes']:
 for q in s['questions']:
  opts={o['id']:o['text'] for o in q['options']};groups={o['id']:o['text'] for o in q.get('groups',[])}
  accepted='Cualquier reflexión personal' if q['kind']=='reflect' else '; '.join(opts.get(a,a) if '=>' not in a else opts[a.split('=>')[0]]+' → '+groups[a.split('=>')[1]] for a in q['answer'])
  ref=q.get('reference') or s['reference'] or 'Mecánica / reflexión original'
  values=[str(s['number'])+' · '+s['title'],ref,q['prompt'],accepted,q['explanation'],source(ref),'Pendiente de verificación externa' if ':' in ref else 'Contenido original: revisión pendiente']
  rows.append('| '+' | '.join(v.replace('|','/').replace('\n',' ') for v in values)+' |')
(root/'docs/CHAPTER_2_EDITORIAL.md').write_text('\n'.join(rows)+'\n')
