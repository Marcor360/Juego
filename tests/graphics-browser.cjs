const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const fs = require("node:fs");
(async () => {
  const b = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
  });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  const failed = [];
  p.on("response", (r) => {
    if (r.status() >= 400 && !r.url().endsWith("favicon.ico"))
      failed.push(r.url());
  });
  await p.goto(process.env.GAME_URL || "http://127.0.0.1:8082");
  await p
    .getByRole("button", { name: "▶ Comenzar aventura" })
    .waitFor({ timeout: 60000 });
  await p.waitForTimeout(1800);
  await p.screenshot({ path: "/tmp/precursora-menu-redesign.png" });
  await p.getByRole("button", { name: "⚙ Ajustes" }).click();
  await p.getByRole("button", { name: "Volver", exact: true }).click();
  await p.getByRole("button", { name: "▶ Comenzar aventura" }).click();
  await p.keyboard.down("d");
  await p.waitForTimeout(1500);
  await p.keyboard.up("d");
  await p.screenshot({ path: "/tmp/precursora-forest-redesign.png" });
  await p.keyboard.press("e");
  await p.waitForTimeout(500);
  await p.screenshot({ path: "/tmp/precursora-dialogue-redesign.png" });
  for (let i = 0; i < 6; i++) await p.keyboard.press("e");
  for (let i = 0; i < 12; i++) {
    await p.keyboard.press("i");
    await p.keyboard.press("i");
    await p.keyboard.press("Escape");
    await p.keyboard.press("Escape");
  }
  for (const viewport of [
    { width: 667, height: 375 },
    { width: 2560, height: 1440 },
  ]) {
    await p.setViewportSize(viewport);
    await p.waitForTimeout(300);
    await p.screenshot({
      path: `/tmp/precursora-responsive-${viewport.width}.png`,
    });
  }
  console.log(JSON.stringify({ errors, failed }));
  await b.close();
  if (errors.length || failed.length) process.exitCode = 1;
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
