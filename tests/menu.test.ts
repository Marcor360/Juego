import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import { menuThemeForSave } from "../game/menu/themes.ts";
import { newSave } from "../game/save/schema.ts";
test("menu outfits follow actual story milestones without unlocking final art from old rewards", () => {
  const s = newSave();
  assert.equal(menuThemeForSave(null), "beginning");
  assert.equal(menuThemeForSave(s), "beginning");
  s.legacyRewards = true;
  s.tools = ["fe"];
  assert.equal(menuThemeForSave(s), "beginning");
  s.missions.completedMissions = Array.from(
    { length: 7 },
    (_, i) => `CH1_${String(i + 1).padStart(2, "0")}`,
  );
  assert.equal(menuThemeForSave(s), "beginning");
  s.missions.completedMissions.push("CH1_08");
  assert.equal(menuThemeForSave(s), "middle");
  s.missions.completedMissions = Array.from(
    { length: 16 },
    (_, i) => `CH1_${String(i + 1).padStart(2, "0")}`,
  );
  assert.equal(menuThemeForSave(s), "ending");
});
test("menu atlas registers six real poses with stable feet, and each phase has a dedicated background", () => {
  const root = new URL("../", import.meta.url);
  const art = JSON.parse(
    readFileSync(new URL("game/rendering/menu-art.json", root), "utf8"),
  );
  const png = readFileSync(new URL("assets/menu/hero.png", root));
  assert.equal(art.width, png.readUInt32BE(16));
  assert.equal(art.height, png.readUInt32BE(20));
  assert.equal(art.frames.length, 6);
  for (const [id, indices] of Object.entries(art.variants) as [
    string,
    number[],
  ][]) {
    assert.equal(indices.length, 2);
    for (const index of indices) {
      const f = art.frames[index];
      assert(f.width > 100 && f.height > 300);
      assert(f.x >= f.cell.x && f.x + f.width <= f.cell.x + f.cell.width);
      assert(f.y >= f.cell.y && f.y + f.height <= f.cell.y + f.cell.height);
      assert.equal(f.anchorY, f.y + f.height);
    }
    const bg = readFileSync(new URL(`assets/menu/${id}.png`, root));
    assert(bg.readUInt32BE(16) >= 960 && bg.readUInt32BE(20) >= 540);
  }
});
