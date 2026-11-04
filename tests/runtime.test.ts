import { test } from "node:test";
import assert from "node:assert/strict";
import { FixedStepClock, MAX_STEPS } from "../game/engine/ticker.ts";
import { World } from "../game/engine/world.ts";
import { viewWindow, intersects, groundTiles } from "../game/rendering/view.ts";
import { WIDTH, zones } from "../game/levels/forest.ts";
test("bounded fixed stepping preserves real movement and camera position from 5 to 120 FPS", () => {
  const states = [];
  for (const fps of [5, 10, 15, 30, 60, 120]) {
    const world = new World(),
      clock = new FixedStepClock();
    world.input.right = true;
    for (let i = 0; i < fps; i++)
      clock.advance(1 / fps, (dt) => world.step(dt));
    assert(Math.abs(world.x - 235) < 1e-8, `movement at ${fps} FPS`);
    states.push([world.x, world.camera, world.time]);
  }
  for (const state of states) assert.deepEqual(state, states[0]);
});
test("long stalls do bounded work and paused fractional time does not leak into a resumed frame", () => {
  const clock = new FixedStepClock();
  assert.equal(
    clock.advance(20, () => {}),
    MAX_STEPS,
  );
  assert.equal(
    clock.advance(NaN, () => {}),
    0,
  );
  assert.equal(
    clock.advance(-1, () => {}),
    0,
  );
  clock.advance(1 / 240, () => {});
  clock.reset();
  assert.equal(
    clock.advance(1 / 240, () => {}),
    0,
  );
  assert.equal(
    clock.advance(1 / 240, () => {}),
    1,
  );
});
test("render windows include the entire camera and all backgrounds required by a zone fade", () => {
  for (let camera = 0; camera <= WIDTH - 480; camera += 5) {
    const window = viewWindow(Math.floor(camera / 240), WIDTH);
    assert(camera >= window.start);
    assert(camera + 480 <= window.end);
    for (const zone of zones) {
      const center = camera + 240;
      if (center >= zone.start - 100 && center <= zone.end + 100)
        assert(intersects(window, zone.start, zone.end - zone.start), zone.id);
    }
  }
});
test("long floor segments only draw nearby tiles and their source edges cover the visible ground", () => {
  for (let sector = 0; sector < 34; sector++) {
    const window = viewWindow(sector, WIDTH),
      segment = { x: 0, w: WIDTH },
      tiles = groundTiles(segment, window);
    assert(tiles.length <= 6);
    if (tiles.length) {
      assert(tiles[0] * 240 <= window.start);
      assert((tiles.at(-1)! + 1) * 240 >= window.end);
    }
  }
  assert.deepEqual(groundTiles({ x: 0, w: 100 }, viewWindow(20, WIDTH)), []);
});
