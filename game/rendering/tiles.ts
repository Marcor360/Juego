/** Alternating reflected strips meet on the exact same source-image edge. */
export function tileTransform(index: number, width: number) {
  const reflected = Math.abs(index % 2) === 1;
  return [
    { translateX: (index + (reflected ? 1 : 0)) * width },
    { scaleX: reflected ? -1 : 1 },
  ];
}
export function tileSourceEdge(
  index: number,
  edge: "left" | "right",
  width: number,
) {
  const reflected = Math.abs(index % 2) === 1;
  return (edge === "left") !== reflected ? 0 : width;
}
export const BACKDROP = {
  width: 580,
  height: 326.25,
  step: 516,
  fade: 64,
  y: -28.5,
};
export function backdropTiles(
  worldWidth: number,
  viewWidth = 480,
  parallax = 0.12,
) {
  const right = (worldWidth - viewWidth) * parallax + viewWidth;
  return Array.from({ length: Math.ceil(right / BACKDROP.step) }, (_, i) => i);
}
