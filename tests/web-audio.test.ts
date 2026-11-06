import { test } from "node:test";
import assert from "node:assert/strict";
import { WebAudioPlayer } from "../game/audio/webPlayer.ts";

test("web audio safely cancels a pending play when pausing or replacing a track", async () => {
  const media: {paused:boolean;volume:number;loop:boolean;readyState:number;currentTime:number;play:()=>Promise<void>;pause:()=>void;removeAttribute:()=>void;load:()=>void}[]=[];
  const create=()=>{
    let reject:(error:unknown)=>void=()=>{};
    const value={paused:true,volume:1,loop:false,readyState:0,currentTime:0,
      play:()=>{value.paused=false;return new Promise<void>((_resolve,fail)=>{reject=fail;});},
      pause:()=>{value.paused=true;reject(Object.assign(Error("interrupted"),{name:"AbortError"}));},
      removeAttribute:()=>{},load:()=>{},
    };
    media.push(value);
    return value as unknown as HTMLAudioElement;
  };
  const player=new WebAudioPlayer("menu.mp3",create);
  player.play();
  player.pause();
  await Promise.resolve();await Promise.resolve();
  assert.equal(media[0].paused,true);
  player.play();
  player.replace("forest.mp3");
  await Promise.resolve();await Promise.resolve();
  assert.equal(media[0].paused,true);
  assert.equal(media[1].paused,true);
  player.remove();
});
