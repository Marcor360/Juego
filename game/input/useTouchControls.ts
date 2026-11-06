import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

function prefersTouch() {
  if (Platform.OS !== "web") return true;
  return typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;
}

/** Follow the primary pointer and actual input, including hybrid computers. */
export function useTouchControls(onSwitch: () => void) {
  const [touch, setTouch] = useState(prefersTouch);
  const current = useRef(touch);
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const query = window.matchMedia("(pointer: coarse)");
    const change = (next: boolean) => {
      if (next === current.current) return;
      onSwitch();
      current.current = next;
      setTouch(next);
    };
    const update = () => change(query.matches);
    const pointer = (event: PointerEvent) => {
      if (event.pointerType === "touch") change(true);
      else if (event.pointerType === "mouse") change(false);
    };
    const keyboard = (event: KeyboardEvent) => {
      if (["a", "d", "arrowleft", "arrowright", "arrowup", " ", "e", "i", "j"].includes(event.key.toLowerCase()))
        change(false);
    };
    query.addEventListener("change", update);
    window.addEventListener("pointerdown", pointer);
    window.addEventListener("keydown", keyboard);
    return () => {
      query.removeEventListener("change", update);
      window.removeEventListener("pointerdown", pointer);
      window.removeEventListener("keydown", keyboard);
    };
  }, []);
  return touch;
}

export function controlInstructions(touch: boolean) {
  return touch
    ? "Mantén ← o → para caminar y mantén ↑ para saltar alto; suéltalo para un salto corto. Puedes caminar y saltar a la vez. Toca ◇ o el aviso para interactuar; usa los botones Cuaderno, Inventario y Pausa."
    : "A/D o ← →: caminar · Espacio o ↑: saltar (mantén para más altura) · E: interactuar · J: cuaderno · I: inventario · Esc: pausa.";
}
