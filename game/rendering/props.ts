type Frame = {
  x: number;
  y: number;
  width: number;
  height: number;
  anchorX: number;
  anchorY: number;
  surfaceY?: number;
};

/** Local source coordinates: ground props use their registered foot;
 * platforms put the walkable surface at zero and their body below it. */
export function propPlacement(
  frame: Frame,
  width?: number,
  height?: number,
  surface = false,
) {
  const originY = surface ? (frame.surfaceY ?? frame.y) : frame.anchorY;
  const bodyHeight = surface
    ? frame.y + frame.height - originY
    : frame.height;
  const sx = width !== undefined ? width / frame.width : (height ?? 30) / bodyHeight;
  const sy = height !== undefined ? height / bodyHeight : sx;
  return {
    sx,
    sy,
    left: surface ? -frame.width / 2 : frame.x - frame.anchorX,
    top: frame.y - originY,
  };
}
