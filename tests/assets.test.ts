import { URL } from "node:url";
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

test("all runtime image imports resolve and obsolete sprite packs stay removed", () => {
  for (const file of ["Scene", "AnimatedCharacter", "ForestProps", "Portrait", "ItemArt", "MainMenu", "PlaceAtmosphere", "Illustration", "WorldDecor", "LibraryChapter", "WaterfallOverlay"]) {
    const source = readFileSync(new URL(`../components/${file}.tsx`, import.meta.url), "utf8");
    for (const match of source.matchAll(/require\("(\.\.\/assets\/[^"]+)"\)/g)) {
      assert(existsSync(new URL("../components/" + match[1], import.meta.url)), match[1]);
    }
  }
  for (const path of ["assets/frames", "assets/sheets", "manifest.json", "assets/sounds/ambient.wav", "assets/sounds/step.wav"]) {
    assert(!existsSync(new URL("../" + path, import.meta.url)), path);
  }
});
