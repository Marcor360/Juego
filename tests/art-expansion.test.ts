import {URL} from "node:url";
import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {objects} from "../game/levels/forest.ts";
import {pickupFrames} from "../game/rendering/pickups.ts";
const art=JSON.parse(readFileSync(new URL("../game/rendering/art.json",import.meta.url),"utf8"));
test("all physical clues and parts have named artwork instead of a shared placeholder",()=>{
  for(const o of objects.filter(o=>o.kind==="item"||o.kind==="evidence")) {
    assert(Number.isInteger(pickupFrames[o.id]),o.id);
    assert(art.pickups.frames[pickupFrames[o.id]],o.id);
  }
  assert.equal(new Set(["lever","cover","wick","rock_mark","storm_notice","sign_fragment"].map(id=>pickupFrames[id])).size,6);
});
test("the four NPCs have full pose sets, paired portraits and grounded feet",()=>{
  assert.equal(art.cast.frames.length,24);assert.equal(art.castPortraits.frames.length,8);
  for(const f of art.cast.frames)assert.equal(f.anchorY,f.y+f.height);
  assert.equal(art.water.frames.length,8);assert.equal(art.menuEmblems.frames.length,3);
  for(const f of art.decor.frames)assert.equal(f.anchorY,f.y+f.height);
});

test("menu figures retain original resolution and grounded poses with less decoded memory",()=>{
  const figures=JSON.parse(readFileSync(new URL("../game/rendering/menu-figures.json",import.meta.url),"utf8"));
  const old=JSON.parse(readFileSync(new URL("../game/rendering/menu-art-runtime.json",import.meta.url),"utf8"));
  for(const [name,d]of Object.entries(figures) as [string,any][]){
    const png=readFileSync(new URL(`../assets/runtime/menu-figure-${name}.png`,import.meta.url));
    assert.equal(png.readUInt32BE(16),d.width);assert.equal(png.readUInt32BE(20),d.height);
    assert.equal(d.frames.length,2);assert(d.frames.every((f:any)=>f.height>=470));
    assert(d.width*d.height<old.width*old.height);
    for(const frame of d.frames){assert.equal(frame.anchorY,frame.y+frame.height);assert(frame.x+frame.width<=d.width);assert(frame.y+frame.height<=d.height);}
  }
});
