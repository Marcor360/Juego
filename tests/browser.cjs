const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
(async () => {
  const b = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
  });
  const page = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(process.env.GAME_URL || "http://127.0.0.1:8081");
  await page.waitForTimeout(1500);
  await page.clock.install();
  const run = async (ms) => {
    await page.clock.runFor(ms);
  };
  const move = async (ms, jump = false) => {
    await page.keyboard.down("d");
    if (jump) await page.keyboard.press("Space");
    await run(ms);
    await page.keyboard.up("d");
    await run(32);
  };
  const e = async () => {
    await page.keyboard.press("e");
    await run(32);
  };
  const saved = async () =>
    page.evaluate(() => JSON.parse(localStorage.getItem("precursora-save-v1")));
  const log = async (label) =>
    console.log(
      label,
      JSON.stringify(await saved()),
      (await page.locator("body").innerText()).slice(0, 200),
    );
  if (process.env.FOREST_CHECKPOINT === "traveler") {
    const fixture = {
      schemaVersion: 1,
      gameId: "precursora",
      level: 1,
      checkpoint: 1630,
      missions: {
        guide: true,
        lights: ["light1", "light2", "light3"],
        lamps: ["lamp1", "lamp2"],
        traveler: true,
        riddle: false,
        complete: false,
      },
      tools: [],
      unlockedChapters: [1],
      settings: { music: 0, effects: 0, reducedMotion: true },
    };
    const fixtureChooser = page.waitForEvent("filechooser");
    await page
      .getByRole("button", { name: "↥ Cargar partida", exact: true })
      .click();
    await (
      await fixtureChooser
    ).setFiles({
      name: "checkpoint.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(fixture)),
    });
    await run(64);
  } else {
    await page.getByRole("button", { name: "▶ Comenzar aventura" }).click();
    await run(64);
    await move(1700);
    await e();
    for (let i = 0; i < 6; i++) await e();
    await log("guide");
    assert((await saved()).missions.guide);
    await move(2700);
    await e();
    await e();
    await log("light1");
    assert.equal((await saved()).missions.lights.length, 1);
    await move(940);
    await move(880, true);
    await move(177);
    await move(824, true);
    await e();
    await e();
    await log("light2");
    assert.equal((await saved()).missions.lights.length, 2);
    await move(1180);
    await run(400);
    await move(1300, true);
    await e();
    await e();
    await log("light3");
    assert.equal((await saved()).missions.lights.length, 3);
    await move(2400);
    await e();
    await e();
    await log("lamp1");
    await move(2240);
    await e();
    await e();
    await log("lamp2");
    assert.equal((await saved()).missions.lamps.length, 2);
    await move(4120);
    await e();
    await page
      .getByRole("button", {
        name: "Entiendo que tengas miedo. Podemos dar un paso juntos.",
      })
      .click();
    await e();
    await log("traveler");
    assert((await saved()).missions.traveler);
  }
  // Cross the ruins by three deliberate jumps.
  await move(2600);
  await move(840, true);
  await move(425);
  await move(800, true);
  await move(600);
  await move(850, true);
  await move(2400);
  await e();
  await log("riddle trigger");
  const r = await page.locator("body").innerText();
  if (!r.includes("Ordena las palabras")) throw Error("Riddle not reached");
  for (const word of ["Confía", "en", "Jehová", "con", "todo", "tu", "corazón"])
    await page.getByRole("button", { name: word, exact: true }).click();
  await page.getByRole("button", { name: "Comprobar", exact: true }).click();
  await e();
  assert((await saved()).missions.riddle);
  await move(7650);
  await e();
  await log("complete");
  assert((await saved()).missions.complete);
  assert.deepEqual((await saved()).tools, ["fe"]);
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Descargar partida", exact: true })
    .click();
  const download = await downloadPromise;
  const path = await download.path();
  const fs = require("fs");
  const exported = JSON.parse(fs.readFileSync(path));
  assert.deepEqual(exported.unlockedChapters, [1, 2]);
  await page.reload();
  await run(1500);
  await page.getByRole("button", { name: "▤ Continuar", exact: true }).click();
  await run(32);
  assert(
    (await page.locator("body").innerText()).includes("Capítulo completado"),
  );
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Guardar y volver al inicio", exact: true })
    .click();
  let fc = page.waitForEvent("filechooser");
  await page
    .getByRole("button", { name: "↥ Cargar partida", exact: true })
    .click();
  await (
    await fc
  ).setFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"schemaVersion":999}'),
  });
  await run(32);
  assert((await page.locator("body").innerText()).includes("incompatible"));
  assert((await saved()).missions.complete);
  fc = page.waitForEvent("filechooser");
  await page
    .getByRole("button", { name: "↥ Cargar partida", exact: true })
    .click();
  await (
    await fc
  ).setFiles({
    name: "save.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(exported)),
  });
  await run(32);
  assert(
    (await page.locator("body").innerText()).includes("Capítulo completado"),
  );
  await page.screenshot({ path: "/tmp/precursora-complete.png" });
  assert.deepEqual(errors, []);
  console.log(
    "PASS: full forest, export, reload, invalid import, valid import; no page errors",
  );
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
