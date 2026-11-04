import { Asset } from "expo-asset";
import {
  Atlas,
  useImage,
  Group,
  useRSXformBuffer,
} from "@shopify/react-native-skia";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";
import art from "../game/rendering/art.json";
export function AnimatedCharacter({
  kind,
  frame,
  height = 44,
  direction,
}: {
  kind: "hero" | "npcs";
  frame: SharedValue<number>;
  height?: number;
  direction?: SharedValue<number>;
}) {
  const image = useImage(
    Asset.fromModule(
      kind === "hero"
        ? require("../assets/characters/v2/hero.png")
        : require("../assets/characters/v2/npcs.png"),
    ).uri,
  );
  const data = art[kind],
    scale = height / data.referenceHeight;
  const sprites = useDerivedValue(() => {
    const f =
      data.frames[
        Math.max(0, Math.min(data.frames.length - 1, Math.round(frame.value)))
      ];
    return [{ x: f.x, y: f.y, width: f.width, height: f.height }];
  });
  const transforms = useRSXformBuffer(1, (transform) => {
    "worklet";
    const f =
      data.frames[
        Math.max(0, Math.min(data.frames.length - 1, Math.round(frame.value)))
      ];
    transform.set(
      scale,
      0,
      (f.x - f.anchorX) * scale,
      (f.y - f.anchorY) * scale,
    );
  });
  const flip = useDerivedValue(() => [{ scaleX: direction?.value ?? 1 }]);
  return (
    <Group transform={flip}>
      {image && (
        <Atlas
          image={image}
          sprites={sprites}
          transforms={transforms}
          sampling={{ filter: 0, mipmap: 0 }}
        />
      )}
    </Group>
  );
}
