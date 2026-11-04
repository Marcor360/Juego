/** Valid, explicit fixture: migrated Chapter 1 reward, without pretending it was replayed. */
import { newSave, validateSave } from "../game/save/schema.ts";
import { withLibrary } from "../game/chapter2/campaign.ts";
import { rooms } from "../game/chapter2/maps/library.ts";
import { libraryScenes } from "../game/chapter2/state.ts";
const entry = withLibrary({
  ...newSave(),
  legacyRewards: true,
  migratedFrom: 1,
  tools: ["fe"],
  unlockedChapters: [1, 2],
});
console.log(
  JSON.stringify({ entry: validateSave(entry), rooms, story: libraryScenes }),
);
