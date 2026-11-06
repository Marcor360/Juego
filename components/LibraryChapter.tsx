import { conversationPose, idlePose } from "../game/rendering/conversation";
import { SpeechMarker } from "./InteractionEffects";
import Portrait from "./Portrait";
import RegisteredSprite from "./RegisteredSprite";
import { Asset } from "expo-asset";
import art from "../game/rendering/art-runtime.json";
import React, { useEffect, useRef, useState } from "react";
import { AppState, Image as NativeImage, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Canvas, Circle, Group, Rect, Image, useImage } from "@shopify/react-native-skia";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";
import { AnimatedCharacter } from "./AnimatedCharacter";
import { FixedStepClock } from "../game/engine/ticker";
import { LIBRARY_WIDTH, completeLibraryTask, libraryComplete, libraryTasks, type LibraryProgress } from "../game/chapter2/library";
import { useModalFocus } from "../game/input/useModalFocus";
import type { SoundKind } from "../game/audio/context";
export type LibraryProps = { width:number; height:number; initial:LibraryProgress; touch:boolean; reduced:boolean; onChange:(progress:LibraryProgress)=>void; onExit:()=>void; onSound:(sound:SoundKind)=>void };
function Action({label,onPress,selected=false,text}:{label:string;onPress:()=>void;selected?:boolean;text?:string}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{selected}} onPress={onPress} style={[s.button,selected&&{backgroundColor:"#efd297"}]}><Text style={s.ink}>{text ?? label}</Text></Pressable>;
}
function ReadingDesk({image,index}:{image:ReturnType<typeof useImage>;index:number}) {
  const frame=art.library.frames[index],scale=32/art.library.referenceHeight;
  return image?<Group transform={[{scale}]} clip={{x:frame.x-frame.anchorX,y:frame.y-frame.anchorY,width:frame.width,height:frame.height}}>
    <Image image={image} x={-frame.anchorX} y={-frame.anchorY} width={art.library.width} height={art.library.height} fit="fill" sampling={{filter:0,mipmap:0}} />
  </Group>:null;
}
export default function LibraryChapter(props:LibraryProps) {
  const decor=useImage(Asset.fromModule(require("../assets/runtime/decor.png")).uri);
  const desks=useImage(Asset.fromModule(require("../assets/runtime/library.png")).uri);
  const [progress,setProgress]=useState(props.initial), [reading,setReading]=useState(false), [paused,setPaused]=useState(false), [help,setHelp]=useState(false), [feedback,setFeedback]=useState(""), [position,setPosition]=useState(props.initial.position);
  const state=useRef({progress,reading,paused,help}); state.current={progress,reading,paused,help};
  const callbacks=useRef(props);callbacks.current=props;
  const input=useRef({left:false,right:false,jump:false,held:false});
  const actor=useRef({x:props.initial.position,y:226,vy:0,grounded:true});
  const stage=useRef<View>(null),modal=useRef<View>(null);
  const x=useSharedValue(props.initial.position),y=useSharedValue(226),camera=useSharedValue(Math.max(0,Math.min(LIBRARY_WIDTH-480,props.initial.position-195))),time=useSharedValue(0),motion=useSharedValue(0),facing=useSharedValue(1);
  const readerSpeechAt=useSharedValue(-100);
  const task=libraryTasks[progress.answers.length],done=libraryComplete(progress);
  const release=()=>{input.current={left:false,right:false,jump:false,held:false};};
  const publish=(next:LibraryProgress)=>{state.current.progress=next;setProgress(next);callbacks.current.onChange(next);};
  const savePosition=()=>publish({...state.current.progress,position:Math.round(actor.current.x)});
  const open=()=>{release();if(libraryComplete(state.current.progress)){setHelp(true);return;} const next=libraryTasks[state.current.progress.answers.length];if(Math.abs(actor.current.x-next.x)>48){if(Math.abs(actor.current.x-1050)<=38){readerSpeechAt.value=time.value;setFeedback("Aprendiz: Si algo no se entiende, podemos preguntar y revisar la leyenda juntos. Busca la mesa iluminada para continuar.");callbacks.current.onSound("talk-soft");return;}setFeedback("Sigue la indicación de la siguiente mesa. Puedes caminar a ambos lados de la sala.");return;}setFeedback("");savePosition();setReading(true);callbacks.current.onSound("page");};
  const liveOpen=useRef(open);liveOpen.current=open;
  useEffect(()=>{release();},[props.touch]);
  useModalFocus(modal,reading?"reading":paused?"pause":help?"help":null,stage);
  useEffect(()=>{
    let id:number,last=0,lastHud=0,lastSave=0,lastStep=0;
    const clock=new FixedStepClock();
    const loop=(now:number)=>{
      if(now<last)lastHud=lastSave=lastStep=now;
      const elapsed=last?Math.max(0,Math.min(.2,(now-last)/1000)):0;last=now;
      const blocked=state.current.reading||state.current.paused||state.current.help;
      if(!blocked){
        clock.advance(elapsed,dt=>{
          const a=actor.current,controls=input.current,dir=Number(controls.right)-Number(controls.left);
          if(controls.jump&&a.grounded){a.vy=-300;a.grounded=false;callbacks.current.onSound("jump");}
          controls.jump=false;
          if(!controls.held&&a.vy < -220)a.vy=-220;
          a.x=Math.max(24,Math.min(LIBRARY_WIDTH-24,a.x+dir*115*dt));
          a.vy+=900*dt;a.y+=a.vy*dt;
          if(a.y>=226){if(!a.grounded&&a.vy>80)callbacks.current.onSound("land");a.y=226;a.vy=0;a.grounded=true;}
          if(dir)facing.value=dir;
          motion.value=a.grounded?dir?1:0:a.vy<0?2:3;
          time.value+=dt;
        });
        if(motion.value===1&&now-lastStep>340){lastStep=now;callbacks.current.onSound("step-wood");}
        if(now-lastSave>600&&Math.round(actor.current.x)!==state.current.progress.position){lastSave=now;savePosition();}
      }else{clock.reset();motion.value=0;}
      x.value=actor.current.x;y.value=actor.current.y;
      camera.value=Math.max(0,Math.min(LIBRARY_WIDTH-480,actor.current.x-195));
      if(now-lastHud>100){lastHud=now;setPosition(Math.round(actor.current.x));}
      id=requestAnimationFrame(loop);
    };
    id=requestAnimationFrame(loop);
    const suspend=()=>{release();savePosition();setPaused(true);};
    const subscription=AppState.addEventListener("change",status=>{if(status!=="active")suspend();});
    if(Platform.OS==="web")window.addEventListener("blur",suspend);
    return()=>{cancelAnimationFrame(id);subscription.remove();if(Platform.OS==="web")window.removeEventListener("blur",suspend);};
  },[]);
  useEffect(()=>{
    if(Platform.OS!=="web")return;
    const down=(event:KeyboardEvent)=>{
      const key=event.key.toLowerCase();
      if(key==="escape"){event.preventDefault();release();if(state.current.reading)setReading(false);else if(state.current.help)setHelp(false);else setPaused(value=>!value);return;}
      if(state.current.reading||state.current.paused||state.current.help)return;
      if((event.target as Element)?.closest?.('button,[role="button"],input,textarea'))return;
      if(["arrowleft","arrowright","arrowup"," "].includes(key))event.preventDefault();
      if(["a","arrowleft"].includes(key))input.current.left=true;
      if(["d","arrowright"].includes(key))input.current.right=true;
      if([" ","arrowup"].includes(key)&&!event.repeat){input.current.jump=true;input.current.held=true;}
      if(key==="e"&&!event.repeat)liveOpen.current();
    };
    const up=(event:KeyboardEvent)=>{const key=event.key.toLowerCase();if(["a","arrowleft"].includes(key))input.current.left=false;if(["d","arrowright"].includes(key))input.current.right=false;if([" ","arrowup"].includes(key))input.current.held=false;};
    window.addEventListener("keydown",down);window.addEventListener("keyup",up);
    return()=>{window.removeEventListener("keydown",down);window.removeEventListener("keyup",up);};
  },[]);
  const world=useDerivedValue(()=>[{translateX:-camera.value}]);
  const hero=useDerivedValue(()=>[{translateX:x.value},{translateY:y.value}]);
  const frame=useDerivedValue(()=>motion.value===2?6:motion.value===3?7:motion.value===1?2+Math.floor(time.value*8)%4:!props.reduced&&time.value%4.8>4.5?1:0);
  const npcFrame=useDerivedValue(()=>props.reduced?0:Math.floor(time.value*2)%4);
  const librarianFrame=useDerivedValue(()=>18+(reading?2:idlePose(time.value,props.reduced)));
  const visitorFrame=useDerivedValue(()=>6+(time.value-readerSpeechAt.value<2.4?conversationPose(time.value-readerSpeechAt.value,props.reduced):idlePose(time.value,props.reduced)));
  const readerSpeaking=useDerivedValue(()=>time.value-readerSpeechAt.value<2.4?1:0);
  const librarianDirection=useDerivedValue<number>(()=>x.value<130?-1:1);
  const visitorDirection=useDerivedValue<number>(()=>x.value<1080?-1:1);
  const travelerDirection=useDerivedValue<number>(()=>x.value<1360?-1:1);
  const near=task&&Math.abs(position-task.x)<=48;
  const nearReader=!near&&Math.abs(position-1050)<=38;
  const hint=task?`${task.x>=position?"→":"←"} Mesa ${progress.answers.length+1}: ${task.title} · ${Math.max(0,Math.round(Math.abs(task.x-position)))} pasos`:"Biblioteca completada · Aprendizaje obtenido";
  const closeReading=()=>{setReading(false);setFeedback("");};
  const select=(id:string)=>{if(!task)return;const selected=task.kind==="order"?progress.selected.includes(id)?progress.selected.filter(v=>v!==id):[...progress.selected,id]:[id];publish({...progress,position:Math.round(actor.current.x),selected});setFeedback("");};
  const submit=()=>{try{const next=completeLibraryTask({...progress,position:Math.round(actor.current.x)});publish(next);setReading(false);callbacks.current.onSound("discovery");setFeedback(libraryComplete(next)?"Has obtenido el Aprendizaje. Puedes volver a leer tus notas o guardar y salir.":"Lectura anotada. Camina hasta la siguiente mesa indicada arriba.");if(libraryComplete(next))setHelp(true);}catch(error){setFeedback((error as Error).message);}};
  return <View ref={stage} tabIndex={0} accessibilityLabel="Zona de juego de la biblioteca" style={{width:props.width,height:props.height,backgroundColor:"#493b30"}}>
    <NativeImage source={require("../assets/runtime/library.webp")} resizeMode="cover" style={[StyleSheet.absoluteFill,{width:props.width,height:props.height}]} />
    <Canvas style={StyleSheet.absoluteFill}>
      <Group transform={[{scale:props.width/480}]}><Group transform={world}>
        <Rect x={0} y={226} width={LIBRARY_WIDTH} height={44} color="#795234" />
        <Rect x={0} y={226} width={LIBRARY_WIDTH} height={2} color="#e3c18b" />
        <Rect x={0} y={240} width={LIBRARY_WIDTH} height={1} color="#62442d" /><Rect x={0} y={254} width={LIBRARY_WIDTH} height={1} color="#62442d" />
        {Array.from({length:30},(_,i)=><Rect key={i} x={i*48} y={228} width={1} height={42} color="#4d382b" />)}
        {libraryTasks.map((station,i)=><Group key={station.id} transform={[{translateX:station.x}]}>
          <Group transform={[{translateY:226}]}><ReadingDesk image={desks} index={i===7?3:i%3} /></Group>
          {i===progress.answers.length&&<Circle cx={0} cy={184} r={4} color="#ffe2a0" />}
        </Group>)}
        {[{x:70,frame:3,height:13},{x:580,frame:4,height:24},{x:1020,frame:5,height:13},{x:1410,frame:7,height:20}].map(d=><Group key={d.x} transform={[{translateX:d.x},{translateY:226}]}><RegisteredSprite image={decor} data={art.decor} frame={d.frame} height={d.height} /></Group>)}
        <Group transform={[{translateX:130},{translateY:226}]}><AnimatedCharacter kind="cast" frame={librarianFrame} direction={librarianDirection} height={44} /></Group>
        <Group transform={[{translateX:1080},{translateY:226}]}><AnimatedCharacter kind="locals" frame={visitorFrame} direction={visitorDirection} height={44} /><Group opacity={readerSpeaking}><SpeechMarker time={time} reduced={props.reduced} /></Group></Group>
        <Group transform={[{translateX:1360},{translateY:226}]}><AnimatedCharacter kind="traveler" frame={npcFrame} direction={travelerDirection} height={44} /></Group>
        <Group transform={hero}><AnimatedCharacter kind="hero" frame={frame} direction={facing} height={44} /></Group>
      </Group></Group>
    </Canvas>
    <View style={s.hud}><View style={{flex:1}}><Text style={s.light}>CAPÍTULO II · {progress.answers.length}/8</Text><Text style={s.light}>{hint}</Text></View><Action text="Ayuda" label="Ayuda de la biblioteca" onPress={()=>{release();setHelp(true);}} /><Action text="Pausa" label="Pausa biblioteca" onPress={()=>{release();savePosition();setPaused(true);}} /></View>
    {!reading&&!paused&&!help&&<>
      {(near||nearReader)&&<View style={{position:"absolute",bottom:Math.max(64,props.height-174*props.width/480),alignSelf:"center"}}><Action label={nearReader?(props.touch?"Hablar con el aprendiz":"E · Hablar con el aprendiz"):props.touch?"Leer mesa":"E · Leer mesa"} onPress={open} /></View>}
      {!!feedback&&<View pointerEvents="none" style={{position:"absolute",top:94,left:12,right:12,backgroundColor:"#243e3cdd",padding:8,flexDirection:"row",gap:10,alignItems:"center"}}>{feedback.startsWith("Aprendiz:")&&<Portrait speaker="reader" size={42} />}<Text accessibilityLiveRegion="polite" style={[s.light,{flex:1}]}>{feedback}</Text></View>}
      {props.touch&&<View style={s.controls}>
        <View style={s.row}>{(["left","right"] as const).map((key,i)=><Pressable key={key} accessibilityRole="button" accessibilityLabel={i?"Biblioteca caminar derecha":"Biblioteca caminar izquierda"} onTouchStart={()=>input.current[key]=true} onTouchEnd={()=>input.current[key]=false} onTouchCancel={()=>input.current[key]=false} style={s.touch}><Text style={s.light}>{i?"▶":"◀"}</Text></Pressable>)}</View>
        <View style={s.row}><Pressable accessibilityRole="button" accessibilityLabel="Biblioteca saltar" onTouchStart={()=>{input.current.jump=true;input.current.held=true;}} onTouchEnd={()=>input.current.held=false} onTouchCancel={()=>input.current.held=false} style={s.touch}><Text style={s.light}>↑</Text></Pressable><Action label="Biblioteca interactuar" onPress={open} /></View>
      </View>}
    </>}
    {(reading||paused||help)&&<View ref={modal} role="dialog" aria-modal accessibilityViewIsModal accessibilityLabel={reading?"Lectura de la biblioteca":paused?"Pausa de la biblioteca":"Cuaderno de aprendizaje"} style={s.shade}>
      <View style={[s.paper,{maxHeight:"92%",width:props.width<650?"94%":"76%"}]}><ScrollView key={reading?task?.id:paused?"paused":"help"} contentContainerStyle={{gap:12}}>
        {reading&&task?<>
          <View style={{flexDirection:"row",gap:12,alignItems:"center"}}><Portrait speaker="librarian" size={60} /><Text style={[s.title,{flex:1}]}>{progress.answers.length+1}/8 · {task.title}</Text></View><Text style={s.ink}>{task.reading}</Text><Text accessibilityRole="header" style={[s.ink,{fontWeight:"700"}]}>{task.prompt}</Text>
          {task.options.map(option=><Action key={option.id} selected={progress.selected.includes(option.id)} label={`${task.kind==="order"&&progress.selected.includes(option.id)?`${progress.selected.indexOf(option.id)+1}. `:""}${option.text}`} onPress={()=>select(option.id)} />)}
          {task.kind==="order"&&<Action label="Borrar orden" onPress={()=>publish({...progress,selected:[]})} />}
          {!!feedback&&<Text accessibilityLiveRegion="polite" style={s.ink}>{feedback}</Text>}<Action label="Comprobar lectura" onPress={submit} /><Action label="Cerrar lectura" onPress={closeReading} />
        </>:paused?<><Text style={s.title}>Un descanso entre libros</Text><Text style={s.ink}>Tu posición y tus respuestas se conservan. Puedes seguir explorando o salir al menú.</Text><Action label="Continuar biblioteca" onPress={()=>setPaused(false)} /><Action label="Guardar biblioteca y salir" onPress={()=>{savePosition();props.onExit();}} /></>:<>
          <Text style={s.title}>{done?"Aprendizaje obtenido":"La biblioteca del aprendizaje"}</Text>
          <Text style={s.ink}>{done?"Completaste las ocho lecturas. La herramienta del Aprendizaje queda en tu inventario y el capítulo III se desbloquea para una próxima aventura.":"Recorre la sala de izquierda a derecha. La indicación superior te dice cuál es tu siguiente mesa. Acércate al libro iluminado y ábrelo para leer, elegir y comprobar una respuesta. Equivocarte no quita corazones ni borra lo aprendido."}</Text>
          <Text style={s.ink}>{props.touch?"Usa las flechas táctiles para caminar, ↑ para saltar y Leer mesa para abrir un libro.":"A/D o ←/→: caminar · Espacio/↑: saltar · E: leer la mesa cercana · Esc: pausa."}</Text>
          {progress.answers.map((_,i)=><Text key={i} style={s.ink}>✓ {libraryTasks[i].title} · {libraryTasks[i].options.filter(o=>libraryTasks[i].answer.includes(o.id)).map(o=>o.text).join(" ")}</Text>)}
          <Action label={done?"Volver a la sala":"Entendido · explorar biblioteca"} onPress={()=>setHelp(false)} /><Action label="Guardar biblioteca y salir" onPress={()=>{savePosition();props.onExit();}} />
        </>}
      </ScrollView></View>
    </View>}
  </View>;
}
const s=StyleSheet.create({hud:{position:"absolute",top:8,left:10,right:10,padding:8,borderRadius:8,backgroundColor:"#213d3ee8",flexDirection:"row",gap:8,alignItems:"center"},light:{color:"#fff0cf",fontSize:12,lineHeight:17},ink:{color:"#493f43",fontSize:15,lineHeight:23},title:{color:"#493f43",fontSize:22,fontWeight:"700"},button:{minHeight:44,paddingHorizontal:12,paddingVertical:9,backgroundColor:"#fff1d8",borderColor:"#b68b53",borderWidth:1,borderRadius:7,justifyContent:"center"},row:{flexDirection:"row",gap:8},controls:{position:"absolute",bottom:10,left:10,right:10,flexDirection:"row",justifyContent:"space-between"},touch:{width:52,height:48,alignItems:"center",justifyContent:"center",backgroundColor:"#254b4cdd",borderRadius:8,borderWidth:1,borderColor:"#b2c0a4"},shade:{...StyleSheet.absoluteFillObject,backgroundColor:"#172d35bb",justifyContent:"center",alignItems:"center"},paper:{backgroundColor:"#fff2dd",borderRadius:14,borderWidth:2,borderColor:"#b68b53",padding:18,maxWidth:880}});
