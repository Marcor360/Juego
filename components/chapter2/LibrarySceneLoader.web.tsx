import React from "react";
import { WithSkiaWeb } from "@shopify/react-native-skia/lib/module/web";
import { View, Text } from "react-native";
import canvasKit from "canvaskit-wasm/package.json";
import type { LibrarySceneProps } from "./LibraryScene";
const opts = {
  locateFile: (file: string) =>
    file.endsWith(".wasm") ? `/canvaskit-${canvasKit.version}.wasm` : file,
};
const load = () => import("./LibraryScene");
export default function LibrarySceneLoader(props: LibrarySceneProps) {
  return (
    <WithSkiaWeb
      opts={opts}
      getComponent={load}
      componentProps={props}
      fallback={
        <View>
          <Text>Abriendo la biblioteca…</Text>
        </View>
      }
    />
  );
}
