import { Circle, Group, Path, RoundedRect, type SkImage } from "@shopify/react-native-skia";
import { useDerivedValue,type SharedValue } from "react-native-reanimated";
import { AnimatedCharacter } from "./AnimatedCharacter";
import { ForestProp } from "./ForestProps";
import { SoftGlow } from "./WorldEffects";
import { BRANCH_CLEAR_SECONDS } from "../game/rendering/conversation";
export function BranchClearance({progress,reduced}:{progress:SharedValue<number>;reduced:boolean}) {
 const frame=useDerivedValue(()=>reduced?(progress.value>=1?7:0):Math.min(7,Math.floor(Math.max(0,progress.value)*8)));
 const transform=useDerivedValue(()=>{const p=reduced?(progress.value>=1?1:0):Math.max(0,progress.value);return [{translateX:2398+p*12},{translateY:226+p*18}];});
 return <><Group transform={transform}><AnimatedCharacter kind="branch" frame={frame} height={71} /></Group>{!reduced&&[0,1,2,3,4,5].map(i=><Dust key={i} progress={progress} i={i} />)}</>;
}
function Dust({progress,i}:{progress:SharedValue<number>;i:number}) {
 const opacity=useDerivedValue(()=>{const t=progress.value*BRANCH_CLEAR_SECONDS-1.6;return t>=0&&t<.8?(1-t/.8)*.35:0;});
 const transform=useDerivedValue(()=>{const t=Math.max(0,Math.min(.8,progress.value*BRANCH_CLEAR_SECONDS-1.6));return [{translateX:2405+(i-2.5)*t*18},{translateY:237-Math.sin(t/.8*Math.PI)*10-i%2*3}];});
 return <Group transform={transform} opacity={opacity}><Circle cx={0} cy={0} r={1.5+i%3} color="#d5b582" /></Group>;
}
export function SpeechMarker({time,reduced=false}:{time:SharedValue<number>;reduced?:boolean}) {
 const alpha=useDerivedValue(()=>reduced?.7:.6+Math.sin(time.value*2)*.16);
 return <Group opacity={alpha}><RoundedRect x={-9} y={-55} width={18} height={9} r={3} color="#fff2d4" /><Path path="M -3 -46 L 0 -43 L 3 -46 Z" color="#fff2d4" />{[-4,0,4].map(x=><Circle key={x} cx={x} cy={-50.5} r={.8} color="#785b46" />)}</Group>;
}
export function RepairLamp({image,x,y=226,lit,repair,clock,reduced}:{image:SkImage|null;x:number;y?:number;lit:boolean;repair:SharedValue<{x:number;at:number}>;clock:SharedValue<number>;reduced:boolean}) {
 const amount=useDerivedValue(()=>lit?(reduced||repair.value.x!==x?1:Math.max(0,Math.min(1,(clock.value-repair.value.at)/1.4))):0);
 const unlit=useDerivedValue(()=>1-amount.value);
 const flare=useDerivedValue(()=>{const t=clock.value-repair.value.at;return !reduced&&lit&&repair.value.x===x&&t>=0&&t<1.4?1:0;});
 const frame=useDerivedValue(()=>Math.min(5,Math.max(0,Math.floor((clock.value-repair.value.at)/1.4*6))));
 return <Group transform={[{translateX:x},{translateY:y}]}><Group opacity={unlit}><ForestProp image={image} index={1} height={45} /></Group><Group opacity={amount}><ForestProp image={image} index={2} height={45} /><SoftGlow x={0} y={-32} r={13} opacity={.18} /></Group><Group opacity={flare}><Group transform={[{translateY:-28}]}><AnimatedCharacter kind="flame" frame={frame} height={12} /></Group><SoftGlow x={0} y={-31} r={18} opacity={.24} /></Group></Group>;
}
