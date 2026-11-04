export const WIDTH = 3300;
export const GROUND = 226;
export const platforms = [
  { x: 540, y: 194, w: 85, h: 32 },
  { x: 640, y: 160, w: 90, h: 14 },
  { x: 820, y: 205, w: 30, h: 21 },
  { x: 1890, y: 201, w: 110, h: 25 },
  { x: 2000, y: 177, w: 90, h: 14 },
  { x: 2130, y: 198, w: 60, h: 28 },
];
export const objects = [
  { id: "guide", x: 210, y: 226, kind: "guide" },
  { id: "light1", x: 440, y: 208, kind: "light" },
  { id: "light2", x: 680, y: 143, kind: "light" },
  { id: "light3", x: 895, y: 208, kind: "light" },
  { id: "lamp1", x: 1100, y: 226, kind: "lamp" },
  { id: "lamp2", x: 1290, y: 226, kind: "lamp" },
  { id: "traveler", x: 1640, y: 226, kind: "traveler" },
  { id: "riddle", x: 2360, y: 226, kind: "riddle" },
  { id: "chest", x: 3010, y: 226, kind: "chest" },
] as const;
export const chapters = [
  "El bosque de las dudas",
  "La biblioteca del aprendizaje",
  "El puente del valor",
  "La tormenta del desánimo",
  "Los amigos del camino",
  "El valle del perdón",
  "El destino desconocido",
];
