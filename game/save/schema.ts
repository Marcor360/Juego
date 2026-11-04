import {
  freshProgress,
  missionId,
  evidenceIds,
  itemIds,
  lightIds,
  hasMission,
  prerequisites,
  type Progress,
} from "../missions/progress.ts";
import {
  checkpoints,
  floorAt,
  platforms,
  rightLimit,
  type CheckpointId,
} from "../levels/forest.ts";
import { validateLegacySave } from "./legacy-v1.ts";
export type Settings = {
  music: number;
  effects: number;
  reducedMotion: boolean;
};
export type Save = {
  schemaVersion: 2;
  gameId: "precursora";
  level: 1;
  checkpoint: CheckpointId;
  position: number;
  health: number;
  missions: Progress;
  tools: string[];
  unlockedChapters: number[];
  settings: Settings;
  legacyRewards: boolean;
  migratedFrom: 1 | null;
};
export const defaultSettings: Settings = {
  music: 0.5,
  effects: 0.7,
  reducedMotion: false,
};
export const newSave = (): Save => ({
  schemaVersion: 2,
  gameId: "precursora",
  level: 1,
  checkpoint: "ch1_entrada",
  position: 120,
  health: 3,
  missions: freshProgress(),
  tools: [],
  unlockedChapters: [1],
  settings: { ...defaultSettings },
  legacyRewards: false,
  migratedFrom: null,
});
const fail = (message = "Partida incorrecta o incompatible."): never => {
  throw Error(message);
};
const ids = (v: unknown, allowed: string[]): v is string[] =>
  Array.isArray(v) &&
  v.length <= allowed.length &&
  new Set(v).size === v.length &&
  v.every((x) => allowed.includes(x));
export function validateSave(raw: unknown): Save {
  if ((raw as any)?.schemaVersion === 1) {
    const old = validateLegacySave(raw);
    return {
      ...newSave(),
      settings: old.settings,
      legacyRewards: old.missions.complete,
      tools: [...old.tools],
      unlockedChapters: [...old.unlockedChapters],
      migratedFrom: 1,
    };
  }
  const s = raw as Save;
  if (!s || s.schemaVersion !== 2 || s.gameId !== "precursora" || s.level !== 1)
    fail();
  const p = s.missions;
  if (
    !p ||
    !ids(
      p.completedMissions,
      Array.from({ length: 16 }, (_, i) => missionId(i + 1)),
    ) ||
    !p.completedMissions.every((id, i) => id === missionId(i + 1))
  )
    fail("Orden de misiones inválido.");
  if (
    !p.tutorial ||
    !["walk", "jump", "journal", "interact"].every(
      (k) => typeof p.tutorial[k as keyof Progress["tutorial"]] === "boolean",
    ) ||
    !ids(p.evidence, evidenceIds) ||
    !ids(p.items, itemIds) ||
    !ids(p.lights, lightIds) ||
    !p.worldFlags ||
    typeof p.worldFlags.noReturn !== "boolean" ||
    typeof p.worldFlags.bridgeWarning !== "boolean"
  )
    fail("Datos del bosque inválidos.");
  if (
    !Array.isArray(p.reflections) ||
    p.reflections.length > 50 ||
    p.reflections.some((x) => typeof x !== "string" || x.length > 1200) ||
    !p.decisions ||
    typeof p.decisions !== "object" ||
    Array.isArray(p.decisions) ||
    Object.entries(p.decisions).some(
      ([k, v]) =>
        !p.completedMissions.includes(k) ||
        typeof v !== "string" ||
        v.length > 4000,
    )
  )
    fail("Cuaderno inválido.");
  for (let n = 1; n <= p.completedMissions.length; n++) {
    const prior = {
      ...p,
      completedMissions: p.completedMissions.slice(0, n - 1),
    };
    if (prerequisites(prior, n).length)
      fail("Faltan evidencias o acciones necesarias.");
  }
  if (
    (p.worldFlags.noReturn && !hasMission(p, 11)) ||
    (hasMission(p, 12) && !p.worldFlags.noReturn)
  )
    fail("Estado de la niebla incoherente.");
  if (
    !Object.hasOwn(checkpoints, s.checkpoint) ||
    checkpoints[s.checkpoint].scene > p.completedMissions.length ||
    (s.checkpoint === "ch1_niebla" && !p.worldFlags.noReturn) ||
    (p.worldFlags.noReturn && checkpoints[s.checkpoint].x < 5112)
  )
    fail("Checkpoint bloqueado.");
  if (
    !Number.isInteger(s.position) ||
    s.position < 12 ||
    s.position > rightLimit(p) ||
    (p.worldFlags.noReturn && s.position < 5112) ||
    (!floorAt(s.position) &&
      !platforms.some(
        (r) =>
          r.kind !== "moving" &&
          r.kind !== "rope" &&
          s.position > r.x + 4 &&
          s.position < r.x + r.w - 4,
      ))
  )
    fail("Posición insegura.");
  if (
    !Number.isInteger(s.health) ||
    s.health < 1 ||
    s.health > 3 ||
    typeof s.legacyRewards !== "boolean" ||
    ![1, null].includes(s.migratedFrom)
  )
    fail();
  if (s.legacyRewards && s.migratedFrom !== 1) fail("Migración inválida.");
  const tools = hasMission(p, 15) || s.legacyRewards ? ["fe"] : [],
    unlocked = hasMission(p, 16) || s.legacyRewards ? [1, 2] : [1];
  if (
    JSON.stringify(s.tools) !== JSON.stringify(tools) ||
    JSON.stringify(s.unlockedChapters) !== JSON.stringify(unlocked)
  )
    fail("Inventario o capítulos incoherentes.");
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
    fail("Ajustes inválidos.");
  return JSON.parse(
    JSON.stringify({
      schemaVersion: 2,
      gameId: "precursora",
      level: 1,
      checkpoint: s.checkpoint,
      position: s.position,
      health: s.health,
      missions: p,
      tools,
      unlockedChapters: unlocked,
      settings: s.settings,
      legacyRewards: s.legacyRewards,
      migratedFrom: s.migratedFrom,
    }),
  );
}
