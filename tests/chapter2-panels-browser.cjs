const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const { execFileSync } = require("node:child_process"),
  fs = require("node:fs"),
  path = require("node:path"),
  assert = require("node:assert/strict");
const fixtures = JSON.parse(
  execFileSync(
    process.execPath,
    ["--experimental-strip-types", "tests/chapter2-panel-fixtures.ts"],
    { stdio: ["ignore", "pipe", "ignore"] },
  ),
);
const output = process.env.ARTIFACT_DIR || "/tmp/precursora-chapter2-panels";
fs.mkdirSync(output, { recursive: true });
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
  });
  const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      acceptDownloads: true,
    }),
    page = await context.newPage(),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const url = process.env.GAME_URL || "http://127.0.0.1:8081",
    saved = () =>
      page.evaluate(() =>
        JSON.parse(localStorage.getItem("precursora-save-v2")),
      ),
    click = async (name) => {
      await page.getByRole("button", { name, exact: true }).click();
      await page.waitForTimeout(130);
    };
  async function seed(save) {
    await page.goto(url);
    await page.evaluate((s) => {
      localStorage.clear();
      localStorage.setItem("precursora-save-v2", JSON.stringify(s));
    }, save);
    await page.reload();
    await page
      .getByRole("button", { name: /Continuar/ })
      .first()
      .click();
    await page.waitForTimeout(1200);
  }
  async function dialogue() {
    for (let i = 0; i < 25; i++) {
      if (
        await page
          .getByRole("button", { name: "Continuar →", exact: true })
          .count()
      )
        await click("Continuar →");
      else if (
        await page
          .getByRole("button", { name: "Seguir mi camino →", exact: true })
          .count()
      )
        await click("Seguir mi camino →");
      else return;
    }
  }
  async function download() {
    const wait = page.waitForEvent("download");
    await click("Descargar partida");
    const file = await wait,
      filename = path.join(output, "partial.json");
    await file.saveAs(filename);
    return filename;
  }
  async function load(filename) {
    const wait = page.waitForEvent("filechooser");
    await page.getByRole("button", { name: /Cargar partida/ }).click();
    await (await wait).setFiles(filename);
    await page.waitForTimeout(800);
  }
  try {
    await seed(fixtures.questions);
    await page.keyboard.press("e");
    await dialogue();
    await click("Porque es valiosa y merece una búsqueda constante.");
    const before = (await saved()).library.attempts.CH2_02;
    assert.equal(before.selected.length, 1);
    await click("Consultar contexto de la referencia");
    assert.ok(
      await page
        .getByText(/requiere atención, esfuerzo y constancia/)
        .isVisible(),
    );
    await click("Cerrar ×");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(100);
    const qfile = await download();
    await click("Guardar y volver al menú");
    await load(qfile);
    await page.keyboard.press("e");
    await page.waitForTimeout(150);
    const after = (await saved()).library.attempts.CH2_02;
    assert.deepEqual(after, before);
    await click("Comprobar");
    await click("Continuar investigación →");
    await click("De quienes saben más que todos.");
    const health = (await saved()).library.health;
    await click("Comprobar");
    assert.equal((await saved()).library.health, health);
    await page.screenshot({ path: path.join(output, "question-feedback.png") });
    await click("De Jehová.");
    await click("Comprobar");
    await click("Continuar investigación →");
    await dialogue();
    assert.equal((await saved()).library.completed.length, 2);
    console.log(
      "PASS question context, persisted selection/order, import, retry without health penalty",
    );
    await seed(fixtures.board);
    await page.keyboard.press("e");
    await page.waitForTimeout(150);
    await click("Comenzar");
    const tile = (i) =>
      page.getByRole("button", { name: new RegExp(`^Posición ${i},`) });
    await tile(1).click();
    await tile(2).click();
    await page.waitForTimeout(150);
    assert.equal((await saved()).library.board.swaps, 1);
    await tile(3).focus();
    await page.keyboard.press("Enter");
    await tile(4).focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(150);
    assert.equal((await saved()).library.board.swaps, 2);
    await tile(6).scrollIntoViewIfNeeded();
    const from = await tile(6).boundingBox(),
      to = await tile(7).boundingBox();
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
    await page.mouse.down();
    await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, {
      steps: 20,
    });
    await page.mouse.up();
    await page.waitForTimeout(500);
    assert.equal(
      (await saved()).library.board.swaps,
      3,
      "drag must swap exactly two cards once",
    );
    await click("Pausar el reloj");
    const partial = (await saved()).library.board;
    await page.waitForTimeout(600);
    assert.deepEqual((await saved()).library.board, partial);
    await page.screenshot({ path: path.join(output, "book-board.png") });
    await click("Cerrar ×");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(100);
    const file = await download();
    await click("Guardar y volver al menú");
    await load(file);
    assert.deepEqual((await saved()).library.board, partial);
    await page.keyboard.press("e");
    await page.waitForTimeout(150);
    await click("Continuar el mismo tablero");
    await page.waitForTimeout(500);
    assert.ok((await saved()).library.board.remaining < partial.remaining);
    await click("Pausar el reloj");
    await click("Cerrar ×");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(100);
    await click("Guardar y volver al menú");
    const good = await saved();
    const bad = { ...good, tools: ["fe", "conocimiento"] };
    const badFile = path.join(output, "invalid.json");
    fs.writeFileSync(badFile, JSON.stringify(bad));
    await load(badFile);
    assert.deepEqual(
      await saved(),
      good,
      "invalid import must not overwrite campaign",
    );
    console.log(
      "PASS board tap, keyboard, drag, clock pause/resume, JSON round trip, invalid import protection",
    );
    await seed(fixtures.board);
    await page.keyboard.press("e");
    await page.waitForTimeout(150);
    await page.clock.install();
    await click("Desafío · 3 min");
    await click("Comenzar");
    const healthBeforeTimeout = (await saved()).library.health;
    await page.clock.fastForward(181000);
    await page.waitForTimeout(200);
    assert.equal((await saved()).library.board.status, "timeout");
    assert.equal((await saved()).library.health, healthBeforeTimeout);
    await dialogue();
    await click("Nuevo intento");
    await click("Exploración · 10 min");
    await click("Comenzar");
    for (let i = 0; i < 66; i++) {
      const board = (await saved()).library.board.board,
        expected = `book_${String(i + 1).padStart(2, "0")}`;
      if (board[i] === expected) continue;
      const j = board.indexOf(expected);
      await tile(i + 1).click();
      await tile(j + 1).click();
      await page.waitForTimeout(60);
    }
    await page
      .getByRole("button", { name: "Continuar →", exact: true })
      .waitFor();
    await dialogue();
    assert.ok((await saved()).tools.includes("conocimiento"));
    assert.ok((await saved()).unlockedChapters.includes(3));
    await page.screenshot({ path: path.join(output, "completed-balcony.png") });
    console.log(
      "PASS timeout dialogue, retry/mode switch, legal full-board victory, reward and chapter 3",
    );
    const mobileContext = await browser.newContext({
        viewport: { width: 852, height: 393 },
        isMobile: true,
        hasTouch: true,
      }),
      mobile = await mobileContext.newPage();
    mobile.on("pageerror", (e) => errors.push(e.message));
    await mobile.goto(url);
    await mobile.evaluate((s) => {
      localStorage.clear();
      localStorage.setItem("precursora-save-v2", JSON.stringify(s));
    }, fixtures.visitor);
    await mobile.reload();
    await mobile
      .getByRole("button", { name: /Continuar/ })
      .first()
      .tap();
    await mobile.waitForTimeout(1300);
    const up = await mobile
        .getByRole("button", { name: "Caminar arriba", exact: true })
        .boundingBox(),
      cdp = await mobileContext.newCDPSession(mobile);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: up.x + up.width / 2, y: up.y + up.height / 2 }],
    });
    await mobile.waitForTimeout(280);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await mobile.getByRole("button", { name: "Ⅱ", exact: true }).tap();
    await mobile.waitForTimeout(120);
    const moved = await mobile.evaluate(
      () => JSON.parse(localStorage.getItem("precursora-save-v2")).library,
    );
    assert.ok(
      moved.y < fixtures.visitor.library.y - 10,
      "touch D-pad must move player",
    );
    await mobile.getByRole("button", { name: "Cerrar ×", exact: true }).tap();
    await mobile
      .getByRole("button", { name: "Conversar con la visitante", exact: true })
      .tap();
    await mobile.screenshot({ path: path.join(output, "mobile-dialogue.png") });
    assert.ok(
      await mobile.getByText("La visitante", { exact: true }).isVisible(),
    );
    const viewport = await mobile.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      width: window.innerWidth,
    }));
    assert.ok(viewport.scroll <= viewport.width + 1);
    await mobileContext.close();
    assert.deepEqual(errors, []);
    console.log(
      "PASS landscape mobile touch, visitor portrait/dialogue, no horizontal overflow; no JS errors",
    );
  } catch (e) {
    await page.screenshot({ path: path.join(output, "failure.png") });
    console.error(e);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
