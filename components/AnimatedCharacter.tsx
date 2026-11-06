import { Asset } from "expo-asset";
import { Image, useImage, Group } from "@shopify/react-native-skia";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";
import art from "../game/rendering/art-runtime.json";
export function AnimatedCharacter({ kind, frame, height = 44, direction }: {
  kind: "hero" | "npcs" | "traveler" | "cast" | "locals" | "heroTalk" | "travelerTalk" | "branch" | "flame";
  frame: SharedValue<number>;
  height?: number;
  direction?: SharedValue<number>;
}) {
  const image = useImage(Asset.fromModule(
    kind === "locals" ? require("../assets/runtime/locals.png")
      : kind === "heroTalk" ? require("../assets/runtime/heroTalk.png")
      : kind === "travelerTalk" ? require("../assets/runtime/travelerTalk.png")
      : kind === "branch" ? require("../assets/runtime/branch.png")
      : kind === "flame" ? require("../assets/runtime/flame.png")
      : kind === "cast" ? require("../assets/runtime/cast.png")
      : kind === "hero" ? require("../assets/runtime/hero.png")
      : kind === "npcs" ? require("../assets/runtime/npcs.png")
      : require("../assets/runtime/traveler.png"),
  ).uri);
  const data = art[kind], scale = height / data.referenceHeight;
  const current = useDerivedValue(() => data.frames[Math.max(0, Math.min(data.frames.length - 1, Math.round(frame.value)))]);
  // A local image crop keeps animated characters independent of Atlas buffer
  // updates and world-coordinate precision. Every pose uses its registered foot.
  const clip = useDerivedValue(() => ({ x: 0, y: 0, width: current.value.width, height: current.value.height }));
  const placement = useDerivedValue(() => [
    { translateX: (current.value.x - current.value.anchorX) * scale },
    { translateY: (current.value.y - current.value.anchorY) * scale },
    { scale },
  ]);
  const sourceX = useDerivedValue(() => -current.value.x);
  const sourceY = useDerivedValue(() => -current.value.y);
  const flip = useDerivedValue(() => [{ scaleX: direction?.value ?? 1 }]);
  return image ? (
    <Group transform={flip}>
      <Group transform={placement}>
        <Group clip={clip}>
          <Image image={image} x={sourceX} y={sourceY} width={data.width} height={data.height} fit="fill" sampling={{ filter: 0, mipmap: 0 }} />
        </Group>
      </Group>
    </Group>
  ) : null;
}
