import { currentScene, hasMission, type Progress } from "../missions/progress.ts";
import { objects } from "../levels/forest.ts";
/** One actionable destination at a time, including prerequisites hidden in the old objective. */
export function chapterGuidance(p:Progress) {
  const scene=currentScene(p);
  let id=objects.find(o=>o.scene===scene)!.id;
  let text="",detail="";
  if(scene===1){text="Prepara tu cuaderno junto al inicio.";detail="Practica caminar y saltar, abre el cuaderno y usa Interactuar junto al libro. Las cuatro marcas deben quedar en ✓.";}
  if(scene===3){id=["rock_mark","storm_notice","sign_fragment"].find(key=>!p.evidence.includes(key))??"sign1";text=id==="sign1"?"Vuelve al letrero para reparar la señal.":`Recoge: ${objects.find(o=>o.id===id)!.label}.`;detail="Las pistas se guardan al pasar cerca. Usa las plataformas para alcanzar las elevadas; después regresa al letrero.";}
  if(scene===5&&!p.items.includes("lever")&&!p.evidence.includes("helper_offer")){id="helper";text="Pide ayuda al guardabosques junto a la rama.";detail="Puedes hablar con el guardabosques que está junto a la rama. También sirve recoger la palanca elevada; basta una de las dos opciones.";}
  if(scene===6){id=["bridge_damage","missing_boards","safe_detour"].find(key=>!p.evidence.includes(key))??"bridge";text=id==="bridge"?"Habla junto al final del desvío.":`Investiga: ${objects.find(o=>o.id===id)!.label}.`;detail="El puente roto no se cruza por abajo. Sube a las piedras del desvío, recoge sus marcas y llega al otro lado.";}
  if(scene===9){id=["cover","wick"].find(key=>!p.items.includes(key))??"lamp1";text=id==="lamp1"?"Reúnete con el viajero en el primer farol.":`Recoge: ${objects.find(o=>o.id===id)!.label}.`;detail="El viajero sostiene la cuerda. Salta desde su apoyo hasta la cubierta y después busca la mecha en la cornisa siguiente. Con ambas piezas, vuelve al farol.";}
  if(scene===12&&!p.worldFlags.noReturn){id="no_return";detail="Antes del tramo móvil, confirma la entrada en el paso de niebla. Se guardará un checkpoint y podrás reintentar sin perder las escenas.";}
  if(scene===12&&p.worldFlags.noReturn){id="mist_beacon";text="Cruza las piedras hasta el farol de la niebla.";detail="El tramo de niebla va del claro al refugio. Espera a que se acerquen los apoyos móviles, mantén el salto para alcanzar más altura y llega al farol. Si caes, vuelves al último apoyo seguro; tus escenas no se pierden.";}
  if(scene===13){text="Busca la inscripción entre la niebla.";detail="La niebla sigue presente. El farol que acabas de registrar sirve de orientación; sigue las plataformas hasta la inscripción y resuelve la reflexión para abrir el paso al refugio.";}
  const target=objects.find(o=>o.id===id)??objects.find(o=>o.scene===scene)!;
  if(!text)text=target.label+".";
  if(!detail)detail=scene===16?"El cofre ya terminó su parte. Sigue a la derecha hasta el libro de la salida del refugio. Allí se cierra el capítulo y se abre la biblioteca.":"Sigue el marcador dorado. Acércate al personaje u objeto y usa Interactuar. Si te falta una pista, el cuaderno te dice cuál.";
  if(hasMission(p,16))return {target:objects.find(o=>o.id==="library")!,text:"Entra en la biblioteca del aprendizaje.",detail:"Interactúa con el libro de la salida o abre el capítulo II desde el diario de capítulos."};
  return {target,text,detail};
}
