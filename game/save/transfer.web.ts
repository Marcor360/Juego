import { validateSave, type Save } from "./schema";
export async function downloadSave(s: Save) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(validateSave(s), null, 2)], {
      type: "application/json",
    }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "el-camino-de-una-precursora-partida.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function importSave(): Promise<Save | null> {
  return new Promise((resolve, reject) => {
    const el = document.createElement("input");
    el.type = "file";
    el.accept = ".json,application/json";
    el.oncancel = () => resolve(null);
    el.onchange = async () => {
      try {
        const f = el.files?.[0];
        if (!f) return resolve(null);
        if (f.size > 100000) throw Error("El archivo es demasiado grande.");
        resolve(validateSave(JSON.parse(await f.text())));
      } catch (e) {
        reject(e);
      }
    };
    el.click();
  });
}
