import { useMemo } from "react";
import { Atlas, Skia } from "@shopify/react-native-skia";
import art from "../game/rendering/art-runtime.json";
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
