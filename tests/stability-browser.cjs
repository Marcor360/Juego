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
const legacy = {
  schemaVersion: 1,
  gameId: "precursora",
  level: 1,
  checkpoint: 65,
  missions: {
    guide: false,
    lights: [],
    lamps: [],
    traveler: false,
    riddle: false,
    complete: false,
  },
  tools: [],
  unlockedChapters: [1],
  settings: fixtures[0].settings,
};
(async () => {
  const b = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
  });
  const url = process.env.GAME_URL || "http://127.0.0.1:8081";
  try {
    for (const failBackup of [false, true]) {
      const c = await b.newContext({
        viewport: { width: 1280, height: 720 },
        acceptDownloads: true,
      });
      await c.addInitScript(
        ({ legacy, failBackup }) => {
          localStorage.setItem("precursora-save-v2", "damaged-current-data");
          localStorage.setItem("precursora-save-v1", JSON.stringify(legacy));
          if (failBackup) {
            const original = Storage.prototype.setItem;
            Storage.prototype.setItem = function (key, value) {
              if (
                key.includes("recovery") ||
                key.includes("damaged-") ||
                key.includes("last-good")
              )
                throw Error("Simulated storage quota");
              return original.call(this, key, value);
            };
          }
        },
        { legacy, failBackup },
      );
      const p = await c.newPage(),
        errors = [];
      p.on("pageerror", (e) => errors.push(e.message));
      await p.goto(url);
      await p.getByRole("alert").waitFor();
      await p.clock.install();
      await p.clock.runFor(12000);
      assert(
        await p.getByRole("alert").isVisible(),
        "startup recovery notice must not expire",
      );
      assert(
        !(await p
          .getByRole("button", { name: "▤ Continuar", exact: true })
          .isDisabled()),
      );
      await p.getByRole("button", { name: "Entendido", exact: true }).click();
      await p.getByRole("button", { name: "▤ Continuar", exact: true }).click();
      await p.clock.runFor(80);
      await p
        .getByRole("button", { name: "Seguir mi camino →", exact: true })
        .click();
      await p.getByRole("button", { name: "▤ Cuaderno", exact: true }).click();
      await p.clock.runFor(160);
      await p.getByRole("button", { name: "Volver", exact: true }).click();
      await p.getByRole("button", { name: "Pausa", exact: true }).click();
      await p
        .getByRole("button", {
          name: "Guardar y volver al inicio",
          exact: true,
        })
        .click();
      await p.clock.runFor(160);
      const stored = await p.evaluate(() => ({
        current: localStorage.getItem("precursora-save-v2"),
        backup: localStorage.getItem("precursora-save-v2-recovery"),
        legacy: localStorage.getItem("precursora-save-v1"),
      }));
      assert.equal(stored.legacy, JSON.stringify(legacy));
      if (failBackup) {
        assert.equal(stored.current, "damaged-current-data");
        assert(await p.getByRole("alert").isVisible());
        assert(
          (await p.locator("body").innerText()).includes(
            "no se guardó en el dispositivo",
          ),
        );
        await p.getByRole("button", { name: "Entendido", exact: true }).click();
      } else {
        assert.equal(stored.backup, "damaged-current-data");
        assert.equal(JSON.parse(stored.current).schemaVersion, 2);
      }
      const event = p.waitForEvent("download");
      await p
        .getByRole("button", { name: "Descargar partida", exact: true })
        .click();
      const download = await event;
      const data = JSON.parse(
        require("node:fs").readFileSync(await download.path(), "utf8"),
      );
      assert(
        data.missions.tutorial.journal,
        "latest in-memory session must be exported, even after a disk failure",
      );
      assert.deepEqual(errors, []);
      console.log(
        "recovery, persistent warning and latest-session download",
        failBackup ? "backup failure" : "success",
        "ok",
      );
      await c.close();
    }
    // Completing preparation from the journal must require all actual tutorial actions.
    {
      const c = await b.newContext({ viewport: { width: 1280, height: 720 } }),
        p = await c.newPage();
      await p.goto(url);
      await p
        .getByRole("button", { name: "▶ Comenzar aventura", exact: true })
        .click();
      await p
        .getByRole("button", { name: "Seguir mi camino →", exact: true })
        .click();
      await p.clock.install();
      await p.keyboard.down("d");
      await p.clock.runFor(650);
      await p.keyboard.up("d");
      await p.keyboard.press("Space");
      await p.clock.runFor(750);
      await p.getByRole("button", { name: "▤ Cuaderno", exact: true }).click();
      assert.equal(
        await p
          .getByRole("button", { name: "Finalizar preparación", exact: true })
          .count(),
        0,
      );
      await p.getByRole("button", { name: "Volver", exact: true }).click();
      // Use the observed saved position: real time between commands can extend a hold.
      const position = await p.evaluate(() => JSON.parse(localStorage.getItem("precursora-save-v2")).position);
      if (Math.abs(position - 170) > 24) {
        const key = position > 170 ? "a" : "d";
        await p.keyboard.down(key);
        await p.clock.runFor(Math.abs(position - 170) / 115 * 1000 + 40);
        await p.keyboard.up(key);
        await p.clock.runFor(100);
      }
      await p.keyboard.press("e");
      await p.clock.runFor(80);
      await p.getByRole("button", { name: "Continuar →", exact: true }).click();
      await p
        .getByRole("button", { name: "Seguir mi camino →", exact: true })
        .click();
      await p.clock.runFor(120);
      const saved = await p.evaluate(() =>
        JSON.parse(localStorage.getItem("precursora-save-v2")),
      );
      assert(saved.missions.completedMissions.includes("CH1_01"));
      await c.close();
    }
    // Practice all four controls with real touch input, then finish from the journal away from the book.
    {
      const c = await b.newContext({
          viewport: { width: 667, height: 375 },
          isMobile: true,
          hasTouch: true,
        }),
        p = await c.newPage();
      await p.goto(url);
      await p
        .getByRole("button", { name: "▶ Comenzar aventura", exact: true })
        .tap();
      await p
        .getByRole("button", { name: "Seguir mi camino →", exact: true })
        .tap();
      await p.clock.install();
      const cdp = await c.newCDPSession(p),
        box = await p
          .getByRole("button", { name: "Caminar a la derecha", exact: true })
          .boundingBox();
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [
          { id: 1, x: box.x + box.width / 2, y: box.y + box.height / 2 },
        ],
      });
      await p.clock.runFor(1200);
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
      await p.getByRole("button", { name: "Saltar", exact: true }).tap();
      await p.clock.runFor(750);
      await p.getByRole("button", { name: "Interactuar", exact: true }).tap();
      await p.clock.runFor(80);
      await p.getByRole("button", { name: "▤ Cuaderno", exact: true }).tap();
      await p
        .getByRole("button", { name: "Finalizar preparación", exact: true })
        .tap();
      await p.getByRole("button", { name: "Continuar →", exact: true }).tap();
      await p
        .getByRole("button", { name: "Seguir mi camino →", exact: true })
        .tap();
      await p.getByRole("button", { name: "Pausa", exact: true }).tap();
      await p
        .getByRole("button", {
          name: "Guardar y volver al inicio",
          exact: true,
        })
        .tap();
      const saved = await p.evaluate(() =>
        JSON.parse(localStorage.getItem("precursora-save-v2")),
      );
      assert.deepEqual(saved.missions.completedMissions, ["CH1_01"]);
      await c.close();
      console.log(
        "tutorial requirements and journal completion away from book ok",
      );
    }
    // Capture every background while paused immediately after a large checkpoint jump.
    {
      const c = await b.newContext({ viewport: { width: 1280, height: 720 } }),
        p = await c.newPage(),
        errors = [];
      p.on("pageerror", (e) => errors.push(e.message));
      await p.goto(url);
      for (const [scene, position] of [
        [2, 600],
        [5, 2230],
        [6, 2970],
        [10, 4400],
        [12, 5980],
        [15, 7560],
      ]) {
        if (
          await p
            .getByRole("button", { name: "Pausa", exact: true })
            .isVisible()
        ) {
          await p.getByRole("button", { name: "Pausa", exact: true }).click();
          await p
            .getByRole("button", {
              name: "Guardar y volver al inicio",
              exact: true,
            })
            .click();
        }
        const choose = p.waitForEvent("filechooser");
        await p
          .getByRole("button", { name: "↥ Cargar partida", exact: true })
          .click();
        await (
          await choose
        ).setFiles({
          name: "checkpoint.json",
          mimeType: "application/json",
          buffer: Buffer.from(
            JSON.stringify({ ...fixtures[scene - 1], position }),
          ),
        });
        await p.getByRole("button", { name: "Pausa", exact: true }).click();
        await p.locator("canvas").waitFor();
        await p.waitForTimeout(500);
        await p.screenshot({ path: `${process.env.ARTIFACTS_DIR || "/tmp"}/pr1-paused-zone-${scene}.png` });
        await p
          .getByRole("button", { name: "Continuar aventura", exact: true })
          .click();
      }
      assert.deepEqual(errors, []);
      await c.close();
      console.log("paused checkpoint jumps and six zone renders ok");
    }
  } finally {
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
