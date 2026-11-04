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
const phases = [
  {
    id: "beginning",
    name: "Amanecer",
    save: null,
    outfit: "Falda lavanda y mochila de viaje",
  },
  {
    id: "middle",
    name: "En camino",
    save: fixtures[8],
    outfit: "Pantalón de vestir lavanda y zapatos formales",
  },
  {
    id: "ending",
    name: "Nuevos horizontes",
    save: {
      ...fixtures[15],
      unlockedChapters: [1, 2],
      missions: {
        ...fixtures[15].missions,
        completedMissions: [
          ...fixtures[15].missions.completedMissions,
          "CH1_16",
        ],
      },
    },
    outfit: "Falda lavanda y linterna de la Fe",
  },
];
(async () => {
  const b = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
  });
  try {
    for (const viewport of [
      { width: 1280, height: 720 },
      { width: 667, height: 375 },
      { width: 390, height: 844 },
      { width: 600, height: 800 },
    ]) {
      for (const phase of phases) {
        const mobile = viewport.width < 900,
          c = await b.newContext({
            viewport,
            hasTouch: mobile,
            isMobile: mobile,
            acceptDownloads: true,
          });
        if (phase.save)
          await c.addInitScript(
            (s) =>
              localStorage.setItem("precursora-save-v2", JSON.stringify(s)),
            phase.save,
          );
        const p = await c.newPage(),
          errors = [],
          missing = [];
        p.on("pageerror", (e) => errors.push(e.message));
        p.on("response", (r) => {
          if (r.status() >= 400) missing.push(r.url());
        });
        await p.goto(process.env.GAME_URL || "http://127.0.0.1:8081");
        await p.waitForFunction(
          () =>
            [...document.images].length >= 2 &&
            [...document.images].every((i) => i.complete && i.naturalWidth > 0),
        );
        await p.evaluate(() => document.fonts.ready);
        const menu = p.getByLabel(`Menú · ${phase.name}`, { exact: true });
        await menu.waitFor();
        assert(
          await p
            .getByRole("img", {
              name: `La precursora · ${phase.outfit}`,
              exact: true,
            })
            .isVisible(),
        );
        const button = (name) => p.getByRole("button", { name, exact: true }),
          click = async (name) => {
            if (mobile) await button(name).tap();
            else await button(name).click();
          };
        assert.equal(await button("▤ Continuar").isDisabled(), !phase.save);
        for (const name of [
          "▶ Comenzar aventura",
          "▤ Continuar",
          "↥ Cargar partida",
          "⚙ Ajustes",
          "ⓘ Créditos",
        ]) {
          const r = await button(name).boundingBox();
          assert(
            r &&
              r.x >= 0 &&
              r.y >= 0 &&
              r.x + r.width <= viewport.width + 1 &&
              r.y + r.height <= viewport.height + 1,
            name + " must fit viewport",
          );
          if (viewport.height > viewport.width)
            assert(r.height >= 30, "portrait controls must remain usable");
        }
        await p.screenshot({
          path: `/tmp/menu-final-${phase.id}-${viewport.width}.png`,
        });
        await click("⚙ Ajustes");
        assert(
          await p
            .getByText("Reducir efectos y movimiento ambiental", {
              exact: true,
            })
            .isVisible(),
        );
        await click("Volver");
        assert(await menu.isVisible());
        await click("ⓘ Créditos");
        assert(
          await p
            .getByText("El camino de una Precursora", { exact: true })
            .isVisible(),
        );
        await click("Volver");
        if (phase.save) {
          const download = p.waitForEvent("download");
          await click("Descargar partida");
          await download;
          await click("▤ Continuar");
          assert(await button("Pausa").isVisible());
          await click("Pausa");
          await click("Guardar y volver al inicio");
          assert(await menu.isVisible());
        } else {
          await click("▶ Comenzar aventura");
          assert(
            await p
              .getByRole("button", { name: "Seguir mi camino →", exact: true })
              .isVisible(),
          );
        }
        assert.deepEqual(errors, []);
        assert.deepEqual(missing, []);
        console.log("menu", phase.id, viewport, "ok");
        await c.close();
      }
    }
  } finally {
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
