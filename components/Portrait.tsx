import { useEffect, useState } from "react";
import { Image, View, Text } from "react-native";
import { Asset } from "expo-asset";
import art from "../game/rendering/art-runtime.json";
import {
  speakerNames,
  portraitFrame,
  type Speaker,
} from "../game/dialogues/presentation";
const source = Asset.fromModule(
  require("../assets/runtime/portraits.png"),
).uri;
export default function Portrait({
  speaker,
  size = 82,
}: {
  speaker: Speaker;
  size?: number;
}) {
  const [mouth, setMouth] = useState(0);
  useEffect(() => {
    setMouth(0);
    if (!["hero","guide","walker","secondary","keeper","librarian","ranger","reader"].includes(speaker)) return;
    const id = setInterval(() => setMouth((v) => 1 - v), 560);
    return () => clearInterval(id);
  }, [speaker]);
  if (speaker === "narrator")
    return (
      <View
        accessibilityLabel="Reflexión del camino"
        style={{
          width: size,
          height: size,
          borderRadius: 12,
          backgroundColor: "#e5d3ab",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 2,
          borderColor: "#bfa579",
        }}
      >
        <Text style={{ fontSize: size * 0.5, color: "#96794b" }}>✧</Text>
      </View>
    );
  if (speaker === "ranger" || speaker === "reader") {
    const d=art.localsPortraits,f=d.frames[(speaker==="ranger"?0:2)+mouth],scale=(size-6)/Math.max(f.width,f.height);
    return <View accessibilityRole="image" accessibilityLabel={speakerNames[speaker]} style={{width:size,height:size,overflow:"hidden",borderRadius:12,borderWidth:2,borderColor:"#bba781",backgroundColor:"#e3dac1"}}>
      <Image source={{uri:Asset.fromModule(require("../assets/runtime/localsPortraits.png")).uri}} resizeMode="stretch" style={{position:"absolute",left:(size-4-f.width*scale)/2-f.x*scale,top:(size-4-f.height*scale)/2-f.y*scale,width:d.width*scale,height:d.height*scale}} />
    </View>;
  }
  if (speaker === "walker" || speaker === "secondary" || speaker === "keeper" || speaker === "librarian") {
    const row = { walker:0, secondary:1, keeper:2, librarian:3 }[speaker];
    const d=art.castPortraits, f=d.frames[row*2+mouth];
    const scale=(size-6)/Math.max(f.width,f.height);
    return <View accessibilityRole="image" accessibilityLabel={speakerNames[speaker]} style={{width:size,height:size,overflow:"hidden",borderRadius:12,borderWidth:2,borderColor:"#bba781",backgroundColor:"#e3dac1"}}>
      <Image source={{uri:Asset.fromModule(require("../assets/runtime/castPortraits.png")).uri}} resizeMode="stretch" style={{position:"absolute",left:(size-4-f.width*scale)/2-f.x*scale,top:(size-4-f.height*scale)/2-f.y*scale,width:d.width*scale,height:d.height*scale}} />
    </View>;
  }
  const index = portraitFrame(speaker, mouth);
  const f = art.portraits.frames[index].cell;
  const scale = (size - 8) / Math.max(f.width, f.height),
    left = (size - f.width * scale) / 2 - f.x * scale,
    top = (size - f.height * scale) / 2 - f.y * scale;
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={`${speakerNames[speaker]}${speaker === "travelerHappy" ? " alegre" : speaker === "traveler" ? " desanimado" : ""}`}
      style={{
        width: size,
        height: size,
        overflow: "hidden",
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#bba781",
        backgroundColor: "#d6d2b4",
      }}
    >
      <Image
        source={{ uri: source }}
        style={{
          position: "absolute",
          left: left - 2,
          top: top - 2,
          width: art.portraits.width * scale,
          height: art.portraits.height * scale,
        }}
        resizeMode="stretch"
      />
    </View>
  );
}
