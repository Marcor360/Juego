const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const { execFileSync } = require("node:child_process");
const assert = require("node:assert/strict");
const fixtures = JSON.parse(
  execFileSync(
    process.execPath,
    ["--experimental-strip-types", "tests/fixtures.ts"],
    { stdio: ["ignore", "pipe", "ignore"] },
  ),
);
(async () => {
  const b = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
  });
  try {
    const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
    await p.goto(process.env.GAME_URL || "http://127.0.0.1:8081");
    await p.waitForTimeout(1200);
    const original = {
      ...fixtures[15],
      unlockedChapters: [1, 2],
      missions: {
        ...fixtures[15].missions,
        completedMissions: [
          ...fixtures[15].missions.completedMissions,
          "CH1_16",
        ],
        lights: ["light1", "light2"],
      },
    };
    const chooser = p.waitForEvent("filechooser");
    await p
      .getByRole("button", { name: "↥ Cargar partida", exact: true })
      .click();
    await (
      await chooser
    ).setFiles({
      name: "complete.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(original)),
    });
    await p.waitForTimeout(300);
    const click = async (name) => {
      await p.getByRole("button", { name, exact: true }).click();
    };
    await click("Pausa");
    await click("Guardar y volver al inicio");
    const before = await p.evaluate(() =>
      localStorage.getItem("precursora-save-v2"),
    );
    await click("▶ Comenzar aventura");
    await click("Repetir capítulo");
    await p.waitForTimeout(300);
    await click("Pausa");
    await click("Guardar y volver al inicio");
    assert.equal(
      await p.evaluate(() => localStorage.getItem("precursora-save-v2")),
      before,
    );
    await click("▤ Continuar");
    await p.waitForTimeout(300);
    assert(
      await p
        .getByText("Capítulo completado · La biblioteca te espera", {
          exact: true,
        })
        .isVisible(),
    );
    await click("Pausa");
    await click("Guardar y volver al inicio");
    const after = await p.evaluate(() =>
      JSON.parse(localStorage.getItem("precursora-save-v2")),
    );
    assert.equal(after.missions.completedMissions.length, 16);
    assert.deepEqual(after.missions.lights, ["light1", "light2"]);
    assert.deepEqual(after.tools, ["fe"]);
    console.log(
      "replay preserves main save and continue restores original completed progress",
    );
  } finally {
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
