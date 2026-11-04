import { test } from "node:test";
import assert from "node:assert/strict";
import { World } from "../game/engine/world.ts";
import {
  freshProgress,
  finishMission,
  prerequisites,
  evidenceIds,
  itemIds,
  hasMission,
} from "../game/missions/progress.ts";
import { newSave, validateSave } from "../game/save/schema.ts";
import {
  platforms,
  platformAt,
  gaps,
  activePlatforms,
  objects,
} from "../game/levels/forest.ts";
import {
  scenes,
  getScene,
  evaluateStage,
  shuffled,
} from "../game/chapter1/challenges.ts";
function progressTo(n: number) {
  const p = freshProgress();
  p.tutorial = { walk: true, jump: true, journal: true, interact: true };
  p.evidence = [...evidenceIds];
  p.items = [...itemIds];
  for (let i = 1; i <= n; i++) {
    if (i === 12) p.worldFlags.noReturn = true;
    finishMission(p, i);
  }
  return p;
}
function tick(w: World, n: number) {
  for (let i = 0; i < n; i++) w.step(1 / 60);
}
test("16 scenes require sequential progress and observed evidence, not only dialogue", () => {
  const p = freshProgress();
  assert.throws(() => finishMission(p, 2));
  assert.throws(() => finishMission(p, 1));
  p.tutorial = { walk: true, jump: true, journal: true, interact: true };
  finishMission(p, 1);
  finishMission(p, 2);
  assert(prerequisites(p, 3).length === 3);
  assert.throws(() => finishMission(p, 3));
  assert.equal(progressTo(16).completedMissions.length, 16);
});
test("movement, jumping, collisions and automatic collection operate in simulation", () => {
  const w = new World();
  w.input.right = true;
  tick(w, 35);
  assert(w.x > 180);
  assert(w.progress.tutorial.walk);
  w.input.jump = true;
  tick(w, 10);
  assert(w.y < 226);
  assert(w.progress.tutorial.jump);
  tick(w, 100);
  assert(w.x <= 380 - 9 || w.y <= 204);
  const p = progressTo(2);
  w.progress = p;
  w.restore(1280);
  w.y = 162;
  w.input.right = true;
  tick(w, 12);
  assert(w.progress.evidence.includes("rock_mark"));
  const count = w.progress.evidence.length;
  tick(w, 20);
  assert.equal(w.progress.evidence.length, count);
});
test("falls consume hearts, invulnerability prevents double damage and exhaustion keeps story", () => {
  const w = new World();
  w.progress = progressTo(5);
  w.checkpoint = "ch1_arroyo";
  w.restore(2440);
  w.damage("fall");
  assert.equal(w.health, 2);
  w.damage("fall");
  assert.equal(w.health, 2);
  w.invulnerable = 0;
  w.damage("fall");
  w.invulnerable = 0;
  w.damage("fall");
  assert.equal(w.health, 3);
  assert.equal(w.x, 2440);
  assert(hasMission(w.progress, 5));
  assert(w.progress.items.includes("lever"));
});
test("moving supports carry riders, and cooperative support unlocks only after listening", () => {
  const w = new World();
  w.progress = progressTo(11);
  w.enterMist();
  const r = platforms.find((p) => p.id === "mist_move1")!;
  w.x = r.x + 25;
  w.y = 155;
  w.vy = 20;
  tick(w, 20);
  assert(w.grounded);
  const before = w.x;
  tick(w, 10);
  assert.notEqual(w.x, before);
  assert(!activePlatforms(progressTo(6)).some((p) => p.kind === "rope"));
  assert(activePlatforms(progressTo(7)).some((p) => p.kind === "rope"));
});
test("mist requires informed confirmation and prohibits walking back afterwards", () => {
  const w = new World();
  assert.throws(() => w.enterMist());
  w.progress = progressTo(11);
  w.enterMist();
  w.input.left = true;
  tick(w, 100);
  assert(w.x >= 5112);
  assert.equal(w.checkpoint, "ch1_niebla");
});
test("all staged challenges reject guesses, accept coherent alternative references and shuffle independently", () => {
  const p = progressTo(2);
  for (const scene of scenes) {
    const history: string[][] = [];
    for (const stage of scene.stages) {
      p.items = [...itemIds];
      p.evidence = [...evidenceIds];
      const answer =
        stage.byAnswer?.[history[0]?.[0]] ??
        (stage.kind === "reflect"
          ? [stage.options[0].id]
          : stage.answers.slice(0, stage.kind === "choice" ? 1 : undefined));
      assert(
        evaluateStage(stage, answer, history, p),
        `${scene.number}: ${stage.prompt}`,
      );
      assert(!evaluateStage(stage, [], history, p));
      history.push(answer);
    }
  }
  const stage = getScene(8).stages[1];
  assert(evaluateStage(stage, ["check"], [["prudence"]], p));
  assert(!evaluateStage(stage, ["ask"], [["prudence"]], p));
  const order = getScene(13).stages[0];
  assert(order.options.length > order.answers.length);
  const en = order.answers.filter(
    (id) => order.options.find((o) => o.id === id)?.text === "en",
  );
  if (en.length === 2) {
    const answer = order.answers.map((id) =>
      id === en[0] ? en[1] : id === en[1] ? en[0] : id,
    );
    assert(evaluateStage(order, answer, [], p));
  }
  assert.notDeepEqual(
    shuffled([1, 2, 3, 4], () => 0),
    [1, 2, 3, 4],
  );
});
test("save v2 round trips, rejects blocked checkpoints, missing evidence, invalid hearts and early rewards", () => {
  const s = newSave();
  assert.deepEqual(validateSave(s), s);
  for (const mutate of [
    (s: any) => (s.health = 0),
    (s: any) => (s.position = 7900),
    (s: any) => (s.checkpoint = "ch1_niebla"),
    (s: any) => (s.tools = ["fe"]),
    (s: any) => (s.missions.completedMissions = ["CH1_02"]),
  ]) {
    const bad = structuredClone(s);
    mutate(bad);
    assert.throws(() => validateSave(bad));
  }
  const mid = {
    ...newSave(),
    missions: progressTo(11),
    position: 4500,
    checkpoint: "ch1_claro" as const,
  };
  assert.deepEqual(validateSave(mid), mid);
  mid.missions.evidence = mid.missions.evidence.filter(
    (id) => id !== "storm_notice",
  );
  assert.throws(() => validateSave(mid));
});
test("legacy migration preserves earned tools, never pretends new scenes were completed", () => {
  const old = {
    schemaVersion: 1,
    gameId: "precursora",
    level: 1,
    checkpoint: 3010,
    missions: {
      guide: true,
      lights: ["light1", "light2", "light3"],
      lamps: ["lamp1", "lamp2"],
      traveler: true,
      riddle: true,
      complete: true,
    },
    tools: ["fe"],
    unlockedChapters: [1, 2],
    settings: newSave().settings,
  };
  const migrated = validateSave(old);
  assert.equal(migrated.schemaVersion, 2);
  assert.equal(migrated.position, 120);
  assert.deepEqual(migrated.missions.completedMissions, []);
  assert.deepEqual(migrated.tools, ["fe"]);
  assert.equal(migrated.migratedFrom, 1);
  assert.deepEqual(validateSave(migrated), migrated);
});

test("coyote time allows a late edge jump and the landing buffer starts the next jump", () => {
  const w = new World();
  w.progress = progressTo(5);
  w.restore(1406);
  w.input.right = true;
  tick(w, 5);
  assert(!w.grounded);
  w.input.jump = true;
  w.step(1 / 60);
  assert(w.vy < 0, "edge grace must permit jumping after leaving the ground");
  const landing = new World();
  landing.y = 210;
  landing.vy = 140;
  landing.grounded = false;
  while (landing.y < 220) landing.step(1 / 120);
  landing.input.jump = true;
  tick(landing, 8);
  assert(landing.vy < 0, "jump pressed just before landing must be buffered");
});
test("real water falls and raised roots cause physical damage without erasing observations", () => {
  const w = new World();
  w.progress = progressTo(11);
  w.enterMist();
  const evidence = [...w.progress.evidence];
  w.x = 5350;
  w.y = 320;
  w.step(1 / 60);
  assert.equal(w.health, 2);
  assert(w.x >= 5112);
  assert.deepEqual(w.progress.evidence, evidence);
  w.invulnerable = 0;
  w.x = 6174;
  w.y = 226;
  w.grounded = true;
  w.step(1 / 60);
  assert.equal(w.health, 1);
  assert.deepEqual(w.progress.evidence, evidence);
});

test("every mandatory clue and repair material can be collected from its actual support", () => {
  for (const o of objects.filter(
    (o) => o.kind === "evidence" || o.kind === "item",
  )) {
    const w = new World();
    w.progress = progressTo(11);
    if (o.kind === "item")
      w.progress.items = w.progress.items.filter((id) => id !== o.id);
    else w.progress.evidence = w.progress.evidence.filter((id) => id !== o.id);
    w.restore(o.x);
    w.step(1 / 120);
    assert(
      (o.kind === "item" ? w.progress.items : w.progress.evidence).includes(
        o.id,
      ),
      o.id + " must be reachable at the visible support height",
    );
  }
});

test("the supply chest has a solid body while remaining reachable for interaction", () => {
  const w = new World();
  w.progress = progressTo(14);
  w.restore(7580);
  w.input.right = true;
  tick(w, 60);
  assert.equal(w.x, 7594);
  assert.equal(w.nearby()?.id, "chest");
  w.input.jump = true;
  tick(w, 50);
  assert(w.x > 7620, "the opened route can be crossed with a normal jump");
});
