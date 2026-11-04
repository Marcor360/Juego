const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const { execFileSync } = require("node:child_process");
const assert = require("node:assert/strict");
const fixtures = JSON.parse(
  execFileSync(
    process.execPath,
    ["--experimental-strip-types", "tests/fixtures.ts"],
    { stdio: ["ignore", "pipe", "ignore"] },
  ).toString(),
);
(async () => {
  const b = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
  });
  try {
    for (const viewport of [
      { width: 1280, height: 720 },
      { width: 812, height: 375 },
      { width: 667, height: 375 },
      { width: 390, height: 844 },
    ]) {
      const p = await b.newPage({ viewport });
      const errors = [];
      p.on("pageerror", (e) => errors.push(e.message));
      await p.goto(process.env.GAME_URL || "http://127.0.0.1:8081");
      await p.waitForTimeout(1000);
      const chooser = p.waitForEvent("filechooser");
      await p
        .getByRole("button", { name: "↥ Cargar partida", exact: true })
        .click();
      await (
        await chooser
      ).setFiles({
        name: "v3.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify(fixtures[11])),
      });
      await p.waitForTimeout(1200);
      assert((await p.locator("canvas").count()) > 0);
      await p.getByRole("button", { name: "▤ Cuaderno", exact: true }).click();
      await p.getByRole("button", { name: "Mapa", exact: true }).click();
      await p.screenshot({ path: `/tmp/v3-map-${viewport.width}.png` });
      await p.getByRole("button", { name: "Volver", exact: true }).click();
      await p.screenshot({ path: `/tmp/v3-forest-${viewport.width}.png` });
      assert(
        !(await p
          .getByText("No se pudo preparar el paisaje.", { exact: true })
          .count()),
      );
      assert.deepEqual(errors, []);
      console.log("graphics", viewport, "ok");
      await p.close();
    }
  } finally {
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
