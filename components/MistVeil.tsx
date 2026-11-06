import { Group, Rect, Circle, RadialGradient, LinearGradient, vec } from "@shopify/react-native-skia";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";
import { mistDensity } from "../game/rendering/atmosphere";

type MistProps = { position: SharedValue<number>; time: SharedValue<number>; reduced: boolean; oriented: boolean };
/** Behind the walkable world: atmospheric depth cannot hide a landing or actor. */
export function MistBackdrop({position,time,reduced,oriented}:MistProps) {
  const density=useDerivedValue(()=>mistDensity(position.value,oriented));
  return <Group opacity={density}>
    <Rect x={0} y={0} width={480} height={270}>
      <LinearGradient start={vec(0,0)} end={vec(0,270)} colors={["#c4d6e739","#d9e7f3aa","#e2edf4e6"]} />
    </Rect>
    {[0,1,2,3].map(i=><MistBank key={i} index={i} time={time} reduced={reduced} />)}
  </Group>;
}
function MistBank({index,time,reduced}:{index:number;time:SharedValue<number>;reduced:boolean}) {
  const transform=useDerivedValue(()=>[
    {translateX:reduced?0:Math.sin(time.value*(.09+index*.025)+index*2)*35},
    {translateY:reduced?0:Math.sin(time.value*.07+index)*4},
  ]);
  return <Group transform={transform}>
    <Group transform={[{translateX:index%2?80:380},{translateY:70+index*45},{scaleY:.22}]}>
      <Circle cx={0} cy={0} r={260}>
        <RadialGradient c={vec(0,0)} r={260} colors={["#e6f0f89c","#e6f0f83c","#e6f0f800"]} positions={[0,.55,1]} />
      </Circle>
    </Group>
  </Group>;
}
/** A light near-ground wisp is the only layer in front of gameplay. */
export function MistForeground({position,time,reduced,oriented}:MistProps) {
  const opacity=useDerivedValue(()=>mistDensity(position.value,oriented)*.22);
  const transform=useDerivedValue(()=>[{translateX:reduced?0:Math.sin(time.value*.13)*22}]);
  return <Group opacity={opacity} transform={transform}>
    <Rect x={-25} y={174} width={530} height={68}>
      <LinearGradient start={vec(0,174)} end={vec(0,242)} colors={["#dceaf700","#dceaf7","#dceaf700"]} />
    </Rect>
  </Group>;
}
