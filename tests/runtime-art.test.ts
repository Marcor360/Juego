import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { URL } from "node:url";
function json(path: string) { return JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8")); }
test("optimized atlas geometry preserves original animation anchors and collision surfaces", () => {
  for (const name of ["art", "menu-art", "menu-formal-art"]) {
    const source = json(`../game/rendering/${name}.json`);
    const runtime = json(`../game/rendering/${name}-runtime.json`);
    const packs = name === "art" ? Object.keys(source) : ["menu"];
    for (const pack of packs) {
      const a = name === "art" ? source[pack] : source;
      const b = name === "art" ? runtime[pack] : runtime;
      assert.equal(b.width, Math.ceil(a.width / 2));
      assert.equal(b.height, Math.ceil(a.height / 2));
      assert.equal(b.referenceHeight, a.referenceHeight / 2);
      for (let i = 0; i < a.frames.length; i++) {
        for (const key of ["x", "y", "width", "height", "anchorX", "anchorY", "surfaceY"]) {
          if (a.frames[i][key] !== undefined) assert.equal(b.frames[i][key], a.frames[i][key] / 2, `${pack} ${i} ${key}`);
        }
        assert(b.frames[i].x + b.frames[i].width <= b.width);
        assert(b.frames[i].y + b.frames[i].height <= b.height);
      }
    }
  }
});
test("runtime resources reduce transfer size and decoded atlas memory", () => {
  const report = json("../game/rendering/asset-report.json");
  let source = 0, runtime = 0;
  for (const entry of report) {
    const bytes = readFileSync(new URL("../" + entry.runtime, import.meta.url));
    assert.equal(bytes.length, entry.runtimeBytes);
    assert.equal(statSync(new URL("../" + entry.source, import.meta.url)).size, entry.originalBytes);
    assert(entry.runtimeBytes < entry.originalBytes, entry.runtime);
    if (entry.runtime.endsWith(".png")) {
      assert.equal(bytes.readUInt32BE(16), entry.runtimeSize[0]);
      assert.equal(bytes.readUInt32BE(20), entry.runtimeSize[1]);
      assert(entry.decodedBytes < entry.originalSize[0] * entry.originalSize[1] * 4 * .26);
    } else assert.equal(bytes.toString("ascii", 8, 12), "WEBP");
    source += entry.originalBytes;
    runtime += entry.runtimeBytes;
  }
  assert(runtime < source * .2);
});
