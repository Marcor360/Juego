import { useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import { setAudioModeAsync } from "expo-audio";
import { useAudioPlayer } from "./player";
import type { Settings } from "../save/schema";
import type { Ambience, SoundKind } from "./context";

const ambienceSources: Record<Ambience, number> = {
  menu: require("../../assets/sounds/ambience-menu.mp3"),
  forest: require("../../assets/sounds/ambience-forest.mp3"),
  bridge: require("../../assets/sounds/ambience-bridge.mp3"),
  stream: require("../../assets/sounds/ambience-stream.mp3"),
  clearing: require("../../assets/sounds/ambience-clearing.mp3"),
  mist: require("../../assets/sounds/ambience-mist.mp3"),
  refuge: require("../../assets/sounds/ambience-refuge.mp3"),
  library: require("../../assets/sounds/ambience-library.mp3"),
};

export function useGameAudio(settings: Settings, ambience: Ambience, ducked: boolean, initialized = true) {
  const musicA = useAudioPlayer(null);
  const musicB = useAudioPlayer(null);
  const transition = useRef<{ ambience: Ambience | null; slot: number }>({ ambience: null, slot: 0 });
  const discovery = useAudioPlayer(require("../../assets/sounds/discovery.wav"));
  const interaction = useAudioPlayer(require("../../assets/sounds/interact.wav"));
  const jump = useAudioPlayer(require("../../assets/sounds/jump.wav"));
  const fall = useAudioPlayer(require("../../assets/sounds/fall.wav"));
  const land = useAudioPlayer(require("../../assets/sounds/land.wav"));
  const damage = useAudioPlayer(require("../../assets/sounds/damage.wav"));
  const page = useAudioPlayer(require("../../assets/sounds/page.wav"));
  const chest = useAudioPlayer(require("../../assets/sounds/chest.wav"));
  const woodShift = useAudioPlayer(require("../../assets/sounds/wood-shift.wav"));
  const woodLand = useAudioPlayer(require("../../assets/sounds/wood-land.wav"));
  const ignite = useAudioPlayer(require("../../assets/sounds/ignite.wav"));
  const talkSoft = useAudioPlayer(require("../../assets/sounds/talk-soft.wav"));
  const grass1 = useAudioPlayer(require("../../assets/sounds/step-grass-1.wav"));
  const grass2 = useAudioPlayer(require("../../assets/sounds/step-grass-2.wav"));
  const wood1 = useAudioPlayer(require("../../assets/sounds/step-wood-1.wav"));
  const wood2 = useAudioPlayer(require("../../assets/sounds/step-wood-2.wav"));
  const stone1 = useAudioPlayer(require("../../assets/sounds/step-stone-1.wav"));
  const stone2 = useAudioPlayer(require("../../assets/sounds/step-stone-2.wav"));
  const [unlocked, setUnlocked] = useState(Platform.OS !== "web");
  const [foreground, setForeground] = useState(AppState.currentState !== "background");
  const current = useRef({ settings, foreground, unlocked });
  current.current = { settings, foreground, unlocked };
  const variant = useRef(0);
  const players = { discovery, interaction, jump, fall, land, damage, page, chest, "wood-shift":woodShift,"wood-land":woodLand,ignite,"talk-soft":talkSoft };
  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false }).catch(() => {});
    const suspend = () => {
      current.current.foreground = false;
      for (const player of [musicA, musicB, discovery, interaction, jump, fall, land, damage, page, chest, woodShift, woodLand, ignite, talkSoft, grass1, grass2, wood1, wood2, stone1, stone2]) player.pause();
    };
    const subscription = AppState.addEventListener("change", state => {
      const active = state === "active" && (Platform.OS !== "web" || !document.hidden);
      if (!active) suspend();
      setForeground(active);
    });
    if (Platform.OS !== "web") return () => subscription.remove();
    const unlock = () => setUnlocked(true);
    const visibility = () => {
      if (document.hidden) suspend();
      setForeground(!document.hidden);
    };
    window.addEventListener("pointerdown", unlock, { capture:true, once:true });
    window.addEventListener("keydown", unlock, { capture:true, once:true });
    document.addEventListener("visibilitychange", visibility);
    return () => {
      subscription.remove();
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  useEffect(() => {
    const pair = [musicA, musicB];
    if (transition.current.ambience !== ambience) {
      const slot = transition.current.ambience === null ? 0 : 1 - transition.current.slot;
      const incoming = pair[slot];
      incoming.pause();
      incoming.replace(ambienceSources[ambience]);
      incoming.loop = true;
      incoming.volume = 0;
      transition.current = { ambience, slot };
    }
    if (!initialized || !unlocked || !foreground || settings.music <= 0) {
      for (const player of pair) { player.pause(); player.volume = 0; }
      return;
    }
    const incoming = pair[transition.current.slot];
    incoming.play();
    const target = settings.music * (ducked ? .32 : .68);
    const timer = setInterval(() => {
      let settled = true;
      pair.forEach((player, index) => {
        const goal = index === transition.current.slot ? target : 0;
        const delta = goal - player.volume;
        if (Math.abs(delta) < .005) {
          player.volume = goal;
          if (goal === 0) player.pause();
        } else {
          settled = false;
          player.volume += delta * .14;
        }
      });
      if (settled) clearInterval(timer);
    }, 50);
    return () => clearInterval(timer);
  }, [musicA, musicB, ambience, settings.music, ducked, unlocked, foreground, initialized]);
  useEffect(() => {
    for (const player of [discovery, interaction, jump, fall, land, damage, page, chest, woodShift, woodLand, ignite, talkSoft]) {
      player.volume = settings.effects * .8;
      if (settings.effects <= 0) player.pause();
    }
    for (const player of [grass1, grass2, wood1, wood2, stone1, stone2]) {
      player.volume = settings.effects * .6;
      if (settings.effects <= 0) player.pause();
    }
  }, [settings.effects]);
  useEffect(() => {
    if (foreground) return;
    for (const player of [discovery, interaction, jump, fall, land, damage, page, chest, woodShift, woodLand, ignite, talkSoft, grass1, grass2, wood1, wood2, stone1, stone2]) player.pause();
  }, [foreground]);
  return (kind: SoundKind) => {
    const state = current.current;
    if (state.settings.effects <= 0 || !state.foreground || !state.unlocked) return;
    const isStep = kind.startsWith("step-");
    const pair = kind === "step-wood" ? [wood1, wood2] : kind === "step-stone" ? [stone1, stone2] : [grass1, grass2];
    const player = isStep ? pair[variant.current++ % 2] : players[kind as keyof typeof players];
    player.volume = state.settings.effects * (isStep ? .6 : .8);
    void player.seekTo(0).then(() => {
      if (current.current.foreground && current.current.settings.effects > 0) player.play();
    }).catch(() => {});
  };
}
