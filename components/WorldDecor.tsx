import { Asset } from "expo-asset";
import { Group, useImage } from "@shopify/react-native-skia";
import art from "../game/rendering/art-runtime.json";
import { intersects, type ViewWindow } from "../game/rendering/view";
import RegisteredSprite from "./RegisteredSprite";
const plants=[
  {x:58,index:0,height:19},{x:960,index:0,height:17},{x:1378,index:1,height:22},
  {x:1715,index:1,height:20},{x:2480,index:0,height:18},{x:3060,index:0,height:16},
  {x:4180,index:0,height:20},{x:4490,index:2,height:23},{x:4525,index:7,height:18},
  {x:5180,index:0,height:15},{x:6170,index:0,height:16},{x:7200,index:0,height:19},
  {x:7380,index:7,height:20},
];
/** Decoration has no collision and stays clear of the centers of narrow landings. */
export default function WorldDecor({viewport}:{viewport:ViewWindow}) {
 const image=useImage(Asset.fromModule(require("../assets/runtime/decor.png")).uri);
 return <>{plants.filter(p=>intersects(viewport,p.x,40)).map(p=><Group key={p.x} transform={[{translateX:p.x},{translateY:226}]}><RegisteredSprite image={image} data={art.decor} frame={p.index} height={p.height} /></Group>)}</>;
}
