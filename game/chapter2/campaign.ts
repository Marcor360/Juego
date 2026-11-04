import type { Save } from "../save/schema.ts";
import {
  freshLibrary,
  validateLibrary,
  hasScene,
  type LibraryState,
} from "./state.ts";
export function withLibrary(
  save: Save,
  library: LibraryState = save.library ?? freshLibrary(),
  activeChapter: 1 | 2 = 2,
): Save {
  const completed = hasScene(library, 16);
  return {
    ...save,
    schemaVersion: 3,
    level: activeChapter,
    activeChapter,
    library: JSON.parse(JSON.stringify(library)),
    tools: completed ? ["fe", "conocimiento"] : ["fe"],
    unlockedChapters: completed ? [1, 2, 3] : [1, 2],
  };
}
export function validateCampaign(
  raw: unknown,
  validateOld: (raw: unknown) => Save,
): Save {
  const s = raw as Save;
  if (
    !s ||
    s.schemaVersion !== 3 ||
    ![1, 2].includes(s.activeChapter ?? 0) ||
    !s.library ||
    s.level !== s.activeChapter
  )
    throw Error("Partida de campaña incompatible.");
  const old = validateOld({
    ...s,
    schemaVersion: 2,
    level: 1,
    tools: Array.isArray(s.tools)
      ? s.tools.filter((t) => t !== "conocimiento")
      : s.tools,
    unlockedChapters: Array.isArray(s.unlockedChapters)
      ? s.unlockedChapters.filter((c) => c !== 3)
      : s.unlockedChapters,
  });
  if (!old.unlockedChapters.includes(2) || !old.tools.includes("fe"))
    throw Error("Completa el bosque antes de entrar a la biblioteca.");
  const library = validateLibrary(s.library),
    expected = withLibrary(old, library, s.activeChapter!);
  if (
    JSON.stringify(s.tools) !== JSON.stringify(expected.tools) ||
    JSON.stringify(s.unlockedChapters) !==
      JSON.stringify(expected.unlockedChapters)
  )
    throw Error("Herramientas o capítulos adelantados.");
  return expected;
}
