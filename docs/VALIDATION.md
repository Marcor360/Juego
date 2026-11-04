# Validación del prototipo

Ejecutada en el entorno actual con Node 24.22.1 y npm 11.9.0.

| Comprobación | Resultado |
| --- | --- |
| `npm ci --no-audit --no-fund` | Correcta; hook de CanvasKit ejecutado |
| `npm run typecheck` | Correcta |
| `npm test` | 9 pruebas aprobadas, 0 fallidas, 0 omitidas |
| `expo export --platform web` | Correcta |
| `expo export --platform android --platform ios` | Ambos bundles Hermes generados |
| Inicio de Expo sin CI, puerto 8082 | Menú mostrado en Chromium, sin errores de página |
| `tests/browser.cjs`, partida nueva | Recorrido completo aprobado |
| Mismo test desde checkpoint del viajero | Aprobado |

El recorrido automatizado comenzó en el menú, habló con la guía, recogió las tres luces (incluida la plataforma elevada), encendió ambos faroles, ayudó al viajero, ordenó las palabras, abrió el cofre y comprobó Fe y capítulos `[1,2]` en la partida. Después descargó JSON, recargó, continuó, rechazó una importación incompatible conservando la partida y restauró el archivo válido. No hubo errores JavaScript de página.

Las primeras pruebas detectaron rutas de sprites no resueltas en web y un margen de salto insuficiente en las ruinas; se corrigieron y el recorrido completo pasó después de esos cambios.

Los archivos de arte originales, `manifest.json` y `LEEME.md` permanecen sin cambios. Las dimensiones de todas las láminas y cuadros se compararon con el manifiesto; la calidad visual de sus poses sigue siendo provisional.

## Revisión visual y de CanvasKit

- Se sustituyeron los árboles geométricos y el dibujo manual con `PictureRecorder`/pinturas descartadas por fondos ilustrados y capas de sprites con imágenes fijas. Los fotogramas actualizan offsets numéricos, sin transportar imágenes nativas dentro de valores derivados.
- El WASM servido tiene un nombre con la versión instalada y una prueba compara su SHA-256 con la dependencia para evitar incompatibilidades por caché.
- Se probaron menús, retratos, doce ciclos de pausa/inventario y ventanas 667×375, 1920×1080 y 2560×1440, sin errores de página ni solicitudes de recursos fallidas.
- Tres recargas de Fast Refresh seguidas de apertura/cierre de ajustes no reprodujeron el aborto de CanvasKit reportado. Esto verifica las rutas probadas; no establece una causa única para todos los posibles fallos del motor gráfico.
- El acertijo limpia la orientación del intento anterior al seleccionar otra palabra. La última pose de reposo se dibuja con una ventana que excluye una línea aislada del recurso original.

## Límites de esta validación

- Generar bundles Android/iOS no demuestra ejecución, persistencia ni rendimiento en dispositivos físicos. Estas pruebas siguen pendientes.
- No se ha validado la duración objetivo de 8–12 minutos mediante sesiones con jugadores.
- Los paisajes y personajes secundarios ahora son ilustraciones pixel art con asistencia generativa. Falta una auditoría artística de continuidad entre fondos y poses y una auditoría de accesibilidad.
- La idea de Proverbios 3:5 está marcada como adaptación pendiente de verificación editorial.
- El capítulo 2 se desbloquea, pero los capítulos 2–7 aún no tienen escenarios jugables.
- Se guardaron `install_script` y `start_skill` en el borrador. No se publicó el entorno ni se validó una restauración en una tarea nueva.
