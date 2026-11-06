const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const { execFileSync } = require("node:child_process");
const assert = require("node:assert/strict");
const fixture = JSON.parse(
  execFileSync(
    process.execPath,
    ["--experimental-strip-types", "tests/fixtures.ts"],
    { stdio: ["ignore", "pipe", "ignore"] },
  ),
)[14];
const content = require("../game/dialogues/chapter1.json").scenes[14];
(async () => {
  const b = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
  });
  try {
    for (const mobile of [false, true]) {
      const c = await b.newContext({
        viewport: mobile
          ? { width: 812, height: 375 }
          : { width: 1280, height: 720 },
        hasTouch: mobile,
        isMobile: mobile,
      });
      const p = await c.newPage(),
        errors = [];
      p.on("pageerror", (e) => errors.push(e.message));
      await p.goto(process.env.GAME_URL || "http://127.0.0.1:8081");
      await p.waitForTimeout(1200);
      await p.clock.install();
      const click = async (name) => {
        const el = p.getByRole("button", { name, exact: true });
        if (mobile) await el.tap();
        else await el.click();
        await p.clock.runFor(80);
      };
      const chooser = p.waitForEvent("filechooser");
      await click("↥ Cargar partida");
      await (
        await chooser
      ).setFiles({
        name: "supply.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify(fixture)),
      });
      await p.clock.runFor(300);
      await p.screenshot({
        path: `${process.env.ARTIFACTS_DIR || "/tmp"}/chest-v3-${mobile ? "mobile" : "desktop"}-closed.png`,
      });
      if (mobile) await click("Interactuar");
      else {
        await p.keyboard.press("e");
        await p.clock.runFor(80);
      }
      for (let i = 0; i < content.dialogue.length; i++)
        await click(
          i + 1 === content.dialogue.length
            ? "Seguir mi camino →"
            : "Continuar →",
        );
      await p.clock.runFor(1700);
      await p.screenshot({
        path: `${process.env.ARTIFACTS_DIR || "/tmp"}/chest-v3-${mobile ? "mobile" : "desktop"}-opening.png`,
      });
      await p.clock.runFor(1600);
      assert(
        await p.getByText("¡Has obtenido la Fe!", { exact: false }).isVisible(),
      );
      await click("Guardar la linterna y continuar");
      const save = await p.evaluate(() =>
        JSON.parse(localStorage.getItem("precursora-save-v2")),
      );
      assert(save.missions.completedMissions.includes("CH1_15"));
      assert.deepEqual(save.tools, ["fe"]);
      assert.deepEqual(save.unlockedChapters, [1]);
      assert(save.position <= 7594 || save.position >= 7646);
      assert.deepEqual(errors, []);
      await p.screenshot({
        path: `${process.env.ARTIFACTS_DIR || "/tmp"}/chest-v3-${mobile ? "mobile" : "desktop"}-open.png`,
      });
      console.log(
        "chest solid body, animated opening and permanent reward",
        mobile,
        "ok",
      );
      await c.close();
    }
  } finally {
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
