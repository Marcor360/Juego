import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import { tileSourceEdge } from "../game/rendering/tiles.ts";
import { zones, WIDTH, objects } from "../game/levels/forest.ts";
import {
  dialogueSpeaker,
  speakerNames,
  portraitFrame,
} from "../game/dialogues/presentation.ts";
const art = JSON.parse(
  readFileSync(new URL("../game/rendering/art.json", import.meta.url), "utf8"),
);
test("new art atlases have distinct registered frames inside their real image dimensions", () => {
  const paths = {
    hero: "characters/v2/hero.png",
    npcs: "characters/v2/npcs.png",
    props: "props/v2/forest-props.png",
    portraits: "characters/v2/portraits.png",
    treasures: "props/v2/treasures.png",
    others: "characters/v3/others.png",
    chest: "props/v3/chest.png",
    terrain: "props/v3/terrain.png",
  };
  for (const [key, path] of Object.entries(paths)) {
    const d = art[key],
      png = readFileSync(new URL("../assets/" + path, import.meta.url));
    assert.equal(d.width, png.readUInt32BE(16));
    assert.equal(d.height, png.readUInt32BE(20));
    assert.equal(d.frames.length, d.columns * d.rows);
    assert.equal(
      new Set(d.frames.map((f: any) => `${f.x}:${f.y}`)).size,
      d.frames.length,
    );
    for (const f of d.frames) {
      assert(f.width > 0 && f.height > 0);
      assert(f.x >= f.cell.x && f.y >= f.cell.y);
      assert(f.x + f.width <= f.cell.x + f.cell.width);
      assert(f.y + f.height <= f.cell.y + f.cell.height);
      assert(Number.isFinite(f.anchorX) && Number.isFinite(f.anchorY));
    }
  }
  assert.equal(art.hero.frames.length, 12);
  assert.equal(art.npcs.frames.length, 8);
  assert.equal(art.portraits.frames.length, 6);
});
test("reflected ground strips meet on identical source edges", () => {
  for (let i = -1; i < 7; i++)
    assert.equal(
      tileSourceEdge(i, "right", 516),
      tileSourceEdge(i + 1, "left", 516),
    );
});
test("dialogues identify the grateful traveler instead of the heroine", () => {
  assert.equal(dialogueSpeaker("travelerHappy"), "travelerHappy");
  assert.equal(speakerNames.travelerHappy, "El viajero");
  assert.equal(portraitFrame("travelerHappy"), 5);
  assert.equal(portraitFrame("traveler"), 4);
  assert.equal(dialogueSpeaker("guide"), "guide");
  assert.equal(dialogueSpeaker("hero"), "hero");
});

test("six original zone backgrounds cover the extended world and every narrative object", () => {
  assert.equal(zones[0].start, 0);
  assert.equal(zones.at(-1)?.end, WIDTH);
  zones.forEach((zone, i) => {
    if (i) assert.equal(zones[i - 1].end, zone.start);
    const png = readFileSync(
      new URL(`../assets/backgrounds/v3/${zone.id}.png`, import.meta.url),
    );
    assert(png.readUInt32BE(16) >= 960);
    assert(png.readUInt32BE(20) >= 540);
  });
  assert(objects.every((o) => o.x >= 0 && o.x <= WIDTH));
});
