import { Image, View } from "react-native";
import { Asset } from "expo-asset";
import art from "../game/rendering/art-runtime.json";
const source = Asset.fromModule(
  require("../assets/runtime/treasures.png"),
).uri;
export default function ItemArt({
  index,
  size = 90,
}: {
  index: number;
  size?: number;
}) {
  const f = art.treasures.frames[index],
    scale = (size - 8) / Math.max(f.width, f.height);
  return (
    <View style={{ width: size, height: size, overflow: "hidden" }}>
      <Image
        source={{ uri: source }}
        resizeMode="stretch"
        style={{
          position: "absolute",
          left: (size - f.width * scale) / 2 - f.x * scale,
          top: (size - f.height * scale) / 2 - f.y * scale,
          width: art.treasures.width * scale,
          height: art.treasures.height * scale,
        }}
      />
    </View>
  );
}
