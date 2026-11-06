import { Image, View } from "react-native";
import art from "../game/rendering/art-runtime.json";
export default function Illustration({pack,frame,size=40,label}:{pack:"pickups"|"menuEmblems"|"decor";frame:number;size?:number;label?:string}) {
 const source=pack==="pickups"?require("../assets/runtime/pickups.png"):pack==="decor"?require("../assets/runtime/decor.png"):require("../assets/runtime/menuEmblems.png");
 const data=art[pack],f=data.frames[frame],scale=(size-2)/Math.max(f.width,f.height);
 return <View pointerEvents="none" accessible={!!label} accessibilityRole={label?"image":undefined} accessibilityLabel={label} style={{width:size,height:size,overflow:"hidden"}}>
   <Image accessible={false} source={source} resizeMode="stretch" style={{position:"absolute",width:data.width*scale,height:data.height*scale,left:size/2-(f.x+f.width/2)*scale,top:size/2-(f.y+f.height/2)*scale}} />
 </View>;
}
