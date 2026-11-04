const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const { execFileSync } = require("node:child_process");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const fixtures = JSON.parse(
  execFileSync(
    process.execPath,
    ["--experimental-strip-types", "tests/fixtures.ts"],
    { stdio: ["ignore", "pipe", "ignore"] },
  ).toString(),
);
const content = require("../game/dialogues/chapter1.json");
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
  });
  const report = [];
  try {
    for (const mobile of process.env.MOBILE_ONLY ? [true] : [false, true]) {
      const context = await browser.newContext({
        viewport: mobile
          ? { width: 812, height: 375 }
          : { width: 1280, height: 720 },
        hasTouch: mobile,
        isMobile: mobile,
        acceptDownloads: true,
      });
      const page = await context.newPage();
      const errors = [],
        failed = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("response", (r) => {
        if (r.status() >= 400) failed.push(r.url());
      });
      await page.goto(process.env.GAME_URL || "http://127.0.0.1:8081");
      await page.waitForTimeout(1600);
      await page.clock.install();
      const run = (ms) => page.clock.runFor(ms);
      const button = (name) => page.getByRole("button", { name, exact: true });
      const click = async (name) => {
        const matches = await button(name).all();
        const target =
          matches.length === 1
            ? matches[0]
            : await (async () => {
                for (const m of matches)
                  if ((await m.getAttribute("aria-selected")) !== "true")
                    return m;
                return matches[0];
              })();
        if (!target)
          throw Error(
            `Missing button: ${name}\n${await page.locator("body").innerText()}`,
          );
        if (mobile) await target.tap();
        else await target.click();
        await run(80);
      };
      const saved = () =>
        page.evaluate(() =>
          JSON.parse(localStorage.getItem("precursora-save-v2")),
        );
      const open = async (save) => {
        if (await button("Pausa").isVisible()) {
          await click("Pausa");
          await click("Guardar y volver al inicio");
        }
        const chooser = page.waitForEvent("filechooser");
        await click("↥ Cargar partida");
        const fc = await chooser;
        await fc.setFiles({
          name: "partida.json",
          mimeType: "application/json",
          buffer: Buffer.from(JSON.stringify(save)),
        });
        await run(180);
      };
      // Tutorial is exercised through actual controls, not a fixture.
      await click("▶ Comenzar aventura");
      await click("Seguir mi camino →");
      const cdp = mobile ? await context.newCDPSession(page) : null;
      const touchPoint = async (name, id) => {
        const box = await button(name).boundingBox();
        return { x: box.x + box.width / 2, y: box.y + box.height / 2, id };
      };
      if (mobile) {
        const right = await touchPoint("Caminar a la derecha", 1);
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchStart",
          touchPoints: [right],
        });
        await run(650);
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchEnd",
          touchPoints: [],
        });
        await click("Saltar");
      } else {
        await page.keyboard.down("d");
        await run(550);
        await page.keyboard.up("d");
        await page.keyboard.press("Space");
      }
      await run(750);
      await click("▤ Cuaderno");
      await click("Volver");
      await click("Interactuar");
      for (let k = 0; k < 2; k++)
        await click(k === 1 ? "Seguir mi camino →" : "Continuar →");
      await run(100);
      assert.equal((await saved()).missions.completedMissions.length, 1);
      for (let n = 2; n <= 16; n++) {
        console.log("scene", mobile, n);
        await open(fixtures[n - 1]);
        const def = content.scenes[n - 1];
        await click("Interactuar");
        for (let i = 0; i < def.dialogue.length; i++)
          await click(
            i + 1 === def.dialogue.length
              ? "Seguir mi camino →"
              : "Continuar →",
          );
        const history = [];
        for (let i = 0; i < def.stages.length; i++) {
          const stage = def.stages[i];
          const answers =
            stage.byAnswer?.[history[0]?.[0]] ||
            (stage.kind === "reflect"
              ? [stage.options[0].id]
              : stage.kind === "choice"
                ? [stage.answers[0]]
                : stage.answers);
          if (i === 0 && n === 2) {
            const bad = stage.options.find(
              (o) => !stage.answers.includes(o.id),
            );
            await click(bad.text);
            await click("Comprobar decisión");
            assert(
              await page
                .getByText("Revisa lo que observaste", { exact: false })
                .isVisible(),
            );
            await click("Borrar selección");
          }
          if (stage.kind === "order") {
            const labels = await page.getByRole("button").allTextContents();
            for (const option of stage.options)
              assert(labels.includes(option.text.toLocaleUpperCase("es")));
          }
          const usedLabels = {};
          for (const id of answers) {
            const label = stage.options.find((o) => o.id === id).text;
            if (stage.kind === "order") {
              const text = label.toLocaleUpperCase("es"),
                index = usedLabels[text] ?? 0;
              usedLabels[text] = index + 1;
              const target = button(text).nth(index);
              if (mobile) await target.tap();
              else await target.click();
              await run(80);
            } else await click(label);
          }
          if (n === 13 && i === 0) {
            await page.screenshot({
              path: `/tmp/chapter-v3-${mobile ? "mobile" : "desktop"}-puzzle.png`,
            });
          }
          await click(
            stage.kind === "reflect"
              ? "Guardar reflexión"
              : "Comprobar decisión",
          );
          history.push(answers);
        }
        if (n === 7 || n === 8) await click("Seguir mi camino →");
        if (n === 15) {
          await run(3200);
          assert(
            await page
              .getByText("¡Has obtenido la Fe!", { exact: false })
              .isVisible(),
          );
          await page.screenshot({
            path: `/tmp/chapter-v3-${mobile ? "mobile" : "desktop"}-reward.png`,
          });
          await click("Guardar la linterna y continuar");
        }
        await run(150);
        const s = await saved();
        assert(
          s.missions.completedMissions.includes(
            `CH1_${String(n).padStart(2, "0")}`,
          ),
          `scene ${n}`,
        );
        assert.equal(s.health, 3);
        if ([3, 6, 9, 10, 12, 14, 15].includes(n))
          await page.screenshot({
            path: `/tmp/chapter-v3-${mobile ? "mobile" : "desktop"}-${n}.png`,
          });
      }
      assert.deepEqual((await saved()).tools, ["fe"]);
      assert.deepEqual((await saved()).unlockedChapters, [1, 2]);
      const downloadEvent = page.waitForEvent("download");
      await click("Descargar partida");
      const download = await downloadEvent;
      const file = await download.path();
      const exported = JSON.parse(fs.readFileSync(file, "utf8"));
      assert.equal(exported.missions.completedMissions.length, 16);
      await click("Abrir el diario de viaje");
      await click("Volver al inicio");
      // Import rejection is observable and must not overwrite progress.
      const prior = await saved();
      const chooser = page.waitForEvent("filechooser");
      await click("↥ Cargar partida");
      await (
        await chooser
      ).setFiles({
        name: "wrong.json",
        mimeType: "application/json",
        buffer: Buffer.from('{"schemaVersion":99}'),
      });
      await run(200);
      assert(
        await page
          .getByText("No se cargó la partida.", { exact: false })
          .isVisible(),
      );
      assert.deepEqual(await saved(), prior);
      await click("Seguir mi camino →");
      // Physical controls near the moving-platform section, then restore from disk.
      const mist = { ...fixtures[11], position: 5230 };
      await open(mist);
      if (mobile) {
        const right = await touchPoint("Caminar a la derecha", 1),
          jump = await touchPoint("Saltar", 2);
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchStart",
          touchPoints: [right],
        });
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchStart",
          touchPoints: [right, jump],
        });
        await run(420);
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchEnd",
          touchPoints: [],
        });
      } else {
        await page.keyboard.down("d");
        await page.keyboard.press("Space");
        await run(420);
        await page.keyboard.up("d");
      }
      await run(350);
      await click("Pausa");
      await click("Guardar y volver al inicio");
      const advanced = await saved();
      assert(advanced.position > 5230);
      await click("▤ Continuar");
      await run(150);
      assert(
        await page
          .getByText("12/16 · Cruzar la niebla", { exact: true })
          .isVisible(),
      );
      // Confirm no-return uses its own explicit panel.
      await open({
        ...fixtures[10],
        missions: {
          ...fixtures[11].missions,
          worldFlags: { noReturn: false, bridgeWarning: false },
        },
        checkpoint: "ch1_claro",
        position: 5030,
      });
      await click("Interactuar");
      assert(
        await page
          .getByText("El sendero de la niebla", { exact: true })
          .isVisible(),
      );
      await click("Estoy lista · entrar en la niebla");
      assert.equal((await saved()).checkpoint, "ch1_niebla");
      assert.deepEqual(errors, []);
      assert.deepEqual(failed, []);
      report.push({
        mobile,
        scenes: 16,
        exported: true,
        invalidImportRetained: true,
        mistControls: true,
        errors: 0,
      });
      await context.close();
    }
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
