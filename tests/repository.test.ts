import { test } from "node:test";
import assert from "node:assert/strict";
import { createSaveRepository, SAVE_KEYS } from "../game/save/repository.ts";
import { newSave } from "../game/save/schema.ts";
const data = (health = 3) => JSON.stringify({ ...newSave(), health });
const legacy = () =>
  JSON.stringify({
    schemaVersion: 1,
    gameId: "precursora",
    level: 1,
    checkpoint: 65,
    missions: {
      guide: false,
      lights: [],
      lamps: [],
      traveler: false,
      riddle: false,
      complete: false,
    },
    tools: [],
    unlockedChapters: [1],
    settings: newSave().settings,
  });
function memory(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial)),
    failReads = new Set<string>(),
    failWrites = new Set<string>();
  return {
    values,
    failReads,
    failWrites,
    getItem: async (key: string) => {
      if (failReads.has(key)) throw Error("read failed");
      return values.get(key) ?? null;
    },
    setItem: async (key: string, value: string) => {
      if (failWrites.has(key)) throw Error("write failed");
      values.set(key, value);
    },
  };
}
test("repository reads the current save without touching valid data", async () => {
  const storage = memory({ [SAVE_KEYS.current]: data(2) }),
    repo = createSaveRepository(storage);
  const loaded = await repo.load();
  assert.equal(loaded.source, "current");
  assert.equal(loaded.save?.health, 2);
  assert.equal(storage.values.size, 1);
  assert.equal(loaded.notice, "");
});
test("corrupt current saves are preserved before falling back to legacy", async () => {
  const storage = memory({
      [SAVE_KEYS.current]: "broken JSON",
      [SAVE_KEYS.legacy]: legacy(),
    }),
    repo = createSaveRepository(storage);
  const loaded = await repo.load();
  assert.equal(loaded.source, "legacy");
  assert.equal(storage.values.get(SAVE_KEYS.recovery), "broken JSON");
  assert.equal(storage.values.get(SAVE_KEYS.current), "broken JSON");
  assert.equal(loaded.save?.migratedFrom, 1);
  assert(loaded.notice);
});
test("an unreadable current key does not hide an independently readable legacy save", async () => {
  const storage = memory({
    [SAVE_KEYS.current]: data(),
    [SAVE_KEYS.legacy]: legacy(),
  });
  storage.failReads.add(SAVE_KEYS.current);
  const loaded = await createSaveRepository(storage).load();
  assert.equal(loaded.source, "legacy");
  assert.match(loaded.notice, /leer/);
  assert.equal(storage.values.get(SAVE_KEYS.current), data());
});
test("the last valid v2 snapshot takes precedence over an older v1 save", async () => {
  const storage = memory({
    [SAVE_KEYS.current]: "damaged",
    [SAVE_KEYS.lastGood]: data(2),
    [SAVE_KEYS.legacy]: legacy(),
  });
  const loaded = await createSaveRepository(storage).load();
  assert.equal(loaded.source, "backup");
  assert.equal(loaded.save?.health, 2);
  assert.equal(loaded.save?.migratedFrom, null);
});
test("multiple damaged candidates are retained without replacing the first recovery copy", async () => {
  const storage = memory({
      [SAVE_KEYS.current]: "second damage",
      [SAVE_KEYS.recovery]: "first damage",
    }),
    repo = createSaveRepository(storage);
  const loaded = await repo.load();
  assert.equal(loaded.source, "none");
  await repo.store(newSave());
  assert.equal(storage.values.get(SAVE_KEYS.recovery), "first damage");
  assert(
    [...storage.values.entries()].some(
      ([key, value]) =>
        key.startsWith(SAVE_KEYS.damagedPrefix) && value === "second damage",
    ),
  );
  assert.equal(storage.values.get(SAVE_KEYS.current), data());
});
test("a failed recovery copy prevents replacing corrupt data, even after legacy recovery", async () => {
  const storage = memory({
    [SAVE_KEYS.current]: "damaged",
    [SAVE_KEYS.legacy]: legacy(),
  });
  storage.failWrites.add(SAVE_KEYS.recovery);
  const repo = createSaveRepository(storage),
    loaded = await repo.load();
  assert.equal(loaded.source, "legacy");
  assert.match(loaded.notice, /No se pudo crear/);
  await assert.rejects(repo.store(newSave()), /No se pudo respaldar/);
  assert.equal(storage.values.get(SAVE_KEYS.current), "damaged");
  assert.equal(storage.values.get(SAVE_KEYS.legacy), legacy());
});
test("an unreadable current save is never overwritten by a new session", async () => {
  const storage = memory({ [SAVE_KEYS.current]: data(2) });
  storage.failReads.add(SAVE_KEYS.current);
  await assert.rejects(
    createSaveRepository(storage).store(newSave()),
    /No se pudo leer/,
  );
  assert.equal(storage.values.get(SAVE_KEYS.current), data(2));
});
test("writes retain the immediately preceding valid save for later recovery", async () => {
  const storage = memory({ [SAVE_KEYS.current]: data(3) }),
    repo = createSaveRepository(storage);
  await repo.store({ ...newSave(), health: 2 });
  assert.equal(storage.values.get(SAVE_KEYS.lastGood), data(3));
  storage.values.set(SAVE_KEYS.current, "broken after write");
  assert.equal((await repo.load()).save?.health, 3);
});
test("a failed last-good backup does not overwrite an existing valid save", async () => {
  const storage = memory({ [SAVE_KEYS.current]: data(2) });
  storage.failWrites.add(SAVE_KEYS.lastGood);
  await assert.rejects(
    createSaveRepository(storage).store(newSave()),
    /No se pudo respaldar/,
  );
  assert.equal(storage.values.get(SAVE_KEYS.current), data(2));
});
test("the serialized queue can retry after a storage failure without dropping new progress", async () => {
  const storage = memory({ [SAVE_KEYS.current]: data(3) }),
    repo = createSaveRepository(storage);
  storage.failWrites.add(SAVE_KEYS.current);
  await assert.rejects(repo.store({ ...newSave(), health: 2 }));
  storage.failWrites.clear();
  await Promise.all([
    repo.store({ ...newSave(), health: 2 }),
    repo.store({ ...newSave(), health: 1 }),
  ]);
  assert.equal(storage.values.get(SAVE_KEYS.current), data(1));
  assert.equal(storage.values.get(SAVE_KEYS.lastGood), data(2));
});
test("replacing an unreadable last-good candidate archives it first", async () => {
  const storage = memory({
      [SAVE_KEYS.current]: data(3),
      [SAVE_KEYS.lastGood]: "damaged previous backup",
    }),
    repo = createSaveRepository(storage);
  await repo.store({ ...newSave(), health: 2 });
  assert.equal(
    storage.values.get(SAVE_KEYS.recovery),
    "damaged previous backup",
  );
  assert.equal(storage.values.get(SAVE_KEYS.lastGood), data(3));
});
