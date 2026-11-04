import AsyncStorage from "@react-native-async-storage/async-storage";
import { validateSave, type Save } from "./schema";
const KEY = "precursora-save-v1";
let queue = Promise.resolve();
export async function loadSave() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? validateSave(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}
export function storeSave(s: Save) {
  const data = JSON.stringify(validateSave(s));
  queue = queue.catch(() => {}).then(() => AsyncStorage.setItem(KEY, data));
  return queue;
}
