import type { Save } from "../save/schema.ts";
export type MenuThemeId = "beginning" | "middle" | "ending";
export const menuThemes = {
  beginning: {
    id: "beginning",
    name: "Amanecer",
    eyebrow: "TODO COMIENZA CON UN PASO",
    caption: "Un camino por descubrir",
    description: "Amanecer entre flores, montañas y un pequeño pueblo.",
    ink: "#54394e",
    muted: "#796455",
    gold: "#c39b64",
    paper: "#fff5e9ed",
    accent: "#88715a",
    outfit: "Falda lavanda y mochila de viaje",
  },
  middle: {
    id: "middle",
    name: "En camino",
    eyebrow: "LA CONFIANZA CRECE",
    caption: "Un paso más, con confianza",
    description: "Un puente de piedra entre árboles y luz de la tarde.",
    ink: "#2e4b47",
    muted: "#626e5d",
    gold: "#ba995d",
    paper: "#f4f0dfed",
    accent: "#657e6c",
    outfit: "Pantalón lavanda y botas de camino",
  },
  ending: {
    id: "ending",
    name: "Nuevos horizontes",
    eyebrow: "CADA PASO DEJA UNA HUELLA",
    caption: "La luz que llevas contigo",
    description: "El valle al anochecer y la esperanza de una nueva etapa.",
    ink: "#4b405a",
    muted: "#756778",
    gold: "#b7956a",
    paper: "#f8eef0ed",
    accent: "#8c7898",
    outfit: "Falda lavanda y linterna de la Fe",
  },
} as const;
/** Themes describe the currently playable chapter; no rewards from future chapters are exposed. */
export function menuThemeForSave(
  save: Pick<Save, "missions"> | null,
): MenuThemeId {
  const completed = save?.missions.completedMissions ?? [];
  if (completed.includes("CH1_16")) return "ending";
  if (completed.includes("CH1_08")) return "middle";
  return "beginning";
}
