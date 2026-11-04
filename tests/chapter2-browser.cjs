/** Continuous Chapter 2 UI run, starting from an honest valid migrated Fe save. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const fs = require("node:fs"),
  path = require("node:path"),
  { execFileSync } = require("node:child_process");
const { entry, rooms, story } = JSON.parse(
  execFileSync(
    process.execPath,
    ["--experimental-strip-types", "tests/chapter2-fixtures.ts"],
    { stdio: ["ignore", "pipe", "ignore"] },
  ),
);
const output = process.env.ARTIFACT_DIR || "/tmp/precursora-chapter2";
fs.mkdirSync(output, { recursive: true });
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
  });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(process.env.GAME_URL || "http://127.0.0.1:8081");
  await page.evaluate((s) => {
    localStorage.clear();
    localStorage.setItem("precursora-save-v2", s);
  }, JSON.stringify(entry));
  await page.reload();
  await page
    .getByRole("button", { name: "Continuar", exact: false })
    .first()
    .click();
  await page.waitForTimeout(2000);
  const saved = () =>
    page.evaluate(() => JSON.parse(localStorage.getItem("precursora-save-v2")));
  const click = async (name, exact = true) => {
    await page.getByRole("button", { name, exact }).click();
    await page.waitForTimeout(80);
  };
  await page.clock.install();
  const snapshot = async () => {
    await page.keyboard.press("m");
    await page.waitForTimeout(100);
    const s = await saved();
    await click("Cerrar ×");
    return s.library;
  };
  const clear = (r, x, y, npcs) =>
    x >= 18 &&
    x <= r.w - 18 &&
    y >= (r.id === "balcony" ? 185 : 80) &&
    y <= r.h - 18 &&
    !r.furniture.some(
      (o) =>
        o.solid &&
        x + 12 > o.solid.x &&
        x - 12 < o.solid.x + o.solid.w &&
        y + 8 > o.solid.y &&
        y - 8 < o.solid.y + o.solid.h,
    ) &&
    !npcs.some((a) => Math.hypot(x - a.x, y - a.y) < 19);
  async function go(x, y, radius = 25) {
    for (let tries = 0; tries < 60; tries++) {
      const s = await snapshot(),
        r = rooms[s.room];
      if (Math.hypot(s.x - x, s.y - y) < radius) return;
      const npcs = Object.entries(s.actorMemory)
        .filter(([k]) => k.startsWith(s.room + ":"))
        .map(([k, v]) => v);
      const cell = 8,
        start = [Math.round(s.x / cell) * cell, Math.round(s.y / cell) * cell],
        queue = [start],
        parents = new Map([[start.join(","), null]]);
      let goal;
      for (let i = 0; i < queue.length; i++) {
        const p = queue[i];
        if (Math.hypot(p[0] - x, p[1] - y) < radius - 3) {
          goal = p;
          break;
        }
        for (const [dx, dy] of [
          [8, 0],
          [-8, 0],
          [0, 8],
          [0, -8],
        ]) {
          const n = [p[0] + dx, p[1] + dy],
            key = n.join(",");
          if (!parents.has(key) && clear(r, n[0], n[1], npcs)) {
            parents.set(key, p);
            queue.push(n);
          }
        }
      }
      if (!goal) throw Error("No path " + s.room + ":" + x + "," + y);
      const path = [];
      while (goal) {
        path.unshift(goal);
        goal = parents.get(goal.join(","));
      }
      if (path.length < 2) continue;
      let end = 1;
      const dx = path[1][0] - path[0][0],
        dy = path[1][1] - path[0][1];
      while (
        end + 1 < path.length &&
        path[end + 1][0] - path[end][0] === dx &&
        path[end + 1][1] - path[end][1] === dy &&
        end < 20
      )
        end++;
      const p = path[end],
        delta = dx ? p[0] - s.x : p[1] - s.y,
        key = dx ? (delta < 0 ? "a" : "d") : delta < 0 ? "w" : "s";
      await page.keyboard.down(key);
      await page.clock.runFor(Math.max(40, (Math.abs(delta) / 94) * 1000));
      await page.keyboard.up(key);
    }
    throw Error(
      "Navigation stuck " + x + "," + y + " " + JSON.stringify(await saved()),
    );
  }
  async function door(id) {
    let s = (await saved()).library;
    const d = rooms[s.room].doors.find((d) => d.id === id);
    await go(d.x, d.y, 17);
    await page.keyboard.press("e");
    await page.waitForTimeout(200);
    s = await snapshot();
    if (s.room !== d.to) throw Error("Door failed " + id + " " + s.room);
    console.log("ROOM", s.room);
  }
  async function object(id) {
    let s = (await saved()).library;
    const o = rooms[s.room].interactions.find((o) => o.id === id);
    await go(o.x, o.y, 25);
    await page.keyboard.press("e");
    await page.waitForTimeout(150);
  }
  async function dialogue() {
    for (let k = 0; k < 30; k++) {
      if (
        await page
          .getByRole("button", { name: "Continuar →", exact: true })
          .count()
      ) {
        await click("Continuar →");
        continue;
      }
      if (
        await page
          .getByRole("button", { name: "Seguir mi camino →", exact: true })
          .count()
      ) {
        await click("Seguir mi camino →");
        continue;
      }
      break;
    }
  }
  async function dismiss() {
    if (
      await page
        .getByRole("button", { name: "Seguir explorando", exact: true })
        .count()
    )
      await click("Seguir explorando");
  }
  async function question(n, optional = false) {
    for (let j = 0; j < 20; j++) {
      const s = (await saved()).library,
        a =
          s.attempts[
            optional ? "debate_extra" : `CH2_${String(n).padStart(2, "0")}`
          ];
      if (!a || a.finished) {
        if (
          await page
            .getByRole("button", {
              name: "Continuar investigación →",
              exact: true,
            })
            .count()
        )
          await click("Continuar investigación →");
        await dialogue();
        return;
      }
      const q = story[n - 1].questions.find(
        (q) => q.id === a.questionIds[a.step],
      );
      if (q.kind === "classify" || q.kind === "match") {
        for (const answer of q.answer) {
          const [o, g] = answer.split("=>");
          await click(q.options.find((x) => x.id === o).text);
          await click(q.groups.find((x) => x.id === g).text);
        }
      } else
        for (const answer of q.kind === "reflect"
          ? [q.options[0].id]
          : q.answer)
          await click(q.options.find((x) => x.id === answer).text);
      await click("Comprobar");
      await click("Continuar investigación →");
    }
    throw Error("questionloop");
  }
  try {
    await page.screenshot({ path: path.join(output, "courtyard-final.png") });
    await door("front");
    await object("traveler");
    await dialogue();
    await dismiss();
    await go(185, 250, 12);
    await go(395, 250, 12);
    await object("intro_book");
    await dismiss();
    await object("traveler");
    await dialogue();
    await dismiss();
    console.log("SCENE1", (await saved()).library.completed);
    await object("librarian_entry");
    await dialogue();
    await question(2);
    console.log("SCENE2", (await saved()).library.completed);
    await page.screenshot({ path: path.join(output, "vestibule.png") });
    await door("to_catalogue");
    await object("catalogue");
    await dialogue();
    await question(3);
    await object("assistant");
    await dialogue();
    await dismiss();
    await door("archive_stairs");
    for (const id of ["mechanism_a", "mechanism_b", "acts_card", "book_lift"]) {
      await object(id);
      await dismiss();
    }
    await door("lift_down");
    await object("assistant");
    await dialogue();
    await dismiss();
    console.log("SCENE4", (await saved()).library.completed);
    await door("to_research");
    await object("ref_bereans");
    await dismiss();
    await object("research_lib");
    await dialogue();
    await question(5);
    await object("dark_assistant");
    await dialogue();
    await dismiss();
    await page.keyboard.press("i");
    await click("Equipar linterna");
    await click("Cerrar ×");
    await door("to_dark");
    for (const id of ["floor_mark_a", "floor_mark_b", "lights_on"]) {
      await object(id);
      await dismiss();
    }
    await page.screenshot({ path: path.join(output, "lamps.png") });
    await door("dark_back");
    await object("dark_assistant");
    await dialogue();
    await dismiss();
    await object("ref_scriptures");
    await dismiss();
    await object("research_lib");
    await dialogue();
    await question(7);
    console.log("SCENE7", (await saved()).library.completed);
    await door("to_visitors");
    await object("visitor");
    await dialogue();
    await question(8);
    await door("visitor_back");
    await object("ref_faith");
    await dismiss();
    await door("to_visitors");
    await object("visitor");
    await dialogue();
    await question(9);
    await object("student");
    await dialogue();
    await question(10);
    await door("visitor_back");
    await object("ref_philip");
    await dismiss();
    await door("to_visitors");
    await object("student");
    await dialogue();
    await question(11);
    console.log("SCENE11", (await saved()).library.completed);
    await door("to_maze");
    for (const id of [
      "doc_pending",
      "doc_opinion",
      "doc_general",
      "doc_support",
      "doc_primary",
    ]) {
      await object(id);
      await dismiss();
    }
    await object("researcher");
    await dialogue();
    await question(12);
    await page.screenshot({ path: path.join(output, "maze.png") });
    await door("to_quiet");
    await object("quiet_librarian");
    await dialogue();
    await question(13);
    console.log("SCENE13", (await saved()).library.completed);
    await door("to_upper");
    await object("upper_assistant");
    await dialogue();
    await dismiss();
    await object("upper_switch");
    await dismiss();
    await door("to_landing");
    await object("upper_door");
    await dialogue();
    await dismiss();
    await door("great_gate");
    await object("final_visitor");
    await dialogue();
    await question(15);
    await object("book_challenge");
    await dialogue();
    await page.screenshot({ path: path.join(output, "books.png") });
    console.log("FINAL BOARD", (await saved()).library.completed);
    await click("Comenzar");
    const b = (await saved()).library.board;
    const originalRemaining = b.remaining;
    await page.waitForTimeout(1000);
    await click("Pausar el reloj");
    let savedBoard = (await saved()).library.board;
    if (savedBoard.remaining >= originalRemaining)
      throw Error("Timer did not advance");
    const paused = savedBoard.remaining;
    await page.waitForTimeout(1100);
    if ((await saved()).library.board.remaining !== paused)
      throw Error("Paused time advances");
    await click("Continuar el mismo tablero");
    for (let i = 0; i < 66; i++) {
      const current = (await saved()).library.board.board,
        expected = `book_${String(i + 1).padStart(2, "0")}`;
      if (current[i] === expected) continue;
      const j = current.indexOf(expected);
      await page
        .getByRole("button", { name: new RegExp(`^Posición ${i + 1},`) })
        .click();
      await page
        .getByRole("button", { name: new RegExp(`^Posición ${j + 1},`) })
        .click();
      await page.waitForTimeout(70);
    }
    await page
      .getByRole("button", { name: "Continuar →", exact: true })
      .waitFor();
    await dialogue();
    console.log("FINAL", (await saved()).library.completed.length, "scenes");
    await page.screenshot({ path: path.join(output, "complete.png") });
    if (!(await saved()).tools.includes("conocimiento"))
      throw Error("No reward");
    const downloadPromise = page.waitForEvent("download");
    await click("Descargar mi partida");
    const downloaded = await downloadPromise;
    await downloaded.saveAs(path.join(output, "export.json"));
    await page.reload();
    await page
      .getByRole("button", { name: /Continuar/ })
      .first()
      .click();
    await page.waitForTimeout(700);
    if (!(await saved()).unlockedChapters.includes(3))
      throw Error("Lost chapter3");
    console.log("PASS complete Chapter2 UI campaign", errors);
  } catch (e) {
    await page.screenshot({ path: "/tmp/ch2-e2e-failure.png" });
    console.error(e);
    console.log("BODY", (await page.locator("body").innerText()).slice(-4000));
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
