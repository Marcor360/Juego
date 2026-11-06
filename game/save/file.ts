import { validateSave, type Save } from "./schema.ts";
import { challengeRecoveryNotice } from "../chapter1/draft.ts";
export const MAX_SAVE_BYTES = 1024 * 1024;
export const SAVE_FILENAME = "el-camino-de-una-precursora-partida.json";
export type ImportedSave = { save: Save; notice: string };

export function utf8Length(text: string) {
  let bytes = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code < 0x80) bytes++;
    else if (code < 0x800) bytes += 2;
    else if (code >= 0xd800 && code <= 0xdbff && text.charCodeAt(i+1) >= 0xdc00 && text.charCodeAt(i+1) <= 0xdfff) { bytes += 4; i++; }
    else bytes += 3;
  }
  return bytes;
}
export function readSaveFile(text: string): ImportedSave {
  if (text.length > MAX_SAVE_BYTES || utf8Length(text) > MAX_SAVE_BYTES) throw Error("El archivo supera el límite de 1 MB.");
  let raw: unknown;
  try { raw = JSON.parse(text.replace(/^\uFEFF/, "")); }
  catch { throw Error("El archivo no contiene una partida JSON válida."); }
  const save = validateSave(raw);
  return { save, notice: challengeRecoveryNotice(raw, save.challenge) };
}
export function writeSaveFile(save: Save) {
  const text = JSON.stringify(validateSave(save), null, 2);
  if (utf8Length(text) > MAX_SAVE_BYTES) throw Error("La copia supera el límite de 1 MB.");
  return text;
}
