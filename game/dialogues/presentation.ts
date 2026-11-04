export type Speaker =
  | "hero"
  | "guide"
  | "traveler"
  | "travelerHappy"
  | "narrator";
export function dialogueSpeaker(speaker: Speaker, index = 0): Speaker {
  return speaker === "guide" && (index === 1 || index === 4) ? "hero" : speaker;
}
export const speakerNames: Record<Speaker, string> = {
  hero: "La precursora",
  guide: "La guía del bosque",
  traveler: "El viajero",
  travelerHappy: "El viajero",
  narrator: "Una luz en el camino",
};
export function portraitFrame(speaker: Speaker, mouth = 0) {
  if (speaker === "hero") return mouth ? 1 : 0;
  if (speaker === "guide") return mouth ? 3 : 2;
  return speaker === "traveler" ? 4 : 5;
}
