import test from "node:test";
import assert from "node:assert/strict";
import { LibraryWorld } from "../game/chapter2/engine/world.ts";
import {
  rooms,
  roomIds,
  isWalkable,
  sceneTargets,
} from "../game/chapter2/maps/library.ts";
import {
  freshLibrary,
  validateLibrary,
  completeLibraryScene,
  getAttempt,
  questionsFor,
  missingFor,
  addFlag,
  scene,
  ch2id,
} from "../game/chapter2/state.ts";
import {
  newBookAttempt,
  swapBooks,
  tickBooks,
  countCorrect,
  bookIds,
  validateBookAttempt,
  limits,
} from "../game/chapter2/puzzles.ts";
import {
  createAttempt,
  acceptAnswer,
  validateAttempt,
} from "../game/questions.ts";
import { withLibrary } from "../game/chapter2/campaign.ts";
import { newSave, validateSave } from "../game/save/schema.ts";
function walkComponent(id: (typeof roomIds)[number]) {
  const r = rooms[id],
    size = 8,
    visited = new Set<string>(),
    queue: { x: number; y: number }[] = [];
  const start = r.doors[0];
  queue.push({
    x: Math.round(start.x / size) * size,
    y: Math.round(start.y / size) * size,
  });
  for (let i = 0; i < queue.length; i++) {
    const p = queue[i],
      key = p.x + "," + p.y;
    if (visited.has(key) || !isWalkable(r, p.x, p.y)) continue;
    visited.add(key);
    for (const [dx, dy] of [
      [size, 0],
      [-size, 0],
      [0, size],
      [0, -size],
    ]) {
      const x = p.x + dx,
        y = p.y + dy;
      if (!visited.has(x + "," + y) && isWalkable(r, x, y))
        queue.push({ x, y });
    }
  }
  return [...visited].map((key) => key.split(",").map(Number));
}
test("library rooms have reachable doors, documents and story actors, with safe arrival positions", () => {
  for (const id of roomIds) {
    const r = rooms[id],
      reachable = walkComponent(id);
    assert.ok(reachable.length > 20, id);
    for (const p of [...r.interactions, ...r.doors])
      assert.ok(
        reachable.some(([x, y]) => Math.hypot(x - p.x, y - p.y) < 32),
        `${id}:${p.id} inaccessible`,
      );
    for (const d of r.doors)
      assert.ok(
        !rooms[d.to].actors.some(
          (a) => Math.hypot(a.x - d.spawn.x, a.y - d.spawn.y) < 20,
        ),
        `${d.id} arrives on an NPC`,
      );
    for (const d of r.doors)
      assert.ok(
        isWalkable(rooms[d.to], d.spawn.x, d.spawn.y),
        `${d.id} unsafe spawn`,
      );
    for (const a of r.actors)
      assert.ok(isWalkable(r, a.x, a.y, 7), `${id}:${a.id} initial collision`);
  }
});
test("ambient walking paths are collision free and do not occupy a door", () => {
  for (const r of Object.values(rooms))
    for (const a of r.actors.filter((a) => a.path)) {
      for (let i = 0; i < a.path!.length; i++) {
        const p = a.path![i],
          q = a.path![(i + 1) % a.path!.length];
        for (let f = 0; f <= 1; f += 0.02) {
          const x = p.x + (q.x - p.x) * f,
            y = p.y + (q.y - p.y) * f;
          assert.ok(
            isWalkable(r, x, y, 7),
            `${r.id}:${a.id} blocked route at ${x},${y}`,
          );
          assert.ok(
            !r.doors.some((d) => Math.hypot(d.x - x, d.y - y) < 20),
            `${a.id} walks through doorway`,
          );
        }
      }
    }
});
test("RPG movement normalizes diagonals, collides at ground footprints and preserves NPC routines", () => {
  const a = new LibraryWorld(),
    b = new LibraryWorld();
  a.input.down = true;
  b.input.down = true;
  b.input.right = true;
  const ax = a.state.x,
    ay = a.state.y,
    bx = b.state.x,
    by = b.state.y;
  for (let i = 0; i < 60; i++) {
    a.step(1 / 120);
    b.step(1 / 120);
  }
  assert.ok(
    Math.abs(
      Math.hypot(a.state.x - ax, a.state.y - ay) -
        Math.hypot(b.state.x - bx, b.state.y - by),
    ) < 0.01,
  );
  a.restore("vestibule", 290, 310);
  a.input.up = true;
  for (let i = 0; i < 200; i++) a.step(1 / 120);
  assert.ok(a.state.y >= 294);
  const w = new LibraryWorld();
  for (let i = 0; i < 400; i++) w.step(1 / 120);
  const npc = w.actors.find((a) => a.id === "patio_walk1")!;
  assert.notEqual(npc.x, 220);
  const snapshot = w.snapshot(),
    restored = new LibraryWorld(snapshot);
  assert.equal(restored.actors.find((a) => a.id === npc.id)!.x, npc.x);
  assert.deepEqual(validateLibrary(snapshot), snapshot);
});
test("all sixteen scenes require their world actions and persisted randomized research", () => {
  const s = freshLibrary();
  for (let n = 1; n <= 16; n++) {
    assert.throws(() => completeLibraryScene(s, n + 1));
    for (const flag of missingFor(s, n)) addFlag(s, flag);
    if (questionsFor(n).length) {
      const a = getAttempt(s, n),
        questions = questionsFor(n);
      assert.deepEqual(getAttempt(s, n), a);
      while (!a.finished) {
        const q = questions.find((q) => q.id === a.questionIds[a.step])!;
        a.selected = q.kind === "reflect" ? [q.options[1].id] : [...q.answer];
        assert.equal(acceptAnswer(a, questions), true);
      }
      validateAttempt(a, questions);
    }
    if (n === 16) {
      s.board = newBookAttempt("easy", 431);
      s.board.status = "running";
      for (let i = 0; i < 66; i++)
        if (s.board.board[i] !== bookIds[i])
          swapBooks(s.board, i, s.board.board.indexOf(bookIds[i]));
    }
    completeLibraryScene(s, n);
    assert.doesNotThrow(() => validateLibrary(s));
  }
  assert.equal(s.completed.length, 16);
  assert.equal(s.board?.status, "won");
  assert.equal(s.checkpoint, "great");
});
test("66-book board shuffles every book, persists real remaining time and wins only by legal swaps", () => {
  for (const d of ["easy", "medium", "hard"] as const) {
    const a = newBookAttempt(d, 42);
    assert.equal(new Set(a.board).size, 66);
    assert.equal(countCorrect(a.board), 0);
    assert.equal(swapBooks(a, 0, 1), false);
    a.status = "running";
    tickBooks(a, 17.25);
    a.status = "paused";
    tickBooks(a, 70);
    assert.equal(a.remaining, limits[d] - 17.25);
    const b = validateBookAttempt(JSON.parse(JSON.stringify(a)));
    assert.deepEqual(b, a);
    b.status = "running";
    for (let i = 0; i < 66; i++)
      if (b.board[i] !== bookIds[i])
        assert.equal(swapBooks(b, i, b.board.indexOf(bookIds[i])), true);
    assert.equal(b.status, "won");
    assert.equal(countCorrect(b.board), 66);
    assert.ok(b.swaps > 30);
    assert.doesNotThrow(() => validateBookAttempt(b));
  }
  const a = newBookAttempt("hard");
  a.status = "running";
  tickBooks(a, 181);
  assert.equal(a.status, "timeout");
  assert.equal(swapBooks(a, 1, 2), false);
});
test("campaign migration preserves Chapter 1 and rejects fabricated tools, rooms, hearts, questions and book clocks", () => {
  const legacy = {
      ...newSave(),
      legacyRewards: true,
      migratedFrom: 1 as const,
      tools: ["fe"],
      unlockedChapters: [1, 2],
    },
    s = withLibrary(legacy);
  assert.deepEqual(validateSave(s), s);
  assert.deepEqual(s.missions, legacy.missions);
  assert.equal(s.settings.music, legacy.settings.music);
  for (const mutate of [
    (s: any) => s.tools.push("conocimiento"),
    (s: any) => (s.library.room = "great"),
    (s: any) => (s.library.health = 4),
    (s: any) => (s.library.direction = "wrong"),
    (s: any) => s.library.completed.push("CH2_16"),
    (s: any) => (s.library.actorMemory.fake = { x: 0, y: 0 }),
  ]) {
    const bad = JSON.parse(JSON.stringify(s));
    mutate(bad);
    assert.throws(() => validateSave(bad));
  }
  const board = newBookAttempt("easy");
  assert.throws(() => validateBookAttempt({ ...board, remaining: 22 }));
  assert.throws(() =>
    validateBookAttempt({ ...board, board: board.board.map(() => bookIds[0]) }),
  );
});
test("story question selection persists without position clues or accepted answer duplication", () => {
  for (let n = 1; n <= 16; n++) {
    const questions = questionsFor(n);
    if (!questions.length) continue;
    const a = createAttempt(questions, 351),
      copy = validateAttempt(JSON.parse(JSON.stringify(a)), questions);
    assert.deepEqual(copy, a);
    const q = questions.find((q) => q.id === a.questionIds[0])!;
    a.selected = ["not_an_option"];
    assert.equal(acceptAnswer(a, questions), false);
    assert.throws(() => validateAttempt(a, questions));
  }
  assert.equal(
    scene(16).closing.some((d) =>
      d.text.toLowerCase().includes("conocimiento"),
    ),
    true,
  );
});

test("canonical board contains exactly 39 Hebrew and 27 Greek books with unique abbreviations", async () => {
  const { books } = await import("../game/chapter2/puzzles.ts");
  assert.equal(books.length, 66);
  assert.equal(books.filter((b) => b.section === "hebrew").length, 39);
  assert.equal(books.filter((b) => b.section === "greek").length, 27);
  assert.equal(new Set(books.map((b) => b.abbreviation)).size, 66);
  assert.equal(books[0].name, "Génesis");
  assert.equal(books[38].name, "Malaquías");
  assert.equal(books[39].name, "Mateo");
  assert.equal(books[65].name, "Apocalipsis");
});
test("physical damage preserves research while restoring hearts at a valid checkpoint", () => {
  const w = new LibraryWorld();
  w.flag("welcome_sign");
  w.damage();
  assert.equal(w.state.health, 2);
  w.damage();
  assert.equal(w.state.health, 2);
  w.invulnerable = 0;
  w.damage();
  w.invulnerable = 0;
  w.damage();
  assert.equal(w.state.health, 3);
  assert.equal(w.state.room, "vestibule");
  assert.ok(w.state.flags.includes("welcome_sign"));
  assert.doesNotThrow(() => validateLibrary(w.snapshot()));
});
test("door requirements are checked in simulation and stair/elevator destinations change floors", () => {
  const w = new LibraryWorld();
  w.restore("vestibule", 580, 240);
  assert.throws(() => w.enter("to_catalogue"));
  const s = freshLibrary();
  for (let n = 1; n <= 3; n++) {
    for (const f of missingFor(s, n)) addFlag(s, f);
    if (questionsFor(n).length) {
      const a = getAttempt(s, n),
        qs = questionsFor(n);
      while (!a.finished) {
        const q = qs.find((q) => q.id === a.questionIds[a.step])!;
        a.selected = q.answer;
        acceptAnswer(a, qs);
      }
    }
    completeLibraryScene(s, n);
  }
  const v = new LibraryWorld(s);
  v.restore("catalogue", 700, 180);
  v.enter("archive_stairs");
  assert.equal(v.state.floor, 1);
  assert.throws(() => v.enter("lift_down"));
  for (const id of ["mechanism_a", "mechanism_b", "acts_card", "book_lift"])
    v.activate(id);
  v.enter("lift_down");
  assert.equal(v.state.floor, 0);
  assert.equal(v.state.room, "catalogue");
});

test("library fixed stepping keeps movement speed and camera consistent at 5 through 120 FPS", async () => {
  const { FixedStepClock } = await import("../game/engine/ticker.ts");
  const samples = [];
  for (const fps of [5, 10, 30, 60, 120]) {
    const w = new LibraryWorld(),
      clock = new FixedStepClock();
    w.state.x = 320;
    w.state.y = 370;
    w.input.right = true;
    for (let i = 0; i < fps; i++) clock.advance(1 / fps, (dt) => w.step(dt));
    samples.push([w.state.x, w.cameraX]);
  }
  for (const sample of samples)
    for (let i = 0; i < 2; i++)
      assert.ok(Math.abs(sample[i] - samples[0][i]) < 0.001);
});

test("schema 3 uses the existing guarded repository and keeps a recoverable Chapter 1 snapshot", async () => {
  const { createSaveRepository, SAVE_KEYS } = await import(
    "../game/save/repository.ts"
  );
  const old = {
      ...newSave(),
      legacyRewards: true,
      migratedFrom: 1 as const,
      tools: ["fe"],
      unlockedChapters: [1, 2],
    },
    values = new Map([[SAVE_KEYS.current, JSON.stringify(old)]]),
    repository = createSaveRepository({
      getItem: async (key) =>
        values.get(key as typeof SAVE_KEYS.current) ?? null,
      setItem: async (key, value) => {
        values.set(key as typeof SAVE_KEYS.current, value);
      },
    });
  const campaign = withLibrary(old);
  campaign.library!.dialogues.CH2_01 = 2;
  await repository.store(campaign);
  assert.equal(
    JSON.parse(values.get(SAVE_KEYS.lastGood as typeof SAVE_KEYS.current)!)
      .schemaVersion,
    2,
  );
  const loaded = await repository.load();
  assert.equal(loaded.save!.library!.dialogues.CH2_01, 2);
  assert.deepEqual(loaded.save!.missions, old.missions);
  values.set(SAVE_KEYS.current, "broken campaign");
  const recovered = await repository.load();
  assert.equal(recovered.source, "backup");
  assert.equal(recovered.save!.schemaVersion, 2);
  assert.equal(recovered.save!.tools[0], "fe");
});

test("chapter 2 art uses real registered frames inside the actual PNG dimensions", async () => {
  const { readFileSync } = await import("node:fs");
  const { URL } = await import("node:url");
  const manifest = JSON.parse(
    readFileSync(
      new URL("../game/chapter2/art/manifest.json", import.meta.url),
      "utf8",
    ),
  );
  for (const [name, m] of Object.entries(manifest) as [string, any][]) {
    const png = readFileSync(
      new URL("../assets/chapter2/" + m.file, import.meta.url),
    );
    assert.equal(m.width, png.readUInt32BE(16), name);
    assert.equal(m.height, png.readUInt32BE(20), name);
    assert.equal(m.frames.length, m.columns * m.rows);
    for (const f of m.frames) {
      assert.ok(f.x >= 0 && f.y >= 0 && f.width > 0 && f.height > 0);
      assert.ok(f.x + f.width <= m.width && f.y + f.height <= m.height);
    }
  }
  assert.equal(manifest.hero.frames.length, 24);
  assert.equal(manifest.npcs.frames.length, 24);
  assert.equal(manifest.citizens.frames.length, 16);
  assert.equal(manifest.actions.frames.length, 9);
});
