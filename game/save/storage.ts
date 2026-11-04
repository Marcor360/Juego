import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSaveRepository } from "./repository";
export type { LoadResult } from "./repository";
const repository = createSaveRepository(AsyncStorage);
export const loadSave = repository.load;
export const storeSave = repository.store;
