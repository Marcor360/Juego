import { useMemo } from "react";
import { Atlas, Group, Skia } from "@shopify/react-native-skia";
import art from "../game/rendering/art.json";
export function ForestProp({
  image,
  index,
  height = 46,
  width,
  x = 0,
  y = 0,
  top = false,
}: {
  image: ReturnType<typeof import("@shopify/react-native-skia").useImage>;
  index: number;
  height?: number;
  width?: number;
  x?: number;
  y?: number;
  top?: boolean;
}) {
  const f = art.props.frames[index];
  // Lantern states share a cell-based scale so their posts never change size.
  const lantern = index === 1 || index === 2;
  const source = lantern ? f.cell : f;
  const scale =
    width !== undefined
      ? width / source.width
      : height / (lantern ? art.props.frames[1].height : source.height);
  const tx = x - source.width * 0.5 * scale;
  const groundInCell =
    art.props.frames[1].y +
    art.props.frames[1].height -
    art.props.frames[1].cell.y;
  const ty = top ? y : y - (lantern ? groundInCell : source.height) * scale;
  const transforms = useMemo(
    () => [Skia.RSXform(scale, 0, tx, ty)],
    [scale, tx, ty],
  );
  return image ? (
    <Atlas
      image={image}
      sprites={[
        {
          x: source.x,
          y: source.y,
          width: source.width,
          height: source.height,
        },
      ]}
      transforms={transforms}
      sampling={{ filter: 0, mipmap: 0 }}
    />
  ) : null;
}
export function MossPlatform({
  image,
  x,
  y,
  w,
  h,
}: {
  image: ReturnType<typeof import("@shopify/react-native-skia").useImage>;
  x: number;
  y: number;
  w: number;
  h: number;
}) {
  const span = Math.min(44, w + 4),
    count = Math.ceil(w / (span - 5));
  return (
    <Group
      clip={{ x: x - 2, y: y - 7, width: w + 4, height: Math.max(38, h + 12) }}
    >
      {Array.from({ length: count }, (_, i) => (
        <ForestProp
          key={i}
          image={image}
          index={0}
          width={span + 4}
          x={i === count - 1 ? x + w - span / 2 : x + (span - 5) * i + span / 2}
          y={y - 6}
          top
        />
      ))}
    </Group>
  );
}
