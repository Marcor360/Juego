type Progress = {
  guide: boolean;
  lights: string[];
  lamps: string[];
  traveler: boolean;
  riddle: boolean;
  complete: boolean;
};
const freshProgress = (): Progress => ({
  guide: false,
  lights: [],
  lamps: [],
  traveler: false,
  riddle: false,
  complete: false,
});
export type Settings = {
  music: number;
  effects: number;
  reducedMotion: boolean;
};
export type LegacySave = {
  schemaVersion: 1;
  gameId: "precursora";
  level: 1;
  checkpoint: number;
  missions: Progress;
  tools: string[];
  unlockedChapters: number[];
  settings: Settings;
};
export const defaultSettings: Settings = {
  music: 0.5,
  effects: 0.7,
  reducedMotion: false,
};
export const newSave = (): LegacySave => ({
  schemaVersion: 1,
  gameId: "precursora",
  level: 1,
  checkpoint: 65,
  missions: freshProgress(),
  tools: [],
  unlockedChapters: [1],
  settings: { ...defaultSettings },
});
export function validateLegacySave(raw: unknown): LegacySave {
  const s = raw as LegacySave;
  if (
    !s ||
    s.schemaVersion !== 1 ||
    s.gameId !== "precursora" ||
    s.level !== 1 ||
    !Number.isFinite(s.checkpoint) ||
    s.checkpoint < 12 ||
    s.checkpoint > 3288
  )
    throw Error("Partida incorrecta o incompatible.");
  const p = s.missions;
  const validIds = (v: unknown, ids: string[]) =>
    Array.isArray(v) &&
    new Set(v).size === v.length &&
    v.every((x) => ids.includes(x));
  if (
    !p ||
    !["guide", "traveler", "riddle", "complete"].every(
      (k) => typeof p[k as keyof Progress] === "boolean",
    ) ||
    !validIds(p.lights, ["light1", "light2", "light3"]) ||
    !validIds(p.lamps, ["lamp1", "lamp2"])
  )
    throw Error("Misiones inválidas.");
  if (
    (p.lights.length && !p.guide) ||
    (p.lamps.length && p.lights.length !== 3) ||
    (p.traveler && p.lamps.length !== 2) ||
    (p.riddle && !p.traveler) ||
    (p.complete && !p.riddle)
  )
    throw Error("Progreso incoherente.");
  if (
    !validIds(s.tools, ["fe"]) ||
    JSON.stringify(s.tools) !== JSON.stringify(p.complete ? ["fe"] : []) ||
    JSON.stringify(s.unlockedChapters) !==
      JSON.stringify(p.complete ? [1, 2] : [1])
  )
    throw Error("Inventario o capítulos inválidos.");
  if (
    (s.checkpoint > 1420 && p.lamps.length < 2) ||
    (s.checkpoint > 2540 && !p.riddle)
  )
    throw Error("Checkpoint bloqueado.");
  if (
    !s.settings ||
    !["music", "effects"].every(
      (k) =>
        typeof s.settings[k as "music" | "effects"] === "number" &&
        Number.isFinite(s.settings[k as "music" | "effects"]) &&
        s.settings[k as "music" | "effects"] >= 0 &&
        s.settings[k as "music" | "effects"] <= 1,
    ) ||
    typeof s.settings.reducedMotion !== "boolean"
  )
    throw Error("Ajustes inválidos.");
  return {
    schemaVersion: 1,
    gameId: "precursora",
    level: 1,
    checkpoint: s.checkpoint,
    missions: {
      guide: p.guide,
      lights: [...p.lights],
      lamps: [...p.lamps],
      traveler: p.traveler,
      riddle: p.riddle,
      complete: p.complete,
    },
    tools: [...s.tools],
    unlockedChapters: [...s.unlockedChapters],
    settings: { ...s.settings },
  };
}
