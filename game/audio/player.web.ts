import { useEffect, useRef, useState } from "react";
import { Asset } from "expo-asset";
import { WebAudioPlayer } from "./webPlayer";

function uri(source: number | string | null) {
  return typeof source === "number" ? Asset.fromModule(source).uri : source;
}
class AssetPlayer extends WebAudioPlayer {
  constructor(source: number | string | null) { super(uri(source)); }
  replace(source: number | string | null) { super.replace(uri(source)); }
}
/** Same small playback contract on each platform, with web cancellation handled. */
export function useAudioPlayer(source: number | string | null) {
  const [player] = useState(() => new AssetPlayer(source));
  const previous = useRef(source);
  useEffect(() => {
    if (previous.current !== source) { player.replace(source); previous.current = source; }
  }, [player, source]);
  useEffect(() => () => player.remove(), [player]);
  return player;
}
