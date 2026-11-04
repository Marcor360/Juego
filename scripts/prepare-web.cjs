const fs = require("node:fs");
const path = require("node:path");
const wasm = require.resolve("canvaskit-wasm/bin/full/canvaskit.wasm");
const version = require("canvaskit-wasm/package.json").version;
fs.mkdirSync("public", { recursive: true });
// A versioned name prevents an older browser-cached WASM from being paired with
// a newer CanvasKit JavaScript runtime after npm ci or a deployment.
fs.copyFileSync(wasm, path.join("public", `canvaskit-${version}.wasm`));
