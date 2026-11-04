const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fixture = (checkpoint, lights = [], lamps = []) => ({
  schemaVersion: 1,
  gameId: "precursora",
  level: 1,
  checkpoint,
  missions: {
    guide: true,
    lights,
    lamps,
    traveler: false,
    riddle: false,
    complete: false,
  },
  tools: [],
  unlockedChapters: [1],
  settings: { music: 0, effects: 0, reducedMotion: false },
});
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
  });
  try {
    for (const mobile of [false, true]) {
      const context = await browser.newContext({
        viewport: mobile
          ? { width: 667, height: 375 }
          : { width: 1280, height: 720 },
        hasTouch: mobile,
        isMobile: mobile,
      });
      const p = await context.newPage(),
        errors = [];
      p.on("pageerror", (e) => errors.push(e.message));
      const open = async (save) => {
        await p.goto(process.env.GAME_URL || "http://127.0.0.1:8081");
        await p
          .getByRole("button", { name: "↥ Cargar partida", exact: true })
          .waitFor({ timeout: 60000 });
        const chooser = p.waitForEvent("filechooser");
        await p
          .getByRole("button", { name: "↥ Cargar partida", exact: true })
          .click();
        await (
          await chooser
        ).setFiles({
          name: "checkpoint.json",
          mimeType: "application/json",
          buffer: Buffer.from(JSON.stringify(save)),
        });
      };
      const saved = () =>
        p.evaluate(() =>
          JSON.parse(localStorage.getItem("precursora-save-v1")),
        );
      await open(fixture(416));
      await p.waitForTimeout(800);
      if (mobile) {
        const point = await p
          .getByRole("button", { name: "▶", exact: true })
          .boundingBox();
        const cdp = await context.newCDPSession(p);
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchStart",
          touchPoints: [
            { x: point.x + point.width / 2, y: point.y + point.height / 2 },
          ],
        });
        await p.waitForTimeout(650);
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchEnd",
          touchPoints: [],
        });
      } else {
        await p.keyboard.down("d");
        await p.waitForTimeout(650);
        await p.keyboard.up("d");
      }
      await p.waitForFunction(
        () =>
          JSON.parse(localStorage.getItem("precursora-save-v1")).missions.lights
            .length === 1,
      );
      assert.deepEqual((await saved()).missions.lights, ["light1"]);
      assert.equal(
        await p.getByText("Seguir mi camino →", { exact: true }).count(),
        0,
      );
      await open(fixture(680, ["light1"]));
      await p.waitForFunction(
        () =>
          JSON.parse(localStorage.getItem("precursora-save-v1")).missions.lights
            .length === 2,
      );
      await open(fixture(895, ["light1", "light2"]));
      await p.waitForFunction(
        () =>
          JSON.parse(localStorage.getItem("precursora-save-v1")).missions.lights
            .length === 3,
      );
      await p.waitForTimeout(500);
      assert.equal((await saved()).missions.lights.length, 3);
      await open(
        fixture(1630, ["light1", "light2", "light3"], ["lamp1", "lamp2"]),
      );
      await p.waitForTimeout(700);
      await p.getByRole("button", { name: "E", exact: true }).click();
      await p.getByLabel("El viajero desanimado", { exact: true }).waitFor();
      await p
        .getByRole("button", {
          name: "Entiendo que tengas miedo. Podemos dar un paso juntos.",
          exact: true,
        })
        .click();
      await p.getByLabel("El viajero alegre", { exact: true }).waitFor();
      assert.equal(
        await p.getByLabel("La precursora", { exact: true }).count(),
        0,
      );
      await p.screenshot({
        path: `/tmp/precursora-v2-happy-${mobile ? "touch" : "desktop"}.png`,
      });
      await p
        .getByRole("button", { name: "Seguir mi camino →", exact: true })
        .click();
      await p.waitForTimeout(350);
      await p.screenshot({
        path: `/tmp/precursora-v2-world-${mobile ? "touch" : "desktop"}.png`,
      });
      await open(fixture(1410, ["light1", "light2", "light3"], ["lamp1"]));
      await p.waitForTimeout(700);
      await p.screenshot({
        path: `/tmp/precursora-v2-fog-${mobile ? "touch" : "desktop"}.png`,
      });
      await open(fixture(606, ["light1"]));
      await p.waitForTimeout(700);
      await p.screenshot({
        path: `/tmp/precursora-v2-platform-${mobile ? "touch" : "desktop"}.png`,
      });
      assert.deepEqual(errors, []);
      console.log(
        `PASS ${mobile ? "touch" : "desktop"}: automatic lights, vertical range, no collection modal, happy traveler portrait, scene states`,
      );
      await context.close();
    }
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
