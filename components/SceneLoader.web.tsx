import React, { Component, type ReactNode } from "react";
import { WithSkiaWeb } from "@shopify/react-native-skia/lib/module/web";
import { View, Text, Pressable } from "react-native";
import canvasKit from "canvaskit-wasm/package.json";
import type { SceneProps } from "./Scene";
const loadScene = () => import("./Scene");
const opts = {
  locateFile: (file: string) =>
    file.endsWith(".wasm") ? `/canvaskit-${canvasKit.version}.wasm` : file,
};
class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#213e40",
          padding: 24,
          gap: 16,
        }}
      >
        <Text style={{ color: "#fff0d1", fontSize: 18 }}>
          No se pudo preparar el paisaje.
        </Text>
        <Text style={{ color: "#d7d8c3", fontSize: 14 }}>
          Recarga para volver a iniciar el motor gráfico.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => window.location.reload()}
          style={{ backgroundColor: "#f4d08b", padding: 14, borderRadius: 8 }}
        >
          <Text style={{ color: "#493e40" }}>Volver a intentar</Text>
        </Pressable>
      </View>
    ) : (
      this.props.children
    );
  }
}
export default function SceneLoader(props: SceneProps) {
  return (
    <SceneBoundary>
      <WithSkiaWeb
        opts={opts}
        getComponent={loadScene}
        componentProps={props}
        fallback={
          <View
            style={{
              width: props.width,
              height: props.height,
              backgroundColor: "#213e40",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#f6dfb4", fontSize: 20 }}>
              Preparando el camino…
            </Text>
          </View>
        }
      />
    </SceneBoundary>
  );
}
