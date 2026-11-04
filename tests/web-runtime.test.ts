import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { URL } from "node:url";
const require = createRequire(import.meta.url);
test("public versioned CanvasKit binary matches the installed JavaScript runtime", () => {
  const version = require("canvaskit-wasm/package.json").version;
  const installed = readFileSync(
    require.resolve("canvaskit-wasm/bin/full/canvaskit.wasm"),
  );
  const served = readFileSync(
    new URL(`../public/canvaskit-${version}.wasm`, import.meta.url),
  );
  assert.deepEqual([...served.subarray(0, 4)], [0, 97, 115, 109]);
  const digest = (buffer: Buffer) =>
    createHash("sha256").update(buffer).digest("hex");
  assert.equal(digest(served), digest(installed));
});
