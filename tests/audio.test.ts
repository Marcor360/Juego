import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { URL } from "node:url";
import { finishMission } from "../game/missions/progress.ts";
import { World } from "../game/engine/world.ts";
import { ambienceFor } from "../game/audio/context.ts";

test("audio follows the menu, world zones and library preview", () => {
  assert.equal(ambienceFor("menu", "La niebla", false), "menu");
  assert.equal(ambienceFor("chapters", "La niebla", true), "library");
  assert.equal(ambienceFor("play", "Entrada del bosque", false), "forest");
  assert.equal(ambienceFor("play", "El arroyo", false), "stream");
  assert.equal(ambienceFor("play", "El puente dañado", false), "bridge");
  assert.equal(ambienceFor("play", "El claro", false), "clearing");
  assert.equal(ambienceFor("play", "La niebla", false), "mist");
  assert.equal(ambienceFor("play", "El refugio", false), "refuge");
});
test("simulation emits one jump, one landing and no repetitive grounded landing sounds", () => {
  const world = new World();
  world.input.jump = true;
  for (let i = 0; i < 120; i++) world.step(1 / 120);
  const sounds = world.drainEvents().filter(event => event.type === "sound").map(event => event.sound);
  assert.equal(sounds.filter(sound => sound === "jump").length, 1);
  assert.equal(sounds.filter(sound => sound === "land").length, 1);
  for (let i = 0; i < 120; i++) world.step(1 / 120);
  assert.equal(world.drainEvents().filter(event => event.type === "sound").length, 0);
  world.restore(400);
  assert.equal(world.footstepSound, "step-stone");
  world.restore(120);
  assert.equal(world.footstepSound, "step-grass");
});
test("a fall whoosh occurs before damage and damage respects invulnerability", () => {
  const world = new World();
  world.progress.tutorial = { walk: true, jump: true, journal: true, interact: true };
  finishMission(world.progress, 1);
  finishMission(world.progress, 2);
  world.x = 1420;
  for (let i = 0; i < 90; i++) world.step(1 / 120);
  const sounds = world.drainEvents().filter(event => event.type === "sound").map(event => event.sound);
  assert.deepEqual(sounds, ["fall", "damage"]);
  world.damage("test");
  assert.equal(world.drainEvents().filter(event => event.type === "sound").length, 0);
});
test("all generated sounds exist, have audible content and stay below clipping", () => {
  const entries = JSON.parse(readFileSync(new URL("../assets/sounds/audio-manifest.json", import.meta.url), "utf8"));
  assert.equal(entries.filter((entry: any) => entry.file.endsWith(".mp3")).length, 8);
  for (const entry of entries) {
    assert(entry.peak < .83 && entry.rms > .001, entry.name);
    assert.equal(statSync(new URL("../assets/sounds/" + entry.file, import.meta.url)).size, entry.bytes);
  }
});
