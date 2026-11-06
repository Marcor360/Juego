import React from "react";
import { WithSkiaWeb } from "@shopify/react-native-skia/lib/module/web";
import { Text, View } from "react-native";
import canvasKit from "canvaskit-wasm/package.json";
import type { LibraryProps } from "./LibraryChapter";
const load=()=>import("./LibraryChapter");
const opts={locateFile:(file:string)=>file.endsWith(".wasm")?`/canvaskit-${canvasKit.version}.wasm`:file};
export default function LibraryLoader(props:LibraryProps){return <WithSkiaWeb opts={opts} getComponent={load} componentProps={props} fallback={<View><Text>Preparando la biblioteca…</Text></View>} />;}
