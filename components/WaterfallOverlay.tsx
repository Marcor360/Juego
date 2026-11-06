import { Asset } from "expo-asset";
import { Group, useImage } from "@shopify/react-native-skia";
import { useDerivedValue,type SharedValue } from "react-native-reanimated";
import art from "../game/rendering/art-runtime.json";
import RegisteredSprite from "./RegisteredSprite";
/** Align animated, translucent water with the existing painted falls. */
export default function WaterfallOverlay({index,time,reduced}:{index:number;time:SharedValue<number>;reduced:boolean}) {
 const image=useImage(Asset.fromModule(require("../assets/runtime/waterfall.png")).uri);
 const frame=useDerivedValue(()=>reduced?0:Math.floor(time.value*7)%8);
 const falls=index===1?[{x:126,y:95,w:29,h:45},{x:174,y:137,w:22,h:27},{x:182,y:159,w:21,h:19}]:[{x:131,y:132,w:23,h:43},{x:161,y:193,w:22,h:73},{x:340,y:139,w:11,h:40}];
 return <Group opacity={.42}>{falls.map((fall,i)=><Group key={i} transform={[{translateX:fall.x},{translateY:fall.y}]}><RegisteredSprite image={image} data={art.waterfall} frame={frame} width={fall.w} height={fall.h} center /></Group>)}</Group>;
}
