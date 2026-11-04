import { validateSave, type Save } from "./schema.ts";

/** Decode a stored candidate without allowing invalid JSON to block fallback. */
export function decodeStoredSave(raw: string | null): Save | null {
  if (!raw) return null;
  try {
    return validateSave(JSON.parse(raw));
  } catch {
    return null;
  }
}
