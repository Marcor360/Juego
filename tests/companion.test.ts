import { platforms, platformAt } from "../game/levels/forest.ts";
import { test } from "node:test";
import assert from "node:assert/strict";
import { CompanionTrail, companionPresent } from "../game/engine/companion.ts";
import { World } from "../game/engine/world.ts";
import { freshProgress, finishMission, evidenceIds, itemIds } from "../game/missions/progress.ts";
const dt = 1 / 120;
function preparedProgress() {
  const p = freshProgress();
  p.tutorial = { walk: true, jump: true, journal: true, interact: true };
  p.evidence = [...evidenceIds]; p.items = [...itemIds];
  return p;
}
test("the traveler joins after being heard and does not appear in earlier areas", () => {
  const progress = preparedProgress();
  assert(!companionPresent(progress, 3100));
  for (let n = 1; n <= 7; n++) finishMission(progress, n);
  assert(companionPresent(progress, 3100));
  assert(companionPresent(progress, 7500));
  assert(!companionPresent(progress, 120));
  assert(!companionPresent(progress, 2900));
});
test("a stopped companion stays grounded with personal space and never orbits on a turn", () => {
  const follower = new CompanionTrail();
  follower.reset({ x: 3100, y: 226, grounded: true });
  for (let i = 1; i <= 240; i++) follower.step(dt, { x: 3100 + i * 115 * dt, y: 226, grounded: true });
  const stopped = follower.x;
  for (let i = 0; i < 240; i++) follower.step(dt, { x: 3330, y: 226, grounded: true });
  assert.equal(follower.x, stopped);
  assert.equal(follower.y, 226);
  assert(!follower.moving);
  assert(follower.x <= 3330 - 34);
  for (let i = 1; i <= 120; i++) follower.step(dt, { x: 3330 - i * 115 * dt, y: 226, grounded: true });
  assert.equal(follower.facing, -1);
});
test("the companion reproduces an actual jump and lands rather than freezing in the air", () => {
  const follower = new CompanionTrail();
  follower.reset({ x: 3100, y: 226, grounded: true });
  let airborne = false, rising = false, falling = false;
  for (let i = 1; i <= 80; i++) {
    const time = i * dt;
    const y = Math.min(226, 226 - 300 * time + 450 * time * time);
    follower.step(dt, { x: 3100 + i * 115 * dt, y, grounded: i >= 80 });
    if (!follower.grounded) { airborne = true; rising ||= !follower.falling; falling ||= follower.falling; }
  }
  for (let i = 0; i < 240; i++) follower.step(dt, { x: 3100 + 80 * 115 * dt, y: 226, grounded: true });
  assert(airborne && rising && falling);
  assert(follower.grounded);
  assert.equal(follower.y, 226);
  assert(!follower.moving);
});
test("overhead platforms do not pull a walking companion off the ground, and restores clear its old route", () => {
  const w = new World();
  w.progress = preparedProgress();
  for (let n = 1; n <= 8; n++) finishMission(w.progress, n);
  w.restore(3340);
  w.input.right = true;
  for (let i = 0; i < 180; i++) {
    w.step(dt);
    assert.equal(w.companionY, 226);
    assert(w.companion.grounded);
  }
  w.restore(7440);
  assert(w.companionX > 7300);
  w.step(dt);
  assert(w.companionX > 7300);
});

test("a waiting traveler stays on a moving support throughout its horizontal and vertical cycle", () => {
  for (const id of ["mist_move1", "mist_move2"]) {
    const w = new World();w.progress = preparedProgress();
    for (let n=1;n<=11;n++) finishMission(w.progress,n);
    w.progress.worldFlags.noReturn = true;
    const platform = platforms.find(p=>p.id===id)!;
    w.restore(5200);w.x=platform.x+3;w.y=platform.y-2;w.vy=80;w.grounded=false;
    for(let warmup=0;warmup<60;warmup++)w.step(dt);
    assert(w.grounded);
    w.companion.reset({x:w.x,y:w.y,grounded:true,support:id});
    for(let i=0;i<1440;i++) {
      w.step(dt);
      const support=platformAt(platform,w.time);
      assert(w.companion.grounded);
      assert(Math.abs(w.companionY-support.y)<.01);
      assert(w.companionX+8>support.x&&w.companionX-8<support.x+support.w);
    }
  }
});
