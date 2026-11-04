import story from "./content/story.json" with { type: "json" };
import {
  createAttempt,
  validateAttempt,
  shuffle,
  randomFor,
  type Attempt,
  type Question,
} from "../questions.ts";
import {
  rooms,
  roomIds,
  flagIds,
  isWalkable,
  type RoomId,
  type Direction,
} from "./maps/library.ts";
import {
  validateBookAttempt,
  limits,
  type BookAttempt,
  type Difficulty,
  type BookRecord,
} from "./puzzles.ts";
export type LibraryScene = {
  number: number;
  id: string;
  title: string;
  dialogue: { speaker: string; text: string }[];
  closing: { speaker: string; text: string }[];
  timeout?: { speaker: string; text: string }[];
  reference: string;
  questions: Question[];
};
export const libraryScenes = story.scenes as LibraryScene[];
export const scene = (n: number) => libraryScenes[n - 1];
export const ch2id = (n: number) => `CH2_${String(n).padStart(2, "0")}`;
export type LibraryState = {
  version: 1;
  completed: string[];
  flags: string[];
  discovered: RoomId[];
  room: RoomId;
  floor: number;
  x: number;
  y: number;
  direction: Direction;
  health: number;
  checkpoint: RoomId;
  attempts: Record<string, Attempt>;
  dialogues: Record<string, number>;
  reflections: string[];
  board: BookAttempt | null;
  records: Partial<Record<Difficulty, BookRecord>>;
  worldTime: number;
  optionalDebates: number;
  actorMemory: Record<
    string,
    { x: number; y: number; index: number; wait: number; left: boolean }
  >;
};
export const freshLibrary = (): LibraryState => ({
  version: 1,
  completed: [],
  flags: [],
  discovered: ["courtyard"],
  room: "courtyard",
  floor: 0,
  x: 320,
  y: 250,
  direction: "up",
  health: 3,
  checkpoint: "vestibule",
  attempts: {},
  dialogues: {},
  reflections: [],
  board: null,
  records: {},
  worldTime: 0,
  optionalDebates: 0,
  actorMemory: {},
});
export const hasScene = (s: LibraryState, n: number) =>
  s.completed.includes(ch2id(n));
export const activeScene = (s: LibraryState) =>
  Math.min(16, s.completed.length + 1);
export const addFlag = (s: LibraryState, id: string) => {
  if (!s.flags.includes(id)) s.flags.push(id);
};
export function questionsFor(n: number, optional = false) {
  const q = scene(n).questions;
  return n === 12 ? (optional ? q.slice(6) : q.slice(0, 6)) : q;
}
export function getAttempt(s: LibraryState, n: number, optional = false) {
  const key = optional ? "debate_extra" : ch2id(n);
  if (!s.attempts[key]) {
    const questions = questionsFor(n, optional),
      a = createAttempt(questions, Date.now() >>> 0, n === 12);
    if (n === 12 && !optional)
      a.questionIds = [
        ...shuffle(
          questions.slice(0, 5).map((q) => q.id),
          randomFor(a.seed),
        ),
        questions[5].id,
      ];
    s.attempts[key] = a;
  }
  return s.attempts[key];
}
export function missingFor(s: LibraryState, n: number) {
  const needed: Record<number, string[]> = {
    1: [
      "walk_up",
      "walk_down",
      "walk_left",
      "walk_right",
      "table_west",
      "table_east",
      "intro_book",
      "traveler_talk",
    ],
    4: ["mechanism_a", "mechanism_b", "acts_card", "book_lift"],
    5: ["ref_bereans"],
    6: ["lantern_equipped", "floor_mark_a", "floor_mark_b", "lights_on"],
    7: ["ref_scriptures"],
    9: ["ref_faith"],
    11: ["ref_philip"],
    12: [
      "doc_primary",
      "doc_support",
      "doc_general",
      "doc_opinion",
      "doc_pending",
    ],
    14: ["upper_switch", "upper_stairs", "upper_route"],
  };
  const missing = (needed[n] ?? []).filter((f) => !s.flags.includes(f));
  if (n === 1 && !s.flags.includes("map_opened")) missing.push("map_opened");
  return missing;
}
export const flagLabels: Record<string, string> = {
  walk_up: "Camina hacia arriba",
  walk_down: "Camina hacia abajo",
  walk_left: "Camina hacia la izquierda",
  walk_right: "Camina hacia la derecha",
  table_west: "Pasa por el lado izquierdo de la mesa",
  table_east: "Rodea el lado derecho de la mesa",
  intro_book: "Abre el libro de bienvenida",
  traveler_talk: "Habla con el viajero",
  map_opened: "Consulta el mapa",
  mechanism_a: "Activa el mecanismo A",
  mechanism_b: "Activa el mecanismo B",
  acts_card: "Recupera la ficha de Hechos",
  book_lift: "Activa el elevador de libros",
  ref_bereans: "Consulta Hechos 17:11 en investigación",
  ref_scriptures: "Consulta 2 Timoteo 3:16, 17",
  lantern_equipped: "Equipa la linterna de Fe desde el inventario",
  floor_mark_a: "Ilumina y observa el primer escalón",
  floor_mark_b: "Observa las marcas al otro lado del pasillo",
  lights_on: "Activa el interruptor de las lámparas",
  ref_faith: "Busca Hebreos 11:1 en investigación",
  ref_philip: "Localiza Hechos 8:30-35 en investigación",
  doc_primary: "Lee la fuente principal del laberinto",
  doc_support: "Consulta la fuente de apoyo",
  doc_general: "Examina el documento de información general",
  doc_opinion: "Lee la opinión del visitante",
  doc_pending: "Investiga la afirmación sin confirmar",
  upper_switch: "Activa el mecanismo del archivo superior",
  upper_stairs: "Sube la escalera superior",
  upper_route: "Abre la puerta del acceso superior",
};
export function completeLibraryScene(s: LibraryState, n: number) {
  if (n !== s.completed.length + 1 || missingFor(s, n).length)
    throw Error("Todavía faltan acciones de esta escena.");
  if (questionsFor(n).length && !s.attempts[ch2id(n)]?.finished)
    throw Error("Continúa la investigación antes de avanzar.");
  if (n === 16 && s.board?.status !== "won")
    throw Error("Ordena los 66 libros antes de recibir Conocimiento.");
  s.completed.push(ch2id(n));
  s.reflections.push(scene(n).title);
  if (n === 4) s.checkpoint = "catalogue";
  if (n === 9) s.checkpoint = "research";
  if (n === 13) {
    s.checkpoint = "quiet";
    s.health = 3;
  }
  if (n === 15) s.checkpoint = "great";
}
export function validateLibrary(raw: unknown): LibraryState {
  const s = raw as LibraryState,
    unique = (v: unknown, ids: string[]) =>
      Array.isArray(v) &&
      new Set(v).size === v.length &&
      v.every((x) => ids.includes(x));
  if (
    !s ||
    !["down", "up", "left", "right"].includes(s.direction) ||
    s.version !== 1 ||
    !unique(
      s.completed,
      Array.from({ length: 16 }, (_, i) => ch2id(i + 1)),
    ) ||
    !s.completed.every((id, i) => id === ch2id(i + 1)) ||
    !unique(s.flags, [...flagIds, "map_opened"]) ||
    !unique(s.discovered, roomIds) ||
    !roomIds.includes(s.room) ||
    !s.discovered.includes(s.room) ||
    rooms[s.room].floor !== s.floor ||
    !isWalkable(rooms[s.room], s.x, s.y) ||
    !Number.isInteger(s.health) ||
    s.health < 1 ||
    s.health > 3 ||
    !["vestibule", "catalogue", "research", "quiet", "great"].includes(
      s.checkpoint,
    ) ||
    !Number.isFinite(s.worldTime) ||
    s.worldTime < 0 ||
    !Number.isInteger(s.optionalDebates) ||
    s.optionalDebates < 0 ||
    s.optionalDebates > 10000
  )
    throw Error("Estado de biblioteca inválido.");
  if (
    !s.actorMemory ||
    typeof s.actorMemory !== "object" ||
    Array.isArray(s.actorMemory)
  )
    throw Error("Rutinas de visitantes incompatibles.");
  for (const [key, a] of Object.entries(s.actorMemory)) {
    const [roomId, actorId] = key.split(":");
    const r = rooms[roomId as RoomId],
      actor = r?.actors.find((actor) => actor.id === actorId);
    if (
      !r ||
      !actor ||
      !s.discovered.includes(roomId as RoomId) ||
      !a ||
      !isWalkable(r, a.x, a.y, 7) ||
      !Number.isInteger(a.index) ||
      a.index < 0 ||
      a.index >= Math.max(1, actor.path?.length ?? 1) ||
      !Number.isFinite(a.wait) ||
      a.wait < 0 ||
      a.wait > 10 ||
      typeof a.left !== "boolean"
    )
      throw Error("Rutina de visitante inválida.");
  }
  const minScenes: Partial<Record<RoomId, number>> = {
    catalogue: 2,
    archive: 3,
    research: 4,
    dark: 5,
    visitors: 7,
    maze: 11,
    quiet: 12,
    upper: 13,
    landing: 13,
    great: 14,
    balcony: 16,
  };
  const flagMinimum: Record<string, number> = {
    mechanism_a: 3,
    mechanism_b: 3,
    acts_card: 3,
    book_lift: 3,
    ref_bereans: 4,
    ref_scriptures: 4,
    ref_faith: 4,
    ref_philip: 4,
    floor_mark_a: 5,
    floor_mark_b: 5,
    lights_on: 5,
    doc_primary: 11,
    doc_support: 11,
    doc_general: 11,
    doc_opinion: 11,
    doc_pending: 11,
    upper_switch: 13,
    upper_stairs: 13,
    upper_route: 13,
    horizon: 16,
  };
  if (s.flags.some((f) => (flagMinimum[f] ?? 0) > s.completed.length))
    throw Error("Evidencia de una sala todavía bloqueada.");
  if (
    s.discovered.some((id) => (minScenes[id] ?? 0) > s.completed.length) ||
    (minScenes[s.room] ?? 0) > s.completed.length ||
    (s.checkpoint === "catalogue" && !hasScene(s, 4)) ||
    (s.checkpoint === "research" && !hasScene(s, 9)) ||
    (s.checkpoint === "quiet" && !hasScene(s, 13)) ||
    (s.checkpoint === "great" && !hasScene(s, 15))
  )
    throw Error("Habitación o checkpoint bloqueado.");
  if (
    !s.attempts ||
    typeof s.attempts !== "object" ||
    Array.isArray(s.attempts) ||
    !s.dialogues ||
    typeof s.dialogues !== "object" ||
    Array.isArray(s.dialogues) ||
    !Array.isArray(s.reflections) ||
    s.reflections.length > 100 ||
    s.reflections.some((x) => typeof x !== "string" || x.length > 1000)
  )
    throw Error("Cuaderno incompatible.");
  for (const [id, a] of Object.entries(s.attempts)) {
    const n = id === "debate_extra" ? 12 : Number(id.slice(4));
    if (
      (id !== "debate_extra" && id !== ch2id(n)) ||
      (id === "debate_extra" && !hasScene(s, 12)) ||
      n < 1 ||
      n > 16 ||
      n > s.completed.length + 1 ||
      !questionsFor(n, id === "debate_extra").length
    )
      throw Error("Intento adelantado o desconocido.");
    validateAttempt(a, questionsFor(n, id === "debate_extra"));
  }
  for (const [id, index] of Object.entries(s.dialogues)) {
    const n = Number(id.slice(4));
    if (
      id !== ch2id(n) ||
      n < 1 ||
      n > 16 ||
      !Number.isInteger(index) ||
      index < 0 ||
      index > scene(n).dialogue.length ||
      n > s.completed.length + 1
    )
      throw Error("Conversación incompatible.");
  }
  if (s.board) validateBookAttempt(s.board);
  if (s.board && !hasScene(s, 15)) throw Error("Reto final adelantado.");
  for (let n = 1; n <= s.completed.length; n++) {
    if (
      missingFor(s, n).length ||
      (questionsFor(n).length && !s.attempts[ch2id(n)]?.finished)
    )
      throw Error("Una escena carece de sus requisitos.");
  }
  if (hasScene(s, 16) && s.board?.status !== "won")
    throw Error("Recompensa final sin resolver el tablero.");
  if (
    !s.records ||
    typeof s.records !== "object" ||
    Array.isArray(s.records) ||
    Object.entries(s.records).some(
      ([difficulty, r]) =>
        !Object.hasOwn(limits, difficulty) ||
        !r ||
        !Number.isFinite(r.seconds) ||
        r.seconds < 0 ||
        r.seconds > limits[difficulty as Difficulty] ||
        !Number.isInteger(r.swaps) ||
        r.swaps < 1,
    ) ||
    (Object.keys(s.records).length && !hasScene(s, 16))
  )
    throw Error("Récords incompatibles.");
  return JSON.parse(JSON.stringify(s));
}
