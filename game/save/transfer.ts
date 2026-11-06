import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { Directory, File, Paths } from "expo-file-system";
import type { Save } from "./schema";
import { MAX_SAVE_BYTES, readSaveFile, writeSaveFile, type ImportedSave } from "./file";

export async function downloadSave(save: Save): Promise<void> {
  const text = writeSaveFile(save);
  if (!await Sharing.isAvailableAsync()) throw Error("No se puede abrir el menú de compartir en este dispositivo.");
  const directory = new Directory(Paths.cache, "partidas-exportadas");
  directory.create({ intermediates: true, idempotent: true });
  // Keep recent files: a receiving app may read the URI after its sheet closes.
  const previous = directory.list().filter((item): item is File => item instanceof File && /^precursora-copia-\d+-[a-z0-9]+\.json$/.test(item.name))
    .sort((a,b) => b.name.localeCompare(a.name));
  previous.forEach((file,index) => {
    const timestamp = Number(file.name.split("-")[2]);
    if (index >= 9 || Date.now() - timestamp > 24 * 60 * 60 * 1000) {
      try { file.delete(); } catch { /* Optional cache cleanup must not prevent a backup. */ }
    }
  });
  const file = new File(directory, `precursora-copia-${Date.now()}-${Math.random().toString(36).slice(2,8)}.json`);
  file.create();
  file.write(text);
  await Sharing.shareAsync(file.uri, { mimeType: "application/json", UTI: "public.json", dialogTitle: "Guardar copia de la partida" });
}
export async function importSave(): Promise<ImportedSave | null> {
  const selected = await DocumentPicker.getDocumentAsync({ type: ["application/json", "text/plain", "application/octet-stream"], copyToCacheDirectory: true, multiple: false });
  if (selected.canceled) return null;
  const asset = selected.assets[0];
  if (!asset) throw Error("No se pudo abrir el archivo seleccionado.");
  const file = new File(asset.uri);
  if ((asset.size ?? file.size) > MAX_SAVE_BYTES || file.size > MAX_SAVE_BYTES) throw Error("El archivo supera el límite de 1 MB.");
  return readSaveFile(await file.text());
}
