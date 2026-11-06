import { test } from "node:test";
import assert from "node:assert/strict";
import { libraryTasks, newLibrary, validateLibrary, completeLibraryTask, libraryComplete } from "../game/chapter2/library.ts";
import { newSave, validateSave } from "../game/save/schema.ts";
import { freshProgress, finishMission, evidenceIds, itemIds } from "../game/missions/progress.ts";
import { chapterGuidance } from "../game/chapter1/guidance.ts";
function finishedForest(){const p=freshProgress();p.tutorial={walk:true,jump:true,journal:true,interact:true};p.evidence=[...evidenceIds];p.items=[...itemIds];for(let i=1;i<=16;i++){if(i===12)p.worldFlags.noReturn=true;finishMission(p,i);}return {...newSave(),missions:p,checkpoint:"ch1_refugio" as const,position:7890,tools:["fe"],unlockedChapters:[1,2]};}
test("library progress cannot bypass a locked chapter or grant an unearned reward",()=>{
  assert.throws(()=>validateSave({...newSave(),library:newLibrary(),activeChapter:2}));
  assert.throws(()=>validateSave({...finishedForest(),tools:["fe","aprendizaje"]}));
  assert.throws(()=>validateLibrary({...newLibrary(),answers:[["made-up"]]}));
  assert.throws(()=>validateLibrary({...newLibrary(),position:NaN}));
  assert.throws(()=>validateLibrary({...newLibrary(),selected:["cause","cause"]}));
});
test("eight library stations are playable in order, require proximity, and preserve partial answers",()=>{
  let library=newLibrary();
  assert.throws(()=>completeLibraryTask({...library,selected:["cause"]}));
  for(const task of libraryTasks){
    library={...library,position:task.x,selected:[...task.answer]};
    assert.deepEqual(validateLibrary(JSON.parse(JSON.stringify(library))),library);
    library=completeLibraryTask(library);
  }
  assert(libraryComplete(library));
  const save=validateSave({...finishedForest(),activeChapter:2,library,tools:["fe","aprendizaje"],unlockedChapters:[1,2,3]});
  assert.equal(save.library?.answers.length,8);
  assert.equal(save.activeChapter,2);
  assert.deepEqual(save.tools,["fe","aprendizaje"]);
  assert.throws(()=>completeLibraryTask(library));
});
test("old saves keep the forest and an activated library starts safely without erasing chapter one",()=>{
  const raw=finishedForest(); delete raw.library;delete raw.activeChapter;
  const old=validateSave(raw);assert.equal(old.activeChapter,1);assert.equal(old.library,null);
  const library=validateSave({...raw,activeChapter:2});assert.equal(library.library?.position,90);assert.equal(library.missions.completedMissions.length,16);
});
test("chapter-one guidance names missing evidence, the fog entrance and the final exit",()=>{
  const p=finishedForest().missions;
  p.completedMissions=p.completedMissions.slice(0,2);p.evidence=[];
  assert.equal(chapterGuidance(p).target.id,"rock_mark");
  p.evidence=["rock_mark"];assert.equal(chapterGuidance(p).target.id,"storm_notice");
  p.completedMissions=finishedForest().missions.completedMissions.slice(0,11);p.worldFlags.noReturn=false;
  assert.equal(chapterGuidance(p).target.id,"no_return");
  p.completedMissions=finishedForest().missions.completedMissions.slice(0,15);
  assert.equal(chapterGuidance(p).target.id,"library");
  assert.match(chapterGuidance(p).detail,/derecha/);
});
