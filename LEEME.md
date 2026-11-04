# Personaje pixel art — El camino de una precursora

Paquete de trabajo v0.1 para React Native / Expo / React Native Web.

## Archivos
- `assets/sheets/*.png`: una animación por spritesheet horizontal; tamaños por celda en manifest.json.
- `assets/frames/{animacion}/*.png`: cuadros PNG individuales con transparencia.
- `manifest.json`: nombres de animaciones, dimensiones, FPS orientativo, referencias de íconos y retratos.

## Animaciones
Reposo 4 cuadros x 2 direcciones; caminar 6 x 2; salto 4 x 2; hablar 4; abrir cofre 6; recibir objeto 5; celebrar 5; tropiezo 4; recuperación 3; sentarse, leer, orar y descansar como poses individuales.

## Guardado
Este paquete contiene solo arte: el guardado automático en móvil y exportación/importación JSON en web se implementan en el motor de juego.

## Importante
Estos recursos proceden de una hoja de diseño generativa segmentada de forma programática. Son una primera iteración para prototipar: revisar recortes, siluetas, coherencia de posiciones y color antes de producción. No son animaciones de calidad final auditadas manualmente; algunas poses son aproximaciones.

## Recompensas individuales
Además de recibir_objeto genérico, hay animaciones receive_fe, receive_aprendizaje, receive_valor, receive_perseverancia, receive_amistades y receive_perdon (6 cuadros cada una).
