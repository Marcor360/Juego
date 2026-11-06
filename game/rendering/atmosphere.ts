/** Shared visual direction. The position, not a timer, chooses each place's mood. */
export const atmospheres = [
  { id: "entrance", wind: .22, tint: "#e9c78b", particle: "#ffe9b3", glow: .3 },
  { id: "stream", wind: .38, tint: "#afd9cf", particle: "#e4f5e5", glow: .12 },
  { id: "bridge", wind: .62, tint: "#c1c6d5", particle: "#cec4aa", glow: .05 },
  { id: "clearing", wind: .12, tint: "#f1d69b", particle: "#fff2b0", glow: .35 },
  { id: "mist", wind: .85, tint: "#b4c6e2", particle: "#c8d8ed", glow: .02 },
  { id: "refuge", wind: .08, tint: "#e8b275", particle: "#ffdf88", glow: .5 },
] as const;
export function atmosphereIndex(x: number) {
  "worklet";
  return x < 1120 ? 0 : x < 2560 ? 1 : x < 4000 ? 2 : x < 5120 ? 3 : x < 7040 ? 4 : 5;
}
export function gust(time: number) {
  "worklet";
  return .5 + .22 * Math.sin(time * .37) + .17 * Math.sin(time * .113 + 1.8) + .1 * Math.sin(time * .071 + 3.1);
}
export function mistAmount(x: number) {
  "worklet";
  const enter = Math.max(0, Math.min(1, (x - 4960) / 320));
  const exit = Math.max(0, Math.min(1, (7140 - x) / 240));
  return enter * exit;
}

/** Recovery opens visibility, but the mist remains a recognisable place. */
export function mistDensity(x: number, oriented = false) {
  "worklet";
  return mistAmount(x) * (oriented ? .68 : 1);
}
