import {URL} from "node:url";
import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {World} from "../game/engine/world.ts";
import {freshProgress,finishMission,evidenceIds,itemIds} from "../game/missions/progress.ts";
import {conversationPose,idlePose,BRANCH_CLEAR_SECONDS} from "../game/rendering/conversation.ts";
function ready(scene:number){const w=new World();w.progress=freshProgress();w.progress.tutorial={walk:true,jump:true,journal:true,interact:true};w.progress.evidence=[...evidenceIds];w.progress.items=[...itemIds];for(let n=1;n<scene;n++)finishMission(w.progress,n);w.restore(scene===5?2290:3750);w.drainEvents();return w;}
const step=(w:World,n:number)=>{for(let i=0;i<n;i++)w.step(1/120);};
const sounds=(w:World)=>w.drainEvents().filter(e=>e.type==="sound").map(e=>e.sound);
test("clearing a branch walks to it, holds the obstacle until it settles, and emits one shift and impact",()=>{
 const w=ready(5);w.complete(5,"helper");assert.equal(w.x,2290);assert(w.branchApproach);step(w,30);assert(w.x>2290&&w.x<2350);assert.equal(w.branchClearing,BRANCH_CLEAR_SECONDS);
 step(w,60);assert.equal(w.branchApproach,false);assert.equal(w.x,2350);assert(w.branchClearing>0);w.input.right=true;step(w,60);assert.equal(w.x,2350);assert(w.branchClearing>0);step(w,300);assert.equal(w.branchClearing,0);assert.equal(w.x,2350);
 const emitted=sounds(w);assert.equal(emitted.filter(s=>s==="wood-shift").length,1);assert.equal(emitted.filter(s=>s==="wood-land").length,1);assert.equal(w.health,3);
 w.input.right=true;step(w,110);assert(w.x>2420,"the path opens after settling");
});
test("restoring a completed branch safely skips the transient animation",()=>{const w=ready(5);w.complete(5,"lever");step(w,30);w.restore(2350);assert.equal(w.branchClearing,0);assert.equal(w.branchApproach,false);w.drainEvents();w.input.right=true;step(w,90);assert(w.x>2400);assert(!sounds(w).includes("wood-shift"));});
test("repair emits an ignition sound and speech holds closed poses between articulations",()=>{const w=ready(9);w.complete(9);assert.equal(sounds(w).filter(s=>s==="ignite").length,1);assert.equal(conversationPose(.1),2);assert.equal(conversationPose(.49),3);assert.equal(conversationPose(.7),4);assert.equal(conversationPose(1.6),5);for(let t=0;t<7;t+=.01)assert.equal(conversationPose(t,true),2);assert.equal(idlePose(5.1),1);assert.equal(idlePose(5.1,true),0);});
test("new NPCs, conversation and effects have complete grounded registrations",()=>{const a=JSON.parse(readFileSync(new URL("../game/rendering/art.json",import.meta.url),"utf8"));for(const [key,count]of Object.entries({cast:24,locals:12,localsPortraits:4,heroTalk:6,travelerTalk:6,branch:8,flame:6})){assert.equal(a[key].frames.length,count,key);if(key!=="localsPortraits")for(const f of a[key].frames)assert.equal(f.anchorY,f.y+f.height);}for(const key of ["branch","flame"])assert.equal(a[key].referenceHeight,Math.max(...a[key].frames.map((f:any)=>f.height)));});
