import RegisteredSprite from "./RegisteredSprite";
import art from "../game/rendering/art-runtime.json";
import { Asset } from "expo-asset";
import { Circle, Group, Image, Rect, LinearGradient, vec, useImage } from "@shopify/react-native-skia";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";
import { atmosphereIndex, atmospheres, gust } from "../game/rendering/atmosphere";

function FloatingParticle({ i, camera, time, reduced }: { i: number; camera: SharedValue<number>; time: SharedValue<number>; reduced: boolean }) {
  const transform = useDerivedValue(() => {
    const profile = atmospheres[atmosphereIndex(camera.value + 240)];
    const t = reduced ? 0 : time.value;
    return [
      { translateX: ((i * 79 + t * profile.wind * 7 + Math.sin(t * .13 + i) * 8) % 510) - 15 },
      { translateY: 55 + (i * 37) % 155 + Math.sin(t * .27 + i * 2.1) * (reduced ? 0 : 8) },
    ];
  });
  const color = useDerivedValue(() => atmospheres[atmosphereIndex(camera.value + 240)].particle);
  const alpha = useDerivedValue(() => {
    const place = atmosphereIndex(camera.value + 240);
    const brightness = place === 4 ? .13 : place === 5 ? .7 : .4;
    return reduced ? brightness * .55 : brightness * (.6 + Math.sin(time.value * .8 + i) * .4);
  });
  return <Group transform={transform} opacity={alpha}><Circle cx={0} cy={0} r={i % 3 ? .55 : 1.1} color={color} /></Group>;
}
export function WaterSurface({ x, width, time, reduced }: { x: number; width: number; time: SharedValue<number>; reduced: boolean }) {
  const image=useImage(Asset.fromModule(require("../assets/runtime/water.png")).uri);
  const frame=useDerivedValue(()=>reduced?0:Math.floor(time.value*6)%8);
  const drift=useDerivedValue(()=>[{translateX:reduced?0:(time.value*5)%96}]);
  return <Group clip={{x,y:236,width,height:34}}>
    <Group transform={drift}>
      {Array.from({length:Math.ceil(width/96)+2},(_,i)=><Group key={i} transform={[{translateX:x+(i-1)*96+48},{translateY:253}]}>
        <RegisteredSprite image={image} data={art.water} frame={frame} width={97} height={34} center />
      </Group>)}
    </Group>
    <Rect x={x} y={236} width={width} height={34}><LinearGradient start={vec(0,236)} end={vec(0,270)} colors={["#173e4922","#132c4a9a"]} /></Rect>
  </Group>;
}
export default function PlaceAtmosphere({ camera, time, reduced }: { camera: SharedValue<number>; time: SharedValue<number>; reduced: boolean }) {
  const foliage = useImage(Asset.fromModule(require("../assets/runtime/foreground.png")).uri);
  const foreground = useDerivedValue(() => [
    { translateX: -camera.value * .0015 + (reduced ? 0 : Math.sin(time.value * .32) * 1.2) },
    { translateY: reduced ? 0 : Math.sin(time.value * .21) * .65 },
  ]);
  const warm = useDerivedValue(() => {
    const x = camera.value + 240;
    const clearing = Math.max(0, 1 - Math.abs(x - 4560) / 650);
    const refuge = Math.max(0, Math.min(1, (x - 6900) / 600));
    return (clearing + refuge) * .12;
  });
  return <>
    <Rect x={0} y={0} width={480} height={226} opacity={warm}><LinearGradient start={vec(380,0)} end={vec(180,226)} colors={["#f3cb87", "#edc68900"]} /></Rect>
    {Array.from({ length: reduced ? 5 : 16 }, (_, i) => <FloatingParticle key={i} i={i} camera={camera} time={time} reduced={reduced} />)}
    {foliage && <Group transform={foreground} opacity={.68}><Image image={foliage} x={0} y={0} width={490} height={270} fit="fill" /></Group>}
  </>;
}
