export type Direction = "down" | "up" | "left" | "right";
export type RoomId =
  | "courtyard"
  | "vestibule"
  | "catalogue"
  | "archive"
  | "research"
  | "dark"
  | "visitors"
  | "maze"
  | "quiet"
  | "upper"
  | "landing"
  | "great"
  | "balcony";
export type Rect = { x: number; y: number; w: number; h: number };
export type Furniture = {
  id: string;
  art: number;
  x: number;
  y: number;
  w: number;
  h: number;
  solid?: Rect;
  kind?: "furniture" | "facade" | "object";
  frame?: number;
};
export type Interaction = {
  id: string;
  x: number;
  y: number;
  label: string;
  scene?: number;
  kind: "story" | "document" | "mechanism" | "reference" | "rest" | "book";
  flag?: string;
  role?: string;
};
export type Door = {
  id: string;
  x: number;
  y: number;
  to: RoomId;
  spawn: { x: number; y: number };
  required: number;
  label: string;
  flag?: string;
  floor?: boolean;
};
export type Actor = {
  id: string;
  role: string;
  column: number;
  x: number;
  y: number;
  path?: { x: number; y: number }[];
  activity?: "read" | "talk" | "walk" | "idle";
  ambient?: boolean;
};
export type Room = {
  id: RoomId;
  name: string;
  region: number;
  floor: number;
  w: number;
  h: number;
  tile: number;
  furniture: Furniture[];
  interactions: Interaction[];
  doors: Door[];
  actors: Actor[];
  hazards?: {
    id: string;
    x: number;
    y: number;
    amplitude: number;
    period: number;
  }[];
};
const prop = (
  id: string,
  art: number,
  x: number,
  y: number,
  w = 88,
  h = 75,
  solid = true,
): Furniture => ({
  id,
  art,
  x,
  y,
  w,
  h,
  ...(solid ? { solid: { x: x - w / 2, y: y - 14, w, h: 28 } } : {}),
});
const door = (
  id: string,
  x: number,
  y: number,
  to: RoomId,
  sx: number,
  sy: number,
  required = 0,
  label = "Atravesar puerta",
  flag?: string,
  floor = false,
): Door => ({
  id,
  x,
  y,
  to,
  spawn: { x: sx, y: sy },
  required,
  label,
  flag,
  floor,
});
const story = (
  id: string,
  x: number,
  y: number,
  scene: number,
  label: string,
  role: string,
): Interaction => ({ id, x, y, scene, label, role, kind: "story" });
const pickup = (
  id: string,
  x: number,
  y: number,
  label: string,
  kind: Interaction["kind"] = "document",
): Interaction => ({ id, x, y, label, kind, flag: id });
const ambient = (
  id: string,
  column: number,
  x: number,
  y: number,
  path?: { x: number; y: number }[],
  activity: Actor["activity"] = "read",
): Actor => ({
  id,
  role: "citizen",
  column,
  x,
  y,
  path,
  activity,
  ambient: true,
});
const shelves = (xs: number[], y: number, prefix: string) =>
  xs.map((x, i) => prop(prefix + i, 0, x, y, 92, 84));
const common = (id: string, x: number, y: number): Actor[] => [
  ambient(id + "_reader", 0, x, y),
  ambient(
    id + "_walker",
    1,
    x + 220,
    y + 70,
    [
      { x: x + 220, y: y + 70 },
      { x: x + 320, y: y + 70 },
    ],
    "walk",
  ),
];
export const rooms: Record<RoomId, Room> = {
  courtyard: {
    id: "courtyard",
    name: "Patio de la biblioteca",
    region: 1,
    floor: 0,
    w: 640,
    h: 480,
    tile: 4,
    furniture: [
      {
        id: "facade",
        art: 0,
        kind: "facade",
        x: 320,
        y: 180,
        w: 540,
        h: 180,
        solid: { x: 50, y: 45, w: 540, h: 104 },
      },
      prop("bench", 7, 130, 350, 96, 64),
      prop("garden", 7, 520, 350, 96, 64),
    ],
    interactions: [
      pickup("welcome_sign", 320, 215, "Leer el cartel de bienvenida", "book"),
    ],
    doors: [
      door(
        "front",
        320,
        170,
        "vestibule",
        320,
        405,
        0,
        "Entrar en la biblioteca",
      ),
    ],
    actors: [
      ambient("patio_read", 0, 130, 320),
      ambient("patio_chat", 2, 455, 320, undefined, "talk"),
      ambient(
        "patio_walk1",
        1,
        220,
        280,
        [
          { x: 220, y: 280 },
          { x: 420, y: 280 },
          { x: 420, y: 400 },
          { x: 220, y: 400 },
        ],
        "walk",
      ),
      ambient(
        "patio_walk2",
        3,
        95,
        415,
        [
          { x: 95, y: 415 },
          { x: 180, y: 415 },
        ],
        "walk",
      ),
    ],
  },
  vestibule: {
    id: "vestibule",
    name: "Vestíbulo principal",
    region: 1,
    floor: 0,
    w: 640,
    h: 480,
    tile: 0,
    furniture: [
      ...shelves([100, 550], 120, "vest_shelf"),
      prop("welcome_table", 1, 290, 275, 110, 76),
      prop("window", 3, 320, 120, 100, 110, false),
      prop("bench", 7, 110, 235, 84, 58),
    ],
    interactions: [
      story("traveler", 180, 365, 1, "Hablar con el viajero", "traveler"),
      story(
        "librarian_entry",
        450,
        190,
        2,
        "Hablar con la bibliotecaria",
        "librarian",
      ),
      pickup("intro_book", 345, 350, "Abrir el libro de bienvenida", "book"),
    ],
    doors: [
      door("outside", 320, 445, "courtyard", 320, 225, 0, "Salir al patio"),
      door("to_catalogue", 600, 240, "catalogue", 75, 440, 2, "Ir al catálogo"),
    ],
    actors: [
      { id: "traveler_actor", role: "traveler", column: 5, x: 200, y: 365 },
      { id: "librarian_actor", role: "librarian", column: 0, x: 474, y: 190 },
      ambient("vest_reader", 0, 110, 205),
      ambient(
        "vest_walk",
        2,
        150,
        410,
        [
          { x: 150, y: 410 },
          { x: 460, y: 410 },
        ],
        "walk",
      ),
    ],
  },
  catalogue: {
    id: "catalogue",
    name: "Catálogo y estanterías",
    region: 2,
    floor: 0,
    w: 800,
    h: 560,
    tile: 0,
    furniture: [
      ...shelves([140, 235, 490, 585], 145, "cat_top"),
      ...shelves([270, 365, 460], 340, "cat_mid"),
      prop("catalogue_desk", 2, 160, 230, 94, 70),
      prop("stairs", 4, 700, 170, 92, 95, false),
      prop("window", 3, 690, 90, 80, 90, false),
    ],
    interactions: [
      story("catalogue", 155, 285, 3, "Organizar el catálogo", "librarian"),
      story("assistant", 630, 410, 4, "Hablar con el auxiliar", "assistant"),
    ],
    doors: [
      door(
        "back_vest",
        35,
        440,
        "vestibule",
        550,
        240,
        0,
        "Volver al vestíbulo",
      ),
      door(
        "archive_stairs",
        700,
        180,
        "archive",
        100,
        400,
        3,
        "Subir al archivo",
        undefined,
        true,
      ),
      door(
        "to_research",
        755,
        440,
        "research",
        85,
        440,
        4,
        "Ir a investigación",
      ),
    ],
    actors: [
      { id: "cat_lib", role: "librarian", column: 0, x: 185, y: 285 },
      { id: "cat_assistant", role: "assistant", column: 1, x: 654, y: 410 },
      ambient("cat_reader", 3, 540, 215),
      ambient(
        "cat_walk",
        1,
        120,
        480,
        [
          { x: 120, y: 480 },
          { x: 650, y: 480 },
        ],
        "walk",
      ),
    ],
  },
  archive: {
    id: "archive",
    name: "Archivo intermedio",
    region: 2,
    floor: 1,
    w: 640,
    h: 480,
    tile: 0,
    furniture: [
      ...shelves([180, 275, 420, 515], 120, "archive_top"),
      prop("balcony", 1, 320, 245, 130, 75),
      prop("stairs", 4, 100, 405, 75, 88, false),
      prop("lift", 5, 555, 385, 80, 90, false),
    ],
    interactions: [
      pickup("mechanism_a", 140, 185, "Activar el mecanismo A", "mechanism"),
      pickup("mechanism_b", 495, 180, "Activar el mecanismo B", "mechanism"),
      pickup("acts_card", 430, 350, "Recoger la ficha de Hechos"),
      pickup("book_lift", 555, 385, "Poner en marcha el elevador", "mechanism"),
    ],
    doors: [
      door(
        "down_catalogue",
        100,
        415,
        "catalogue",
        680,
        220,
        0,
        "Bajar al catálogo",
        undefined,
        true,
      ),
      door(
        "lift_down",
        555,
        420,
        "catalogue",
        630,
        450,
        3,
        "Bajar por el elevador",
        "book_lift",
        true,
      ),
    ],
    actors: [ambient("archive_reader", 2, 215, 350)],
    hazards: [
      { id: "archive_cart", x: 310, y: 315, amplitude: 110, period: 5 },
    ],
  },
  research: {
    id: "research",
    name: "Salas de investigación",
    region: 3,
    floor: 0,
    w: 800,
    h: 560,
    tile: 0,
    furniture: [
      ...shelves([240, 335, 500, 595], 120, "research_shelf"),
      prop("desk_a", 1, 350, 220),
      prop("desk_b", 1, 540, 220),
      prop("desk_c", 1, 350, 420),
      prop("desk_d", 1, 540, 420),
      prop("window", 3, 700, 110, 90, 110, false),
    ],
    interactions: [
      story(
        "research_lib",
        165,
        220,
        5,
        "Consultar a la bibliotecaria",
        "librarian",
      ),
      story(
        "dark_assistant",
        685,
        325,
        6,
        "Hablar sobre las lámparas",
        "assistant",
      ),
      pickup("ref_bereans", 350, 270, "Consultar Hechos 17:11", "reference"),
      pickup(
        "ref_scriptures",
        540,
        270,
        "Consultar 2 Timoteo 3:16, 17",
        "reference",
      ),
      pickup("ref_faith", 540, 470, "Consultar Hebreos 11:1", "reference"),
      pickup("ref_philip", 350, 470, "Consultar Hechos 8:30-35", "reference"),
    ],
    doors: [
      door(
        "back_catalogue",
        35,
        440,
        "catalogue",
        710,
        440,
        0,
        "Volver al catálogo",
      ),
      door(
        "to_dark",
        750,
        325,
        "dark",
        95,
        375,
        5,
        "Entrar al pasillo sin luz",
      ),
      door(
        "to_visitors",
        750,
        480,
        "visitors",
        85,
        380,
        7,
        "Ir a la sala de visitantes",
      ),
    ],
    actors: [
      {
        id: "research_librarian",
        role: "librarian",
        column: 0,
        x: 190,
        y: 220,
      },
      {
        id: "research_assistant",
        role: "assistant",
        column: 1,
        x: 710,
        y: 325,
      },
      ambient("research_read", 3, 350, 185),
      ambient("research_read2", 0, 540, 185),
      ambient(
        "research_walk",
        1,
        145,
        500,
        [
          { x: 145, y: 500 },
          { x: 625, y: 500 },
        ],
        "walk",
      ),
    ],
  },
  dark: {
    id: "dark",
    name: "Pasillo de las lámparas",
    region: 3,
    floor: 1,
    w: 640,
    h: 480,
    tile: 1,
    furniture: [
      prop("old_stack", 0, 280, 195, 130, 100),
      prop("second_stack", 0, 410, 340, 130, 95),
      prop("column", 7, 170, 290, 65, 90),
    ],
    interactions: [
      pickup(
        "floor_mark_a",
        115,
        275,
        "Observar las marcas del suelo",
        "reference",
      ),
      pickup(
        "floor_mark_b",
        495,
        290,
        "Observar el segundo escalón",
        "reference",
      ),
      pickup("lights_on", 515, 125, "Activar el interruptor", "mechanism"),
    ],
    doors: [
      door(
        "dark_back",
        65,
        410,
        "research",
        670,
        370,
        0,
        "Volver a investigación",
      ),
    ],
    actors: [],
  },
  visitors: {
    id: "visitors",
    name: "Sala de visitantes",
    region: 4,
    floor: 0,
    w: 640,
    h: 480,
    tile: 1,
    furniture: [
      prop("conversation_table", 1, 190, 230, 100, 65),
      prop("student_table", 1, 440, 230, 100, 65),
      prop("window", 3, 320, 105, 92, 110, false),
      prop("bench", 7, 320, 385, 85, 60),
    ],
    interactions: [
      story("visitor", 155, 300, 8, "Conversar con la visitante", "visitor"),
      story("student", 435, 320, 10, "Escuchar a la estudiante", "student"),
    ],
    doors: [
      door(
        "visitor_back",
        35,
        380,
        "research",
        700,
        480,
        0,
        "Volver a investigación",
      ),
      door(
        "to_maze",
        595,
        150,
        "maze",
        90,
        580,
        11,
        "Entrar al laberinto de las ideas",
      ),
    ],
    actors: [
      { id: "visitor_actor", role: "visitor", column: 2, x: 180, y: 300 },
      { id: "student_actor", role: "student", column: 3, x: 460, y: 320 },
      ambient("visitor_reader", 0, 320, 350),
      ambient(
        "visitor_walk",
        2,
        95,
        425,
        [
          { x: 95, y: 425 },
          { x: 540, y: 425 },
        ],
        "walk",
      ),
    ],
  },
  maze: {
    id: "maze",
    name: "El laberinto de las ideas",
    region: 5,
    floor: 0,
    w: 960,
    h: 640,
    tile: 0,
    furniture: [
      ...shelves([100, 195, 290, 385, 480, 575, 670], 200, "maze_a"),
      ...shelves([290, 385, 480, 575, 670, 765, 860], 340, "maze_b"),
      ...shelves([100, 195, 290, 385, 480, 575, 670], 480, "maze_c"),
    ],
    interactions: [
      story(
        "researcher",
        835,
        560,
        12,
        "Conversar con el investigador",
        "researcher",
      ),
      pickup("doc_primary", 130, 105, "Leer la fuente principal"),
      pickup("doc_support", 850, 265, "Leer la fuente de apoyo"),
      pickup("doc_general", 140, 410, "Leer información general"),
      pickup("doc_opinion", 745, 410, "Leer una opinión"),
      pickup("doc_pending", 735, 555, "Leer una afirmación pendiente"),
    ],
    doors: [
      door(
        "maze_back",
        35,
        590,
        "visitors",
        550,
        165,
        0,
        "Volver a visitantes",
      ),
      door(
        "to_quiet",
        905,
        95,
        "quiet",
        80,
        375,
        12,
        "Entrar en la sala tranquila",
      ),
    ],
    actors: [
      { id: "researcher_actor", role: "researcher", column: 4, x: 862, y: 560 },
      ambient("maze_reader", 2, 820, 410),
      ambient(
        "maze_walk",
        1,
        180,
        550,
        [
          { x: 180, y: 550 },
          { x: 620, y: 550 },
        ],
        "walk",
      ),
    ],
  },
  quiet: {
    id: "quiet",
    name: "La sala tranquila",
    region: 5,
    floor: 1,
    w: 640,
    h: 480,
    tile: 0,
    furniture: [
      prop("window", 3, 320, 115, 110, 120, false),
      prop("rest_bench", 7, 145, 250, 100, 68),
      prop("notebook_table", 1, 420, 300, 100, 68),
    ],
    interactions: [
      story(
        "quiet_librarian",
        355,
        195,
        13,
        "Descansar y reflexionar",
        "librarian",
      ),
      { id: "rest", x: 500, y: 375, label: "Descansar", kind: "rest" },
    ],
    doors: [
      door("quiet_back", 35, 375, "maze", 860, 100, 0, "Volver al laberinto"),
      door(
        "to_upper",
        580,
        140,
        "upper",
        95,
        450,
        13,
        "Subir al último piso",
        undefined,
        true,
      ),
    ],
    actors: [
      {
        id: "quiet_librarian_actor",
        role: "librarian",
        column: 0,
        x: 380,
        y: 195,
      },
      ambient("quiet_reader", 0, 145, 215),
      ambient("quiet_reader2", 3, 420, 265),
    ],
  },
  upper: {
    id: "upper",
    name: "Archivo superior",
    region: 6,
    floor: 2,
    w: 800,
    h: 560,
    tile: 0,
    furniture: [
      ...shelves([165, 260, 355, 550, 645], 140, "upper_shelves"),
      ...shelves(
        [50, 145, 240, 335, 495, 590, 685, 780],
        300,
        "upper_timed_gate",
      ),
      prop("upper_barrier", 1, 320, 320, 120, 80),
      prop("upper_stairs", 4, 680, 150, 80, 95, false),
      prop("upper_lift", 5, 100, 445, 80, 90, false),
    ],
    interactions: [
      story(
        "upper_assistant",
        150,
        410,
        14,
        "Revisar el acceso superior",
        "assistant",
      ),
      pickup(
        "upper_switch",
        235,
        220,
        "Activar el mecanismo superior",
        "mechanism",
      ),
    ],
    doors: [
      door(
        "upper_back",
        65,
        480,
        "quiet",
        545,
        180,
        0,
        "Bajar a la sala tranquila",
        undefined,
        true,
      ),
      door(
        "upper_elevator",
        100,
        445,
        "landing",
        105,
        300,
        14,
        "Usar el ascensor superior",
        undefined,
        true,
      ),
      door(
        "to_landing",
        680,
        170,
        "landing",
        105,
        300,
        13,
        "Subir la escalera superior",
        "upper_switch",
        true,
      ),
    ],
    actors: [
      {
        id: "upper_assistant_actor",
        role: "assistant",
        column: 1,
        x: 175,
        y: 410,
      },
    ],
    hazards: [
      { id: "upper_cart_a", x: 420, y: 250, amplitude: 150, period: 5 },
      { id: "upper_cart_b", x: 530, y: 405, amplitude: 120, period: 4.5 },
    ],
  },
  landing: {
    id: "landing",
    name: "Balcón del archivo",
    region: 6,
    floor: 3,
    w: 640,
    h: 400,
    tile: 0,
    furniture: [
      ...shelves([220, 315, 410], 140, "landing_stack"),
      prop("landing_stairs", 4, 100, 300, 80, 90, false),
    ],
    interactions: [
      story(
        "upper_door",
        495,
        260,
        14,
        "Abrir el acceso a la gran sala",
        "assistant",
      ),
    ],
    doors: [
      door(
        "landing_down",
        70,
        330,
        "upper",
        650,
        210,
        0,
        "Bajar al archivo",
        undefined,
        true,
      ),
      door(
        "great_gate",
        570,
        270,
        "great",
        100,
        420,
        14,
        "Entrar en la gran sala",
      ),
    ],
    actors: [ambient("landing_reader", 2, 305, 220)],
  },
  great: {
    id: "great",
    name: "La gran sala",
    region: 6,
    floor: 3,
    w: 800,
    h: 560,
    tile: 7,
    furniture: [
      ...shelves([110, 205, 300, 500, 595, 690], 145, "great_books"),
      prop("great_table", 1, 405, 320, 185, 120),
      prop("great_window", 3, 400, 105, 110, 120, false),
      {
        ...prop("knowledge_chest", 2, 600, 415, 44, 38, false),
        kind: "object",
        frame: 2,
      },
    ],
    interactions: [
      story(
        "final_visitor",
        230,
        365,
        15,
        "La prueba del conocimiento",
        "visitor",
      ),
      story(
        "book_challenge",
        405,
        405,
        16,
        "El desafío de los 66 libros",
        "librarian",
      ),
    ],
    doors: [
      door("great_back", 40, 420, "landing", 530, 280, 0, "Volver al archivo"),
      door("to_balcony", 750, 170, "balcony", 100, 300, 16, "Salir al balcón"),
    ],
    actors: [
      { id: "great_librarian", role: "librarian", column: 0, x: 445, y: 405 },
      { id: "great_visitor", role: "visitor", column: 2, x: 255, y: 365 },
      ambient("great_read", 0, 120, 280),
      ambient("great_read2", 3, 680, 280),
      ambient(
        "great_walk",
        1,
        150,
        485,
        [
          { x: 150, y: 485 },
          { x: 650, y: 485 },
        ],
        "walk",
      ),
    ],
  },
  balcony: {
    id: "balcony",
    name: "Balcón de los nuevos caminos",
    region: 6,
    floor: 3,
    w: 640,
    h: 400,
    tile: 1,
    furniture: [prop("balcony_bench", 7, 420, 300, 100, 65)],
    interactions: [
      {
        id: "horizon",
        x: 320,
        y: 170,
        label: "Mirar el puente entre las montañas",
        kind: "book",
      },
    ],
    doors: [
      door(
        "balcony_back",
        65,
        330,
        "great",
        700,
        190,
        0,
        "Volver a la gran sala",
      ),
    ],
    actors: [ambient("balcony_reader", 2, 420, 265)],
  },
};
export const roomIds = Object.keys(rooms) as RoomId[];
export const flagIds = [
  "welcome_sign",
  "intro_book",
  "traveler_talk",
  "table_west",
  "table_east",
  "walk_up",
  "walk_down",
  "walk_left",
  "walk_right",
  "mechanism_a",
  "mechanism_b",
  "acts_card",
  "book_lift",
  "ref_bereans",
  "ref_scriptures",
  "ref_faith",
  "ref_philip",
  "floor_mark_a",
  "floor_mark_b",
  "lights_on",
  "doc_primary",
  "doc_support",
  "doc_general",
  "doc_opinion",
  "doc_pending",
  "upper_switch",
  "upper_stairs",
  "upper_route",
  "horizon",
  "lantern_equipped",
];
export const sceneTargets: Record<number, { room: RoomId; id: string }> = {
  1: { room: "vestibule", id: "traveler" },
  2: { room: "vestibule", id: "librarian_entry" },
  3: { room: "catalogue", id: "catalogue" },
  4: { room: "catalogue", id: "assistant" },
  5: { room: "research", id: "research_lib" },
  6: { room: "research", id: "dark_assistant" },
  7: { room: "research", id: "research_lib" },
  8: { room: "visitors", id: "visitor" },
  9: { room: "visitors", id: "visitor" },
  10: { room: "visitors", id: "student" },
  11: { room: "visitors", id: "student" },
  12: { room: "maze", id: "researcher" },
  13: { room: "quiet", id: "quiet_librarian" },
  14: { room: "upper", id: "upper_assistant" },
  15: { room: "great", id: "final_visitor" },
  16: { room: "great", id: "book_challenge" },
};
export function isWalkable(room: Room, x: number, y: number, r = 9) {
  return (
    Number.isFinite(x) &&
    Number.isFinite(y) &&
    x >= r + 8 &&
    x <= room.w - r - 8 &&
    y >= (room.id === "balcony" ? 185 : 80) &&
    y <= room.h - r - 8 &&
    !room.furniture.some(
      (o) =>
        o.solid &&
        x + r > o.solid.x &&
        x - r < o.solid.x + o.solid.w &&
        y + r * 0.6 > o.solid.y &&
        y - r * 0.6 < o.solid.y + o.solid.h,
    )
  );
}
