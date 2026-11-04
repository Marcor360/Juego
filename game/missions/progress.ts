export type Progress = {
  guide: boolean;
  lights: string[];
  lamps: string[];
  traveler: boolean;
  riddle: boolean;
  complete: boolean;
};
export const freshProgress = (): Progress => ({
  guide: false,
  lights: [],
  lamps: [],
  traveler: false,
  riddle: false,
  complete: false,
});
export function objective(p: Progress) {
  if (!p.guide) return "El primer encuentro · Habla con la guía";
  if (p.lights.length < 3)
    return `Las luces de esperanza · ${p.lights.length}/3`;
  if (p.lamps.length < 2) return `Los faroles apagados · ${p.lamps.length}/2`;
  if (!p.traveler) return "Ayudar al viajero · Escucha con empatía";
  if (!p.riddle) return "El desafío de la confianza · Busca las ruinas";
  if (!p.complete) return "El santuario del bosque · Abre el cofre";
  return "El bosque vuelve a brillar · Capítulo completado";
}
export function collect(p: Progress, id: string) {
  if (/^light[123]$/.test(id) && p.guide && !p.lights.includes(id))
    p.lights.push(id);
  if (/^lamp[12]$/.test(id) && p.lights.length === 3 && !p.lamps.includes(id))
    p.lamps.push(id);
}
