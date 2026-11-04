import { URL } from "node:url";
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const manifest = JSON.parse(
  readFileSync(new URL("../manifest.json", import.meta.url), "utf8"),
);
test("all supplied sheets match their manifest dimensions and frame counts", () => {
  for (const a of Object.values(manifest.animations) as any[]) {
    const png = readFileSync(new URL("../" + a.sheet, import.meta.url));
    assert.equal(png.readUInt32BE(16), a.frameWidth * a.framesCount, a.sheet);
    assert.equal(png.readUInt32BE(20), a.frameHeight, a.sheet);
    assert.equal(a.frames.length, a.framesCount);
    for (const frame of a.frames) {
      const f = readFileSync(new URL("../" + frame, import.meta.url));
      assert.equal(f.readUInt32BE(16), a.frameWidth);
      assert.equal(f.readUInt32BE(20), a.frameHeight);
    }
  }
});
