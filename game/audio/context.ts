export type SoundKind = "wood-shift" | "wood-land" | "ignite" | "talk-soft" | "discovery" | "interaction" | "jump" | "fall" | "land" | "damage" | "page" | "chest" | "step-grass" | "step-wood" | "step-stone";
export type Ambience = "menu" | "forest" | "stream" | "bridge" | "clearing" | "mist" | "refuge" | "library";

export function ambienceFor(screen: "menu" | "chapters" | "play", zone: string, library: boolean): Ambience {
  if (library) return "library";
  if (screen !== "play") return "menu";
  if (zone === "El arroyo") return "stream";
  if (zone === "El puente dañado") return "bridge";
  if (zone === "El claro") return "clearing";
  if (zone === "La niebla") return "mist";
  if (zone === "El refugio") return "refuge";
  return "forest";
}
