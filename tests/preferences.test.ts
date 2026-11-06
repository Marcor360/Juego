import { test } from "node:test";
import assert from "node:assert/strict";
import { createPreferencesRepository, PREFERENCES_KEY } from "../game/save/preferences.ts";
import { newSave } from "../game/save/schema.ts";
import { menuJourney } from "../game/menu/journey.ts";

test("preferences can be saved before a game exists without creating or replacing progress", async () => {
  const values = new Map<string,string>([["precursora-save-v2", "progress-kept"]]);
  const repository = createPreferencesRepository({getItem:async key=>values.get(key)??null,setItem:async (key,value)=>{values.set(key,value);}});
  assert.equal(await repository.load(),null);
  await repository.store({music:0,effects:.4,reducedMotion:true});
  assert.deepEqual(await repository.load(),{music:0,effects:.4,reducedMotion:true});
  assert.equal(values.get("precursora-save-v2"),"progress-kept");
  values.set(PREFERENCES_KEY,JSON.stringify({music:5,effects:.4,reducedMotion:false}));
  await assert.rejects(repository.load());
});
test("preference writes preserve ordering and can recover after a storage error", async () => {
  let raw:string|null=null, fail=true;
  const repository=createPreferencesRepository({getItem:async()=>raw,setItem:async(_key,value)=>{if(fail){fail=false;throw Error("offline");}raw=value;}});
  await assert.rejects(repository.store({music:.2,effects:.3,reducedMotion:false}));
  const first=repository.store({music:.5,effects:.3,reducedMotion:false});
  const second=repository.store({music:.8,effects:0,reducedMotion:true});
  await Promise.all([first,second]);
  assert.deepEqual(await repository.load(),{music:.8,effects:0,reducedMotion:true});
});
test("menu summaries show a truthful next step and completion without granting scenes from legacy rewards", () => {
  assert.equal(menuJourney(null).completed,0);
  const save=newSave();
  save.legacyRewards=true;
  assert.equal(menuJourney(save).percent,0);
  save.missions.completedMissions=Array.from({length:8},(_,i)=>`CH1_${String(i+1).padStart(2,"0")}`);
  save.position=4500;
  assert.equal(menuJourney(save).percent,50);
  assert.equal(menuJourney(save).next,"Ayuda práctica");
  assert.equal(menuJourney(save).location,"El claro");
  save.missions.completedMissions=Array.from({length:16},(_,i)=>`CH1_${String(i+1).padStart(2,"0")}`);
  assert.equal(menuJourney(save).complete,true);
  assert.equal(menuJourney(save).percent,100);
  assert.equal(menuJourney(save).next,"La biblioteca te espera");
});
