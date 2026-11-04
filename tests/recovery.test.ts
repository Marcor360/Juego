import { test } from "node:test";
import assert from "node:assert/strict";
import { decodeStoredSave } from "../game/save/recovery.ts";
import { newSave } from "../game/save/schema.ts";

test("recovery accepts a valid current save without changing its progress", () => {
  const save = newSave();
  save.health = 2;
  assert.deepEqual(decodeStoredSave(JSON.stringify(save)), save);
});

test("recovery safely rejects malformed and incompatible candidates", () => {
  assert.equal(decodeStoredSave(null), null);
  assert.equal(decodeStoredSave("not-json"), null);
  assert.equal(decodeStoredSave("{}"), null);
  assert.equal(
    decodeStoredSave(JSON.stringify({ ...newSave(), health: -1 })),
    null,
  );
});

test("recovery can decode legacy data when a current save is unavailable", () => {
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
  const restored = decodeStoredSave(JSON.stringify(old));
  assert.equal(restored?.migratedFrom, 1);
  assert.deepEqual(restored?.tools, ["fe"]);
  assert.deepEqual(restored?.unlockedChapters, [1, 2]);
});
