import { evaluateStage, optionAvailable, getScene, type SceneDefinition } from "./challenges.ts";
import { prerequisites, type Progress } from "../missions/progress.ts";

export type ChallengeDraft = {
  version: 1;
  scene: number;
  revision: string;
  history: string[][];
  selected: string[];
  order: string[];
  hints: boolean;
};

/** Fingerprint content, not styling: an edited question must not inherit answers. */
export function challengeRevision(scene: SceneDefinition) {
  let hash = 2166136261;
  const text = JSON.stringify(scene.stages);
  for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619) >>> 0;
  return hash.toString(16).padStart(8, "0");
}
function distinctIds(value: unknown, allowed: Set<string>): value is string[] {
  return Array.isArray(value) && value.length <= allowed.size &&
    value.every(id => typeof id === "string" && allowed.has(id)) && new Set(value).size === value.length;
}
/** Invalid/stale partial work is disposable; the validated chapter is preserved. */
export function normalizeChallengeDraft(raw: unknown, progress: Progress): ChallengeDraft | null {
  if (!raw || typeof raw !== "object") return null;
  const draft = raw as ChallengeDraft;
  if (draft.version !== 1 || !Number.isInteger(draft.scene) || draft.scene !== progress.completedMissions.length + 1 || draft.scene < 1 || draft.scene > 16) return null;
  const scene = getScene(draft.scene);
  if (!scene.stages.length || draft.revision !== challengeRevision(scene) || prerequisites(progress, draft.scene).length) return null;
  if (!Array.isArray(draft.history) || draft.history.length >= scene.stages.length || typeof draft.hints !== "boolean") return null;
  const history: string[][] = [];
  for (let i = 0; i < draft.history.length; i++) {
    const stage = scene.stages[i];
    const selected = draft.history[i];
    if (!distinctIds(selected, new Set(stage.options.map(option => option.id))) || !evaluateStage(stage, selected, history, progress)) return null;
    history.push([...selected]);
  }
  const stage = scene.stages[history.length];
  const allowed = new Set(stage.options.map(option => option.id));
  if (!distinctIds(draft.selected, allowed) || !distinctIds(draft.order, allowed) || draft.order.length !== allowed.size) return null;
  if (!draft.selected.every(id => optionAvailable(stage, id, progress))) return null;
  if (stage.kind !== "order" && stage.kind !== "multi" && draft.selected.length > 1) return null;
  return { version: 1, scene: draft.scene, revision: draft.revision, history, selected: [...draft.selected], order: [...draft.order], hints: draft.hints };
}
export function challengeRecoveryNotice(raw: unknown, normalized: ChallengeDraft | null | undefined) {
  const value = raw as { challenge?: unknown } | null;
  return value?.challenge != null && !normalized
    ? "El reto pendiente cambió o no pudo recuperarse y comenzará desde su primer paso. Tu historia, objetos y escenas completadas se conservan."
    : "";
}
