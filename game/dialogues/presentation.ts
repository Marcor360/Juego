export type Speaker =
  | "hero"
  | "guide"
  | "traveler"
  | "travelerHappy"
  | "narrator"
  | "walker"
  | "secondary"
  | "keeper";
export const speakerNames: Record<Speaker, string> = {
  hero: "La precursora",
  guide: "La guía del bosque",
  traveler: "El viajero",
  travelerHappy: "El viajero",
  narrator: "El bosque de las dudas",
  walker: "La caminante",
  secondary: "El viajero del claro",
  keeper: "La encargada del refugio",
};
export function portraitFrame(speaker: Speaker, mouth = 0) {
  if (speaker === "hero") return mouth ? 1 : 0;
  if (speaker === "guide") return mouth ? 3 : 2;
  return speaker === "traveler" ? 4 : 5;
}
export function dialogueSpeaker(speaker: Speaker) {
  return speaker;
}
