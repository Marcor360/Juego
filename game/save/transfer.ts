import type { Save } from "./schema";
export async function downloadSave(_s: Save): Promise<void> {
  throw Error("La descarga JSON está disponible en web.");
}
export async function importSave(): Promise<Save | null> {
  throw Error("La importación JSON está disponible en web.");
}
