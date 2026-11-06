import type { Settings } from "./schema.ts";
import type { SaveStorage } from "./repository.ts";
export const PREFERENCES_KEY = "precursora-settings-v1";
export function createPreferencesRepository(storage: SaveStorage) {
  let queue: Promise<void> = Promise.resolve();
  function validated(raw: unknown): Settings {
    const value = raw as Settings;
    if (!value || !Number.isFinite(value.music) || value.music < 0 || value.music > 1 || !Number.isFinite(value.effects) || value.effects < 0 || value.effects > 1 || typeof value.reducedMotion !== "boolean")
      throw Error("Los ajustes guardados no son válidos.");
    return { music: value.music, effects: value.effects, reducedMotion: value.reducedMotion };
  }
  return {
    async load(): Promise<Settings | null> {
      const raw = await storage.getItem(PREFERENCES_KEY);
      return raw === null ? null : validated(JSON.parse(raw));
    },
    store(settings: Settings) {
      const snapshot = JSON.stringify(validated(settings));
      queue = queue.catch(() => {}).then(() => storage.setItem(PREFERENCES_KEY, snapshot));
      return queue;
    },
  };
}
