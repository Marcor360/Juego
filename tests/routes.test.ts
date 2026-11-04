import { test } from "node:test";
import assert from "node:assert/strict";
import { World } from "../game/engine/world.ts";
import {
  freshProgress,
  evidenceIds,
  itemIds,
  finishMission,
} from "../game/missions/progress.ts";
import { platforms, platformAt } from "../game/levels/forest.ts";
function ready() {
  const p = freshProgress();
  p.tutorial = { walk: true, jump: true, journal: true, interact: true };
  p.evidence = [...evidenceIds];
  p.items = [...itemIds];
  for (let n = 1; n <= 11; n++) finishMission(p, n);
  p.worldFlags.noReturn = true;
  return p;
}
const groups = [
  ["mark_step", "mark_high"],
  ["fragment_step", "fragment_high"],
  ["lever_step", "lever_high"],
  ["bridge_step", "detour_a", "detour_b", "detour_c", "detour_d"],
  ["rope_step", "rope_lift", "cover_ledge"],
  ["wick_step", "wick_ledge"],
  [
    "mist_step",
    "mist_move1",
    "mist_wet1",
    "mist_move2",
    "mist_stone2",
    "mist_step3",
    "mist_move3",
    "mist_wet2",
    "mist_step4",
    "mist_exit",
  ],
  [
    "trust_step1",
    "trust_step2",
    "trust_move",
    "trust_step3",
    "trust_step4",
    "trust_exit",
  ],
];
test("every required platform transition has a physically valid, damage-free jump", () => {
  for (const group of groups) {
    for (let i = 0; i < group.length - 1; i++) {
      const a = platforms.find((p) => p.id === group[i])!,
        b = platforms.find((p) => p.id === group[i + 1])!;
      let result = false;
      for (const phase of [0, 0.5, 1, 1.5, 2]) {
        if (result) break;
        for (let offset = 8; offset < a.w - 6; offset += 3) {
          if (result) break;
          for (let stop = 24; stop < 96; stop += 4) {
            const w = new World();
            w.progress = ready();
            if (a.x < 5100) w.progress.worldFlags.noReturn = false;
            w.time = phase;
            const ar = platformAt(a, phase);
            w.restore(ar.x + offset);
            w.x = ar.x + offset;
            w.y = ar.y - 1;
            w.vy = 0;
            w.grounded = false;
            for(let settle=0;settle<8;settle++) w.step(1 / 120);
            if (!w.grounded) continue;
            w.input.right = true;
            w.input.jump = true;
            for (let n = 0; n < 140; n++) {
              if (n === stop) w.input.right = false;
              w.step(1 / 120);
              const br = platformAt(b, w.time);
              if (
                w.health === 3 &&
                w.grounded &&
                Math.abs(w.y - br.y) < 0.1 &&
                w.x > br.x - 7 &&
                w.x < br.x + br.w + 7
              ) {
                result = true;
                break;
              }
            }
            if (result) break;
          }
        }
      }
      assert(result, `${a.id} -> ${b.id} must be reachable without damage`);
    }
  }
});
