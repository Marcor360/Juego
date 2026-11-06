import { challengeRecoveryNotice } from "../chapter1/draft.ts";
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

export function storedChallengeNotice(raw: string | null, save: Save) {
  try { return challengeRecoveryNotice(JSON.parse(raw ?? "null"), save.challenge); }
  catch { return ""; }
}
