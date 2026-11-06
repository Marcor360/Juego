import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import { tileSourceEdge } from "../game/rendering/tiles.ts";
import { propPlacement } from "../game/rendering/props.ts";
import { zones, WIDTH, objects } from "../game/levels/forest.ts";
import {
  dialogueSpeaker,
  speakerNames,
  portraitFrame,
} from "../game/dialogues/presentation.ts";
const art = JSON.parse(
  readFileSync(new URL("../game/rendering/art.json", import.meta.url), "utf8"),
);
test("platform art puts the walkable surface on the collider and the body below it", () => {
  for (const frame of art.terrain.frames.slice(0, 2)) {
    for (const [width, height] of [[48, 22], [56, 12], [70, 14]]) {
      const placement = propPlacement(frame, width, height, true);
      const localY = (sourceY: number) => (sourceY - frame.y + placement.top) * placement.sy;
      assert.equal(localY(frame.surfaceY), 0);
      assert(Math.abs(localY(frame.y + frame.height) - height) < 1e-10);
      assert.equal(placement.left * placement.sx, -width / 2);
      assert(placement.top < 0, "moss and bridge posts remain above the surface");
    }
  }
});
test("ground objects preserve their registered anchor instead of aligning the crop edge", () => {
  for (const frame of art.terrain.frames.slice(2)) {
    const placement = propPlacement(frame, 52, 65);
    assert.equal(frame.anchorY, frame.y + frame.height, "each prop rests on its own base");
    assert.equal((frame.anchorY - frame.y + placement.top) * placement.sy, 0);
    assert.equal((frame.anchorX - frame.x + placement.left) * placement.sx, 0);
  }
});
test("new art atlases have distinct registered frames inside their real image dimensions", () => {
  const paths = {
    locals: "characters/v3/locals.png", localsPortraits: "characters/v3/locals-portraits.png",
    heroTalk: "characters/v3/hero-talk.png", travelerTalk:"characters/v3/traveler-talk.png",
    branch:"props/v3/branch-clear.png", flame:"effects/flame.png",
    hero: "characters/v2/hero.png",
    traveler: "characters/v3/traveler.png",
    library: "props/v3/library.png",
    cast: "characters/v3/cast.png", castPortraits: "characters/v3/cast-portraits.png",
    waterfall: "effects/waterfall.png", water: "effects/water.png", pickups: "props/v3/pickups.png", decor: "props/v3/decor.png", menuEmblems: "menu/emblems.png",
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
  assert.equal(art.traveler.frames.length, 12);
  for (const frame of art.traveler.frames)
    assert.equal(frame.anchorY, frame.y + frame.height, "traveler soles match the actor foot in every pose");
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
