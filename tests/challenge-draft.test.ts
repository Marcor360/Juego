import { test } from "node:test";
import assert from "node:assert/strict";
import { newSave, validateSave } from "../game/save/schema.ts";
import { finishMission, evidenceIds, itemIds } from "../game/missions/progress.ts";
import { getScene } from "../game/chapter1/challenges.ts";
import { challengeRevision, normalizeChallengeDraft, type ChallengeDraft } from "../game/chapter1/draft.ts";
import { createSaveRepository, SAVE_KEYS } from "../game/save/repository.ts";
import { readSaveFile, writeSaveFile, utf8Length, MAX_SAVE_BYTES } from "../game/save/file.ts";
function pending() {
  const save = newSave();
  save.missions.tutorial = {walk:true,jump:true,journal:true,interact:true};
  save.missions.evidence=[...evidenceIds];save.missions.items=[...itemIds];
  finishMission(save.missions,1);
  const scene=getScene(2);
  const draft:ChallengeDraft={version:1,scene:2,revision:challengeRevision(scene),history:[[scene.stages[0].answers[0]]],selected:[scene.stages[1].answers[0]],order:scene.stages[1].options.map(option=>option.id).reverse(),hints:true};
  save.challenge=draft;
  return save;
}
test("drafts round-trip accepted steps, current selection, hints and shuffle order without granting a mission",()=>{
  const save=pending();
  assert.deepEqual(validateSave(save),save);
  const imported=readSaveFile(writeSaveFile(save));
  assert.deepEqual(imported.save,save);
  assert.equal(imported.notice,"");
  assert.equal(imported.save.missions.completedMissions.length,1);
});
test("old v2 saves normalize safely without a partial challenge",()=>{
  const save=pending();delete save.challenge;
  assert.equal(validateSave(save).challenge,null);
  assert.deepEqual(validateSave(save).missions,save.missions);
});
test("forged answers, missing or duplicate options and skipped steps cannot be restored",()=>{
  const save=pending();const scene=getScene(2);
  const wrong=scene.stages[0].options.find(option=>!scene.stages[0].answers.includes(option.id))!;
  for(const change of [
    (draft:ChallengeDraft)=>{draft.history=[[wrong.id]];},
    (draft:ChallengeDraft)=>{draft.order=[draft.order[0],draft.order[0]];},
    (draft:ChallengeDraft)=>{draft.selected=['unknown'];},
    (draft:ChallengeDraft)=>{draft.history=Array.from({length:scene.stages.length},()=>[scene.stages[0].answers[0]]);},
    (draft:ChallengeDraft)=>{draft.scene=3;},
  ]) {
    const draft=structuredClone(save.challenge!);change(draft);
    assert.equal(normalizeChallengeDraft(draft,save.missions),null);
  }
});
test("content changes reset only the draft and inform loading/import without changing stored chapter data",async()=>{
  const save=pending();
  const scene=getScene(2);
  const changed={...scene,stages:scene.stages.map((stage,index)=>index?stage:{...stage,prompt:stage.prompt+' revisada'})};
  assert.notEqual(challengeRevision(changed),challengeRevision(scene));
  save.challenge!.revision=challengeRevision(changed);
  const original=JSON.stringify(save);
  const values=new Map([[SAVE_KEYS.current as string,original]]);
  const repository=createSaveRepository({getItem:async key=>values.get(key)??null,setItem:async(key,value)=>{values.set(key,value);}});
  const loaded=await repository.load();
  assert(loaded.notice.includes('reto pendiente'));
  assert.equal(loaded.save!.challenge,null);
  assert.deepEqual(loaded.save!.missions,save.missions);
  assert.equal(values.get(SAVE_KEYS.current),original);
  assert(readSaveFile(original).notice.includes('reto pendiente'));
});
test("one bounded JSON format supports UTF-8 and rejects oversized or invalid files before restoration",()=>{
  const text='Español: áéíóú 🕊️ 漢字';
  assert.equal(utf8Length(text),Buffer.byteLength(text,'utf8'));
  assert.deepEqual(readSaveFile('\uFEFF'+writeSaveFile(pending())).save,pending());
  assert.throws(()=>readSaveFile('not JSON'),/JSON/);
  assert.throws(()=>readSaveFile(JSON.stringify({schemaVersion:99})),/incompatible/);
  assert.throws(()=>readSaveFile('x'.repeat(MAX_SAVE_BYTES+1)),/límite/);
  assert.throws(()=>readSaveFile('漢'.repeat(Math.ceil(MAX_SAVE_BYTES/3)+1)),/límite/);
});
