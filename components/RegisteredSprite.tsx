import { Group, Image, type SkImage } from "@shopify/react-native-skia";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";
type Frame = {x:number;y:number;width:number;height:number;anchorX:number;anchorY:number};
export type SpriteData = {width:number;height:number;frames:Frame[]};
/** Cropped atlas artwork; decorative bounds never create an invisible collider. */
export default function RegisteredSprite({image,data,frame,size=24,width,height,center=false}: {
  image:SkImage|null;data:SpriteData;frame:number|SharedValue<number>;size?:number;width?:number;height?:number;center?:boolean;
}) {
  const current=useDerivedValue(()=>data.frames[Math.max(0,Math.min(data.frames.length-1,Math.floor(typeof frame==="number"?frame:frame.value)))]);
  const clip=useDerivedValue(()=>({x:0,y:0,width:current.value.width,height:current.value.height}));
  const placement=useDerivedValue(()=>{
    const f=current.value,base=size/Math.max(f.width,f.height);
    const sx=width!==undefined?width/f.width:height!==undefined?height/f.height:base;
    const sy=height!==undefined?height/f.height:sx;
    return [{translateX:(center?-f.width/2:f.x-f.anchorX)*sx},{translateY:(center?-f.height/2:f.y-f.anchorY)*sy},{scaleX:sx},{scaleY:sy}];
  });
  const sourceX=useDerivedValue(()=>-current.value.x),sourceY=useDerivedValue(()=>-current.value.y);
  return image?<Group transform={placement}><Group clip={clip}><Image image={image} x={sourceX} y={sourceY} width={data.width} height={data.height} fit="fill" sampling={{filter:0,mipmap:0}} /></Group></Group>:null;
}
