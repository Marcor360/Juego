const fs = require("node:fs");
fs.mkdirSync("public", { recursive: true });
fs.copyFileSync(
  require.resolve("canvaskit-wasm/bin/full/canvaskit.wasm"),
  "public/canvaskit.wasm",
);
