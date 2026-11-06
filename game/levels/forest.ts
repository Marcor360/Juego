import { hasMission, type Progress } from "../missions/progress.ts";
export const WIDTH = 8000,
  GROUND = 226;
export const zones = [
  { id: "entrance", name: "Entrada del bosque", start: 0, end: 1120 },
  { id: "stream", name: "El arroyo", start: 1120, end: 2560 },
  { id: "bridge", name: "El puente dañado", start: 2560, end: 4000 },
  { id: "clearing", name: "El claro", start: 4000, end: 5120 },
  { id: "mist", name: "La niebla", start: 5120, end: 7040 },
  { id: "refuge", name: "El refugio", start: 7040, end: 8000 },
];
export type CheckpointId =
  | "ch1_entrada"
  | "ch1_arroyo"
  | "ch1_puente"
  | "ch1_claro"
  | "ch1_niebla"
  | "ch1_refugio";
export const checkpoints: Record<CheckpointId, { x: number; scene: number }> = {
  ch1_entrada: { x: 120, scene: 0 },
  ch1_arroyo: { x: 2440, scene: 5 },
  ch1_puente: { x: 3860, scene: 9 },
  ch1_claro: { x: 4500, scene: 10 },
  ch1_niebla: { x: 5200, scene: 11 },
  ch1_refugio: { x: 7440, scene: 14 },
};
export const gaps = [
  { x: 1410, w: 28 },
  { x: 1660, w: 32 },
  { x: 2650, w: 290 },
  { x: 3270, w: 30 },
  { x: 3475, w: 33 },
  { x: 5310, w: 740 },
  { x: 6480, w: 40 },
  { x: 6720, w: 36 },
];
export type Platform = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  kind?: "stone" | "wood" | "moving" | "wet" | "rope" | "fragile";
  move?: { axis: "x" | "y"; amplitude: number; period: number };
};
const p = (
  id: string,
  x: number,
  y: number,
  w: number,
  h = 14,
  kind: Platform["kind"] = "stone",
): Platform => ({ id, x, y, w, h, kind });
export const platforms: Platform[] = [
  p("tutorial_rock", 380, 204, 48, 22),
  p("mark_step", 1190, 195, 60),
  p("mark_high", 1270, 162, 68),
  p("fragment_step", 1480, 197, 60),
  p("fragment_high", 1558, 166, 66),
  p("lever_step", 2010, 196, 60),
  p("lever_high", 2090, 160, 72),
  p("branch_approach", 2190, 194, 60),
  p("bridge_step", 2568, 198, 56),
  p("rotten_plank", 2645, 216, 30, 10, "fragile"),
  p("detour_a", 2640, 170, 54),
  p("detour_b", 2720, 148, 54),
  p("detour_c", 2800, 175, 54),
  p("detour_d", 2880, 194, 64),
  p("rope_step", 3190, 196, 54),
  p("rope_lift", 3265, 167, 64, 12, "rope"),
  p("cover_ledge", 3345, 138, 70),
  p("wick_step", 3450, 195, 60),
  p("wick_ledge", 3530, 162, 70),
  p("bridge_exit", 3620, 198, 58),
  p("clearing_rock", 4650, 203, 56),
  p("mist_step", 5250, 195, 54),
  {
    ...p("mist_move1", 5330, 170, 56, 12, "moving"),
    move: { axis: "x", amplitude: 12, period: 4 },
  },
  p("mist_wet1", 5420, 193, 58, 14, "wet"),
  {
    ...p("mist_move2", 5510, 164, 54, 12, "moving"),
    move: { axis: "y", amplitude: 8, period: 4.5 },
  },
  p("mist_stone2", 5600, 190, 54),
  p("mist_step3", 5690, 161, 56),
  {
    ...p("mist_move3", 5770, 181, 56, 12, "moving"),
    move: { axis: "x", amplitude: 12, period: 3.8 },
  },
  p("mist_wet2", 5860, 196, 58, 14, "wet"),
  p("mist_step4", 5940, 164, 54),
  p("mist_exit", 6020, 193, 64),
  p("trust_step1", 6330, 195, 54),
  p("trust_step2", 6410, 162, 54),
  {
    ...p("trust_move", 6490, 183, 56, 12, "moving"),
    move: { axis: "x", amplitude: 10, period: 4.2 },
  },
  p("trust_step3", 6580, 194, 58),
  p("trust_step4", 6660, 166, 54),
  p("trust_exit", 6740, 194, 64),
  p("optional1", 690, 194, 50),
  p("optional2", 760, 162, 60),
  p("optional3", 6900, 195, 54),
  p("optional4", 6980, 161, 54),
];
export const hazards = [
  { id: "root1", x: 5465, y: 193, w: 15 },
  { id: "root2", x: 5613, y: 190, w: 10 },
  { id: "root3", x: 5895, y: 196, w: 15 },
  { id: "root4", x: 6170, y: 226, w: 14 },
  { id: "root5", x: 6605, y: 194, w: 15 },
];
export type WorldObject = {
  id: string;
  x: number;
  y: number;
  kind:
    "story" | "evidence" | "item" | "light" | "helper" | "boundary" | "rest";
  scene?: number;
  label: string;
};
export const objects: WorldObject[] = [
  {
    id: "notebook",
    x: 170,
    y: 226,
    kind: "story",
    scene: 1,
    label: "Preparar el cuaderno",
  },
  {
    id: "guide",
    x: 600,
    y: 226,
    kind: "story",
    scene: 2,
    label: "Hablar con la guía",
  },
  {
    id: "sign1",
    x: 1345,
    y: 226,
    kind: "story",
    scene: 3,
    label: "Reparar la primera señal",
  },
  {
    id: "rock_mark",
    x: 1300,
    y: 146,
    kind: "evidence",
    label: "Marca de roca",
  },
  {
    id: "storm_notice",
    x: 1470,
    y: 226,
    kind: "evidence",
    label: "Aviso de tormenta",
  },
  {
    id: "sign_fragment",
    x: 1590,
    y: 150,
    kind: "evidence",
    label: "Fragmento del letrero",
  },
  {
    id: "walker",
    x: 1800,
    y: 226,
    kind: "story",
    scene: 4,
    label: "Escuchar a la caminante",
  },
  { id: "lever", x: 2125, y: 143, kind: "item", label: "Palanca" },
  { id: "helper", x: 2350, y: 226, kind: "helper", label: "Pedir ayuda" },
  {
    id: "branch",
    x: 2290,
    y: 226,
    kind: "story",
    scene: 5,
    label: "Liberar la tercera señal",
  },
  {
    id: "bridge_damage",
    x: 2540,
    y: 226,
    kind: "evidence",
    label: "Madera astillada",
  },
  {
    id: "missing_boards",
    x: 2660,
    y: 154,
    kind: "evidence",
    label: "Tablas que faltan",
  },
  {
    id: "safe_detour",
    x: 2910,
    y: 178,
    kind: "evidence",
    label: "Marca del desvío seguro",
  },
  {
    id: "bridge",
    x: 2970,
    y: 226,
    kind: "story",
    scene: 6,
    label: "Comprobar el desvío",
  },
  {
    id: "traveler",
    x: 3100,
    y: 226,
    kind: "story",
    scene: 7,
    label: "Escuchar al viajero",
  },
  {
    id: "scripture",
    x: 3160,
    y: 226,
    kind: "story",
    scene: 8,
    label: "Abrir el cuaderno bíblico",
  },
  { id: "cover", x: 3380, y: 122, kind: "item", label: "Cubierta del farol" },
  { id: "wick", x: 3560, y: 146, kind: "item", label: "Mecha" },
  {
    id: "lamp1",
    x: 3750,
    y: 226,
    kind: "story",
    scene: 9,
    label: "Reparar el primer farol",
  },
  {
    id: "guide_clear",
    x: 4400,
    y: 226,
    kind: "story",
    scene: 10,
    label: "Descansar con la guía",
  },
  { id: "rest", x: 4490, y: 226, kind: "rest", label: "Descansar" },
  {
    id: "lamp2",
    x: 4850,
    y: 226,
    kind: "story",
    scene: 11,
    label: "Explicar la ruta segura",
  },
  {
    id: "no_return",
    x: 5030,
    y: 226,
    kind: "boundary",
    label: "Entrar en la niebla",
  },
  {
    id: "mist_beacon",
    x: 6220,
    y: 226,
    kind: "story",
    scene: 12,
    label: "Revisar el tramo recorrido",
  },
  {
    id: "riddle",
    x: 6810,
    y: 226,
    kind: "story",
    scene: 13,
    label: "Resolver la prueba de confianza",
  },
  {
    id: "keeper",
    x: 7340,
    y: 226,
    kind: "story",
    scene: 14,
    label: "Entregar el mapa",
  },
  {
    id: "chest",
    x: 7620,
    y: 226,
    kind: "story",
    scene: 15,
    label: "Abrir el cofre de suministros",
  },
  {
    id: "library",
    x: 7890,
    y: 226,
    kind: "story",
    scene: 16,
    label: "Una nueva pregunta",
  },
  ...[805, 1520, 2850, 3590, 4700, 5920, 7000].map((x, i) => ({
    id: `light${i + 1}`,
    x,
    y: [146, 180, 159, 146, 208, 180, 145][i],
    kind: "light" as const,
    label: "Luz de esperanza",
  })),
];
export const evidenceDescriptions: Record<string, string> = {
  map_old: "El mapa conserva marcas anteriores a la tormenta.",
  rock_mark: "La marca del arroyo no coincide con la flecha del letrero.",
  storm_notice: "El aviso sitúa la tormenta después del paso de la caminante.",
  sign_fragment: "El fragmento pide revisar el puente antes de cruzarlo.",
  witness_time: "La caminante cruzó ayer por la mañana, antes de la tormenta.",
  witness_place: "Hablaba del puente principal, no del desvío.",
  helper_offer: "El guardabosques se ofreció a ayudar con la rama.",
  bridge_damage: "La madera del puente está astillada tras la tormenta.",
  missing_boards: "Faltan varias tablas del paso principal.",
  safe_detour:
    "Las marcas recientes señalan una ruta de piedra alrededor del puente.",
};
export function platformAt(p: Platform, time: number) {
  "worklet";
  const r = { ...p };
  if (p.move)
    r[p.move.axis] +=
      Math.sin((time * Math.PI * 2) / p.move.period) * p.move.amplitude;
  return r;
}
export function activePlatforms(p: Progress) {
  return platforms.filter(
    (r) =>
      (r.kind !== "rope" || hasMission(p, 7)) &&
      (r.kind !== "fragile" || !p.worldFlags.bridgeWarning),
  );
}
export function floorAt(x: number) {
  return x >= 0 && x <= WIDTH && !gaps.some((g) => x > g.x && x < g.x + g.w);
}
export function rightLimit(p: Progress) {
  if (!hasMission(p, 2)) return 1090;
  if (!hasMission(p, 5)) return 2510;
  if (!hasMission(p, 9)) return 3970;
  if (!p.worldFlags.noReturn) return 5050;
  if (!hasMission(p, 13)) return 7030;
  return WIDTH - 12;
}
export function objectVisible(o: WorldObject, p: Progress) {
  if (o.id === "guide") return !hasMission(p, 9);
  if (o.id === "guide_clear") return hasMission(p, 9);
  if (o.id === "traveler" || o.id === "scripture") return !hasMission(p, 8);
  return true;
}
export const chapters = [
  "El bosque de las dudas",
  "La biblioteca del aprendizaje",
  "El puente del valor",
  "La tormenta del desánimo",
  "Los amigos del camino",
  "El valle del perdón",
  "El destino desconocido",
];
