import { WithSkiaWeb } from "@shopify/react-native-skia/lib/module/web";
import { Text } from "react-native";
import type { SceneProps } from "./Scene";
export default function SceneLoader(props: SceneProps) {
  return (
    <WithSkiaWeb
      opts={{ locateFile: () => "/canvaskit.wasm" }}
      getComponent={() => import("./Scene")}
      componentProps={props}
      fallback={
        <Text style={{ color: "#fff", padding: 24 }}>
          Preparando el camino…
        </Text>
      }
    />
  );
}
