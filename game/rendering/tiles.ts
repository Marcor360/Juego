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
