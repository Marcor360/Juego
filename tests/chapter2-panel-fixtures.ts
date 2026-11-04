/** Explicit model fixtures only for panel/input regression tests, not a full-play claim. */
import { newSave, validateSave } from "../game/save/schema.ts";
import { withLibrary } from "../game/chapter2/campaign.ts";
import {
  freshLibrary,
  missingFor,
  addFlag,
  completeLibraryScene,
  getAttempt,
  questionsFor,
  scene,
} from "../game/chapter2/state.ts";
import { acceptAnswer } from "../game/questions.ts";
import { newBookAttempt } from "../game/chapter2/puzzles.ts";
const base = {
  ...newSave(),
  legacyRewards: true,
  migratedFrom: 1 as const,
  tools: ["fe"],
  unlockedChapters: [1, 2],
};
function until(completed: number) {
  const s = freshLibrary();
  for (let n = 1; n <= completed; n++) {
    for (const flag of missingFor(s, n)) addFlag(s, flag);
    s.dialogues[`CH2_${String(n).padStart(2, "0")}`] = scene(n).dialogue.length;
    const qs = questionsFor(n);
    if (qs.length) {
      const a = getAttempt(s, n);
      while (!a.finished) {
        const q = qs.find((q) => q.id === a.questionIds[a.step])!;
        a.selected = q.kind === "reflect" ? [q.options[0].id] : [...q.answer];
        acceptAnswer(a, qs);
      }
    }
    completeLibraryScene(s, n);
  }
  return s;
}
const q = until(1);
q.room = "vestibule";
q.discovered.push("vestibule");
q.x = 450;
q.y = 220;
const b = until(15);
b.room = "great";
b.floor = 3;
b.discovered.push("great");
b.x = 405;
b.y = 380;
b.board = newBookAttempt("medium", 1337);
b.dialogues.CH2_16 = scene(16).dialogue.length;
const visitor = until(7);
visitor.room = "visitors";
visitor.discovered.push("visitors");
visitor.x = 150;
visitor.y = 330;
console.log(
  JSON.stringify({
    questions: validateSave(withLibrary(base, q)),
    board: validateSave(withLibrary(base, b)),
    visitor: validateSave(withLibrary(base, visitor)),
  }),
);
