# Validación del prototipo actual

Ejecutada en el entorno de desarrollo con Node 24.22.1 y npm 11.9.0.

| Comprobación | Resultado |
| --- | --- |
| `npm run typecheck` | Correcta |
| `npm test` | 14 pruebas aprobadas, 0 fallidas, 0 omitidas |
| `expo export --platform web` | Correcta |
| `expo export --platform android --platform ios` | Ambos bundles Hermes generados |
| `tests/browser.cjs` | Bosque completo, recompensa, descarga JSON, recarga e importaciones válida e inválida aprobadas |
| `tests/adventure-browser.cjs` | Recogida automática y retrato alegre aprobados con teclado y eventos táctiles de Chromium |

## Mecánicas y arte verificados

El recorrido completo empezó en el menú, habló con la guía, obtuvo las tres luces al acercarse (incluida la plataforma elevada), encendió ambos faroles, ayudó al viajero, ordenó las palabras y abrió el cofre. La partida conservó Fe y capítulos `[1,2]`. Se descargó JSON, se continuó tras recargar, se rechazó una importación incompatible sin perder el progreso y se restauró un archivo válido. No hubo errores de JavaScript de página.

La prueba táctil mantuvo pulsado el control derecho mediante eventos reales `touchStart`/`touchEnd` de Chromium. La luz se recogió sin tocar E; no se abrió ningún diálogo de recogida. Las pruebas también verificaron que una luz elevada no se recoja desde el suelo, que no se duplique y que requiera el primer encuentro.

El agradecimiento del viajero muestra su retrato alegre y el nombre «El viajero», tanto en escritorio como en web táctil. El mapeo de hablantes y el índice del retrato tienen pruebas de regresión.

El arte v2 incluye 12 poses nuevas de la protagonista, 8 poses de guía/viajero, 6 retratos y 8 objetos ilustrados. Se inspeccionaron sus distribuciones y límites alfa. La prueba de metadatos compara los PNG reales, sus celdas, recortes y anclajes. Las animaciones usan fotogramas distintos de esos atlases; no son únicamente transformaciones de una imagen fija.

Los fondos superponen franjas con un fundido de entrada de 64 píxeles lógicos. El suelo alterna franjas reflejadas cuyos bordes de origen coinciden. Las pruebas verifican cobertura del intervalo de cámara y continuidad geométrica de las uniones. Las plataformas conservan extremos completos y los faroles usan una escala común en sus estados apagado/encendido.

El binario CanvasKit servido tiene la versión instalada en su nombre; una prueba compara su SHA-256 con la dependencia para evitar mezclar JavaScript y WASM de otra versión. Los personajes utilizan buffers de transformaciones de Skia y una imagen fija por atlas, sin transferir imágenes nativas entre fotogramas.

## Límites

- Los bundles Android/iOS no demuestran ejecución, guardado ni rendimiento en dispositivos físicos. La prueba táctil se ejecutó en Chromium, no en una app nativa instalada.
- La duración objetivo de 8–12 minutos todavía requiere sesiones con jugadores.
- El arte se creó con asistencia generativa y necesita revisión artística de continuidad entre poses y una auditoría de accesibilidad.
- Proverbios 3:5 sigue marcado como adaptación pendiente de verificación editorial.
- Los capítulos 2–7 aún no tienen escenarios jugables.
