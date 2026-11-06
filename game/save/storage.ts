import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSaveRepository } from "./repository";
export type { LoadResult } from "./repository";
const repository = createSaveRepository(AsyncStorage);
export const loadSave = repository.load;
export const storeSave = repository.store;

import { createPreferencesRepository } from "./preferences";
const preferences = createPreferencesRepository(AsyncStorage);
export const loadPreferences = preferences.load;
export const storePreferences = preferences.store;
