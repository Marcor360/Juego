export const missionId = (scene: number) =>
  `CH1_${String(scene).padStart(2, "0")}`;
export type Tutorial = {
  walk: boolean;
  jump: boolean;
  journal: boolean;
  interact: boolean;
};
export type Progress = {
  completedMissions: string[];
  tutorial: Tutorial;
  evidence: string[];
  items: string[];
  decisions: Record<string, string>;
  reflections: string[];
  lights: string[];
  worldFlags: { noReturn: boolean; bridgeWarning: boolean };
};
export const freshProgress = (): Progress => ({
  completedMissions: [],
  tutorial: { walk: false, jump: false, journal: false, interact: false },
  evidence: [],
  items: [],
  decisions: {},
  reflections: [],
  lights: [],
  worldFlags: { noReturn: false, bridgeWarning: false },
});
export const hasMission = (p: Progress, n: number) => {
  "worklet";
  return p.completedMissions.includes(`CH1_${String(n).padStart(2, "0")}`);
};
export const currentScene = (p: Progress) =>
  Math.min(16, p.completedMissions.length + 1);
export const addUnique = (list: string[], id: string) => {
  if (!list.includes(id)) list.push(id);
};
export const missionTitles = [
  "Preparar el viaje",
  "La guía del bosque",
  "Observar las señales",
  "Escuchar y contrastar",
  "Pedir ayuda",
  "El puente dañado",
  "Escuchar al viajero",
  "Un texto oportuno",
  "Ayuda práctica",
  "Descansar con la guía",
  "El segundo farol",
  "Cruzar la niebla",
  "La prueba de confianza",
  "Entregar el mapa",
  "La linterna de la Fe",
  "Una nueva pregunta",
];
export function objective(p: Progress) {
  return hasMission(p, 16)
    ? "Capítulo completado · La biblioteca te espera"
    : `${String(currentScene(p)).padStart(2, "0")}/16 · ${missionTitles[currentScene(p) - 1]}`;
}
export const evidenceIds = [
  "map_old",
  "rock_mark",
  "storm_notice",
  "sign_fragment",
  "witness_time",
  "witness_place",
  "helper_offer",
  "bridge_damage",
  "missing_boards",
  "safe_detour",
];
export const itemIds = ["lever", "cover", "wick"];
export const lightIds = [
  "light1",
  "light2",
  "light3",
  "light4",
  "light5",
  "light6",
  "light7",
];
export function prerequisites(p: Progress, n: number): string[] {
  if (n !== p.completedMissions.length + 1)
    return ["Sigue primero la escena indicada en el cuaderno."];
  const missing: string[] = [];
  if (n === 1 && !Object.values(p.tutorial).every(Boolean))
    missing.push("Practica caminar, saltar, abrir el cuaderno e interactuar.");
  if (n === 3)
    for (const id of ["rock_mark", "storm_notice", "sign_fragment"])
      if (!p.evidence.includes(id))
        missing.push(
          {
            rock_mark: "Observa la marca elevada junto al arroyo.",
            storm_notice: "Busca el aviso sobre la tormenta.",
            sign_fragment: "Encuentra el fragmento del letrero.",
          }[id]!,
        );
  if (
    n === 5 &&
    !p.items.includes("lever") &&
    !p.evidence.includes("helper_offer")
  )
    missing.push(
      "Busca la palanca elevada o habla con el guardabosques junto a la rama.",
    );
  if (n === 6)
    for (const id of ["bridge_damage", "missing_boards", "safe_detour"])
      if (!p.evidence.includes(id))
        missing.push(
          "Investiga el puente y alcanza la señal elevada del desvío.",
        );
  if (n === 9)
    for (const id of ["cover", "wick"])
      if (!p.items.includes(id))
        missing.push(
          id === "cover"
            ? "Busca la cubierta en la ruta de la cuerda."
            : "Encuentra la mecha entre las plataformas.",
        );
  if (
    n === 11 &&
    !["storm_notice", "bridge_damage", "safe_detour"].every((id) =>
      p.evidence.includes(id),
    )
  )
    missing.push(
      "Consulta las evidencias de la tormenta, el puente y el desvío.",
    );
  if (n === 12 && !p.worldFlags.noReturn)
    missing.push("Confirma primero la entrada en la niebla.");
  return [...new Set(missing)];
}
export function finishMission(p: Progress, n: number, decision = "") {
  const missing = prerequisites(p, n);
  if (missing.length) throw Error(missing.join(" "));
  addUnique(p.completedMissions, missionId(n));
  if (decision) p.decisions[missionId(n)] = decision;
  if (n === 1) addUnique(p.evidence, "map_old");
  if (n === 4) {
    addUnique(p.evidence, "witness_time");
    addUnique(p.evidence, "witness_place");
  }
  const reflection = [
    "Preparé mi cuaderno antes de avanzar.",
    "La confianza puede ir acompañada de prudencia.",
    "Observar me ayudó a corregir una señal.",
    "Preguntar cuándo y dónde aclara información contradictoria.",
    decision === "helper"
      ? "Pedir ayuda también fue una buena decisión."
      : "Busqué una herramienta antes de forzar el obstáculo.",
    "Comprobé el puente y busqué un desvío seguro.",
    "Escuché el miedo del viajero antes de aconsejar.",
    "Relacioné un principio bíblico con una acción concreta.",
    "Ayudar también significa hacer algo útil.",
    "Descansar me permitió continuar con nuevas fuerzas.",
    "Expliqué mi decisión con evidencias y respeto.",
    "Avancé con cuidado y acepté volver a intentarlo.",
    "Confiar no significa ignorar la información comprobada.",
    "Informé con sinceridad y asumí mi responsabilidad.",
    "La linterna me recuerda lo que aprendí en el camino.",
    "Todavía me quedan muchas cosas por aprender.",
  ][n - 1];
  addUnique(p.reflections, reflection);
}
