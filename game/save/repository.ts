import { validateSave, type Save } from "./schema.ts";
import { decodeStoredSave, storedChallengeNotice } from "./recovery.ts";
export const SAVE_KEYS = {
  current: "precursora-save-v2",
  legacy: "precursora-save-v1",
  recovery: "precursora-save-v2-recovery",
  lastGood: "precursora-save-v2-last-good",
  damagedPrefix: "precursora-save-v2-damaged-",
} as const;
export type SaveStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
};
export type LoadResult = {
  save: Save | null;
  notice: string;
  source: "current" | "backup" | "legacy" | "none";
};
/** Serializes writes and preserves the previous candidate before replacing it. */
export function createSaveRepository(storage: SaveStorage) {
  let queue: Promise<void> = Promise.resolve();
  async function preserveDamaged(raw: string) {
    // Keep compatibility with the PR's first recovery copy, without overwriting it.
    const first = await storage.getItem(SAVE_KEYS.recovery);
    if (first === raw) return;
    if (first === null) {
      await storage.setItem(SAVE_KEYS.recovery, raw);
      return;
    }
    let hash = 2166136261;
    for (let i = 0; i < raw.length; i++)
      hash = Math.imul(hash ^ raw.charCodeAt(i), 16777619) >>> 0;
    for (let n = 0; n < 100; n++) {
      const key =
        SAVE_KEYS.damagedPrefix + hash.toString(16) + (n ? "-" + n : "");
      const existing = await storage.getItem(key);
      if (existing === raw) return;
      if (existing === null) {
        await storage.setItem(key, raw);
        return;
      }
    }
    throw Error("No se pudo reservar una copia de recuperación.");
  }
  async function load(): Promise<LoadResult> {
    let readFailed = false,
      backupFailed = false;
    const read = async (key: string) => {
      try {
        return await storage.getItem(key);
      } catch {
        readFailed = true;
        return null;
      }
    };
    const current = await read(SAVE_KEYS.current),
      valid = decodeStoredSave(current);
    if (valid) return { save: valid, notice: storedChallengeNotice(current, valid), source: "current" };
    if (current !== null) {
      try {
        await preserveDamaged(current);
      } catch {
        backupFailed = true;
      }
    }
    // A failed read is independent: it must not hide another valid candidate.
    const lastGood = await read(SAVE_KEYS.lastGood),
      recovery = await read(SAVE_KEYS.recovery),
      legacy = await read(SAVE_KEYS.legacy);
    const candidates = [
      { raw: lastGood, source: "backup" as const },
      { raw: recovery, source: "backup" as const },
      { raw: legacy, source: "legacy" as const },
    ];
    const explanation = backupFailed
      ? " No se pudo crear el respaldo de los datos dañados; no se reemplazarán mientras eso siga fallando."
      : "";
    for (const candidate of candidates) {
      const save = decodeStoredSave(candidate.raw);
      if (save)
        return {
          save,
          source: candidate.source,
          notice:
            (candidate.source === "legacy"
              ? "Se recuperó una partida de la versión anterior."
              : "Se recuperó una copia local válida de tu partida.") +
            (readFailed ? " No se pudo leer parte del almacenamiento." : "") +
            explanation + (storedChallengeNotice(candidate.raw, save) ? " " + storedChallengeNotice(candidate.raw, save) : ""),
        };
    }
    return {
      save: null,
      source: "none",
      notice: readFailed
        ? "No se pudo leer parte del almacenamiento local. Puedes jugar y descargar una copia; no se reemplazarán datos que no podamos leer."
        : current !== null ||
            lastGood !== null ||
            recovery !== null ||
            legacy !== null
          ? "Hay datos de partida incompatibles o dañados. Se conservaron para intentar recuperarlos." +
            explanation
          : "",
    };
  }
  function store(save: Save): Promise<void> {
    const data = JSON.stringify(validateSave(save));
    const task = queue
      .catch(() => {})
      .then(async () => {
        let current: string | null;
        try {
          current = await storage.getItem(SAVE_KEYS.current);
        } catch {
          throw Error(
            "No se pudo leer la partida existente. No se sobrescribió; descarga una copia de esta sesión.",
          );
        }
        if (current === data) return;
        if (current !== null) {
          try {
            if (decodeStoredSave(current)) {
              const previousBackup = await storage.getItem(SAVE_KEYS.lastGood);
              if (previousBackup !== null && !decodeStoredSave(previousBackup))
                await preserveDamaged(previousBackup);
              await storage.setItem(SAVE_KEYS.lastGood, current);
            } else await preserveDamaged(current);
          } catch {
            throw Error(
              "No se pudo respaldar la partida existente. No se sobrescribió; descarga una copia de esta sesión.",
            );
          }
        }
        await storage.setItem(SAVE_KEYS.current, data);
      });
    queue = task;
    return task;
  }
  return { load, store };
}
