import type { Save } from "./schema";
import { MAX_SAVE_BYTES, SAVE_FILENAME, readSaveFile, writeSaveFile, type ImportedSave } from "./file";
export async function downloadSave(save: Save) {
  const url = URL.createObjectURL(new Blob([writeSaveFile(save)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = SAVE_FILENAME;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function importSave(): Promise<ImportedSave | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    let settled = false;
    let cancellation: ReturnType<typeof setTimeout> | undefined;
    const finish = (value: ImportedSave | null, error?: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(cancellation);
      window.removeEventListener("focus", returned);
      input.onchange = null;
      input.oncancel = null;
      if (error) reject(error); else resolve(value);
    };
    const returned = () => {
      cancellation = setTimeout(() => { if (!input.files?.length) finish(null); }, 300);
    };
    input.oncancel = () => finish(null);
    input.onchange = async () => {
      try {
        const file = input.files?.[0];
        if (!file) return finish(null);
        if (file.size > MAX_SAVE_BYTES) throw Error("El archivo supera el límite de 1 MB.");
        finish(readSaveFile(await file.text()));
      } catch (error) { finish(null, error); }
    };
    window.addEventListener("focus", returned);
    input.click();
  });
}
