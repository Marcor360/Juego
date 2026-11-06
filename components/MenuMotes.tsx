import { View } from "react-native";
import Animated,{useAnimatedStyle,type SharedValue} from "react-native-reanimated";
function Mote({i,width,height,time,reduced}:{i:number;width:number;height:number;time:SharedValue<number>;reduced:boolean}) {
 const style=useAnimatedStyle(()=>({opacity:reduced ? .18 : .16+(Math.sin(time.value*.7+i*1.9)+1)*.17,transform:[{translateX:reduced?0:Math.sin(time.value*.15+i)*8},{translateY:reduced?0:Math.sin(time.value*.22+i*2)*12}]}));
 return <Animated.View style={[{position:"absolute",left:width*(.05+i*.077),top:height*(.18+(i%3)*.17),width:i%2?3:4,height:i%2?3:4,borderRadius:10,backgroundColor:"#ffefbe",boxShadow:"0 0 9px #ffd78c"},style]} />;
}
export default function MenuMotes(props:{width:number;height:number;time:SharedValue<number>;reduced:boolean}) {
 return <View pointerEvents="none" accessible={false} style={{position:"absolute",inset:0}}>{Array.from({length:6},(_,i)=><Mote key={i} i={i} {...props} />)}</View>;
}
