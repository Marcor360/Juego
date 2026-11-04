import AsyncStorage from "@react-native-async-storage/async-storage";
import { validateSave, type Save } from "./schema";
import { decodeStoredSave } from "./recovery";

const KEY = "precursora-save-v2";
const OLD_KEY = "precursora-save-v1";
const RECOVERY_KEY = "precursora-save-v2-recovery";
let queue = Promise.resolve();

export type LoadResult = { save: Save | null; notice: string };

export async function loadSave(): Promise<LoadResult> {
  let current: string | null = null;
  try {
    current = await AsyncStorage.getItem(KEY);
  } catch {
    return {
      save: null,
      notice: "No se pudo acceder al almacenamiento local. No se ha borrado ninguna partida.",
    };
  }

  const validCurrent = decodeStoredSave(current);
  if (validCurrent) return { save: validCurrent, notice: "" };

  if (current) {
    // Preserve the unusable current data rather than silently overwriting it.
    try {
      const backup = await AsyncStorage.getItem(RECOVERY_KEY);
      if (!backup) await AsyncStorage.setItem(RECOVERY_KEY, current);
    } catch {
      // Storage can fail independently; keep the recovery attempt best-effort.
    }
  }

  let legacy: string | null = null;
  try {
    legacy = await AsyncStorage.getItem(OLD_KEY);
  } catch {
    return {
      save: null,
      notice: "No se pudo leer la partida anterior. Los datos almacenados no se eliminaron.",
    };
  }
  const restored = decodeStoredSave(legacy);
  if (restored) {
    return {
      save: restored,
      notice: current
        ? "La partida reciente no pasó la validación. Se recuperó una partida anterior y se conservó una copia de recuperación cuando fue posible."
        : "Se recuperó la partida de la versión anterior.",
    };
  }
  return {
    save: null,
    notice: current || legacy
      ? "Hay datos de partida incompatibles o dañados. Se conservaron para intentar recuperarlos; no se han borrado."
      : "",
  };
}

export function storeSave(s: Save) {
  const data = JSON.stringify(validateSave(s));
  queue = queue.catch(() => {}).then(() => AsyncStorage.setItem(KEY, data));
  return queue;
}
