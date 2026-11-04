import { test } from "node:test";
import assert from "node:assert/strict";
import { World } from "../game/engine/world.ts";
import { collect, freshProgress } from "../game/missions/progress.ts";
import { newSave, validateSave } from "../game/save/schema.ts";
test("gravity lands on solid floor and jumping cannot repeat in air", () => {
  const w = new World();
  w.input.jump = true;
  w.step(1 / 120);
  assert(w.y < 226);
  const v = w.vy;
  w.input.jump = true;
  w.step(1 / 120);
  assert(w.vy > v);
  for (let i = 0; i < 240; i++) w.step(1 / 120);
  assert.equal(w.y, 226);
  assert(w.grounded);
});
test("platform stops lateral motion and can be reached with jump", () => {
  const w = new World();
  w.x = 520;
  w.input.right = true;
  for (let i = 0; i < 50; i++) w.step(1 / 120);
  assert(w.x <= 530);
  w.input.jump = true;
  for (let i = 0; i < 125; i++) w.step(1 / 120);
  assert(w.x > 540);
  assert(w.y <= 226);
});
test("fog blocks passage until its prerequisites are satisfied", () => {
  const w = new World();
  w.x = 1400;
  w.input.right = true;
  for (let i = 0; i < 100; i++) w.step(1 / 120);
  assert(w.x <= 1420);
  w.progress.lamps = ["lamp1", "lamp2"];
  for (let i = 0; i < 100; i++) w.step(1 / 120);
  assert(w.x > 1430);
  w.x = 2520;
  for (let i = 0; i < 100; i++) w.step(1 / 120);
  assert(w.x <= 2540);
  w.progress.riddle = true;
  for (let i = 0; i < 100; i++) w.step(1 / 120);
  assert(w.x > 2550);
});
test("mission ordering and duplicate collection", () => {
  const p = freshProgress();
  collect(p, "light1");
  assert.equal(p.lights.length, 0);
  p.guide = true;
  collect(p, "light1");
  collect(p, "light1");
  collect(p, "lamp1");
  assert.equal(p.lights.length, 1);
  assert.equal(p.lamps.length, 0);
  collect(p, "light2");
  collect(p, "light3");
  collect(p, "lamp1");
  collect(p, "lamp2");
  assert.equal(p.lamps.length, 2);
});
test("save round trip and invalid imports leave original intact", () => {
  const s = newSave();
  assert.deepEqual(validateSave(JSON.parse(JSON.stringify(s))), s);
  for (const bad of [
    { ...s, schemaVersion: 2 },
    { ...s, checkpoint: Infinity },
    { ...s, tools: ["fe"] },
    { ...s, missions: { ...s.missions, complete: true } },
    { ...s, checkpoint: 3000 },
    { ...s, settings: { ...s.settings, music: NaN } },
    { ...s, missions: { ...s.missions, lights: ["fake"] } },
  ])
    assert.throws(() => validateSave(bad));
  assert.equal(s.missions.complete, false);
});
test("complete chapter persists faith and chapter two", () => {
  const s = newSave();
  s.missions = {
    guide: true,
    lights: ["light1", "light2", "light3"],
    lamps: ["lamp1", "lamp2"],
    traveler: true,
    riddle: true,
    complete: true,
  };
  s.tools = ["fe"];
  s.unlockedChapters = [1, 2];
  s.checkpoint = 3010;
  assert.deepEqual(validateSave(JSON.parse(JSON.stringify(s))), s);
});
test("restoring an elevated checkpoint places the player on its support", () => {
  const w = new World();
  w.restore(680);
  assert.equal(w.y, 160);
  w.step(1 / 120);
  assert.equal(w.y, 160);
  assert(w.grounded);
});
test("lights collect by proximity without interaction and emit exactly one event", () => {
  const w = new World();
  w.restore(440);
  w.step(1 / 120);
  assert.equal(w.progress.lights.length, 0);
  w.progress.guide = true;
  w.step(1 / 120);
  assert.deepEqual(w.progress.lights, ["light1"]);
  assert.equal(w.drainPickups()[0].id, "light1");
  for (let i = 0; i < 100; i++) w.step(1 / 120);
  assert.equal(w.drainPickups().length, 0);
  assert.equal(w.progress.lights.length, 1);
  w.x = 680;
  w.y = 226;
  w.step(1 / 120);
  assert.equal(w.progress.lights.length, 1);
  w.restore(680);
  w.step(1 / 120);
  assert.deepEqual(w.progress.lights, ["light1", "light2"]);
  assert.equal(w.drainPickups()[0].id, "light2");
  w.restore(895);
  w.step(1 / 120);
  assert.equal(w.progress.lights.length, 3);
  assert.equal(w.drainPickups()[0].id, "light3");
  assert.notEqual(w.nearby()?.kind, "light");
});
