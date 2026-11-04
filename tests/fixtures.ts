/** Browser fixtures use the real mission transition and save validator, never production test hooks. */
import {
  freshProgress,
  finishMission,
  evidenceIds,
  itemIds,
} from "../game/missions/progress.ts";
import { newSave, validateSave } from "../game/save/schema.ts";
import {
  checkpoints,
  objects,
  type CheckpointId,
} from "../game/levels/forest.ts";
const result = [];
for (let scene = 1; scene <= 16; scene++) {
  const p = freshProgress();
  p.tutorial = { walk: true, jump: true, journal: true, interact: true };
  p.evidence = [...evidenceIds];
  p.items = [...itemIds];
  for (let n = 1; n < scene; n++) {
    if (n === 12) p.worldFlags.noReturn = true;
    finishMission(p, n);
  }
  if (scene === 12) p.worldFlags.noReturn = true;
  const checkpoint: CheckpointId =
    scene >= 15
      ? "ch1_refugio"
      : scene >= 12
        ? "ch1_niebla"
        : scene >= 11
          ? "ch1_claro"
          : scene >= 10
            ? "ch1_puente"
            : scene >= 6
              ? "ch1_arroyo"
              : "ch1_entrada";
  result.push(
    validateSave({
      ...newSave(),
      missions: p,
      checkpoint,
      position: objects.find((o) => o.scene === scene)!.x,
      tools: scene >= 16 ? ["fe"] : [],
      settings: { music: 0, effects: 0, reducedMotion: false },
    }),
  );
}
process.stdout.write(JSON.stringify(result));
