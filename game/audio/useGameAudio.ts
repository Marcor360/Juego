import { useEffect, useRef } from "react";
import { useAudioPlayer } from "expo-audio";
import type { Settings } from "../save/schema";
export function useGameAudio(settings: Settings, active: boolean) {
  const music = useAudioPlayer(require("../../assets/sounds/ambient.wav"));
  const discovery = useAudioPlayer(
    require("../../assets/sounds/discovery.wav"),
  );
  const step = useAudioPlayer(require("../../assets/sounds/step.wav"));
  const interaction = useAudioPlayer(
    require("../../assets/sounds/interact.wav"),
  );
  const enabled = useRef(settings.effects);
  enabled.current = settings.effects;
  useEffect(() => {
    music.loop = true;
    music.volume = settings.music;
    if (active && settings.music > 0) music.play();
    else music.pause();
    return () => music.pause();
  }, [active, settings.music, music]);
  useEffect(() => {
    discovery.volume = settings.effects;
    step.volume = settings.effects * 0.35;
    interaction.volume = settings.effects * 0.5;
  }, [settings.effects, discovery, step, interaction]);
  const sound = (kind: "discovery" | "step" | "interaction") => {
    if (enabled.current <= 0) return;
    const player =
      kind === "discovery" ? discovery : kind === "step" ? step : interaction;
    void player
      .seekTo(0)
      .then(() => player.play())
      .catch(() => {});
  };
  return sound;
}
