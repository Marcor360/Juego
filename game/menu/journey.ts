import { libraryTasks, libraryComplete } from "../chapter2/library.ts";
import type { Save } from "../save/schema.ts";
import { missionTitles } from "../missions/progress.ts";
import { zones } from "../levels/forest.ts";

export function menuJourney(save: Save | null) {
  if (save?.activeChapter === 2 && save.library) return {
    completed: save.library.answers.length, total: 8, chapter: 2,
    percent: Math.round(save.library.answers.length / 8 * 100),
    location: "La biblioteca del aprendizaje",
    next: libraryTasks[save.library.answers.length]?.title ?? "Aprendizaje obtenido",
    complete: libraryComplete(save.library),
  };
  const completed = save?.missions.completedMissions.length ?? 0;
  return {
    completed, total: 16, chapter: 1,
    percent: Math.round(completed / 16 * 100),
    location: save ? (zones.find(zone => save.position >= zone.start && save.position < zone.end)?.name ?? "Entrada del bosque") : "El bosque de las dudas",
    next: completed === 16 ? "La biblioteca te espera" : missionTitles[completed],
    complete: completed === 16,
  };
}
