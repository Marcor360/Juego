import { useEffect, useRef } from "react";
import { useAudioPlayer } from "expo-audio";
import type { Settings } from "../save/schema";
import type { RoomId } from "./maps/library";
const tracks = {
  courtyard: require("../../assets/chapter2/audio/courtyard.wav"),
  library: require("../../assets/chapter2/audio/library.wav"),
  research: require("../../assets/chapter2/audio/research.wav"),
  quiet: require("../../assets/chapter2/audio/quiet.wav"),
  great: require("../../assets/chapter2/audio/great.wav"),
};
export function useLibraryAudio(
  room: RoomId,
  settings: Settings,
  active: boolean,
) {
  const group =
    room === "courtyard" || room === "balcony"
      ? "courtyard"
      : room === "research" || room === "dark" || room === "maze"
        ? "research"
        : room === "quiet"
          ? "quiet"
          : room === "great"
            ? "great"
            : "library";
  const music = useAudioPlayer(tracks[group]),
    page = useAudioPlayer(require("../../assets/chapter2/audio/page.wav")),
    mechanism = useAudioPlayer(
      require("../../assets/chapter2/audio/mechanism.wav"),
    ),
    success = useAudioPlayer(
      require("../../assets/chapter2/audio/success.wav"),
    ),
    card = useAudioPlayer(require("../../assets/chapter2/audio/card.wav")),
    step = useAudioPlayer(require("../../assets/chapter2/audio/step.wav"));
  const config = useRef(settings);
  config.current = settings;
  useEffect(() => {
    music.loop = true;
    music.volume = settings.music * 0.55;
    if (active && settings.music > 0) music.play();
    else music.pause();
    return () => music.pause();
  }, [music, active, settings.music]);
  return (name: "page" | "mechanism" | "success" | "card" | "step") => {
    if (config.current.effects <= 0) return;
    const player = { page, mechanism, success, card, step }[name];
    player.volume = config.current.effects * (name === "step" ? 0.15 : 0.5);
    void player
      .seekTo(0)
      .then(() => player.play())
      .catch(() => {});
  };
}
