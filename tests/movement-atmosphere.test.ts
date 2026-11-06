import { test } from "node:test";
import assert from "node:assert/strict";
import { World } from "../game/engine/world.ts";
import { zones } from "../game/levels/forest.ts";
import { atmospheres, atmosphereIndex, gust, mistAmount, mistDensity } from "../game/rendering/atmosphere.ts";

test("movement accelerates, brakes quickly and stops counting steps against a wall", () => {
  const world = new World();
  world.input.right = true;
  world.step(1/120);
  assert(world.vx > 0 && world.vx < 115);
  for (let i=0;i<20;i++) world.step(1/120);
  assert.equal(world.vx,115);
  world.input.right = false;
  for (let i=0;i<10;i++) world.step(1/120);
  assert.equal(world.vx,0);
  const blocked = new World();
  blocked.x = 371;
  blocked.input.right = true;
  for (let i=0;i<240;i++) blocked.step(1/120);
  assert.equal(blocked.x,371);
  assert.equal(blocked.moving,false);
  assert.equal(blocked.vx,0);
  assert.equal(blocked.progress.tutorial.walk,false);
});
test("holding a jump reaches higher than releasing it without allowing a second airborne jump", () => {
  const peak = (hold: boolean) => {
    const world = new World();
    world.input.jump = true;
    world.input.jumpHeld = true;
    let minimum = world.y;
    for(let i=0;i<100;i++) {
      if(i===4 && !hold) world.input.jumpHeld = false;
      if(i===20) world.input.jump = true;
      world.step(1/120);
      minimum = Math.min(minimum,world.y);
    }
    assert.equal(world.grounded,true);
    assert.equal(world.drainEvents().filter(e=>e.sound==='jump').length,1);
    return minimum;
  };
  assert(peak(true) < peak(false)-10);
});
test("each place has its own mood and refuge clears the mist completely", () => {
  zones.forEach((zone,index)=>{
    assert.equal(atmosphereIndex((zone.start+zone.end)/2),index);
    assert.equal(atmospheres[index].id,zone.id);
  });
  assert(atmospheres[4].wind > atmospheres[3].wind);
  assert.equal(mistAmount(4300),0);
  assert.equal(mistAmount(6000),1);
  assert.equal(mistAmount(7500),0);
  const values=Array.from({length:200},(_,i)=>gust(i*1.7));
  assert(values.every(v=>v>=0&&v<=1));
  assert(Math.max(...values)-Math.min(...values)>.5);
});

test("mist is established at the checkpoint, stays visible after orientation and clears at the refuge", () => {
  assert(mistDensity(5200) >= .7);
  assert.equal(mistDensity(6000), 1);
  assert(mistDensity(6000, true) >= .6);
  assert(mistDensity(6000, true) < mistDensity(6000));
  for (const x of [120, 4400, 4800, 7440, 7890]) assert.equal(mistDensity(x), 0);
  for (let x=4800;x<=7500;x+=20) assert(mistDensity(x)>=0 && mistDensity(x)<=1);
});
